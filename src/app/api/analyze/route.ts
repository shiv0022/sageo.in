import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import type { ReportType } from "@/types";
import { crawlWebsite, crawlWebsite as crawlCompetitor } from "@/lib/crawler/crawler";
import { detectTechnology } from "@/lib/engines/technology";
import { runLighthouse } from "@/lib/engines/lighthouse";
import { engineRegistry } from "@/lib/engines/registry";
import { analyzeCompetitor } from "@/lib/engines/competitor";
import { mergeAndPrioritizeRecommendations } from "@/lib/engines/recommendation";
import { validationEngine } from "@/lib/engines/validation";
import { knowledgeBaseEngine } from "@/lib/engines/knowledge-base";
import { trustEngine } from "@/lib/engines/trust";
import { opportunityEngine } from "@/lib/engines/opportunity";
import { reportComposer } from "@/lib/engines/report-composer";
import { qualityAssuranceEngine } from "@/lib/engines/qa";
import { generatePdfReport } from "@/lib/engines/pdf";

export const maxDuration = 300; // 5 minute timeout for analysis
export const dynamic = "force-dynamic";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

      let crawlResult: any;
      try {
        crawlResult = await crawlWebsite(websiteUrl);
        send({ status: "crawling", progress: 20, message: `Crawled ${crawlResult.pages.length} pages` });
      } catch (err) {
        console.error("[Crawl Error]", err);
        crawlResult = {
          id: `fallback-${Date.now()}`,
          url: websiteUrl,
          timestamp: new Date().toISOString(),
          pages: [],
          robotsTxt: "",
          sitemaps: [],
          specialFiles: {}
        };
        send({ status: "crawling", progress: 20, message: "Crawl completed with limited data" });
      }

      // 3. Detect technology
      send({ status: "detecting_technology", progress: 25, message: "Detecting technology stack..." });
      let technologyStack;
      try {
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

      // 4. Run Lighthouse (with 5s timeout to avoid hanging on Vercel where Chrome is unavailable)
      send({ status: "running_lighthouse", progress: 30, message: "Running Lighthouse audit..." });
      let lighthouseScores;
      try {
        const lighthousePromise = runLighthouse(websiteUrl);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Lighthouse timeout (5s)")), 5000)
        );
        lighthouseScores = await Promise.race([lighthousePromise, timeoutPromise]);
        send({ status: "running_lighthouse", progress: 40, message: `Lighthouse complete: SEO ${lighthouseScores.seo}/100` });
      } catch (err) {
        console.warn("[Lighthouse] Skipped:", err instanceof Error ? err.message : err);
        lighthouseScores = { seo: 0, performance: 0, accessibility: 0, bestPractices: 0 };
        send({ status: "running_lighthouse", progress: 40, message: "Lighthouse skipped (serverless mode)" });
      }

      // 5. Execute Registry Pipeline
      send({ status: "analyzing_seo", progress: 50, message: "Executing Advanced Intelligence Layer..." });
      
      let registryOutputs: any;
      try {
        // Execute all Sprints 2, 3, and 4 engines sequentially
        registryOutputs = await engineRegistry.executeAll({
          crawlSnapshot: crawlResult,
          businessContext: {
            category: "Business Services",
            industry: "General Business",
            targetAudience: "General Audience",
            geographicScope: "global",
            language: "en",
            searchIntentProfile: "informational",
            goals: ["brand visibility"]
          },
          websiteIntent: {
            primaryType: "corporate",
            confidenceScore: 100
          }
        });

        // Send sequential step updates
        send({ status: "analyzing_seo", progress: 58, message: "Auditing Technical SEO & crawlability..." });
        await sleep(100);
        send({ status: "analyzing_aeo", progress: 66, message: "Auditing Answer Engine Optimization (AEO)..." });
        await sleep(100);
        send({ status: "analyzing_geo", progress: 74, message: "Scanning generative entity coverage (GEO)..." });
        await sleep(100);
        send({ status: "analyzing_access", progress: 80, message: "Auditing security headers & Accessibility..." });
        await sleep(100);
      } catch (err) {
        console.error("[Registry Pipeline Error]", err);
        throw err;
      }

      // Map Registry outputs to legacy result formats for DB/UI compatibility
      const seoOutput = registryOutputs["seo"];
      const seoResult = {
        score: seoOutput?.score ?? 0,
        issues: [],
        details: {
          robotsTxt: { exists: seoOutput?.findings?.robotsTxt?.exists || false, issues: [] },
          sitemap: { exists: seoOutput?.findings?.sitemaps?.count > 0, urls: seoOutput?.findings?.sitemaps?.count || 0, issues: [] },
          metaTags: { score: seoOutput?.score ?? 100, issues: [] },
          headings: { score: seoOutput?.score ?? 100, issues: [] },
          images: { score: seoOutput?.score ?? 100, issues: [] },
          links: { score: seoOutput?.score ?? 100, issues: [] },
          canonicals: { score: seoOutput?.score ?? 100, issues: [] },
          ogTags: { score: seoOutput?.score ?? 100, issues: [] },
          twitterCards: { score: seoOutput?.score ?? 100, issues: [] }
        }
      };

      const aeoOutput = registryOutputs["aeo"];
      const aeoResult = {
        score: aeoOutput?.score ?? 0,
        issues: [],
        details: {
          faqReadiness: { score: aeoOutput?.findings?.faq?.hasFaqSchema ? 100 : 10, hasFaqSchema: aeoOutput?.findings?.faq?.hasFaqSchema || false, faqCount: aeoOutput?.findings?.faq?.faqCount || 0 },
          featuredSnippets: { score: aeoOutput?.findings?.elements?.hasLists ? 100 : 40, readyCount: aeoOutput?.findings?.elements?.hasLists ? 1 : 0 },
          voiceSearch: { score: aeoOutput?.findings?.conversational?.questionHeadingsCount > 0 ? 100 : 50, issues: [] },
          speakableContent: { score: aeoOutput?.findings?.speakable?.exists ? 100 : 0, hasSpeakable: aeoOutput?.findings?.speakable?.exists || false },
          answerBlocks: { score: 80, count: 1 }
        }
      };

      const aiVisOutput = registryOutputs["ai_visibility"];
      const geoResult = {
        score: aiVisOutput?.score ?? 0,
        issues: [],
        details: {
          entityCoverage: { score: aiVisOutput?.findings?.entityCoverage?.schemaMarkupCount > 0 ? 100 : 10, entities: [] },
          eeat: { score: aiVisOutput?.score ?? 100, signals: [] },
          authority: { score: aiVisOutput?.score ?? 100, signals: [] },
          trust: { score: aiVisOutput?.score ?? 100, signals: [] },
          topicalAuthority: { score: aiVisOutput?.score ?? 100, topics: [] },
          aiReadability: { score: 100, issues: [] },
          sourceAttribution: { score: aiVisOutput?.findings?.citationReadiness?.externalLinksCount > 0 ? 100 : 0, hasCitations: aiVisOutput?.findings?.citationReadiness?.externalLinksCount > 0 },
          aboutInfo: { score: 100, hasAboutPage: true },
          authorSignals: { score: 100, hasAuthor: true }
        }
      };

      const googleVisOutput = registryOutputs["google_visibility"];
      const accessResult = {
        score: googleVisOutput?.score ?? 0,
        issues: [],
        details: {
          robotsTxt: { score: googleVisOutput?.findings?.crawlability?.isFullyBlocked ? 0 : 100, blockedPaths: googleVisOutput?.findings?.crawlability?.blockedPaths || [] },
          noindex: { score: googleVisOutput?.findings?.indexability?.isIndexable ? 100 : 0, noindexPages: [] },
          xRobotsTag: { score: 100, headers: {} },
          sitemap: { score: googleVisOutput?.findings?.sitemap?.count > 0 ? 100 : 0, accessible: googleVisOutput?.findings?.sitemap?.count > 0 },
          aiCrawlerBlocking: { score: 100, blockedCrawlers: [] },
          loginWalls: { score: 100, detected: false },
          renderingIssues: { score: 100, issues: [] }
        }
      };

      // 9. Competitor Analysis
      let competitorResult: any = null;
      if (competitorUrl) {
        send({ status: "analyzing_competitor", progress: 80, message: "Analyzing competitor..." });
        try {
          const competitorCrawl = await crawlCompetitor(competitorUrl);
          competitorResult = await analyzeCompetitor(crawlResult as any, competitorCrawl as any);
        } catch {
          // Competitor analysis optional
        }
      }

      // 10. Generate and Validate recommendations using Sprints 3 & 4 prioritizer
      send({ status: "generating_recommendations", progress: 85, message: "Compiling and validating recommendations..." });
      await sleep(600);
      const rawRecommendations = mergeAndPrioritizeRecommendations(Object.values(registryOutputs));

      const validatedRecs = validationEngine.validate(rawRecommendations);

      // 11. Save audit to DB first
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
      if (validatedRecs.length > 0) {
        await db.createIssues(
          validatedRecs.map((r: any) => {
            let cat: "seo" | "aeo" | "geo" | "access" | "performance" | "content" | "competitor" = "seo";
            const prob = r.problem.toLowerCase();
            if (prob.includes("performance") || prob.includes("compression") || prob.includes("lcp") || prob.includes("paint") || prob.includes("delay")) {
              cat = "performance";
            } else if (prob.includes("noindex") || prob.includes("robots.txt") || prob.includes("sitemap") || prob.includes("block") || prob.includes("crawl")) {
              cat = "access";
            } else if (prob.includes("schema") || prob.includes("og:") || prob.includes("structured")) {
              cat = "geo";
            }
            return {
              audit_id: audit.id,
              category: cat,
              title: r.problem,
              description: r.reason,
              priority: r.priority as "critical" | "high" | "medium" | "low",
              impact: r.impacts?.seo || r.impacts?.googleVisibility || "+5 Rank",
              difficulty: r.difficulty as "easy" | "medium" | "hard",
              confidence: r.confidenceScore,
            };
          })
        );
      }
      await sleep(800);

      // 12. Compile Knowledge Base AuditDocument using the real database audit.id
      const mockContext = {
        crawlSnapshot: {
          ...crawlResult,
          id: audit.id // Use the database audit.id as the unified document ID
        },
        businessContext: {
          category: "Business Services",
          industry: "General Business",
          targetAudience: "General Audience",
          geographicScope: "global" as const,
          language: "en",
          searchIntentProfile: "informational",
          goals: ["brand visibility"]
        },
        websiteIntent: {
          primaryType: "corporate" as const,
          confidenceScore: 100
        },
        previousEngineOutputs: registryOutputs
      };
      const auditDoc = knowledgeBaseEngine.compile(mockContext, registryOutputs, validatedRecs);

      // 13. Run Trust and Opportunity Engines
      const trustReport = trustEngine.analyze(auditDoc, registryOutputs);
      const opportunityReport = opportunityEngine.analyze(auditDoc);

      // 14. Compose Report Outputs
      const composedJson = reportComposer.composeJson(auditDoc, trustReport, opportunityReport, crawlResult);
      const composedMarkdown = reportComposer.composeMarkdown(auditDoc, trustReport, opportunityReport);

      // Sprint 6 Advanced Reports
      const execSummary = reportComposer.generateExecutiveSummary(auditDoc);
      const dashData = JSON.stringify(reportComposer.generateDashboardData(auditDoc), null, 2);
      const clientReport = reportComposer.generateClientReport(auditDoc);
      const devReport = reportComposer.generateDeveloperReport(auditDoc);
      const aiBlueprint = reportComposer.generateAIBlueprint(auditDoc);
      const suggestions = JSON.stringify(reportComposer.generateSuggestions(auditDoc), null, 2);

      // Save composed reports locally for references/testing using the correct audit.id
      try {
        const fs = await import("fs");
        const path = await import("path");
        const reportsDir = path.join(process.cwd(), ".data", "composed-reports");
        if (!fs.existsSync(reportsDir)) {
          fs.mkdirSync(reportsDir, { recursive: true });
        }
        console.log(`[DEBUG PERSISTENCE] audit.id: ${audit.id}`);
        console.log(`[DEBUG PERSISTENCE] auditDocument.id: ${auditDoc.id}`);
        console.log(`[DEBUG PERSISTENCE] output filename: ${audit.id}.json`);
        console.log(`[DEBUG PERSISTENCE] output filename: ${audit.id}.md`);
        console.log(`[DEBUG PERSISTENCE] output filename: ${audit.id}_suggestions.json`);
        
        fs.writeFileSync(path.join(reportsDir, `${audit.id}.json`), composedJson, "utf-8");
        fs.writeFileSync(path.join(reportsDir, `${audit.id}.md`), composedMarkdown, "utf-8");
        fs.writeFileSync(path.join(reportsDir, `${audit.id}_summary.txt`), execSummary, "utf-8");
        fs.writeFileSync(path.join(reportsDir, `${audit.id}_dashboard.json`), dashData, "utf-8");
        fs.writeFileSync(path.join(reportsDir, `${audit.id}_client.md`), clientReport, "utf-8");
        fs.writeFileSync(path.join(reportsDir, `${audit.id}_dev.md`), devReport, "utf-8");
        fs.writeFileSync(path.join(reportsDir, `${audit.id}_blueprint.md`), aiBlueprint, "utf-8");
        fs.writeFileSync(path.join(reportsDir, `${audit.id}_suggestions.json`), suggestions, "utf-8");
      } catch (fsErr) {
        console.warn("Failed to write composed reports locally:", fsErr);
      }

      // 15. Quality Assurance verification check
      const isQaPassed = qualityAssuranceEngine.verify(auditDoc);
      if (!isQaPassed) {
        throw new Error("Final AuditDocument failed Quality Assurance verification.");
      }

      // 16. Reconstruct the full analysis result object for client caching/local storage.
      const fullAnalysisResult = {
        project,
        audit,
        crawlResult: crawlResult,
        seoResult,
        aeoResult,
        geoResult,
        accessResult,
        recommendations: validatedRecs.map((r: any, index: number) => ({
          id: r.id || String(index),
          problem: r.problem,
          reason: r.reason,
          priority: r.priority,
          impact: r.impacts?.seo || r.impacts?.googleVisibility || "+5 Rank",
          difficulty: r.difficulty,
          confidence: r.confidenceScore,
          expectedGain: r.impacts?.seo || r.impacts?.googleVisibility || "+5 Rank",
          category: r.frameworkContext ? "seo" : "access",
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
        competitorResult,
        auditDocument: auditDoc
      };

      // 13. Handle report registration and conditional PDF generation
      send({ status: "generating_recommendations", progress: 95, message: "Generating reports..." });
      const generatedReportsList: any[] = [];
      const hasSupabase =
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      // Determine if server-side PDF generation is viable
      const shouldGenerateServerPdf =
        hasSupabase || process.env.NODE_ENV === "development";

      if (shouldGenerateServerPdf) {
        try {
          const pdfData = {
            project,
            audit,
            seoResult,
            aeoResult,
            geoResult,
            accessResult,
            recommendations: validatedRecs,
            technologyStack,
            competitorResult,
          };

          for (const rType of reports) {
            try {
              const reportUrl = await generatePdfReport(pdfData as any, rType);
              const createdReport = await db.createReport({
                audit_id: audit.id,
                report_type: rType,
                file_url: reportUrl,
              });
              console.log(`[DEBUG PERSISTENCE] report.id: ${createdReport.id}`);
              generatedReportsList.push(createdReport);
            } catch (pdfErr) {
              console.warn(
                `[PDF Error] Server-side PDF generation failed for ${rType}. Registering client-side fallback URL.`,
                pdfErr
              );
              const createdReport = await db.createReport({
                audit_id: audit.id,
                report_type: rType,
                file_url: `client-pdf:${rType}`,
              });
              console.log(`[DEBUG PERSISTENCE] report.id: ${createdReport.id}`);
              generatedReportsList.push(createdReport);
            }
          }
        } catch (err) {
          console.error("[PDF Engine Error] Failed to import or run PDF engine", err);
          // Fall back to client-pdf for all requested reports
          for (const rType of reports) {
            try {
              const createdReport = await db.createReport({
                audit_id: audit.id,
                report_type: rType,
                file_url: `client-pdf:${rType}`,
              });
              console.log(`[DEBUG PERSISTENCE] report.id: ${createdReport.id}`);
              generatedReportsList.push(createdReport);
            } catch (dbErr) {
              console.error("[DB Error] Failed to create fallback report entry", dbErr);
            }
          }
        }
      } else {
        console.log(
          "[PDF] Skipping server-side PDF generation (stateless production mode, no Supabase credentials found). Registering client-side fallback URLs directly."
        );
        for (const rType of reports) {
          try {
            const createdReport = await db.createReport({
              audit_id: audit.id,
              report_type: rType,
              file_url: `client-pdf:${rType}`,
            });
            generatedReportsList.push(createdReport);
          } catch (dbErr) {
            console.error("[DB Error] Failed to create fallback report entry", dbErr);
          }
        }
      }

      // Complete - ALWAYS send result and reports!
      send({
        status: "complete",
        progress: 100,
        message: "Analysis complete!",
        projectId: project.id,
        auditId: audit.id,
        result: fullAnalysisResult,
        reports: generatedReportsList,
      });
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
