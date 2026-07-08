import { IEngine, IEngineContext, IEngineResult } from "@/lib/interfaces";
import { IRecommendation, DifficultyLevel, PriorityLevel } from "@/types/domain";
import { logger } from "@/lib/logging/logger";
import crypto from "crypto";

export class SecurityIntelligenceEngine implements IEngine {
  public readonly name = "security";
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
        aiPrompt: aiPrompt || `Fix this security header or protocol issue: ${problem}. Evidence: ${evidence}`,
        expectedResult: "Website security score increases and client browsing session remains fully secure."
      });
    };

    // 1. HTTPS Audit
    const isHttps = landingPage.url.startsWith("https://");
    findings.https = { active: isHttps };
    if (!isHttps) {
      penaltyPoints += 50;
      addRecommendation(
        "Website is not using secure HTTPS protocol",
        "HTTPS encrypts communication between the browser and the server. Websites using plain HTTP trigger browser warnings and are penalized by search engines.",
        `Url protocol is: "${landingPage.url.substring(0, 5)}" (HTTP).`,
        { business: "Critical", seo: "Critical", aiVisibility: "Low", googleVisibility: "Critical", security: "Critical" },
        "medium",
        "1 hour",
        "critical",
        [
          "Purchase or configure a free SSL/TLS certificate (e.g. Let's Encrypt).",
          "Configure server redirection rules to force HTTP requests to redirect to HTTPS."
        ],
        undefined
      );
    }

    // 2. Security Headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
    const headers = landingPage.headers || {};
    const csp = headers["content-security-policy"] || headers["Content-Security-Policy"] || "";
    const hsts = headers["strict-transport-security"] || headers["Strict-Transport-Security"] || "";
    const xFrame = headers["x-frame-options"] || headers["X-Frame-Options"] || "";
    const xContentType = headers["x-content-type-options"] || headers["X-Content-Type-Options"] || "";

    findings.headers = {
      hasCsp: !!csp,
      hasHsts: !!hsts,
      hasXFrame: !!xFrame,
      hasXContentType: !!xContentType
    };

    if (!csp) {
      penaltyPoints += 15;
      addRecommendation(
        "Missing Content Security Policy (CSP) Header",
        "CSP prevents cross-site scripting (XSS) and code injection attacks by restricting which sources assets can load from.",
        "No Content-Security-Policy header detected in server response headers.",
        { business: "High", seo: "Low", aiVisibility: "None", googleVisibility: "Low", security: "High" },
        "hard",
        "2 hours",
        "high",
        ["Add Content-Security-Policy header declaration to your server configuration or web server config file."],
        { code: "Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline';", language: "http" }
      );
    }

    if (!hsts && isHttps) {
      penaltyPoints += 10;
      addRecommendation(
        "Missing HSTS Header",
        "HSTS (Strict-Transport-Security) forces browsers to only connect via HTTPS, preventing man-in-the-middle attacks.",
        "No Strict-Transport-Security header found on response headers.",
        { business: "Medium", seo: "Low", aiVisibility: "None", googleVisibility: "Low", security: "High" },
        "medium",
        "30 minutes",
        "high",
        ["Add Strict-Transport-Security header to server configuration."],
        { code: "Strict-Transport-Security: max-age=63072000; includeSubDomains; preload", language: "http" }
      );
    }

    if (!xFrame) {
      penaltyPoints += 8;
      addRecommendation(
        "Missing X-Frame-Options Header",
        "X-Frame-Options prevents clickjacking attacks by blocking browsers from rendering your page inside iframes.",
        "X-Frame-Options header not found.",
        { business: "Low", seo: "None", aiVisibility: "None", googleVisibility: "None", security: "Medium" },
        "easy",
        "10 minutes",
        "medium",
        ["Set X-Frame-Options header value to DENY or SAMEORIGIN."],
        { code: "X-Frame-Options: SAMEORIGIN", language: "http" }
      );
    }

    // 3. security.txt presence
    const hasSecurityTxt = !!snapshot.specialFiles?.securityTxt;
    findings.securityTxt = { exists: hasSecurityTxt };
    if (!hasSecurityTxt) {
      penaltyPoints += 5;
      addRecommendation(
        "Missing security.txt file",
        "The security.txt standard tells security researchers where and how to report vulnerabilities on your site securely.",
        "No security.txt file located inside /.well-known/ or root directories.",
        { business: "Low", seo: "None", aiVisibility: "None", googleVisibility: "None", security: "Low" },
        "easy",
        "5 minutes",
        "low",
        ["Create a file named 'security.txt' inside the public folder root.", "Specify your security contact address."],
        { code: "Contact: mailto:security@yourdomain.com\nExpires: 2027-01-01T00:00:00.000Z", language: "txt" }
      );
    }

    // 4. Mixed Content check (HTTP scripts/images in HTML source)
    const content = landingPage.html || "";
    const httpAssets: string[] = [];
    const scriptRegex = /<script\s+[^>]*src=["'](http:\/\/[^"']+)["']/gi;
    const imgRegex = /<img\s+[^>]*src=["'](http:\/\/[^"']+)["']/gi;
    
    let match;
    while ((match = scriptRegex.exec(content)) !== null) {
      httpAssets.push(match[1]);
    }
    while ((match = imgRegex.exec(content)) !== null) {
      httpAssets.push(match[1]);
    }

    findings.mixedContent = { count: httpAssets.length, list: httpAssets };
    if (httpAssets.length > 0 && isHttps) {
      penaltyPoints += Math.min(20, httpAssets.length * 5);
      addRecommendation(
        "Mixed Content Assets Detected",
        "Mixed content occurs when an HTTPS page loads scripts or assets over plain HTTP, allowing attackers to hijack script execution.",
        `Found ${httpAssets.length} insecure HTTP asset links: ${httpAssets.slice(0, 3).join(", ")}`,
        { business: "High", seo: "Medium", aiVisibility: "None", googleVisibility: "Medium", security: "High" },
        "medium",
        "30 minutes",
        "high",
        ["Locate page script/image tags referencing plain HTTP URLs.", "Modify links to reference relative paths or secure HTTPS protocols."],
        undefined
      );
    }

    const score = Math.max(0, 100 - penaltyPoints);
    logger.info(`Security Engine complete. Score: ${score}`);

    return {
      score,
      findings,
      recommendations
    };
  }
}
export const securityIntelligenceEngine = new SecurityIntelligenceEngine();
