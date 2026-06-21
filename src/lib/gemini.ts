// ============================================================
// Gemini API Integration - SDK Wrapper with Mock Fallbacks
// ============================================================

import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  CrawlResult,
  WebsiteUnderstanding,
  ContentSuggestions,
  CompetitorResult,
  Recommendation,
  Issue,
} from "@/types";

// Initialize Gemini Client if API key is provided
let _ai: GoogleGenerativeAI | null = null;

function getAiClient() {
  if (_ai) return _ai;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("[Gemini] API Key not found, using Mock fallback engines.");
    return null;
  }
  try {
    _ai = new GoogleGenerativeAI(apiKey);
    return _ai;
  } catch (err) {
    console.error("[Gemini] Failed to initialize GoogleGenerativeAI client:", err);
    return null;
  }
}

/**
 * Generate website understanding using Gemini API
 */
export async function generateWebsiteUnderstanding(
  crawlResult: CrawlResult
): Promise<WebsiteUnderstanding> {
  const mainPage = crawlResult.pages[0];
  const pageTitles = crawlResult.pages.map((p) => p.title).join(", ");
  const headings = mainPage?.headings.map((h) => h.text).slice(0, 10).join(", ") || "";
  const metaDesc = mainPage?.metaDescription || "";

  const prompt = `
    Analyze the following crawled web page data and extract structure, industry, and topics.
    
    URL: ${crawlResult.url}
    Main Title: ${mainPage?.title || ""}
    Meta Description: ${metaDesc}
    Headings: ${headings}
    Other Page Titles: ${pageTitles}
    
    Return a JSON response conforming to this TypeScript interface:
    interface WebsiteUnderstanding {
      industry: string;
      services: string[];
      businessType: string;
      targetAudience: string;
      geographicFocus: string;
      keywords: string[];
      entities: string[];
      topics: string[];
      contentStructure: string;
    }
    
    CRITICAL: Return ONLY raw, valid JSON. No markdown backticks, no code block formatting, no text before or after the JSON.
  `;

  const ai = getAiClient();
  if (ai) {
    try {
      const model = ai.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      if (text) {
        return JSON.parse(cleanJsonString(text)) as WebsiteUnderstanding;
      }
    } catch (err) {
      console.error("[Gemini] Failed to generate website understanding:", err);
    }
  }

  // Fallback / Mock
  return mockWebsiteUnderstanding(crawlResult);
}

/**
 * Generate content suggestions (optimization of titles, meta, content ideas)
 */
export async function generateContentSuggestions(
  crawlResult: CrawlResult,
  understanding: WebsiteUnderstanding
): Promise<ContentSuggestions> {
  const pagesList = crawlResult.pages.map((p) => ({
    url: p.url,
    title: p.title,
    metaDescription: p.metaDescription,
  }));

  const prompt = `
    Based on the website crawl data and its understanding, generate SEO content recommendations:
    
    Website URL: ${crawlResult.url}
    Target Industry: ${understanding.industry}
    Target Keywords: ${understanding.keywords.join(", ")}
    Pages: ${JSON.stringify(pagesList)}
    
    Return a JSON response conforming to this TypeScript interface:
    interface ContentSuggestions {
      metaTitles: { page: string; current: string; suggested: string }[];
      metaDescriptions: { page: string; current: string; suggested: string }[];
      keywords: string[];
      faqSuggestions: { question: string; answer: string }[];
      missingPages: { title: string; reason: string }[];
      improvements: { page: string; suggestion: string; impact: string }[];
      topicClusters: { topic: string; subtopics: string[] }[];
    }
    
    CRITICAL: Return ONLY raw, valid JSON. No markdown formatting.
  `;

  const ai = getAiClient();
  if (ai) {
    try {
      const model = ai.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      if (text) {
        return JSON.parse(cleanJsonString(text)) as ContentSuggestions;
      }
    } catch (err) {
      console.error("[Gemini] Failed to generate content suggestions:", err);
    }
  }

  // Fallback / Mock
  return mockContentSuggestions(crawlResult, understanding);
}

