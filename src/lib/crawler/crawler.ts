import * as cheerio from "cheerio";
import { validateUrlForSsrf } from "@/lib/security/ssrf";
import { RobotsParser } from "@/lib/crawler/robots";
import { ICrawlSnapshot, ICrawlPage } from "@/types/domain";
import { CrawlError } from "@/lib/errors/exceptions";
import { logger } from "@/lib/logging/logger";
import { platformConfig } from "@/lib/config";
import { v4 as uuidv4 } from "uuid";

// Default standard User-Agent for our Crawler
const USER_AGENT = "SageoBot/1.0 (+https://sageo.in/bot)";

interface CrawlQueueItem {
  url: string;
  depth: number;
}

/**
 * Normalizes url representation.
 */
function normalizeUrl(url: string): string {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  return url.replace(/\/+$/, "");
}

/**
 * Checks if baseUrl and testUrl share the same hostname origin.
 */
function isSameOrigin(baseUrl: string, testUrl: string): boolean {
  try {
    const base = new URL(baseUrl);
    const test = new URL(testUrl);
    // Ignore www prefix mismatch
    const baseHost = base.hostname.replace(/^www\./, "");
    const testHost = test.hostname.replace(/^www\./, "");
    return baseHost === testHost;
  } catch {
    return false;
  }
}

/**
 * In-memory parser helper for page HTML extracts.
 */
function parsePageHtml(url: string, html: string, statusCode: number, headers: Record<string, string>): ICrawlPage {
  const $ = cheerio.load(html);

  // Meta Tags
  const title = $("title").text().trim() || undefined;
  const metaTags: Record<string, string> = {};
  $("meta").each((_, el) => {
    const name = $(el).attr("name") || $(el).attr("property") || $(el).attr("http-equiv");
    const content = $(el).attr("content");
    if (name && content !== undefined) {
      metaTags[name.toLowerCase()] = content.trim();
    }
  });

  // Headings
  const headings: Record<string, string[]> = {
    h1: [], h2: [], h3: [], h4: [], h5: [], h6: []
  };
  $("h1, h2, h3, h4, h5, h6").each((_, el) => {
    const level = el.tagName.toLowerCase() as keyof typeof headings;
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (text) {
      headings[level].push(text);
    }
  });

  // Links extraction
  const internal: { url: string; anchorText: string }[] = [];
  const external: { url: string; anchorText: string }[] = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href")?.trim();
    const anchorText = $(el).text().replace(/\s+/g, " ").trim() || "";
    if (!href || href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return;
    }

    try {
      const resolved = new URL(href, url).href;
      const resolvedNormalized = normalizeUrl(resolved);
      if (isSameOrigin(url, resolvedNormalized)) {
        internal.push({ url: resolvedNormalized, anchorText });
      } else {
        external.push({ url: resolved, anchorText });
      }
    } catch {
      // Ignore invalid URLs
    }
  });

  // Images
  const images: ICrawlPage["images"] = [];
  $("img").each((_, el) => {
    const src = $(el).attr("src")?.trim();
    if (!src) return;
    try {
      const resolved = new URL(src, url).href;
      const altText = $(el).attr("alt")?.trim() || undefined;
      const widthVal = $(el).attr("width");
      const heightVal = $(el).attr("height");
      const width = widthVal ? parseInt(widthVal, 10) : undefined;
      const height = heightVal ? parseInt(heightVal, 10) : undefined;
      images.push({
        url: resolved,
        altText,
        width: isNaN(width || NaN) ? undefined : width,
        height: isNaN(height || NaN) ? undefined : height
      });
    } catch {
      // Ignore invalid image URLs
    }
  });

  // JSON-LD Schema Markup
  const schemaMarkup: Record<string, any>[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const content = $(el).html();
      if (content) {
        const json = JSON.parse(content);
        if (Array.isArray(json)) {
          schemaMarkup.push(...json);
        } else {
          schemaMarkup.push(json);
        }
      }
    } catch {
      // Ignore invalid json schemas
    }
  });

  return {
    url,
    statusCode,
    html,
    headers,
    title,
    metaTags,
    headings,
    links: {
      internal: internal.filter((v, i, a) => a.findIndex(t => t.url === v.url) === i), // Unique link URLs
      external: external.filter((v, i, a) => a.findIndex(t => t.url === v.url) === i)
    },
    images,
    schemaMarkup
  };
}

