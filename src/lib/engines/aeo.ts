// ============================================================
// AEO Engine - Answer Engine Optimization Analysis
// ============================================================

import type { CrawlResult, AEOResult, Issue } from "@/types";
import { v4 as uuidv4 } from "uuid";

export function analyzeAEO(crawlResult: CrawlResult, auditId: string = ""): AEOResult {
  const mainPage = crawlResult.pages[0];
  const issues: Issue[] = [];

  if (!mainPage) {
    return {
      score: 0,
      issues: [],
      details: {
        faqReadiness: { score: 0, hasFaqSchema: false, faqCount: 0 },
        featuredSnippets: { score: 0, readyCount: 0 },
        voiceSearch: { score: 0, issues: ["No pages crawled"] },
        speakableContent: { score: 0, hasSpeakable: false },
        answerBlocks: { score: 0, count: 0 },
      },
    };
  }

  // 1. FAQ Readiness
  let faqScore = 0;
  let hasFaqSchema = false;
  let faqCount = 0;

  // Search in schema markup for FAQPage
  mainPage.schemaMarkup.forEach((schema: any) => {
    if (schema["@type"] === "FAQPage" || schema["type"] === "FAQPage") {
      hasFaqSchema = true;
      faqCount = (schema.mainEntity || []).length;
    }
  });

  // Also count if there are <details> elements or specific heading + paragraph FAQ patterns in text
  const content = mainPage.content || "";
  const questionsInContent = (content.match(/\b(what|how|why|who|where|when|can|is|are)\b[^.!?]*\?/gi) || []).length;

  if (hasFaqSchema && faqCount > 0) {
    faqScore = 100;
  } else if (questionsInContent > 2) {
    faqScore = 40; // FAQ questions exist in text but no schema markup
    issues.push({
      id: uuidv4(),
      audit_id: auditId,
      category: "aeo",
      title: "Missing FAQ Schema Markup",
      description: "You have question-style headings or FAQs in your page content but lack JSON-LD FAQPage schema. Adding FAQ schema helps search bots represent questions directly in search result pages.",
      priority: "high",
      impact: "+8 AEO",
      difficulty: "easy",
      confidence: 95,
    });
  } else {
    faqScore = 10;
    issues.push({
      id: uuidv4(),
      audit_id: auditId,
      category: "aeo",
      title: "Lack of FAQ/Q&A Section",
      description: "Answer engines heavily rely on structured Q&A formats. Introduce a frequently asked questions section to target informational voice and chat queries.",
      priority: "medium",
      impact: "+10 AEO",
      difficulty: "medium",
      confidence: 90,
    });
  }

  // 2. Featured Snippet Readiness (Targeting list/table/paragraph snippets)
  let snippetScore = 0;
  let snippetCount = 0;

  // Check if headings are followed by lists or tables or short paragraphs (40-60 words)
  const paragraphs = content.split(/[.\n]+/).map(p => p.trim()).filter(p => p.length > 20);
  const shortDirectAnswers = paragraphs.filter(p => {
    const wordCount = p.split(/\s+/).length;
    return wordCount >= 30 && wordCount <= 55; // Sweet spot for paragraph snippets
  }).length;

  const html = mainPage.content || "";
  const hasLists = /<(ul|ol|dl)>/i.test(mainPage.content || "");
  const hasTables = /<table>/i.test(mainPage.content || "");

  if (hasLists) snippetCount += 2;
  if (hasTables) snippetCount += 2;
  snippetCount += Math.min(5, shortDirectAnswers);

  snippetScore = Math.min(100, snippetCount * 12);
  if (snippetScore < 50) {
    issues.push({
      id: uuidv4(),
      audit_id: auditId,
      category: "aeo",
      title: "Suboptimal Content Structure for Featured Snippets",
      description: "To win featured snippets in Google and answer engines, content must be structured into clear bulleted/numbered lists, comparison tables, or short definitions under headers.",
      priority: "medium",
      impact: "+12 AEO",
      difficulty: "medium",
      confidence: 85,
    });
  }

  // 3. Voice Search Readability
  let voiceScore = 80;
  const voiceIssues: string[] = [];

  // Evaluate conversational nature and reading level
  const wordCount = mainPage.wordCount || 0;
  if (wordCount < 300) {
    voiceScore -= 30;
    voiceIssues.push("Main content is too thin (under 300 words) for conversational queries.");
    issues.push({
      id: uuidv4(),
      audit_id: auditId,
      category: "aeo",
      title: "Thin Content for Voice Search Matching",
      description: "Your page content contains under 300 words. Conversational search engines require richer semantic context to index pages for complex long-tail queries.",
      priority: "medium",
      impact: "+5 AEO",
      difficulty: "medium",
      confidence: 90,
    });
  }

  // Evaluate question headings count
  const questionHeadings = mainPage.headings.filter((h) => 
    /\b(who|what|where|why|how|when|should|can|is|does)\b/i.test(h.text)
  ).length;

  if (questionHeadings === 0) {
    voiceScore -= 20;
    voiceIssues.push("No question-based headings found (e.g. headings containing 'how to', 'what is').");
    issues.push({
      id: uuidv4(),
      audit_id: auditId,
      category: "aeo",
      title: "Missing Conversational/Question Headings",
      description: "Answer engines match search terms written as questions. Use headers like 'What is...' or 'How to...' followed directly by concise answers.",
      priority: "high",
      impact: "+10 AEO",
      difficulty: "easy",
      confidence: 95,
    });
  } else {
    voiceScore += 10;
  }
  voiceScore = Math.min(100, Math.max(0, voiceScore));

  // 4. Speakable Content Markup
  let speakableScore = 0;
  let hasSpeakable = false;

  mainPage.schemaMarkup.forEach((schema: any) => {
    if (schema["@type"] === "Speakable" || schema["type"] === "Speakable" || schema["speakable"]) {
      hasSpeakable = true;
    }
  });

  if (hasSpeakable) {
    speakableScore = 100;
  } else {
    speakableScore = 0;
    issues.push({
      id: uuidv4(),
      audit_id: auditId,
      category: "aeo",
      title: "Missing Speakable Schema Markup",
      description: "Speakable schema markup allows search engines to read sections of your content aloud on smart speaker devices. Add Google Speakable JSON-LD markup to your news or blog pages.",
      priority: "low",
      impact: "+3 AEO",
      difficulty: "easy",
      confidence: 90,
    });
  }

  // 5. Answer Blocks (concise paragraph immediately following a heading)
  let answerBlocksCount = 0;
  let answerBlocksScore = 0;
  
  if (questionHeadings > 0) {
    answerBlocksCount = Math.min(questionHeadings, 3); // Assume some are answered
    answerBlocksScore = Math.min(100, answerBlocksCount * 33);
  } else {
    answerBlocksScore = 10;
  }

  // Calculate final score
  const finalScore = Math.round(
    faqScore * 0.3 +
    snippetScore * 0.25 +
    voiceScore * 0.25 +
    speakableScore * 0.1 +
    answerBlocksScore * 0.1
  );

  return {
    score: Math.min(100, Math.max(0, finalScore)),
    issues,
    details: {
      faqReadiness: { score: faqScore, hasFaqSchema, faqCount },
      featuredSnippets: { score: snippetScore, readyCount: snippetCount },
      voiceSearch: { score: voiceScore, issues: voiceIssues },
      speakableContent: { score: speakableScore, hasSpeakable },
      answerBlocks: { score: answerBlocksScore, count: answerBlocksCount },
    },
  };
}
