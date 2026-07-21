// ============================================================
// Crawler Engine - Playwright + Cheerio
// ============================================================

import * as cheerio from "cheerio";
import type {
  CrawlResult,
  PageData,
  HeadingData,
  ImageData,
} from "@/types";
import { logger } from "@/lib/logging/logger";

/**
 * Crawl a website using Playwright for dynamic rendering
 * and Cheerio for HTML parsing
 */
export async function crawlWebsite(url: string): Promise<CrawlResult> {
  const startTime = Date.now();
  const normalizedUrl = normalizeUrl(url);

  let html = "";
  let statusCode = 0;
  let headers: Record<string, string> = {};
  let renderedHtml: string | undefined;

  // Try Playwright first for dynamic content
  try {
    const result = await crawlWithPlaywright(normalizedUrl);
    html = result.html;
    renderedHtml = result.renderedHtml;
    statusCode = result.statusCode;
    headers = result.headers;
  } catch (err) {
    logger.warn("[Crawler] Playwright failed, falling back to fetch:", err);
    // Fallback to fetch
    try {
      const result = await crawlWithFetch(normalizedUrl);
      html = result.html;
      statusCode = result.statusCode;
      headers = result.headers;
    } catch (fetchErr) {
      logger.error("[Crawler] Fetch also failed:", fetchErr);
      throw new Error(`Failed to crawl ${url}`);
    }
  }

  // Parse with Cheerio
  const mainPage = parseHtml(normalizedUrl, html);

  // Fetch robots.txt and sitemap
  const robotsTxt = await fetchRobotsTxt(normalizedUrl);
  const sitemapXml = await fetchSitemap(normalizedUrl);

  // Discover internal links and crawl subpages (limited)
  const internalUrls = mainPage.internalLinks
    .filter((link) => isSameOrigin(normalizedUrl, link))
    .slice(0, 10); // Limit to 10 subpages

  const subPages: PageData[] = [];
  for (const subUrl of internalUrls) {
    try {
      const subResult = await crawlWithFetch(subUrl);
      if (subResult.statusCode === 200) {
        subPages.push(parseHtml(subUrl, subResult.html));
      }
    } catch {
      // Skip failed subpages
    }
  }

  const loadTime = Date.now() - startTime;

  return {
    url: normalizedUrl,
    html,
    renderedHtml,
    statusCode,
    headers,
    pages: [mainPage, ...subPages],
    robotsTxt,
    sitemapXml,
    loadTime,
  };
}

// --- Playwright Crawling ---

async function crawlWithPlaywright(url: string): Promise<{
  html: string;
  renderedHtml: string;
  statusCode: number;
  headers: Record<string, string>;
}> {
  // Dynamic import to avoid issues when playwright is not installed
  const { chromium } = await import("playwright");

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });
    const page = await context.newPage();

    let statusCode = 0;
    let responseHeaders: Record<string, string> = {};

    page.on("response", (response) => {
      if (response.url() === url || response.url() === url + "/") {
        statusCode = response.status();
        const hdrs = response.headers();
        responseHeaders = { ...hdrs };
      }
    });

    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

    // Wait for dynamic content
    await page.waitForTimeout(2000);

    const html = await page.content();

    return {
      html,
      renderedHtml: html,
      statusCode: statusCode || 200,
      headers: responseHeaders,
    };
  } finally {
    await browser.close();
  }
}

// --- Fetch Fallback ---

async function crawlWithFetch(url: string): Promise<{
  html: string;
  statusCode: number;
  headers: Record<string, string>;
}> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    redirect: "follow",
  });

  const html = await response.text();
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  return {
    html,
    statusCode: response.status,
    headers,
  };
}

// --- HTML Parsing with Cheerio ---

function parseHtml(url: string, html: string): PageData {
  const $ = cheerio.load(html);

  // Meta tags
  const title = $("title").text().trim();
  const metaDescription =
    $('meta[name="description"]').attr("content")?.trim() || "";
  const canonical =
    $('link[rel="canonical"]').attr("href")?.trim() || "";
  const metaRobots =
    $('meta[name="robots"]').attr("content")?.trim() || "";

  // OG tags
  const ogTags: Record<string, string> = {};
  $('meta[property^="og:"]').each((_, el) => {
    const property = $(el).attr("property")!;
    const content = $(el).attr("content") || "";
    ogTags[property] = content;
  });

  // Twitter tags
  const twitterTags: Record<string, string> = {};
  $('meta[name^="twitter:"]').each((_, el) => {
    const name = $(el).attr("name")!;
    const content = $(el).attr("content") || "";
    twitterTags[name] = content;
  });

  // Schema markup
  const schemaMarkup: object[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || "{}");
      schemaMarkup.push(json);
    } catch {
      // Invalid JSON-LD
    }
  });

  // Headings
  const headings: HeadingData[] = [];
  $("h1, h2, h3, h4, h5, h6").each((_, el) => {
    const level = parseInt(el.tagName.replace("h", ""), 10);
    const text = $(el).text().trim();
    if (text) {
      headings.push({ level, text });
    }
  });

  // Images
  const images: ImageData[] = [];
  $("img").each((_, el) => {
    const src = $(el).attr("src") || "";
    const alt = $(el).attr("alt") || "";
    images.push({ src, alt, hasAlt: alt.length > 0 });
  });

  // Internal links
  const internalLinks: string[] = [];
  const externalLinks: string[] = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;

    try {
      const resolved = new URL(href, url).href;
      if (isSameOrigin(url, resolved)) {
        internalLinks.push(resolved);
      } else {
        externalLinks.push(resolved);
      }
    } catch {
      // Invalid URL
    }
  });

  // Content
  $("script, style, noscript, nav, footer, header").remove();
  const content = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return {
    url,
    title,
    metaDescription,
    canonical,
    metaRobots,
    ogTags,
    twitterTags,
    schemaMarkup,
    headings,
    images,
    internalLinks: [...new Set(internalLinks)],
    externalLinks: [...new Set(externalLinks)],
    content,
    wordCount,
  };
}

// --- Helpers ---

function normalizeUrl(url: string): string {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  return url.replace(/\/+$/, "");
}

function isSameOrigin(baseUrl: string, testUrl: string): boolean {
  try {
    const base = new URL(baseUrl);
    const test = new URL(testUrl);
    return base.hostname === test.hostname;
  } catch {
    return false;
  }
}

async function fetchRobotsTxt(url: string): Promise<string | undefined> {
  try {
    const origin = new URL(url).origin;
    const res = await fetch(`${origin}/robots.txt`, { redirect: "follow" });
    if (res.ok) {
      return await res.text();
    }
  } catch {
    // No robots.txt
  }
  return undefined;
}

async function fetchSitemap(url: string): Promise<string | undefined> {
  try {
    const origin = new URL(url).origin;
    const res = await fetch(`${origin}/sitemap.xml`, { redirect: "follow" });
    if (res.ok) {
      const text = await res.text();
      if (text.includes("<urlset") || text.includes("<sitemapindex")) {
        return text;
      }
    }
  } catch {
    // No sitemap
  }
  return undefined;
}
