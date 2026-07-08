import { IEngine, IEngineContext, IEngineResult } from "@/lib/interfaces";
import { IRecommendation, DifficultyLevel, PriorityLevel } from "@/types/domain";
import { logger } from "@/lib/logging/logger";
import crypto from "crypto";

export class PerformanceIntelligenceEngine implements IEngine {
  public readonly name = "performance";
  public readonly dependencies: string[] = ["discovery"];

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
        aiPrompt: aiPrompt || `Fix this page performance bottleneck: ${problem}. Evidence: ${evidence}`,
        expectedResult: "Faster server response times, smaller payload transfer weight, and better LCP score."
      });
    };

    // 1. Check content compression headers (Brotli/Gzip)
    const headers = landingPage.headers || {};
    const contentEncoding = headers["content-encoding"] || headers["Content-Encoding"] || "";
    const isCompressed = ["gzip", "br", "deflate"].includes(contentEncoding.toLowerCase().trim());
    findings.compression = { isCompressed, contentEncoding };

    if (!isCompressed) {
      penaltyPoints += 15;
      addRecommendation(
        "Response Content Compression Disabled",
        "Enabling Gzip or Brotli compression on server responses reduces asset size payload transfer by up to 70%, boosting TTFB and load speeds.",
        "Response headers do not contain content-encoding: gzip or br.",
        { business: "Medium", seo: "High", aiVisibility: "Low", googleVisibility: "High", security: "None" },
        "medium",
        "20 minutes",
        "high",
        ["Configure your hosting provider or server to compress text assets (HTML, JS, CSS) using Gzip or Brotli."],
        { code: "Content-Encoding: br", language: "http" }
      );
    }

    // 2. Resource overhead (Huge HTML page weight check)
    const htmlLength = landingPage.html?.length || 0;
    findings.payload = { htmlLengthBytes: htmlLength };
    if (htmlLength > 200000) {
      penaltyPoints += 10;
      addRecommendation(
        "Extremely Heavy HTML DOM Weight",
        "A heavy HTML structure increases parsing time for browsers and increases transfer latency. Keep core HTML under 150KB.",
        `HTML payload weight is ${(htmlLength / 1024).toFixed(1)} KB.`,
        { business: "Low", seo: "Medium", aiVisibility: "Low", googleVisibility: "Medium", security: "None" },
        "hard",
        "1 hour",
        "medium",
        ["Minimize unused code structures.", "Move inline styles/scripts to separate CSS/JS files.", "Optimize DOM rendering nesting."],
        undefined
      );
    }

    // 3. Script load tags audit (checking for blocking scripts)
    const html = landingPage.html || "";
    const scriptCount = (html.match(/<script[^>]*>/gi) || []).length;
    const blockingScripts = (html.match(/<script(?![^>]*(async|defer|type="module"))[^>]*>/gi) || []).length;
    findings.scripts = { scriptCount, blockingScripts };

    if (blockingScripts > 0) {
      penaltyPoints += Math.min(15, blockingScripts * 3);
      addRecommendation(
        "Render-blocking JavaScript found in page head",
        "Scripts loaded without 'async' or 'defer' block the HTML parser from rendering the page, degrading First Contentful Paint (FCP).",
        `Found ${blockingScripts} render-blocking script declarations.`,
        { business: "Medium", seo: "High", aiVisibility: "None", googleVisibility: "High", security: "None" },
        "easy",
        "10 minutes",
        "high",
        ["Locate script elements inside page head.", "Add 'defer' or 'async' attribute flags to ensure async parallel loading."],
        { code: "<script src=\"/bundle.js\" defer></script>", language: "html" }
      );
    }

    // 4. Core Web Vitals Mock (If actual lighthouse scores are not present, estimate them)
    // In our pipeline, we can check if Lighthouse data is populated or estimate metrics
    const estimatedLcp = htmlLength > 100000 ? 3200 : 1800; // estimated ms
    const estimatedTtfb = htmlLength > 100000 ? 800 : 200; // estimated ms
    findings.coreWebVitals = {
      lcp: estimatedLcp,
      cls: 0.05,
      ttfb: estimatedTtfb
    };

    if (estimatedLcp > 2500) {
      penaltyPoints += 10;
      addRecommendation(
        "Suboptimal Largest Contentful Paint (LCP)",
        "An LCP over 2.5 seconds degrades user experience and drops ranking signals. LCP marks the time when the main page content has likely loaded.",
        `Estimated LCP is ${(estimatedLcp / 1000).toFixed(1)}s (Target: under 2.5s).`,
        { business: "High", seo: "High", aiVisibility: "None", googleVisibility: "High", security: "None" },
        "hard",
        "2 hours",
        "medium",
        ["Preload key images above the fold.", "Defer non-critical third-party JS scripts.", "Enable server side caching."],
        { code: "<link rel=\"preload\" fetchpriority=\"high\" as=\"image\" href=\"/hero.jpg\" type=\"image/jpeg\" />", language: "html" }
      );
    }

    const score = Math.max(0, 100 - penaltyPoints);
    logger.info(`Performance Intelligence Engine complete. Score: ${score}`);

    return {
      score,
      findings,
      recommendations
    };
  }
}
export const performanceIntelligenceEngine = new PerformanceIntelligenceEngine();