/**
 * Crawl a URL with Playwright (rendering enabled)
 */
async function fetchWithPlaywright(url: string, timeoutMs: number): Promise<{
  html: string;
  statusCode: number;
  headers: Record<string, string>;
}> {
  const { chromium } = await import("playwright");

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const context = await browser.newContext({
      userAgent: USER_AGENT,
      extraHTTPHeaders: {
        "DNT": "1"
      }
    });

    const page = await context.newPage();
    let statusCode = 200;
    let headers: Record<string, string> = {};

    page.on("response", (response) => {
      if (response.url() === url || response.url() === url + "/") {
        statusCode = response.status();
        headers = response.headers();
      }
    });

    await page.goto(url, { waitUntil: "networkidle", timeout: timeoutMs });
    
    // Wait slightly for post-load visual scripts
    await page.waitForTimeout(1000);

    const html = await page.content();

    return {
      html,
      statusCode,
      headers
    };
  } finally {
    await browser.close();
  }
}

/**
 * Standard GET crawler request fallback
 */
async function fetchWithGet(url: string, timeoutMs: number): Promise<{
  html: string;
  statusCode: number;
  headers: Record<string, string>;
}> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      },
      signal: controller.signal,
      redirect: "follow"
    });

    clearTimeout(id);

    const html = await response.text();
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    return {
      html,
      statusCode: response.status,
      headers
    };
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * Helper to fetch special files on origin
 */
async function fetchSpecialFile(origin: string, filePath: string, timeoutMs: number): Promise<string | undefined> {
  const target = `${origin}/${filePath.replace(/^\/+/, "")}`;
  try {
    await validateUrlForSsrf(target);
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(target, {
      method: "GET",
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
      redirect: "follow"
    });

    clearTimeout(id);

    if (res.ok) {
      return await res.text();
    }
  } catch {
    // Fail silently for special files
  }
  return undefined;
}

/**
 * Performs a comprehensive crawl of the target website URL.
 * Adheres to configured limits, respects robots.txt, and validates SSRF.
 */