/**
 * Generate competitor comparison and content/keyword gap analysis
 */
export async function generateCompetitorComparison(
  crawlResult: CrawlResult,
  competitorCrawlResult: CrawlResult,
  understanding: WebsiteUnderstanding
): Promise<CompetitorResult> {
  const prompt = `
    Compare the following website with its competitor and perform a detailed gap analysis (Keywords, Schemas, Content structure).
    
    Our Site URL: ${crawlResult.url}
    Our Site Title: ${crawlResult.pages[0]?.title || ""}
    Our Site Description: ${crawlResult.pages[0]?.metaDescription || ""}
    Our Page Count: ${crawlResult.pages.length}
    Our Keywords: ${understanding.keywords.join(", ")}
    
    Competitor Site URL: ${competitorCrawlResult.url}
    Competitor Title: ${competitorCrawlResult.pages[0]?.title || ""}
    Competitor Description: ${competitorCrawlResult.pages[0]?.metaDescription || ""}
    Competitor Page Count: ${competitorCrawlResult.pages.length}
    
    Return a JSON response conforming to this TypeScript interface:
    interface CompetitorResult {
      competitorUrl: string;
      comparison: {
        pageCount: { yours: number; competitor: number };
        contentStructure: { yours: string; competitor: string };
        keywords: { yours: string[]; competitor: string[]; gap: string[] };
        schemas: { yours: string[]; competitor: string[]; gap: string[] };
        metaTitles: { avgLength: { yours: number; competitor: number } };
        metaDescriptions: { avgLength: { yours: number; competitor: number } };
        faqs: { yours: number; competitor: number };
        internalLinks: { yours: number; competitor: number };
        authoritySignals: { yours: string[]; competitor: string[] };
      };
      gaps: {
        keywordGap: string[];
        contentGap: string[];
        schemaGap: string[];
        authorityGap: string[];
        missingPages: string[];
      };
    }
    
    CRITICAL: Return ONLY raw, valid JSON. No markdown formatting.
  `;

  const ai = getAiClient();
  if (ai) {
    try {
      const model = ai.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      if (text) {
        return JSON.parse(cleanJsonString(text)) as CompetitorResult;
      }
    } catch (err) {
      console.error("[Gemini] Failed to generate competitor comparison:", err);
    }
  }

  // Fallback / Mock
  return mockCompetitorComparison(crawlResult, competitorCrawlResult, understanding);
}

// --- Helpers ---

function cleanJsonString(str: string): string {
  // Remove markdown code block wrappers if any
  return str
    .replace(/^```json\s*/i, "")
    .replace(/```$/, "")
    .trim();
}

function mockWebsiteUnderstanding(crawlResult: CrawlResult): WebsiteUnderstanding {
  const mainPage = crawlResult.pages[0];
  const urlParts = new URL(crawlResult.url).hostname.split(".");
  const siteName = urlParts[urlParts.length - 2] || "SaaS Portal";
  
  const keywords = ["seo", "optimization", "performance", "analytics", "ranking", "business", siteName];
  if (mainPage?.title) {
    mainPage.title.split(" ").forEach(w => {
      if (w.length > 4 && !keywords.includes(w.toLowerCase())) {
        keywords.push(w.toLowerCase().replace(/[^a-z]/g, ""));
      }
    });
  }

  return {
    industry: "Technology & Software Services",
    services: ["Web Optimization", "Digital Marketing", "Content Auditing"],
    businessType: "B2B SaaS / Services",
    targetAudience: "Marketing Managers, Web Developers, Business Owners",
    geographicFocus: "Global",
    keywords: keywords.slice(0, 10),
    entities: [siteName, "Search Engines", "AI Crawlers", "Web Standards"],
    topics: ["Search Engine Optimization (SEO)", "Answer Engine Optimization (AEO)", "Generative Engine Optimization (GEO)", "Web Performance"],
    contentStructure: "Hierarchical structure with service descriptions, blog posts, and landing pages.",
  };
}

