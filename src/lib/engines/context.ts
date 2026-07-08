import { IEngine, IEngineContext, IEngineResult } from "@/lib/interfaces";
import { IBusinessContext } from "@/types/domain";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "@/lib/logging/logger";

export class BusinessContextEngine implements IEngine {
  public readonly name = "business_context";
  public readonly dependencies: string[] = [];

  public async analyze(context: IEngineContext): Promise<IEngineResult> {
    const pages = context.crawlSnapshot.pages;
    const landingPage = pages.find((p) => p.url === context.crawlSnapshot.url) || pages[0];

    if (!landingPage) {
      return {
        score: 100,
        findings: this.getDefaultContext(),
        recommendations: []
      };
    }

    const html = landingPage.html || "";
    const title = landingPage.title || "";
    const description = landingPage.metaTags["description"] || "";
    
    // Check lang attribute from meta or html tags
    const htmlLang = landingPage.metaTags["content-language"] || "en";

    // Attempt to resolve context via Gemini AI if key is present
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
          Analyze the following website context and extract the business information:
          URL: ${context.crawlSnapshot.url}
          Title: ${title}
          Description: ${description}
          First 1000 characters of page: ${html.substring(0, 1000)}

          Return a JSON response matching this structure:
          {
            "category": "Technology" | "Healthcare" | "Education" | "E-commerce" | "Finance" | "Entertainment" | "Real Estate" | "Hospitality" | "Business Services" | "Other",
            "industry": "General software" | "Retail" | "Medical clinics" | "etc",
            "targetAudience": "Developers" | "B2B buyers" | "Local customers" | "General public" | "etc",
            "geographicScope": "local" | "regional" | "national" | "global",
            "primaryLanguage": "en" | "es" | "fr" | "etc",
            "secondaryLanguages": ["es", "fr", "etc"],
            "businessGoals": ["Lead generation", "sales", "brand visibility", "etc"]
          }

          CRITICAL: Output ONLY valid JSON.
        `;

        const response = await model.generateContent(prompt);
        const text = response.response.text().trim();
        if (text) {
          const parsed = JSON.parse(text.replace(/^```json\s*/i, "").replace(/```$/, "").trim());
          const findings: IBusinessContext = {
            category: parsed.category || "Business Services",
            industry: parsed.industry || "General Industry",
            targetAudience: parsed.targetAudience || "General Public",
            geographicScope: parsed.geographicScope || "global",
            language: parsed.primaryLanguage || htmlLang,
            searchIntentProfile: parsed.searchIntentProfile || "informational",
            goals: parsed.businessGoals || ["brand visibility"],
            ...parsed
          };

          return {
            score: 100,
            findings,
            recommendations: []
          };
        }
      } catch (err) {
        logger.error("Failed to fetch business context from Gemini API. Falling back to rules.", err);
      }
    }

    // Heuristics fallback (no API key or call failed)
    const findings = this.deduceContextFromRules(title, description, htmlLang);
    return {
      score: 100,
      findings,
      recommendations: []
    };
  }

  private getDefaultContext(): IBusinessContext {
    return {
      category: "Business Services",
      industry: "Generic Industry",
      targetAudience: "General Audience",
      geographicScope: "global",
      language: "en",
      searchIntentProfile: "informational",
      goals: ["brand visibility"]
    };
  }

  private deduceContextFromRules(title: string, desc: string, lang: string): IBusinessContext {
    const text = (title + " " + desc).toLowerCase();
    
    let category = "Business Services";
    let industry = "General Business";
    let targetAudience = "General Consumers";
    let geographicScope: "local" | "regional" | "national" | "global" = "global";
    const goals = ["brand visibility"];

    // Category & Industry heuristics
    if (text.includes("shop") || text.includes("store") || text.includes("buy") || text.includes("cart") || text.includes("checkout")) {
      category = "E-commerce";
      industry = "Retail / Online Sales";
      targetAudience = "Shoppers";
      goals.push("sales");
    } else if (text.includes("saas") || text.includes("software") || text.includes("app") || text.includes("platform") || text.includes("api")) {
      category = "Technology";
      industry = "Software as a Service";
      targetAudience = "Developers / Professionals";
      goals.push("Lead generation");
    } else if (text.includes("hospital") || text.includes("doctor") || text.includes("clinic") || text.includes("health") || text.includes("medical")) {
      category = "Healthcare";
      industry = "Medical Services";
      targetAudience = "Patients";
      geographicScope = "local";
    } else if (text.includes("school") || text.includes("university") || text.includes("course") || text.includes("learn") || text.includes("education")) {
      category = "Education";
      industry = "Educational / Academy";
      targetAudience = "Students";
      geographicScope = "national";
    } else if (text.includes("restaurant") || text.includes("food") || text.includes("menu") || text.includes("eat")) {
      category = "Hospitality";
      industry = "Food & Beverage";
      targetAudience = "Local diners";
      geographicScope = "local";
    }

    return {
      category,
      industry,
      targetAudience,
      geographicScope,
      language: lang.substring(0, 2).toLowerCase(),
      searchIntentProfile: category === "E-commerce" ? "transactional" : "informational",
      goals
    };
  }
}
export const businessContextEngine = new BusinessContextEngine();
