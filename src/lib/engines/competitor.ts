// ============================================================
// Competitor Analysis Engine
// ============================================================

import type { CrawlResult, CompetitorResult, WebsiteUnderstanding } from "@/types";
import { generateCompetitorComparison, generateWebsiteUnderstanding } from "@/lib/gemini";

/**
 * Perform competitor analysis. Compares a target website with a competitor.
 * Utilizes the Gemini API for intelligence and crawls data.
 */
export async function analyzeCompetitor(
  crawlResult: CrawlResult,
  competitorCrawlResult: CrawlResult,
  understanding?: WebsiteUnderstanding
): Promise<CompetitorResult> {
  const finalUnderstanding = understanding || await generateWebsiteUnderstanding(crawlResult);
  // Let the Gemini API do the heavy lifting of semantic gap mapping
  // (which handles both real and mock fallbacks automatically)
  return await generateCompetitorComparison(crawlResult, competitorCrawlResult, finalUnderstanding);
}
