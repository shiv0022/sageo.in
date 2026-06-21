import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const projects = await db.listProjects();

    if (projects.length === 0) {
      return NextResponse.json(null, { status: 404 });
    }

    const latestProject = projects[0];
    const latestAudit = await db.getLatestAudit(latestProject.id);

    if (!latestAudit) {
      return NextResponse.json(null, { status: 404 });
    }

    const issues = await db.getIssuesByAudit(latestAudit.id);

    // Reconstruct analysis result from stored data
    const result = {
      project: latestProject,
      audit: latestAudit,
      crawlResult: { pages: [], url: latestProject.website_url },
      seoResult: { score: latestAudit.seo_score, issues: [], details: {} },
      aeoResult: { score: latestAudit.aeo_score, issues: [], details: {} },
      geoResult: { score: latestAudit.geo_score, issues: [], details: {} },
      accessResult: { score: latestAudit.access_score, issues: [], details: {} },
      recommendations: issues.map((issue) => ({
        id: issue.id,
        problem: issue.title,
        reason: issue.description,
        priority: issue.priority,
        impact: issue.impact,
        difficulty: issue.difficulty,
        confidence: issue.confidence,
        expectedGain: issue.impact,
        category: issue.category,
      })),
      technologyStack: latestAudit.technology_stack || {
        framework: "Unknown",
        languages: [],
        analytics: [],
        cdns: [],
        libraries: [],
        meta: {},
      },
      websiteUnderstanding: latestAudit.website_understanding || {},
      lighthouseScores: latestAudit.lighthouse_scores || {},
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Error fetching latest analysis:", error);
    return NextResponse.json(
      { error: "Failed to fetch latest analysis" },
      { status: 500 }
    );
  }
}
