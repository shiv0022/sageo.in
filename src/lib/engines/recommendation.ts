import { IRecommendation, PriorityLevel } from "@/types/domain";
import { logger } from "@/lib/logging/logger";

/**
 * Merges, de-duplicates, and prioritizes recommendations across all analysis engines.
 */
export function mergeAndPrioritizeRecommendations(
  engineOutputs: Record<string, any>[]
): IRecommendation[] {
  const merged: IRecommendation[] = [];
  const seenProblems = new Set<string>();

  const priorityWeights: Record<PriorityLevel, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  for (const output of engineOutputs) {
    const recs = output.recommendations || [];
    for (const rec of recs) {
      // Normalize problem text to detect duplication
      const normalizedProblem = rec.problem.trim().toLowerCase();
      if (seenProblems.has(normalizedProblem)) {
        logger.debug(`De-duplicated overlapping recommendation: "${rec.problem}"`);
        continue;
      }
      seenProblems.add(normalizedProblem);
      merged.push(rec);
    }
  }

  // Sort by priority weight (highest first)
  return merged.sort((a, b) => {
    const weightA = priorityWeights[a.priority] || 0;
    const weightB = priorityWeights[b.priority] || 0;
    return weightB - weightA;
  });
}

// Legacy wrapper to support compatibility during transition
export function generateRecommendations(
  seoResult: any,
  aeoResult: any,
  geoResult: any,
  accessResult: any,
  competitorResult?: any
): any[] {
  // Convert standard results to mock engine outputs for our new prioritizer
  const outputs = [
    { recommendations: seoResult?.recommendations || [] },
    { recommendations: aeoResult?.recommendations || [] },
    { recommendations: geoResult?.recommendations || [] },
    { recommendations: accessResult?.recommendations || [] }
  ];

  const prioritized = mergeAndPrioritizeRecommendations(outputs);

  // Return mapped legacy recommendations structure
  return prioritized.map((r) => ({
    id: r.id,
    problem: r.problem,
    reason: r.reason,
    priority: r.priority,
    impact: r.impacts.seo || "+5 SEO",
    difficulty: r.difficulty,
    confidence: r.confidenceScore,
    expectedGain: r.impacts.seo || "+5 SEO",
    category: r.frameworkContext ? "seo" : "aeo"
  }));
}
