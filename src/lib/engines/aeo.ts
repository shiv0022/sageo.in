import { IEngine, IEngineContext, IEngineResult } from "@/lib/interfaces";
import { IRecommendation, DifficultyLevel, PriorityLevel } from "@/types/domain";
import { logger } from "@/lib/logging/logger";
import crypto from "crypto";

export class AEOEngine implements IEngine {
  public readonly name = "aeo";
  public readonly dependencies: string[] = ["discovery", "business_context"];

  public async analyze(context: IEngineContext): Promise<IEngineResult> {
    const snapshot = context.crawlSnapshot;
    const pages = snapshot.pages;
    const landingPage = pages.find((p) => p.url === snapshot.url) || pages[0];

    if (!landingPage) {
      return {
        score: 0,
        findings: { error: "No crawled page data found." },
        recommendations: []
      };
    }

    const recommendations: IRecommendation[] = [];
    const findings: Record<string, any> = {};
    let penaltyPoints = 0;

    const addRecommendation = (
      problem: string,
      reason: string,
      evidence: string,
      impacts: IRecommendation["impacts"],
      difficulty: DifficultyLevel,
      estimatedTime: string,
      priority: PriorityLevel,
      steps: string[],
      codeSnippet?: IRecommendation["implementationGuide"]["codeSnippet"],
      aiPrompt = ""
    ) => {
      const shasum = crypto ? crypto.createHash("sha1") : null;
      const id = shasum 
        ? shasum.update(problem + evidence).digest("hex").substring(0, 12)
        : `rec-${Math.random().toString(36).substring(2, 9)}`;

      recommendations.push({
        id,
        problem,
        reason,
        evidence,
        impacts,
        difficulty,
        estimatedTime,
        priority,
        confidenceScore: 100,
        implementationGuide: { steps, codeSnippet },
        aiPrompt: aiPrompt || `Fix this AEO optimization issue: ${problem}. Evidence: ${evidence}`,
        expectedResult: "Increased citation probability in Gemini, ChatGPT, and Google AI Overviews."
      });
    };

    // 1. FAQ schema detection
    let hasFaqSchema = false;
    let faqCount = 0;
    landingPage.schemaMarkup.forEach((schema: any) => {
      if (schema["@type"] === "FAQPage" || schema["type"] === "FAQPage") {
        hasFaqSchema = true;
        faqCount = (schema.mainEntity || []).length;
      }
    });

    const content = landingPage.html || "";
    const questionMatches = (content.match(/\b(what|how|why|who|where|when|can|is|are)\b[^.!?]*\?/gi) || []).length;
    findings.faq = { hasFaqSchema, faqCount, questionMatches };

    if (!hasFaqSchema && questionMatches > 2) {
      penaltyPoints += 15;
      addRecommendation(
        "Missing FAQ Schema Markup",
        "Adding FAQPage JSON-LD schema translates plain-text questions into structured datasets that Google and AI overview models can ingest directly.",
        `Found ${questionMatches} question patterns in HTML but no matching FAQ schema markup.`,
        { business: "High", seo: "High", aiVisibility: "High", googleVisibility: "High", security: "None" },
        "easy",
        "10 minutes",
        "high",
        [
          "Identify the core Q&As in your body content.",
          "Generate FAQPage schema markup matching the W3C JSON-LD syntax.",
          "Inject the schema inside a script element in the HTML head."
        ],
        {
          code: "<script type=\"application/ld+json\">\n{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"FAQPage\",\n  \"mainEntity\": [{\n    \"@type\": \"Question\",\n    \"name\": \"Insert your question here?\",\n    \"acceptedAnswer\": {\n      \"@type\": \"Answer\",\n      \"text\": \"Insert concise direct answer here.\"\n    }\n  }]\n}\n</script>",
          language: "json"
        }
      );
    } else if (!hasFaqSchema && questionMatches <= 2) {
      penaltyPoints += 10;
      addRecommendation(
        "Lack of FAQ / Q&A Section",
        "Frequently asked questions target voice search and conversational LLM queries. Adding structured Q&As boosts page visibility on answer engines.",
        "No Q&As found in content.",
        { business: "Medium", seo: "Medium", aiVisibility: "High", googleVisibility: "Medium", security: "None" },
        "medium",
        "30 minutes",
        "medium",
        [
          "Identify 3-5 frequent questions related to your target services/keywords.",
          "Create a dedicated FAQ section at the bottom of the page.",
          "Structure questions as headings (H2 or H3) followed immediately by direct paragraph answers (30-55 words)."
        ],
        undefined
      );
    }

    // 2. Speakable schema detection
    let hasSpeakable = false;
    landingPage.schemaMarkup.forEach((schema: any) => {
      if (schema["@type"] === "Speakable" || schema["type"] === "Speakable" || schema["speakable"]) {
        hasSpeakable = true;
      }
    });
    findings.speakable = { exists: hasSpeakable };
    if (!hasSpeakable) {
      penaltyPoints += 5;
      addRecommendation(
        "Missing Speakable Schema Markup",
        "Speakable schema highlights sections of your page that are suitable for text-to-speech rendering on smart speakers (e.g. Google Assistant, Siri).",
        "No Speakable schema markup blocks detected.",
        { business: "Low", seo: "Low", aiVisibility: "Medium", googleVisibility: "Low", security: "None" },
        "easy",
        "5 minutes",
        "low",
        [
          "Identify the CSS selectors for the primary reading sections on your page.",
          "Create a Speakable schema block pointing to these CSS selectors.",
          "Inject the markup inside the page header."
        ],
        {
          code: "<script type=\"application/ld+json\">\n{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"WebPage\",\n  \"name\": \"Example Page\",\n  \"speakable\": {\n    \"@type\": \"SpeakableSpecification\",\n    \"cssSelector\": [\".main-headline\", \".lead-paragraph\"]\n  }\n}\n</script>",
          language: "json"
        }
      );
    }

    // 3. Featured Snippet Readiness (Table & List checks)
    const hasLists = /<(ul|ol|dl)>/i.test(content);
    const hasTables = /<table>/i.test(content);
    findings.elements = { hasLists, hasTables };

    if (!hasLists && !hasTables) {
      penaltyPoints += 12;
      addRecommendation(
        "Lack of Structured Lists and Tables",
        "Featured snippets and AI search citations favor tabular or list formats. Bulleted steps and comparison tables increase structured data indexing rates.",
        "No list elements (ul, ol) or tables found in the main content.",
        { business: "Medium", seo: "Medium", aiVisibility: "High", googleVisibility: "High", security: "None" },
        "medium",
        "15 minutes",
        "medium",
        [
          "Identify comparative data or sequential steps in your content.",
          "Refactor raw text comparisons into HTML <table> matrices.",
          "Format sequential guides using ordered (<ol>) or unordered (<ul>) lists."
        ],
        {
          code: "<ul>\n  <li>Step 1: First instruction...</li>\n  <li>Step 2: Second instruction...</li>\n</ul>",
          language: "html"
        }
      );
    }

    // 4. Answer Length & Heading Quality (Conversational patterns)
    // Find headings written as questions
    let questionHeadingsCount = 0;
    const questionsList: string[] = [];
    Object.values(landingPage.headings).flat().forEach((h) => {
      if (/\b(who|what|where|why|how|when|should|can|is|does)\b/i.test(h)) {
        questionHeadingsCount++;
        questionsList.push(h);
      }
    });

    findings.conversational = { questionHeadingsCount, list: questionsList };
    if (questionHeadingsCount === 0) {
      penaltyPoints += 15;
      addRecommendation(
        "Missing Question-Based Headings",
        "Search engine users and AI consultants write queries as complete questions. Structure headings as questions to direct answer bots to your content.",
        "No headings matching conversational question keywords found.",
        { business: "Medium", seo: "High", aiVisibility: "High", googleVisibility: "High", security: "None" },
        "easy",
        "10 minutes",
        "high",
        [
          "Review H2 and H3 headings in your copy.",
          "Rewrite them to follow conversational question formats (e.g. replace 'Our Services' with 'What services do we offer?')."
        ],
        undefined
      );
    }

    const score = Math.max(0, 100 - penaltyPoints);
    logger.info(`AEO Engine complete. Score: ${score}, Recommendations: ${recommendations.length}`);

    return {
      score,
      findings,
      recommendations
    };
  }
}
export const aeoEngine = new AEOEngine();

