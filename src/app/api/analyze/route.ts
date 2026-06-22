import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import type { ReportType } from "@/types";

export const maxDuration = 300; // 5 minute timeout for analysis
export const dynamic = "force-dynamic";

// SSE helper
function createSSEStream() {
  const encoder = new TextEncoder();
  let controller: ReadableStreamDefaultController | null = null;

  const stream = new ReadableStream({
    start(c) {
      controller = c;
    },
  });

  const send = (data: Record<string, unknown>) => {
    if (controller) {
      try {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      } catch {
        // Stream closed
      }
    }
  };

  const close = () => {
    if (controller) {
      try {
        controller.close();
      } catch {
        // Already closed
      }
    }
  };

  return { stream, send, close };
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    websiteUrl,
    competitorUrl,
    githubUrl,
    reports = ["website_analysis"],
  } = body as {
    websiteUrl: string;
    competitorUrl?: string;
    githubUrl?: string;
    reports: ReportType[];
  };

  if (!websiteUrl) {
    return new Response(JSON.stringify({ error: "Website URL is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { stream, send, close } = createSSEStream();

  // Run analysis in background
  (async () => {
    try {
      const db = getDb();

      // 1. Create project
      send({ status: "crawling", progress: 5, message: "Creating project..." });
      const project = await db.createProject({
        website_url: websiteUrl,
        competitor_url: competitorUrl,
        github_url: githubUrl,
      });

      // 2. Crawl website
      send({ status: "crawling", progress: 10, message: "Crawling website..." });

      let crawlResult;
      try {
        const { crawlWebsite } = await import("@/lib/engines/crawler");
        crawlResult = await crawlWebsite(websiteUrl);
        send({ status: "crawling", progress: 20, message: `Crawled ${crawlResult.pages.length} pages` });
      } catch (err) {
        console.error("[Crawl Error]", err);
        crawlResult = {
          url: websiteUrl,
          html: "",
          statusCode: 0,
          headers: {},
          pages: [],
          loadTime: 0,
        };
        send({ status: "crawling", progress: 20, message: "Crawl completed with limited data" });
      }

      // 3. Detect technology
      send({ status: "detecting_technology", progress: 25, message: "Detecting technology stack..." });
      let technologyStack;
      try {
        const { detectTechnology } = await import("@/lib/engines/technology");
        technologyStack = detectTechnology(crawlResult);
      } catch {
        technologyStack = {
          framework: "Unknown",
          languages: [],
          analytics: [],
          cdns: [],
          libraries: [],
          meta: {},
        };
      }

      // 4. Run Lighthouse
      send({ status: "running_lighthouse", progress: 30, message: "Running Lighthouse audit..." });
      let lighthouseScores;
      try {
        const { runLighthouse } = await import("@/lib/engines/lighthouse");
        lighthouseScores = await runLighthouse(websiteUrl);
        send({ status: "running_lighthouse", progress: 40, message: `Lighthouse complete: SEO ${lighthouseScores.seo}/100` });
      } catch (err) {
        console.error("[Lighthouse Error]", err);
        lighthouseScores = { seo: 0, performance: 0, accessibility: 0, bestPractices: 0 };
        send({ status: "running_lighthouse", progress: 40, message: "Lighthouse skipped" });
      }

      // 5. SEO Analysis
      send({ status: "analyzing_seo", progress: 45, message: "Analyzing SEO..." });
      let seoResult;
      try {
        const { analyzeSEO } = await import("@/lib/engines/seo");
        seoResult = analyzeSEO(crawlResult);
      } catch {
        seoResult = { score: 0, issues: [], details: {} };
      }

      // 6. AEO Analysis
      send({ status: "analyzing_aeo", progress: 55, message: "Analyzing AEO..." });
      let aeoResult;
      try {
        const { analyzeAEO } = await import("@/lib/engines/aeo");
        aeoResult = analyzeAEO(crawlResult);
      } catch {
        aeoResult = { score: 0, issues: [], details: {} };
      }

      // 7. GEO Analysis
      send({ status: "analyzing_geo", progress: 65, message: "Analyzing GEO..." });
      let geoResult;
      try {
        const { analyzeGEO } = await import("@/lib/engines/geo");
        geoResult = analyzeGEO(crawlResult);
      } catch {
        geoResult = { score: 0, issues: [], details: {} };
      }

      // 8. Access Analysis
      send({ status: "analyzing_access", progress: 75, message: "Analyzing access..." });
      let accessResult;
      try {
        const { analyzeAccess } = await import("@/lib/engines/access");
        accessResult = analyzeAccess(crawlResult);
      } catch {
        accessResult = { score: 0, issues: [], details: {} };
      }

      // 9. Competitor Analysis
      let competitorResult;
      if (competitorUrl) {
        send({ status: "analyzing_competitor", progress: 80, message: "Analyzing competitor..." });
        try {
          const { analyzeCompetitor } = await import("@/lib/engines/competitor");
          const { crawlWebsite: crawlCompetitor } = await import("@/lib/engines/crawler");
          const competitorCrawl = await crawlCompetitor(competitorUrl);
          competitorResult = await analyzeCompetitor(crawlResult, competitorCrawl);
        } catch {
          // Competitor analysis optional
        }
      }

      // 10. Generate recommendations
      send({ status: "generating_recommendations", progress: 85, message: "Generating recommendations..." });
      let recommendations;
      try {
        const { generateRecommendations } = await import("@/lib/engines/recommendation");
        recommendations = generateRecommendations(
          seoResult,
          aeoResult,
          geoResult,
          accessResult,
          competitorResult
        );
      } catch {
        recommendations = [];
      }

      // 11. Save audit
      send({ status: "generating_recommendations", progress: 90, message: "Saving results..." });
      const audit = await db.createAudit({
        project_id: project.id,
        seo_score: seoResult.score || 0,
        aeo_score: aeoResult.score || 0,
        geo_score: geoResult.score || 0,
        access_score: accessResult.score || 0,
        lighthouse_scores: lighthouseScores,
        technology_stack: technologyStack,
      });

      // Save issues
      if (recommendations.length > 0) {
        await db.createIssues(
          recommendations.map((r: { problem: string; reason: string; priority: string; impact: string; difficulty: string; confidence: number; category: string }) => ({
            audit_id: audit.id,
            category: r.category as "seo" | "aeo" | "geo" | "access" | "performance" | "content" | "competitor",
            title: r.problem,
            description: r.reason,
            priority: r.priority as "critical" | "high" | "medium" | "low",
            impact: r.impact,
            difficulty: r.difficulty as "easy" | "medium" | "hard",
            confidence: r.confidence,
          }))
        );
      }

      // 12. Generate PDF reports
      send({ status: "generating_recommendations", progress: 95, message: "Generating reports..." });
      try {
        const { generatePdfReport } = await import("@/lib/engines/pdf");
        const pdfData = {
          project,
          audit,
          seoResult,
          aeoResult,
          geoResult,
          accessResult,
          recommendations,
          technologyStack,
          competitorResult,
        };

        const generatedReportsList: any[] = [];
        for (const rType of reports) {
          try {
            const reportUrl = await generatePdfReport(pdfData, rType);
            const createdReport = await db.createReport({
              audit_id: audit.id,
              report_type: rType,
              file_url: reportUrl,
            });
            generatedReportsList.push(createdReport);
          } catch (pdfErr) {
            console.warn(`[PDF Error] Server-side PDF generation failed for ${rType}. Registering client-side fallback URL.`, pdfErr);
            const createdReport = await db.createReport({
              audit_id: audit.id,
              report_type: rType,
              file_url: `client-pdf:${rType}`,
            });
            generatedReportsList.push(createdReport);
          }
        }
        
        // Reconstruct the full analysis result object for client caching
        const fullAnalysisResult = {
          project,
          audit,
          crawlResult: { pages: [], url: project.website_url },
          seoResult: { score: audit.seo_score, issues: [], details: {} },
          aeoResult: { score: audit.aeo_score, issues: [], details: {} },
          geoResult: { score: audit.geo_score, issues: [], details: {} },
          accessResult: { score: audit.access_score, issues: [], details: {} },
          recommendations: recommendations.map((r: any, index: number) => ({
            id: r.id || String(index),
            problem: r.problem,
            reason: r.reason,
            priority: r.priority,
            impact: r.impact,
            difficulty: r.difficulty,
            confidence: r.confidence,
            expectedGain: r.impact,
            category: r.category,
          })),
          technologyStack: audit.technology_stack || {
            framework: "Unknown",
            languages: [],
            analytics: [],
            cdns: [],
            libraries: [],
            meta: {},
          },
          websiteUnderstanding: audit.website_understanding || {},
          lighthouseScores: audit.lighthouse_scores || {},
        };

        // Complete
        send({
          status: "complete",
          progress: 100,
          message: "Analysis complete!",
          projectId: project.id,
          auditId: audit.id,
          result: fullAnalysisResult,
          reports: generatedReportsList,
        });
      } catch (err) {
        console.error("[PDF Engine Error]", err);
        // Complete even if PDF generation failed
        send({
          status: "complete",
          progress: 100,
          message: "Analysis complete (with PDF errors)!",
          projectId: project.id,
          auditId: audit.id,
        });
      }
    } catch (error) {
      console.error("[Analysis Error]", error);
      send({
        status: "error",
        progress: 0,
        message: error instanceof Error ? error.message : "Analysis failed",
      });
    } finally {
      setTimeout(close, 500);
    }
  })();

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