export async function crawlWebsite(
  urlStr: string,
  onProgress?: (url: string, pagesCrawled: number) => void
): Promise<ICrawlSnapshot> {
  const startUrl = normalizeUrl(urlStr);
  
  // 1. SSRF Protection check
  await validateUrlForSsrf(startUrl);

  const crawlConfig = platformConfig.getCrawlConfig();
  const origin = new URL(startUrl).origin;
  logger.info(`Starting crawl on ${startUrl} (Origin: ${origin})`);

  // 2. Fetch robots.txt first
  let robotsTxtContent: string | undefined;
  try {
    const res = await fetch(`${origin}/robots.txt`, { headers: { "User-Agent": USER_AGENT } });
    if (res.ok) {
      robotsTxtContent = await res.text();
    }
  } catch (err) {
    logger.warn(`Could not fetch robots.txt for origin ${origin}. Proceeding with default allowance.`, err);
  }

  const robotsParser = new RobotsParser(robotsTxtContent);

  // Parse sitemaps declared in robots.txt
  const sitemaps = [...new Set(robotsParser.getSitemaps())];
  // Standard sitemap fallback check
  if (sitemaps.length === 0) {
    sitemaps.push(`${origin}/sitemap.xml`);
  }

  // 3. Initialize Crawl Queue
  const crawledPages: Map<string, ICrawlPage> = new Map();
  const queue: CrawlQueueItem[] = [{ url: startUrl, depth: 1 }];
  const visitedUrls: Set<string> = new Set([startUrl]);

  while (queue.length > 0 && crawledPages.size < crawlConfig.maxPages) {
    const item = queue.shift();
    if (!item) break;

    const { url, depth } = item;

    // Respect robots.txt exclusion rules
    const urlPath = new URL(url).pathname;
    if (!robotsParser.isAllowed(USER_AGENT, urlPath)) {
      logger.info(`Skipping URL disallowed by robots.txt: ${url}`);
      continue;
    }

    logger.info(`Crawling page: ${url} (Depth: ${depth}/${crawlConfig.maxDepth}, Queue size: ${queue.length})`);

    let pageResult: { html: string; statusCode: number; headers: Record<string, string> } | null = null;
    let errorMsg = "";

    // Retry loop (3 attempts)
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        if (depth === 1) {
          // Playwright rendering for the landing page
          pageResult = await fetchWithPlaywright(url, crawlConfig.timeoutMs);
        } else {
          // Fast GET fetch for subpages
          pageResult = await fetchWithGet(url, crawlConfig.timeoutMs);
        }
        break; // Success, break retry loop
      } catch (err) {
        errorMsg = err instanceof Error ? err.message : String(err);
        logger.warn(`Attempt ${attempt} failed to crawl ${url}: ${errorMsg}`);
        if (attempt < 3) {
          // Linear backoff
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        }
      }
    }

    if (!pageResult) {
      logger.error(`Crawl permanently failed for ${url} after 3 attempts. Error: ${errorMsg}`);
      if (depth === 1) {
        throw new CrawlError(`Failed to retrieve landing page: ${url}. Error: ${errorMsg}`, url);
      }
      continue; // Skip failed subpages
    }

    // Parse and cache page results
    try {
      const crawlPage = parsePageHtml(url, pageResult.html, pageResult.statusCode, pageResult.headers);
      crawledPages.set(url, crawlPage);

      if (onProgress) {
        onProgress(url, crawledPages.size);
      }

      // Find subpage links to queue if depth limit not reached
      if (depth < crawlConfig.maxDepth) {
        for (const link of crawlPage.links.internal) {
          const nextUrl = link.url;
          if (!visitedUrls.has(nextUrl) && crawledPages.size + queue.length < crawlConfig.maxPages * 2) {
            visitedUrls.add(nextUrl);
            queue.push({ url: nextUrl, depth: depth + 1 });
          }
        }
      }
    } catch (parseErr) {
      logger.error(`Error parsing crawled page content for ${url}`, parseErr);
    }
  }

  // 4. In parallel, fetch special files and configs on origin
  const [llmsTxt, humansTxt, securityTxt, adsTxt, manifestJson, rssXml, favicon] = await Promise.all([
    fetchSpecialFile(origin, "/llms.txt", crawlConfig.timeoutMs),
    fetchSpecialFile(origin, "/humans.txt", crawlConfig.timeoutMs),
    fetchSpecialFile(origin, "/security.txt", crawlConfig.timeoutMs),
    fetchSpecialFile(origin, "/ads.txt", crawlConfig.timeoutMs),
    fetchSpecialFile(origin, "/manifest.json", crawlConfig.timeoutMs),
    fetchSpecialFile(origin, "/rss.xml", crawlConfig.timeoutMs) || fetchSpecialFile(origin, "/feed.xml", crawlConfig.timeoutMs),
    fetchSpecialFile(origin, "/favicon.ico", crawlConfig.timeoutMs)
  ]);

  // Combine sitemaps index details check
  const activeSitemaps: string[] = [];
  for (const sitemapUrl of sitemaps) {
    try {
      const res = await fetch(sitemapUrl, { method: "HEAD", headers: { "User-Agent": USER_AGENT } });
      if (res.ok) {
        activeSitemaps.push(sitemapUrl);
      }
    } catch {
      // Ignore offline sitemaps
    }
  }

  return {
    id: uuidv4(),
    url: startUrl,
    timestamp: new Date().toISOString(),
    pages: Array.from(crawledPages.values()),
    robotsTxt: robotsTxtContent,
    sitemaps: activeSitemaps,
    specialFiles: {
      llmsTxt,
      humansTxt,
      securityTxt,
      adsTxt,
      // Map other special files to object structure if TDD specs are extended
    }
  };
}
export const crawlerService = {
  crawl: (url: string, onProgress?: (url: string, pages: number) => void) => crawlWebsite(url, onProgress)
};
