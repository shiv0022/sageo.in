import { IRecommendation } from "@/types/domain";
import { logger } from "@/lib/logging/logger";

export class ValidationEngine {
  public validate(recommendations: IRecommendation[]): IRecommendation[] {
    const validated: IRecommendation[] = [];
    const seenProblems = new Set<string>();

    // 1. Detect conflicts
    // e.g. "noindex" vs optimization
    const hasNoindexRec = recommendations.some((r) =>
      r.problem.toLowerCase().includes("noindex")
    );
    const hasFullRobotsBlock = recommendations.some((r) =>
      r.problem.toLowerCase().includes("entire site blocked")
    );

    for (const rec of recommendations) {
      // 16-field validation check (ensure fields are filled, fallback if empty)
      if (!rec.id) rec.id = `rec-${Math.random().toString(36).substring(2, 9)}`;
      if (!rec.problem) continue; // Invalid recommendation
      if (!rec.reason) rec.reason = "Optimization opportunity identified during site analysis.";
      if (!rec.evidence) rec.evidence = "Detected via automated crawling diagnostics.";
      if (!rec.expectedResult) rec.expectedResult = "Overall improvement in visibility and accessibility.";
      if (!rec.estimatedTime) rec.estimatedTime = "15 minutes";
      if (!rec.aiPrompt) rec.aiPrompt = `Fix: ${rec.problem}`;
      
      // Setup default impacts
      if (!rec.impacts) {
        rec.impacts = {
          business: "Medium",
          seo: "Medium",
          aiVisibility: "Medium",
          googleVisibility: "Medium",
          security: "None",
        };
      }

      // Setup default implementation guide
      if (!rec.implementationGuide) {
        rec.implementationGuide = { steps: ["Inspect source files.", "Apply the suggested standard fixes."] };
      }

      // Normalize key for deduplication
      const normKey = rec.problem.trim().toLowerCase();
      if (seenProblems.has(normKey)) {
        logger.debug(`[Validation] Deduplicated: "${rec.problem}"`);
        continue;
      }

      // Conflict Resolution:
      // If the entire site is blocked or page is flagged noindex, lower priority of secondary optimizations (like meta tags)
      // or drop conflicting recommendations.
      if (hasFullRobotsBlock || hasNoindexRec) {
        const probLower = rec.problem.toLowerCase();
        if (
          (probLower.includes("meta description") ||
            probLower.includes("title tag length") ||
            probLower.includes("og:") ||
            probLower.includes("schema")) &&
          !probLower.includes("noindex") &&
          !probLower.includes("robots.txt")
        ) {
          logger.debug(`[Validation] Suppressed conflicting optimization recommendation: "${rec.problem}" due to indexing block.`);
          continue;
        }
      }

      seenProblems.add(normKey);
      validated.push(rec);
    }

    return validated;
  }
}

export const validationEngine = new ValidationEngine();
