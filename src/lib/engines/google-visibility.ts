import { IEngine, IEngineContext, IEngineResult } from "@/lib/interfaces";
import { IRecommendation, DifficultyLevel, PriorityLevel } from "@/types/domain";
import { logger } from "@/lib/logging/logger";
import crypto from "crypto";

export class GoogleVisibilityEngine implements IEngine {
  public readonly name = "google_visibility";
  public readonly dependencies: string[] = ["discovery", "seo"];

  public async analyze(context: IEngineContext): Promise<IEngineResult> {
    const snapshot = context.crawlSnapshot;
    const pages = snapshot.pages;
    const landingPage = pages.find((p) => p.url === snapshot.url) || pages[0];

    if (!landingPage) {
      return {
        score: 0,
        findings: { error: "No crawled page data found." },
        recommendations: []
      };
    }

    const recommendations: IRecommendation[] = [];
    const findings: Record<string, any> = {};
    let penaltyPoints = 0;

    const addRecommendation = (
      problem: string,
      reason: string,
      evidence: string,
      impacts: IRecommendation["impacts"],
      difficulty: DifficultyLevel,
      estimatedTime: string,
      priority: PriorityLevel,
      steps: string[],
      codeSnippet?: IRecommendation["implementationGuide"]["codeSnippet"],
      aiPrompt = ""
    ) => {
      const shasum = crypto ? crypto.createHash("sha1") : null;
      const id = shasum 
        ? shasum.update(problem + evidence).digest("hex").substring(0, 12)
        : `rec-${Math.random().toString(36).substring(2, 9)}`;

      recommendations.push({
        id,
        problem,
        reason,
        evidence,
        impacts,
        difficulty,
        estimatedTime,
        priority,
        confidenceScore: 100,
        implementationGuide: { steps, codeSnippet },
        aiPrompt: aiPrompt || `Fix this Google Visibility issue: ${problem}. Evidence: ${evidence}`,
        expectedResult: "Google Search indexing status turns fully green with clean crawl paths."
      });
    };

    // 1. Robots.txt block check (Crawlability)
    const robotsTxt = snapshot.robotsTxt || "";
    let isFullyBlocked = false;
    const blockedPaths: string[] = [];

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
      isFullyBlocked = true;
      penaltyPoints += 45;
      addRecommendation(
        "Entire Site Blocked in robots.txt",
        "A wildcard block rule prevents Googlebot and other indexing crawlers from entering your domain entirely.",
        "robots.txt contains 'Disallow: /' or 'Disallow: /*' under wildcard agent.",
        { business: "Critical", seo: "Critical", aiVisibility: "High", googleVisibility: "Critical", security: "None" },
        "easy",
        "2 minutes",
        "critical",
        ["Locate the robots.txt file.", "Remove the blocking wildcard 'Disallow: /' statement.", "Provide a clean default rule: 'Allow: /'."],
        { code: "User-agent: *\nAllow: /", language: "txt" }
      );
    }

    findings.crawlability = { isFullyBlocked, blockedPaths };

    // 2. Indexability (Noindex Check)
    const robotsMeta = landingPage.metaTags["robots"] || "";
    const isNoindex = robotsMeta.toLowerCase().includes("noindex");
    findings.indexability = { isIndexable: !isNoindex, robotsMeta };

    if (isNoindex) {
      penaltyPoints += 40;
      addRecommendation(
        "Noindex Directives Active",
        "Noindex tags strictly direct Googlebot to delete or exclude the target landing pages from search indexes.",
        `Found '<meta name="robots" content="noindex">' in page headers.`,
        { business: "Critical", seo: "Critical", aiVisibility: "None", googleVisibility: "Critical", security: "None" },
        "easy",
        "2 minutes",
        "critical",
        ["Open HTML head elements of the landing page.", "Remove the 'noindex' instruction.", "Replace with 'index, follow'."],
        { code: "<meta name=\"robots\" content=\"index, follow\" />", language: "html" }
      );
    }

