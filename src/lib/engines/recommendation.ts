// ============================================================
// Recommendation Engine - Compiling & Scoring Fixes
// ============================================================

import type { Recommendation, Issue, IssueCategory, Priority, Difficulty } from "@/types";
import { v4 as uuidv4 } from "uuid";

export function generateRecommendations(
  seoResult: any,
  aeoResult: any,
  geoResult: any,
  accessResult: any,
  competitorResult?: any
): Recommendation[] {
  const seoIssues = seoResult?.issues || [];
  const aeoIssues = aeoResult?.issues || [];
  const geoIssues = geoResult?.issues || [];
  const accessIssues = accessResult?.issues || [];

  const allIssues = [...seoIssues, ...aeoIssues, ...geoIssues, ...accessIssues];

  // If there are competitor gaps, convert some into recommendations
  if (competitorResult?.gaps) {
    const gaps = competitorResult.gaps;
    if (gaps.keywordGap && gaps.keywordGap.length > 0) {
      allIssues.push({
        id: uuidv4(),
        audit_id: "",
        category: "competitor",
        title: "Keyword Gaps identified compared to Competitor",
        description: `Your competitor ranks for keywords you are missing: ${gaps.keywordGap.slice(0, 5).join(", ")}. Optimize pages for these terms.`,
        priority: "medium",
        impact: "Higher organic search share",
        difficulty: "medium",
        confidence: 85,
      });
    }
    if (gaps.schemaGap && gaps.schemaGap.length > 0) {
      allIssues.push({
        id: uuidv4(),
        audit_id: "",
        category: "competitor",
        title: "Structured Data / Schema Gaps",
        description: `Add missing schemas found on competitor site: ${gaps.schemaGap.join(", ")}.`,
        priority: "medium",
        impact: "Enhanced rich snippets",
        difficulty: "easy",
        confidence: 90,
      });
    }
  }

  const recommendations: Recommendation[] = allIssues.map((issue) => {
    let expectedGain = "";
    if (issue.impact) {
      expectedGain = issue.impact;
    } else {
      switch (issue.priority) {
        case "critical":
          expectedGain = `+20 ${issue.category.toUpperCase()} Index`;
          break;
        case "high":
          expectedGain = `+10 ${issue.category.toUpperCase()} Index`;
          break;
        case "medium":
          expectedGain = `+5 ${issue.category.toUpperCase()} Index`;
          break;
        case "low":
          expectedGain = `+2 ${issue.category.toUpperCase()} Index`;
          break;
      }
    }

    return {
      id: issue.id || uuidv4(),
      problem: issue.title,
      reason: issue.description,
      priority: issue.priority,
      impact: expectedGain,
      difficulty: issue.difficulty,
      confidence: issue.confidence || 90,
      expectedGain: expectedGain,
      category: issue.category,
    };
  });

  const priorityOrder: Record<Priority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}
