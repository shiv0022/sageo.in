// ============================================================
// GEO Engine - Generative Engine Optimization & EEAT Analysis
// ============================================================

import type { CrawlResult, GEOResult, Issue } from "@/types";
import { v4 as uuidv4 } from "uuid";

export function analyzeGEO(crawlResult: CrawlResult, auditId: string = ""): GEOResult {
  const mainPage = crawlResult.pages[0];
  const issues: Issue[] = [];

  if (!mainPage) {
    return {
      score: 0,
      issues: [],
      details: {
        entityCoverage: { score: 0, entities: [] },
        eeat: { score: 0, signals: [] },
        authority: { score: 0, signals: [] },
        trust: { score: 0, signals: [] },
        topicalAuthority: { score: 0, topics: [] },
        aiReadability: { score: 0, issues: ["No pages crawled"] },
        sourceAttribution: { score: 0, hasCitations: false },
        aboutInfo: { score: 0, hasAboutPage: false },
        authorSignals: { score: 0, hasAuthor: false },
      },
    };
  }

  const content = mainPage.content || "";
  const allHtml = crawlResult.html || "";

  // 1. Entity Coverage
  // Detect standard industry entities
  const knownEntities = [
    "Artificial Intelligence", "AI", "LLM", "Large Language Model", "SEO", "Search Engine", 
    "Optimization", "Metadata", "Schema", "JSON-LD", "Web Performance", "API", "Google", 
    "Vercel", "Supabase", "React", "Next.js", "Analytics"
  ];
  const matchedEntities = knownEntities.filter(e => 
    new RegExp(`\\b${e}\\b`, "i").test(content)
  );
  
  const entityScore = Math.min(100, Math.round((matchedEntities.length / 8) * 100));
  if (entityScore < 50) {
    issues.push({
      id: uuidv4(),
      audit_id: auditId,
      category: "geo",
      title: "Low Entity Density",
      description: "Generative search engines crawl for key concepts (entities) and their relationships. Enhance your content with explicit mentions of industry concepts, tools, and organizations.",
      priority: "medium",
      impact: "+8 GEO",
      difficulty: "medium",
      confidence: 85,
    });
  }

  // 2. E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
  let eeatScore = 0;
  const eeatSignals: string[] = [];

  // Check for credentials, certifications, years of experience
  if (/\b(certif|degree|licensed|award|win|years experience|expert|founded in)\b/i.test(content)) {
    eeatScore += 40;
    eeatSignals.push("Credential and experience signals detected in content");
  }

  // Check for external links to academic or authoritative publications
  const externalLinkDomains = mainPage.externalLinks.map(link => {
    try { return new URL(link).hostname; } catch { return ""; }
  }).filter(Boolean);

  const highAuthDomains = ["wikipedia.org", "w3.org", "github.com", "gov", "edu", "npm", "arxiv.org", "microsoft.com", "google.com"];
  const matchesHighAuth = externalLinkDomains.some(domain => 
    highAuthDomains.some(auth => domain.includes(auth))
  );

  if (matchesHighAuth) {
    eeatScore += 30;
    eeatSignals.push("Outbound links to high-authority domains (.gov, .edu, Wikipedia)");
  }

  // Schema verification for E-E-A-T
  const hasEEATSchema = mainPage.schemaMarkup.some((schema: any) => 
    ["Organization", "LocalBusiness", "Person", "NewsArticle", "TechArticle"].includes(schema["@type"] || schema["type"])
  );
  if (hasEEATSchema) {
    eeatScore += 30;
    eeatSignals.push("E-E-A-T aligned Schema markup found (Organization/Person/Article)");
  }

  if (eeatScore < 60) {
    issues.push({
      id: uuidv4(),
      audit_id: auditId,
      category: "geo",
      title: "Weak E-E-A-T Signals",
      description: "Generative engines favor pages that demonstrate first-hand experience and expertise. Add certifications, citations to trusted sources, and Schema markup indicating your Organization/Author identity.",
      priority: "high",
      impact: "+15 GEO",
      difficulty: "medium",
      confidence: 90,
    });
  }

  // 3. About page
  let aboutScore = 0;
  let hasAboutPage = false;
  const isAboutUrl = (url: string) => /\b(about|team|who-we-are|company)\b/i.test(url);

  // Check if current page is about, or if internal links contain about page
  if (isAboutUrl(crawlResult.url) || mainPage.internalLinks.some(isAboutUrl)) {
    hasAboutPage = true;
    aboutScore = 100;
  } else {
    issues.push({
      id: uuidv4(),
      audit_id: auditId,
      category: "geo",
      title: "Missing About/Team Page Link",
      description: "AI crawlers verify corporate or personal identity by scanning for an 'About Us' or 'Team' page. Create an About page describing your history and credentials.",
      priority: "high",
      impact: "+10 GEO",
      difficulty: "easy",
      confidence: 95,
    });
  }

  // 4. Author Signals
  let authorScore = 0;
  let hasAuthor = false;

  // Search schemas for Author
  mainPage.schemaMarkup.forEach((schema: any) => {
    if (schema.author || (schema.mainEntity && schema.mainEntity.author)) {
      hasAuthor = true;
    }
  });

  // Search content for author lines
  if (/\b(written by|by [A-Z][a-z]+ [A-Z][a-z]+|author:)/i.test(content)) {
    hasAuthor = true;
  }

  if (hasAuthor) {
    authorScore = 100;
  } else {
    issues.push({
      id: uuidv4(),
      audit_id: auditId,
      category: "geo",
      title: "Missing Author Attribution",
      description: "LLMs prioritize articles and resources attributed to real, verifiable people. Ensure articles have author bylaws, short bio boxes, and links to author profiles.",
      priority: "medium",
      impact: "+8 GEO",
      difficulty: "medium",
      confidence: 90,
    });
  }

  // 5. Source Attribution (citations)
  const hasCitations = mainPage.externalLinks.length > 0;
  const sourceScore = hasCitations ? 100 : 0;

  if (!hasCitations) {
    issues.push({
      id: uuidv4(),
      audit_id: auditId,
      category: "geo",
      title: "No Outbound Citations",
      description: "Citing high-quality external resources (studies, government reports, official docs) increases your page's credibility index for AI models. Add citation links to support factual statements.",
      priority: "medium",
      impact: "+5 GEO",
      difficulty: "easy",
      confidence: 90,
    });
  }

  // 6. Trust (HTTPS, Terms, Privacy)
  let trustScore = 0;
  const trustSignals: string[] = [];

  const isHttps = crawlResult.url.startsWith("https://");
  if (isHttps) {
    trustScore += 50;
    trustSignals.push("HTTPS Security active");
  }

  // Check internal links for privacy and terms
  const hasLegal = mainPage.internalLinks.some(link => 
    /\b(privacy|terms|legal|cookie)\b/i.test(link)
  );

  if (hasLegal) {
    trustScore += 50;
    trustSignals.push("Privacy Policy or Terms of Service links detected");
  } else {
    issues.push({
      id: uuidv4(),
      audit_id: auditId,
      category: "geo",
      title: "Missing Trust & Legal Footers",
      description: "Generative filters rank secure and compliant sites higher. Ensure your site has links to Privacy Policy and Terms of Service documents in the footer.",
      priority: "high",
      impact: "+10 GEO",
      difficulty: "easy",
      confidence: 95,
    });
  }

  // 7. AI Readability
  let aiReadabilityScore = 100;
  const aiReadabilityIssues: string[] = [];

  // Very large script tags or cluttered page text decreases readability for parsing models
  if (allHtml.length > 500000) {
    aiReadabilityScore -= 30;
    aiReadabilityIssues.push("Page HTML size is extremely heavy (over 500KB). Large code overhead hinders LLM scrapers.");
  }
  
  // Check for clean semantic markdown structures
  const articleTags = /<article>/i.test(allHtml);
  if (!articleTags) {
    aiReadabilityScore -= 10;
    aiReadabilityIssues.push("No <article> or semantic main tag wrapped around core content.");
  }

  aiReadabilityScore = Math.max(0, aiReadabilityScore);

  // 8. Authority (outbound link weight + domain signals)
  const authorityScore = Math.min(100, (mainPage.externalLinks.length * 15) + (hasEEATSchema ? 40 : 10));

  // Calculate final score
  const finalScore = Math.round(
    entityScore * 0.15 +
    eeatScore * 0.2 +
    aboutScore * 0.1 +
    authorScore * 0.1 +
    sourceScore * 0.1 +
    trustScore * 0.15 +
    aiReadabilityScore * 0.1 +
    authorityScore * 0.1
  );

  return {
    score: Math.min(100, Math.max(0, finalScore)),
    issues,
    details: {
      entityCoverage: { score: entityScore, entities: matchedEntities },
      eeat: { score: Math.min(100, eeatScore), signals: eeatSignals },
      authority: { score: authorityScore, signals: eeatSignals },
      trust: { score: trustScore, signals: trustSignals },
      topicalAuthority: { score: entityScore, topics: matchedEntities.slice(0, 5) },
      aiReadability: { score: aiReadabilityScore, issues: aiReadabilityIssues },
      sourceAttribution: { score: sourceScore, hasCitations },
      aboutInfo: { score: aboutScore, hasAboutPage },
      authorSignals: { score: authorScore, hasAuthor },
    },
  };
}
