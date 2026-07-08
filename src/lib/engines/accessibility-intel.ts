import { IEngine, IEngineContext, IEngineResult } from "@/lib/interfaces";
import { IRecommendation, DifficultyLevel, PriorityLevel } from "@/types/domain";
import { logger } from "@/lib/logging/logger";
import crypto from "crypto";

export class AccessibilityIntelligenceEngine implements IEngine {
  public readonly name = "accessibility";
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
        aiPrompt: aiPrompt || `Fix this Accessibility (a11y) check: ${problem}. Evidence: ${evidence}`,
        expectedResult: "Website conforms to WCAG 2.1 AA accessibility guidelines."
      });
    };

    // 1. Missing Image Alt texts
    const totalImages = landingPage.images.length;
    const missingAltCount = landingPage.images.filter((img) => !img.altText).length;
    findings.images = { totalCount: totalImages, missingAlt: missingAltCount };

    if (totalImages > 0 && missingAltCount > 0) {
      const ratio = missingAltCount / totalImages;
      penaltyPoints += Math.round(ratio * 30);
      addRecommendation(
        "Images lack descriptive alt attribute tags",
        "Screen readers read image alt attributes to describe illustrations to visually impaired users. Missing alts fail basic accessibility audits.",
        `${missingAltCount} out of ${totalImages} images do not have an alt attribute.`,
        { business: "Medium", seo: "Medium", aiVisibility: "Low", googleVisibility: "Medium", security: "None" },
        "easy",
        "10 minutes",
        "high",
        ["Locate images without alt attributes.", "Add alt attributes matching the visual context of each asset."],
        { code: "<img src=\"/logo.png\" alt=\"Company main logo design\" />", language: "html" }
      );
    }

    // 2. Input elements labels presence check
    const html = landingPage.html || "";
    const inputMatches = (html.match(/<input\b[^>]*>/gi) || []).length;
    const labelMatches = (html.match(/<label\b[^>]*>/gi) || []).length;
    findings.forms = { inputsCount: inputMatches, labelsCount: labelMatches };

    if (inputMatches > 0 && labelMatches === 0) {
      penaltyPoints += 15;
      addRecommendation(
        "Missing Form Labels configuration",
        "Input elements require associated label elements or aria-label attributes so screen readers can describe the form fields properly.",
        `Page contains ${inputMatches} input element fields but 0 associated label elements.`,
        { business: "Medium", seo: "None", aiVisibility: "None", googleVisibility: "None", security: "None" },
        "easy",
        "15 minutes",
        "high",
        [
          "Locate form input fields.",
          "Add label elements pointing to inputs using the 'for' attribute, or add 'aria-label' descriptions."
        ],
        { code: "<label for=\"email\">Email</label>\n<input type=\"email\" id=\"email\" />", language: "html" }
      );
    }

    // 3. Tabindex & Keyboard Navigation check (Checking for positive tabindex)
    const hasPositiveTabIndex = /tabindex=["']([1-9][0-9]*)["']/i.test(html);
    findings.keyboardNavigation = { hasPositiveTabIndex };
    if (hasPositiveTabIndex) {
      penaltyPoints += 10;
      addRecommendation(
        "Positive tabindex values detected",
        "Using positive tabindex values (e.g. tabindex='1') disrupts the default natural tab order of document elements, frustrating keyboard navigation users.",
        "Found elements using explicit positive tabindex integers.",
        { business: "Low", seo: "None", aiVisibility: "None", googleVisibility: "None", security: "None" },
        "medium",
        "15 minutes",
        "medium",
        ["Remove positive tabindex attributes.", "Allow browsers to automatically calculate natural keyboard focus order (using default tabindex=0 or -1)."],
        undefined
      );
    }

    // 4. ARIA roles and landmarks presence
    const hasAriaLandmarks = /role=["'](main|navigation|contentinfo|banner|search)["']/i.test(html);
    findings.aria = { hasAriaLandmarks };
    if (!hasAriaLandmarks) {
      penaltyPoints += 8;
      addRecommendation(
        "Missing ARIA Landmark Roles",
        "ARIA landmarks identify the layout structure of page content, helping screen reader users skip immediately to navigation or main body sections.",
        "No explicit main, navigation, banner, or contentinfo ARIA roles found in HTML.",
        { business: "Low", seo: "None", aiVisibility: "None", googleVisibility: "None", security: "None" },
        "easy",
        "10 minutes",
        "medium",
        ["Add landmark role attributes to structural tags (e.g., role='main' to `<main>`, role='navigation' to `<nav>`)."],
        { code: "<main role=\"main\">\n  <!-- Core Content -->\n</main>", language: "html" }
      );
    }

    const score = Math.max(0, 100 - penaltyPoints);
    logger.info(`Accessibility Engine complete. Score: ${score}`);

    return {
      score,
      findings,
      recommendations
    };
  }
}
export const accessibilityIntelligenceEngine = new AccessibilityIntelligenceEngine();