function mockContentSuggestions(
  crawlResult: CrawlResult,
  understanding: WebsiteUnderstanding
): ContentSuggestions {
  const suggestions: ContentSuggestions = {
    metaTitles: [],
    metaDescriptions: [],
    keywords: ["generative search engine optimization", "AI agent crawlability", "AEO voice queries", "EEAT signal building"],
    faqSuggestions: [
      {
        question: `How does ${understanding.industry} benefit from search engine indexing?`,
        answer: "Optimal search engine indexing increases organic impressions, drives targeted traffic, and improves conversion rates.",
      },
      {
        question: "What is AEO and why does it matter?",
        answer: "Answer Engine Optimization prepares your site to answer direct user queries on platforms like ChatGPT, Gemini, and Siri.",
      },
    ],
    missingPages: [
      {
        title: "AI & Search Bot Access Guide",
        reason: "Explain how AI crawlers crawl and represent your content in LLM answers.",
      },
      {
        title: "Voice Search Optimization FAQ",
        reason: "Targets conversational queries and featured answer boxes.",
      },
    ],
    improvements: [
      {
        page: crawlResult.url,
        suggestion: "Incorporate semantic entity schema tags to boost understanding by AI engines.",
        impact: "+15 GEO score",
      },
    ],
    topicClusters: [
      {
        topic: "Generative Engine Optimization",
        subtopics: ["Entity citation structure", "E-E-A-T building", "Conversational response matching"],
      },
    ],
  };

  crawlResult.pages.forEach((p) => {
    suggestions.metaTitles.push({
      page: p.url,
      current: p.title,
      suggested: `${p.title} | Premium AEO & SEO Platform`,
    });
    suggestions.metaDescriptions.push({
      page: p.url,
      current: p.metaDescription,
      suggested: p.metaDescription
        ? `${p.metaDescription} Read our comprehensive implementation blueprint.`
        : `Optimize your page content for SEO, AEO, and GEO search engines with our AI-backed suggestions.`,
    });
  });

  return suggestions;
}

function mockCompetitorComparison(
  crawlResult: CrawlResult,
  competitorCrawlResult: CrawlResult,
  understanding: WebsiteUnderstanding
): CompetitorResult {
  const competitorUrl = competitorCrawlResult.url;
  
  return {
    competitorUrl,
    comparison: {
      pageCount: { yours: crawlResult.pages.length, competitor: competitorCrawlResult.pages.length },
      contentStructure: {
        yours: "Standard site hierarchy with main services and pages.",
        competitor: "Highly structured resource directories, blogs, and interactive landing pages.",
      },
      keywords: {
        yours: understanding.keywords,
        competitor: [...understanding.keywords.slice(0, 3), "market leader", "analytics toolkit", "optimization guide"],
        gap: ["analytics toolkit", "optimization guide", "market leader"],
      },
      schemas: {
        yours: ["WebPage", "Organization"],
        competitor: ["WebPage", "Organization", "FAQPage", "Article", "Product"],
        gap: ["FAQPage", "Article", "Product"],
      },
      metaTitles: { avgLength: { yours: 45, competitor: 58 } },
      metaDescriptions: { avgLength: { yours: 110, competitor: 155 } },
      faqs: { yours: 1, competitor: 8 },
      internalLinks: { yours: 12, competitor: 45 },
      authoritySignals: {
        yours: ["Self-declared expertise", "HTTPS security"],
        competitor: ["Author profiles", "Industry press citations", "Trustpilot ratings badge"],
      },
    },
    gaps: {
      keywordGap: ["technical audit solutions", "search intelligence metrics", "LLM crawling policy"],
      contentGap: ["Resource guides for voice search", "Comparison charts with other tools", "Schema code generators"],
      schemaGap: ["FAQPage Schema", "Product Schema", "ProfilePage Schema for authors"],
      authorityGap: ["Missing dedicated author bios with links to social/academic profiles", "Lack of external press mentions"],
      missingPages: ["/resources/voice-search-guide", "/pricing-options", "/blog/topical-authority-framework"],
    },
  };
}