    // 3. Sitemap validation
    const hasSitemap = snapshot.sitemaps.length > 0;
    findings.sitemap = { count: snapshot.sitemaps.length };
    if (!hasSitemap) {
      penaltyPoints += 15;
      addRecommendation(
        "Missing XML Sitemap Validation",
        "Search engine scrapers require XML sitemaps to locate all deep site URLs. Sitemaps map all priority URLs in one central file.",
        "No sitemap links detected in crawlers configuration.",
        { business: "Medium", seo: "High", aiVisibility: "Low", googleVisibility: "High", security: "None" },
        "easy",
        "5 minutes",
        "high",
        ["Generate sitemap.xml.", "Expose it at your website root `/sitemap.xml`.", "Declare sitemap URL path inside robots.txt."],
        { code: "Sitemap: https://yourdomain.com/sitemap.xml", language: "txt" }
      );
    }

    // 4. Canonical matching
    const canonical = landingPage.metaTags["canonical"] || "";
    const matchesCanonical = canonical === landingPage.url;
    findings.canonical = { canonical, matchesCanonical };
    if (!canonical) {
      penaltyPoints += 12;
      addRecommendation(
        "Missing Canonical Link Tag",
        "Canonical tags specify the primary URL version of your pages, preventing duplicate content conflicts from url parameters.",
        "No `<link rel=\"canonical\">` detected on landing page.",
        { business: "Low", seo: "High", aiVisibility: "None", googleVisibility: "High", security: "None" },
        "easy",
        "3 minutes",
        "high",
        ["Add canonical link element in head.", "Configure it to dynamically point to the absolute URL of the page."],
        { code: `<link rel="canonical" href="${landingPage.url}" />`, language: "html" }
      );
    }

    // 5. Soft 404 & Redirect checks
    const statusCode = landingPage.statusCode || 200;
    const isSoft404 = statusCode === 200 && landingPage.html?.toLowerCase().includes("page not found");
    findings.status = { statusCode, isSoft404 };
    if (isSoft404) {
      penaltyPoints += 25;
      addRecommendation(
        "Soft 404 Page Error",
        "A soft 404 occurs when a page returns a 200 OK status code but contains language telling users that the page doesn't exist. This wastes crawl budget.",
        "HTML content contains 'page not found' text on a status 200 response.",
        { business: "Low", seo: "High", aiVisibility: "None", googleVisibility: "High", security: "None" },
        "medium",
        "20 minutes",
        "high",
        ["Configure your server to return a strict 404 Not Found HTTP status code for missing paths."],
        undefined
      );
    }

    // 6. Duplicate Content detection
    let duplicatePagesCount = 0;
    const seenTitles = new Set<string>();
    pages.forEach((p) => {
      if (p.title) {
        if (seenTitles.has(p.title)) {
          duplicatePagesCount++;
        }
        seenTitles.add(p.title);
      }
    });

    findings.duplicateCheck = { duplicatePagesCount };
    if (duplicatePagesCount > 0) {
      penaltyPoints += Math.min(15, duplicatePagesCount * 3);
      addRecommendation(
        "Duplicate Titles / Pages Found",
        "Having multiple pages with identical title tags confuses Google ranking models, diluting organic search performance.",
        `Found ${duplicatePagesCount} pages containing duplicate titles.`,
        { business: "Medium", seo: "High", aiVisibility: "Low", googleVisibility: "High", security: "None" },
        "medium",
        "30 minutes",
        "medium",
        ["Audit your site page list.", "Modify pages to use descriptive, unique titles."],
        undefined
      );
    }

    const score = Math.max(0, 100 - penaltyPoints);
    logger.info(`Google Visibility Engine complete. Score: ${score}`);

    return {
      score,
      findings,
      recommendations
    };
  }
}
export const googleVisibilityEngine = new GoogleVisibilityEngine();
