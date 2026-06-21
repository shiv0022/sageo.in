// ============================================================
// Access Engine - Crawler Accessibility & Indexability Auditing
// ============================================================

import type { CrawlResult, AccessResult, Issue } from "@/types";
import { v4 as uuidv4 } from "uuid";

export function analyzeAccess(crawlResult: CrawlResult, auditId: string = ""): AccessResult {
  const mainPage = crawlResult.pages[0];
  const issues: Issue[] = [];

  if (!mainPage) {
    return {
      score: 0,
      issues: [],
      details: {
        robotsTxt: { score: 0, blockedPaths: [] },
        noindex: { score: 0, noindexPages: [] },
        xRobotsTag: { score: 0, headers: {} },
        sitemap: { score: 0, accessible: false },
        aiCrawlerBlocking: { score: 0, blockedCrawlers: [] },
        loginWalls: { score: 0, detected: false },
        renderingIssues: { score: 0, issues: ["No pages crawled"] },
      },
    };
  }

  // 1. Robots.txt Disallows
  let robotsTxtScore = 100;
  const blockedPaths: string[] = [];
  const robotsTxt = crawlResult.robotsTxt || "";
  
  if (robotsTxt) {
    const lines = robotsTxt.split("\n");
    let currentAgent = "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.toLowerCase().startsWith("user-agent:")) {
        currentAgent = trimmed.split(":")[1]?.trim() || "";
      }
      if (trimmed.toLowerCase().startsWith("disallow:") && (currentAgent === "*" || currentAgent === "")) {
        const path = trimmed.split(":")[1]?.trim();
        if (path) blockedPaths.push(path);
      }
    }
  }

  if (blockedPaths.includes("/") || blockedPaths.includes("/*")) {
    robotsTxtScore = 0;
    issues.push({
      id: uuidv4(),
      audit_id: auditId,
      category: "access",
      title: "Entire Site Blocked in robots.txt",
      description: "Your robots.txt file contains a Disallow rule for the root path '/', preventing all search engine bots from crawling or indexing your website.",
      priority: "critical",
      impact: "Zero Indexability",
      difficulty: "easy",
      confidence: 100,
    });
  } else if (blockedPaths.length > 0) {
    robotsTxtScore = 70;
    issues.push({
      id: uuidv4(),
      audit_id: auditId,
      category: "access",
      title: "Crawl Disallow Rules Active",
      description: `Your robots.txt blocks crawlers from accessing directories: ${blockedPaths.join(", ")}. Ensure no important landing pages or resource files are contained in these directories.`,
      priority: "medium",
      impact: "Selective Crawl Block",
      difficulty: "easy",
      confidence: 95,
    });
  }

  // 2. Noindex Tags
  let noindexScore = 100;
  const noindexPages: string[] = [];
  const metaRobots = mainPage.metaRobots || "";
  
  if (metaRobots.toLowerCase().includes("noindex")) {
    noindexScore = 0;
    noindexPages.push(mainPage.url);
    issues.push({
      id: uuidv4(),
      audit_id: auditId,
      category: "access",
      title: "Noindex Meta Tag Found",
      description: `The home page ${mainPage.url} contains a '<meta name="robots" content="noindex">' tag. This explicitly tells search engines NOT to index this page in search results. Remove this tag.`,
      priority: "critical",
      impact: "Zero Indexability",
      difficulty: "easy",
      confidence: 100,
    });
  }

  // 3. X-Robots-Tag Headers
  let xRobotsScore = 100;
  const responseHeaders = crawlResult.headers || {};
  const xRobotsHeader = responseHeaders["x-robots-tag"] || responseHeaders["X-Robots-Tag"] || "";

  if (xRobotsHeader.toLowerCase().includes("noindex")) {
    xRobotsScore = 0;
    issues.push({
      id: uuidv4(),
      audit_id: auditId,
      category: "access",
      title: "Noindex HTTP Header Detected",
      description: "Your server returns an 'X-Robots-Tag: noindex' header. This blocks search engines from indexing the page even if no HTML meta tags exist. Modify server headers to allow indexing.",
      priority: "critical",
      impact: "Zero Indexability",
      difficulty: "hard",
      confidence: 100,
    });
  }

  // 4. Sitemap Accessibility
  const sitemapScore = crawlResult.sitemapXml ? 100 : 0;

  // 5. AI Crawler Blocking (checking robots.txt for AI bots like GPTBot, ClaudeBot)
  let aiCrawlerBlockingScore = 100;
  const blockedAiCrawlers: string[] = [];
  const aiCrawlers = [
    "gptbot", "google-extended", "claudebot", "perplexitybot", "applebot-extended", "ccbot", "anthropic-ai", "cohere-ai"
  ];

  if (robotsTxt) {
    const lines = robotsTxt.split("\n");
    let currentAgent = "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.toLowerCase().startsWith("user-agent:")) {
        currentAgent = trimmed.split(":")[1]?.trim().toLowerCase() || "";
      }
      if (trimmed.toLowerCase().startsWith("disallow:") && aiCrawlers.includes(currentAgent)) {
        const path = trimmed.split(":")[1]?.trim();
        if (path === "/" || path === "/*") {
          if (!blockedAiCrawlers.includes(currentAgent)) {
            blockedAiCrawlers.push(currentAgent);
          }
        }
      }
    }
  }

  if (blockedAiCrawlers.length > 0) {
    aiCrawlerBlockingScore = Math.max(0, 100 - blockedAiCrawlers.length * 15);
    issues.push({
      id: uuidv4(),
      audit_id: auditId,
      category: "access",
      title: "AI Scrapers Blocked in robots.txt",
      description: `Your robots.txt blocks AI models from scraping content (crawlers blocked: ${blockedAiCrawlers.join(", ")}). This prevents your site from being cited or listed in AI search engines like ChatGPT Search or Gemini. Remove these blocks to enable GEO search citations.`,
      priority: "high",
      impact: "-15 GEO citations",
      difficulty: "easy",
      confidence: 95,
    });
  }

  // 6. Login Walls
  let loginWallDetected = false;
  let loginWallScore = 100;
  
  const contentLower = mainPage.content.toLowerCase();
  const hasLoginKeywords = /\b(login|sign in|log in|signin|password|username)\b/i.test(contentLower);
  const isShortPage = mainPage.wordCount < 100;
  const hasInputPassword = /type=["']password["']/i.test(crawlResult.html || "");

  if (hasInputPassword || (hasLoginKeywords && isShortPage)) {
    loginWallDetected = true;
    loginWallScore = 0;
    issues.push({
      id: uuidv4(),
      audit_id: auditId,
      category: "access",
      title: "Login Wall or Paywall Detected",
      description: "The crawled home page contains form fields or language indicative of a login wall or paywall. Crawlers cannot access pages behind login credentials, preventing content indexing.",
      priority: "critical",
      impact: "Zero Indexability",
      difficulty: "hard",
      confidence: 90,
    });
  }

  // 7. Rendering & Performance Issues
  let renderingScore = 100;
  const renderingIssues: string[] = [];

  const loadTime = crawlResult.loadTime;
  if (loadTime > 4000) {
    renderingScore -= 40;
    renderingIssues.push(`Page load time is slow (${(loadTime/1000).toFixed(1)}s).`);
    issues.push({
      id: uuidv4(),
      audit_id: auditId,
      category: "performance",
      title: "Slow Server Response Time",
      description: `Your page took ${(loadTime/1000).toFixed(1)} seconds to crawl. Slow server response times hurt both SEO crawl budgets and user experience. Investigate server-side bottlenecks or CDN caching.`,
      priority: "high",
      impact: "+5 Performance",
      difficulty: "medium",
      confidence: 90,
    });
  }

  if (crawlResult.statusCode !== 200) {
    renderingScore -= 50;
    renderingIssues.push(`Page returned non-200 status code: ${crawlResult.statusCode}.`);
    issues.push({
      id: uuidv4(),
      audit_id: auditId,
      category: "access",
      title: `Page Returned Error Code (${crawlResult.statusCode})`,
      description: `The URL returned a status code of ${crawlResult.statusCode}. Search engine scrapers will flag this page as broken and remove it from indexes. Ensure the page resolves with a status code of 200 OK.`,
      priority: "critical",
      impact: "Index Removal",
      difficulty: "medium",
      confidence: 100,
    });
  }

  renderingScore = Math.max(0, renderingScore);

  // Calculate final score
  const finalScore = Math.round(
    robotsTxtScore * 0.2 +
    noindexScore * 0.2 +
    xRobotsScore * 0.15 +
    sitemapScore * 0.1 +
    aiCrawlerBlockingScore * 0.15 +
    loginWallScore * 0.1 +
    renderingScore * 0.1
  );

  return {
    score: Math.min(100, Math.max(0, finalScore)),
    issues,
    details: {
      robotsTxt: { score: robotsTxtScore, blockedPaths },
      noindex: { score: noindexScore, noindexPages },
      xRobotsTag: { score: xRobotsScore, headers: responseHeaders },
      sitemap: { score: sitemapScore, accessible: crawlResult.sitemapXml ? true : false },
      aiCrawlerBlocking: { score: aiCrawlerBlockingScore, blockedCrawlers: blockedAiCrawlers },
      loginWalls: { score: loginWallScore, detected: loginWallDetected },
      renderingIssues: { score: renderingScore, issues: renderingIssues },
    },
  };
}
