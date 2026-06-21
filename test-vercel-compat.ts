import { getDb } from "./src/lib/db";
import { generatePdfReport } from "./src/lib/engines/pdf";
import fs from "fs";
import path from "path";

// Mock environment to simulate production on Vercel without Supabase
process.env.NODE_ENV = "production";
delete process.env.NEXT_PUBLIC_SUPABASE_URL;
delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function runTest() {
  console.log("--- STARTING VERCEL COMPATIBILITY TEST ---");
  
  // 1. Verify DB Adapter
  console.log("Verifying Database Adapter...");
  const db = getDb();
  console.log("Active DB Adapter class name:", db.constructor.name);
  if (db.constructor.name !== "InMemoryAdapter") {
    throw new Error(`Expected InMemoryAdapter, got ${db.constructor.name}`);
  }
  
  // Test DB writes/reads in memory
  const project = await db.createProject({
    website_url: "https://example.com",
    github_url: "https://github.com/example/repo",
    competitor_url: "",
  });
  console.log("Created project in memory:", project);
  
  const projectList = await db.listProjects();
  console.log("Listing projects in memory:", projectList);
  if (projectList.length !== 1 || projectList[0].id !== project.id) {
    throw new Error("Project list mismatch!");
  }
  
  const audit = await db.createAudit({
    project_id: project.id,
    seo_score: 90,
    aeo_score: 80,
    geo_score: 70,
    access_score: 60,
  });
  console.log("Created audit in memory:", audit);
  
  const reports = await db.getReportsByAudit(audit.id);
  console.log("Reports for audit (initially empty):", reports);
  
  // 2. Verify PDF generation in production
  console.log("Verifying PDF Generation Fallback...");
  
  // Check if public/reports/ exists and count files
  const reportsDir = path.join(__dirname, "public/reports");
  let initialFiles: string[] = [];
  if (fs.existsSync(reportsDir)) {
    initialFiles = fs.readdirSync(reportsDir);
  }
  
  const pdfData = {
    project,
    audit,
    seoResult: { score: 90, details: { robotsTxt: { exists: true }, sitemap: { exists: true } } } as any,
    aeoResult: { score: 80, details: { faqReadiness: { hasFaqSchema: true } } } as any,
    geoResult: { score: 70, details: { eeat: { score: 75 }, trust: { score: 85 }, authorSignals: { hasAuthor: true } } } as any,
    accessResult: { score: 60 } as any,
    recommendations: [
      { problem: "Test problem", priority: "high", impact: "fix it", difficulty: "easy" }
    ] as any,
    technologyStack: { framework: "Next.js", languages: ["TypeScript"], hosting: "Vercel", analytics: [], libraries: [] },
  };
  
  console.log("Generating report...");
  const reportUrl = await generatePdfReport(pdfData, "full_master_report");
  console.log("Generated Report URL:", reportUrl.substring(0, 100) + "...");
  
  // Check that the returned URL is a base64 Data URL
  if (!reportUrl.startsWith("data:application/pdf;base64,")) {
    throw new Error(`Expected Base64 Data URL in production, but got: ${reportUrl}`);
  }
  console.log("SUCCESS: Base64 data URL generated correctly.");
  
  // Ensure no new files were written to public/reports
  if (fs.existsSync(reportsDir)) {
    const finalFiles = fs.readdirSync(reportsDir);
    const difference = finalFiles.filter(f => !initialFiles.includes(f));
    if (difference.length > 0) {
      throw new Error(`Filesystem writes detected in production: ${difference.join(", ")}`);
    }
  }
  console.log("SUCCESS: No filesystem writes detected.");
  console.log("--- ALL TESTS PASSED SUCCESSFULLY! ---");
}

runTest().catch(err => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
