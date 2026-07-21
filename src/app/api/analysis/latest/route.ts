import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logging/logger";

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

    // Try loading the composed report containing full AuditDocument and crawlSnapshot
    let auditDocument = null;
    let crawlResult: any = { pages: [], url: latestProject.website_url, specialFiles: {}, sitemaps: [] };

    try {
      const fs = await import("fs");
      const path = await import("path");
      const filePath = path.join(process.cwd(), ".data", "composed-reports", `${latestAudit.id}.json`);
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(raw);
        auditDocument = parsed.document;
        if (parsed.crawlSnapshot) {
          crawlResult = parsed.crawlSnapshot;
        }
      }
    } catch (err) {
      logger.warn("Failed to load composed report for latest analysis:", err);
    }

    // Reconstruct analysis result from stored data
    const result = {
      project: latestProject,
      audit: latestAudit,
      crawlResult: crawlResult,
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
      auditDocument
    };

    return NextResponse.json(result);
  } catch (error) {
    logger.error("[API] Error fetching latest analysis:", error);
    return NextResponse.json(
      { error: "Failed to fetch latest analysis" },
      { status: 500 }
    );
  }
}
