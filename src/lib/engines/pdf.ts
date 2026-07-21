// ============================================================
// PDF Report Generation Engine
// ============================================================

import { jsPDF } from "jspdf";
import "jspdf-autotable";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import type { ReportType, Project, Audit, SEOResult, AEOResult, GEOResult, AccessResult, CompetitorResult, Recommendation, TechnologyStack } from "@/types";
import { logger } from "@/lib/logging/logger";

interface PdfData {
  project: Project;
  audit: Audit;
  seoResult: SEOResult;
  aeoResult: AEOResult;
  geoResult: GEOResult;
  accessResult: AccessResult;
  recommendations: Recommendation[];
  technologyStack: TechnologyStack;
  competitorResult?: CompetitorResult;
}

/**
 * Generate a professional PDF report and return its public URL
 */
export async function generatePdfReport(
  data: PdfData,
  reportType: ReportType
): Promise<string> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const { project, audit, seoResult, aeoResult, geoResult, accessResult, recommendations, technologyStack, competitorResult } = data;
  const domain = new URL(project.website_url).hostname;
  
  // Design values
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      // Page background & header
      drawPageBackground();
      drawPageHeader();
    }
  };

  const drawPageBackground = () => {
    // Subtle accent elements
    doc.setFillColor(249, 250, 251); // Gray 50
    doc.rect(0, 0, pageWidth, pageHeight, "F");
  };

  const drawPageHeader = () => {
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175); // Gray 400
    doc.text(`Intelligence Report: ${domain}`, margin, 12);
    doc.text(new Date(audit.created_at).toLocaleDateString(), pageWidth - margin - 20, 12);
    doc.setDrawColor(229, 231, 235); // Gray 200
    doc.line(margin, 15, pageWidth - margin, 15);
  };

  // --- COVER PAGE ---
  drawPageBackground();
  
  // Decorative top bar
  doc.setFillColor(0, 0, 0); // Premium dark black
  doc.rect(0, 0, pageWidth, 25, "F");

  // Logo / Title
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(0, 0, 0);
  doc.text("WEBSITE INTELLIGENCE", margin, 70);
  
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(107, 114, 128); // Gray 500
  doc.text("SEO · AEO · GEO · Access Optimization Report", margin, 80);

  // Divider
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, 95, pageWidth - margin, 95);

  // Metadata Card
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, 110, pageWidth - (margin * 2), 65, "F");
  doc.setDrawColor(243, 244, 246);
  doc.rect(margin, 110, pageWidth - (margin * 2), 65, "S");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("ANALYSIS SUMMARY", margin + 10, 122);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99); // Gray 600
  doc.text(`Target URL:`, margin + 10, 134);
  doc.setFont("Helvetica", "bold");
  doc.text(project.website_url, margin + 40, 134);

  if (project.competitor_url) {
    doc.setFont("Helvetica", "normal");
    doc.text(`Competitor URL:`, margin + 10, 142);
    doc.setFont("Helvetica", "bold");
    doc.text(project.competitor_url, margin + 40, 142);
  }

  doc.setFont("Helvetica", "normal");
  doc.text(`Audit ID:`, margin + 10, 150);
  doc.text(audit.id, margin + 40, 150);

  doc.text(`Created on:`, margin + 10, 158);
  doc.text(new Date(audit.created_at).toLocaleString(), margin + 40, 158);

  // Score badges at the bottom of Cover Page
  const cardWidth = (pageWidth - (margin * 2) - 15) / 4;
  const scores = [
    { label: "SEO Score", val: audit.seo_score, color: [0, 0, 0] },
    { label: "AEO Score", val: audit.aeo_score, color: [75, 85, 99] },
    { label: "GEO Score", val: audit.geo_score, color: [107, 114, 128] },
    { label: "Access Score", val: audit.access_score, color: [156, 163, 175] }
  ];

  scores.forEach((sc, i) => {
    const cardX = margin + i * (cardWidth + 5);
    doc.setFillColor(255, 255, 255);
    doc.rect(cardX, 195, cardWidth, 40, "F");
    doc.setDrawColor(229, 231, 235);
    doc.rect(cardX, 195, cardWidth, 40, "S");

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(sc.label, cardX + (cardWidth / 2), 207, { align: "center" });

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(sc.color[0], sc.color[1], sc.color[2]);
    doc.text(`${sc.val}`, cardX + (cardWidth / 2), 225, { align: "center" });
  });

  // Footer cover
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text("CONFIDENTIAL · PRIVATE WEBSITE AUDIT", pageWidth / 2, 275, { align: "center" });

  // --- PAGE 2: EXECUTIVE SUMMARY & TECH STACK ---
  doc.addPage();
  drawPageBackground();
  drawPageHeader();
  y = 25;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text("Executive Summary", margin, y);
  y += 10;

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  const introText = `This report provides an in-depth, multi-dimensional optimization analysis for ${project.website_url}. Our engines evaluated your website against current Search Engine Optimization (SEO) standards, Answer Engine Optimization (AEO) readiness (for LLM and voice assistants), Generative Engine Optimization (GEO) trust vectors, and technical crawl accessibility.`;
  const splitIntro = doc.splitTextToSize(introText, pageWidth - (margin * 2));
  doc.text(splitIntro, margin, y);
  y += splitIntro.length * 5 + 5;

  // Technology Stack Table
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Detected Technology Stack", margin, y);
  y += 8;

  const techRows = [
    ["Framework / CMS", technologyStack.framework || "Custom Stack"],
    ["Programming Languages", technologyStack.languages.join(", ") || "JavaScript"],
    ["Hosting Server / CDN", technologyStack.hosting || "Cloudflare / Vercel"],
    ["Analytics Systems", technologyStack.analytics.join(", ") || "None Detected"],
    ["Libraries & Styles", technologyStack.libraries.slice(0, 5).join(", ") || "None Detected"]
  ];

  (doc as any).autoTable({
    startY: y,
    head: [["Stack Layer", "Detected Technology"]],
    body: techRows,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 3.5 },
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [243, 244, 246] }
  });
  
  y = (doc as any).lastAutoTable.finalY + 15;

  // --- SECTION: DETAILED RECOMMENDATIONS ---
  checkPageBreak(30);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Priority Recommendations Matrix", margin, y);
  y += 8;

  const recRows = recommendations.slice(0, 10).map((r, index) => [
    `#${index + 1}`,
    r.problem,
    r.priority.toUpperCase(),
    r.difficulty.toUpperCase(),
    r.impact
  ]);

  (doc as any).autoTable({
    startY: y,
    head: [["ID", "Actionable Fix Description", "Priority", "Difficulty", "Gain"]],
    body: recRows,
    margin: { left: margin, right: margin },
    styles: { fontSize: 8.5, cellPadding: 3 },
    headStyles: { fillColor: [55, 65, 81], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 90 },
      2: { cellWidth: 20 },
      3: { cellWidth: 20 },
      4: { cellWidth: 30 }
    }
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // --- SECTION: SEO & ACCESS ---
  checkPageBreak(50);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("1. Technical SEO & Access Analysis", margin, y);
  y += 8;

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(55, 65, 81);
  const seoDesc = `SEO Score: ${seoResult.score}/100. Robots.txt exists: ${seoResult.details.robotsTxt.exists ? "Yes" : "No"}. Sitemap exists: ${seoResult.details.sitemap.exists ? "Yes" : "No"}. Access Score: ${accessResult.score}/100. The site was checked for search blockages, login walls, and AI crawler blocks.`;
  const splitSeo = doc.splitTextToSize(seoDesc, pageWidth - (margin * 2));
  doc.text(splitSeo, margin, y);
  y += splitSeo.length * 5 + 5;

  // --- SECTION: AEO & GEO ---
  checkPageBreak(50);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("2. Answer Engine (AEO) & Generative Engine (GEO) Readiness", margin, y);
  y += 8;

  const aeoDesc = `AEO Score: ${aeoResult.score}/100. FAQ Schema present: ${aeoResult.details.faqReadiness.hasFaqSchema ? "Yes" : "No"}. GEO Score: ${geoResult.score}/100. E-E-A-T score: ${geoResult.details.eeat.score}/100. Trust indicators: ${geoResult.details.trust.score}/100. Author attribution signals: ${geoResult.details.authorSignals.hasAuthor ? "Yes" : "No"}.`;
  const splitAeo = doc.splitTextToSize(aeoDesc, pageWidth - (margin * 2));
  doc.text(splitAeo, margin, y);
  y += splitAeo.length * 5 + 5;

  // --- COMPETITOR COMPARISON (if available) ---
  if (competitorResult) {
    checkPageBreak(70);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`3. Competitor Analysis: comparison with ${competitorResult.competitorUrl}`, margin, y);
    y += 8;

    const comp = competitorResult.comparison;
    const compRows = [
      ["Indexed Page Count", `${comp.pageCount.yours} pages`, `${comp.pageCount.competitor} pages`],
      ["Average Meta Title Length", `${comp.metaTitles.avgLength.yours} chars`, `${comp.metaTitles.avgLength.competitor} chars`],
      ["Average Meta Description Length", `${comp.metaDescriptions.avgLength.yours} chars`, `${comp.metaDescriptions.avgLength.competitor} chars`],
      ["FAQ counts on page", `${comp.faqs.yours}`, `${comp.faqs.competitor}`],
      ["Internal Navigation Links", `${comp.internalLinks.yours}`, `${comp.internalLinks.competitor}`]
    ];

    (doc as any).autoTable({
      startY: y,
      head: [["Metric Compare", "Your Website", "Competitor"]],
      body: compRows,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8.5, cellPadding: 3.5 },
      headStyles: { fillColor: [75, 85, 99], textColor: [255, 255, 255] }
    });

    y = (doc as any).lastAutoTable.finalY + 15;
  }

  // --- IMPLEMENTATION BLUEPRINT ROADMAP ---
  if (reportType === "implementation_blueprint" || reportType === "full_master_report") {
    checkPageBreak(80);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("4. Implementation Blueprint Roadmap", margin, y);
    y += 8;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(55, 65, 81);
    
    let roadmapText = `This blueprint outlines a step-by-step optimization roadmap. Combine these actions in your development sprint:\n\n`;
    roadmapText += `Phase A (Immediate / Critical): Address any meta noindex tags, root redirects, or robots.txt blockages.\n`;
    roadmapText += `Phase B (Content & Schema): Deploy JSON-LD Organization schema and FAQPage markups to qualify for voice queries and AI citation links.\n`;
    roadmapText += `Phase C (EEAT building): Author biographies must be linked directly to their profiles. Create an explicit About Us company page.\n`;
    
    if (project.github_url) {
      roadmapText += `\nGitHub Repository context detected: Suggest adding missing schema JSON files directly inside the repository under your components structure.`;
    }

    const splitRoadmap = doc.splitTextToSize(roadmapText, pageWidth - (margin * 2));
    doc.text(splitRoadmap, margin, y);
    y += splitRoadmap.length * 5 + 5;
  }

  // --- SAVE AND EXPORT ---
  const pdfBytes = doc.output("arraybuffer");
  const filename = `report_${audit.id}_${reportType}.pdf`;
  
  // Try uploading to Supabase if credentials exist
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      logger.info("[PDF] Attempting Supabase upload...");
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const { error: uploadError } = await supabase.storage
        .from("reports")
        .upload(filename, pdfBytes, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("reports")
          .getPublicUrl(filename);
        if (urlData?.publicUrl) {
          logger.info("[PDF] Uploaded to Supabase:", { publicUrl: urlData.publicUrl });
          return urlData.publicUrl;
        }
      } else {
        logger.warn("[PDF] Supabase upload failed:", uploadError.message);
      }
    } catch (err) {
      logger.warn("[PDF] Supabase client failed:", err);
    }
  }

  // Local / In-memory Fallback
  if (process.env.NODE_ENV === "development") {
    logger.info("[PDF] Falling back to local file storage (development mode).");
    const reportsDir = path.join(process.cwd(), "public", "reports");
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const filePath = path.join(reportsDir, filename);
    fs.writeFileSync(filePath, Buffer.from(pdfBytes));

    const localUrl = `/reports/${filename}`;
    logger.info("[PDF] Local report generated at:", { localUrl });
    return localUrl;
  } else {
    logger.info("[PDF] Falling back to Base64 Data URL (production mode, no filesystem access).");
    const base64String = Buffer.from(pdfBytes).toString("base64");
    return `data:application/pdf;base64,${base64String}`;
  }
}