// Legacy wrapper to support compatibility during transition
export function analyzeAEO(crawlResult: any, auditId: string = ""): any {
  // Translate types back and forth
  const mockContext: IEngineContext = {
    crawlSnapshot: {
      id: auditId,
      url: crawlResult.url,
      timestamp: new Date().toISOString(),
      pages: crawlResult.pages.map((p: any) => ({
        url: p.url,
        statusCode: p.statusCode || 200,
        html: p.content || crawlResult.html || "",
        headers: p.headers || {},
        metaTags: {
          description: p.metaDescription || ""
        },
        headings: {},
        links: { internal: [], external: [] },
        images: [],
        schemaMarkup: p.schemaMarkup || []
      })),
      specialFiles: {}
    } as any,
    businessContext: {} as any,
    websiteIntent: {} as any,
    previousEngineOutputs: {}
  };

  const engine = new AEOEngine();
  let result: any = { score: 100, issues: [], details: {} };
  engine.analyze(mockContext).then((res) => {
    result = {
      score: res.score,
      issues: res.recommendations.map(r => ({
        id: r.id,
        audit_id: auditId,
        category: "aeo",
        title: r.problem,
        description: r.reason,
        priority: r.priority,
        impact: r.impacts.seo,
        difficulty: r.difficulty,
        confidence: r.confidenceScore
      })),
      details: {
        faqReadiness: {
          score: res.findings.faq?.hasFaqSchema ? 100 : 10,
          hasFaqSchema: res.findings.faq?.hasFaqSchema || false,
          faqCount: res.findings.faq?.faqCount || 0
        },
        featuredSnippets: {
          score: res.findings.elements?.hasLists ? 100 : 40,
          readyCount: res.findings.elements?.hasLists ? 1 : 0
        },
        voiceSearch: {
          score: res.findings.conversational?.questionHeadingsCount > 0 ? 100 : 50,
          issues: []
        },
        speakableContent: {
          score: res.findings.speakable?.exists ? 100 : 0,
          hasSpeakable: res.findings.speakable?.exists || false
        },
        answerBlocks: {
          score: 80,
          count: 1
        }
      }
    };
  });

  return result;
}
