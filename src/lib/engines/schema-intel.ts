import { IEngine, IEngineContext, IEngineResult } from "@/lib/interfaces";
import { IRecommendation, DifficultyLevel, PriorityLevel } from "@/types/domain";
import { logger } from "@/lib/logging/logger";
import crypto from "crypto";

export class SchemaIntelligenceEngine implements IEngine {
  public readonly name = "schema";
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
        aiPrompt: aiPrompt || `Create structured schema data for this issue: ${problem}. Evidence: ${evidence}`,
        expectedResult: "Google Search rich results validation checks pass and page gains rich search snippet features."
      });
    };

    // 1. Detect existing schemas
    const schemas = landingPage.schemaMarkup || [];
    const detectedTypes = schemas.map((s: any) => s["@type"] || s["type"]).filter(Boolean);
    findings.detectedSchemas = { count: schemas.length, types: detectedTypes };

    // 2. Organization Schema Check
    const hasOrgSchema = detectedTypes.some((t: string) => ["Organization", "Corporation", "LocalBusiness"].includes(t));
    if (!hasOrgSchema) {
      penaltyPoints += 15;
      addRecommendation(
        "Missing Organization Schema Markup",
        "Organization structured data describes your brand, logo, social profiles, and contact endpoints directly to search indexing crawlers.",
        "No Organization or LocalBusiness schema.org JSON-LD elements detected.",
        { business: "High", seo: "High", aiVisibility: "High", googleVisibility: "High", security: "None" },
        "easy",
        "10 minutes",
        "high",
        [
          "Create a JSON-LD structured block containing your Organization name, URL, logo, and social link profiles.",
          "Inject the markup inside the page body or head header."
        ],
        {
          code: "<script type=\"application/ld+json\">\n{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"Organization\",\n  \"name\": \"Your Brand\",\n  \"url\": \"https://yourdomain.com\",\n  \"logo\": \"https://yourdomain.com/logo.png\"\n}\n</script>",
          language: "json"
        }
      );
    }

    // 3. WebSite Searchbox Schema Check
    const hasWebSiteSchema = detectedTypes.includes("WebSite");
    if (!hasWebSiteSchema) {
      penaltyPoints += 8;
      addRecommendation(
        "Missing WebSite Schema Markup",
        "WebSite schema indicates to Googlebot that your website is eligible for the Sitelinks Searchbox feature, directing users to inner paths directly from search pages.",
        "No WebSite schema.org JSON-LD blocks found.",
        { business: "Medium", seo: "Medium", aiVisibility: "Low", googleVisibility: "High", security: "None" },
        "easy",
        "5 minutes",
        "medium",
        ["Add WebSite JSON-LD markup declaring site name and query inputs configurations."],
        {
          code: "<script type=\"application/ld+json\">\n{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"WebSite\",\n  \"name\": \"Your Brand\",\n  \"url\": \"https://yourdomain.com\"\n}\n</script>",
          language: "json"
        }
      );
    }

    // 4. Missing Schema suggestions based on site intent
    const siteIntent = context.websiteIntent?.primaryType || "corporate";
    const recommendedSchema = siteIntent === "ecommerce" ? "Product" : siteIntent === "saas" ? "SoftwareApplication" : "Article";
    const hasRecommended = detectedTypes.includes(recommendedSchema);

    findings.intentRecommendation = { siteIntent, recommendedSchema, hasRecommended };
    if (!hasRecommended) {
      penaltyPoints += 10;
      addRecommendation(
        `Missing Recommended Schema: ${recommendedSchema}`,
        `Based on the website intent classification (${siteIntent}), your page should contain ${recommendedSchema} schema to enable rich search result snippets.`,
        `Primary site type is categorized as "${siteIntent}" but missing ${recommendedSchema} schema.`,
        { business: "High", seo: "High", aiVisibility: "High", googleVisibility: "High", security: "None" },
        "medium",
        "20 minutes",
        "medium",
        [
          `Identify core properties of your ${siteIntent} content (e.g. price and reviews for Product schema).`,
          `Create a JSON-LD block matching the Schema.org ${recommendedSchema} specification.`,
          "Inject the script block inside page markup."
        ],
        undefined
      );
    }

    const score = Math.max(0, 100 - penaltyPoints);
    logger.info(`Schema Intelligence Engine complete. Score: ${score}`);

    return {
      score,
      findings,
      recommendations
    };
  }
}
export const schemaIntelligenceEngine = new SchemaIntelligenceEngine();
