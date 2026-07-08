import { IEngine, IEngineContext, IEngineResult } from "@/lib/interfaces";
import { IWebsiteIntent } from "@/types/domain";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "@/lib/logging/logger";

export class WebsiteIntentEngine implements IEngine {
  public readonly name = "website_intent";
  public readonly dependencies: string[] = ["business_context"];

  public async analyze(context: IEngineContext): Promise<IEngineResult> {
    const pages = context.crawlSnapshot.pages;
    const landingPage = pages.find((p) => p.url === context.crawlSnapshot.url) || pages[0];

    if (!landingPage) {
      return {
        score: 100,
        findings: { primaryType: "other", confidenceScore: 50 },
        recommendations: []
      };
    }

    const title = landingPage.title || "";
    const description = landingPage.metaTags["description"] || "";
    const html = landingPage.html || "";

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
          Analyze this website context and determine the primary category:
          URL: ${context.crawlSnapshot.url}
          Title: ${title}
          Description: ${description}
          First 1000 characters: ${html.substring(0, 1000)}

          Classify it into one of these strict categories:
          "ecommerce" | "saas" | "blog" | "news" | "portfolio" | "agency" | "hospital" | "school" | "restaurant" | "hotel" | "movie ticket booking" | "real estate" | "marketplace" | "corporate" | "government" | "ngo" | "personal website"

          Return a JSON response conforming to this structure:
          {
            "primaryType": string,
            "confidenceScore": number (0-100),
            "indicators": string[]
          }

          CRITICAL: Output ONLY valid JSON.
        `;

        const response = await model.generateContent(prompt);
        const text = response.response.text().trim();
        if (text) {
          const parsed = JSON.parse(text.replace(/^```json\s*/i, "").replace(/```$/, "").trim());
          const findings: IWebsiteIntent = {
            primaryType: parsed.primaryType || "other",
            confidenceScore: parsed.confidenceScore || 70
          };

          return {
            score: 100,
            findings,
            recommendations: []
          };
        }
      } catch (err) {
        logger.error("Failed to classify website intent using Gemini API. Falling back to rules.", err);
      }
    }

    // Rules-based fallback classifier
    const findings = this.classifyIntentFromRules(title, description, html);
    return {
      score: 100,
      findings,
      recommendations: []
    };
  }

  private classifyIntentFromRules(title: string, desc: string, html: string): IWebsiteIntent {
    const text = (title + " " + desc + " " + html.substring(0, 1000)).toLowerCase();
    
    // Heuristic signals
    if (text.includes("cart") || text.includes("checkout") || text.includes("shop") || text.includes("product-schema") || text.includes("add to cart")) {
      return { primaryType: "ecommerce", confidenceScore: 85 };
    }
    if (text.includes("saas") || text.includes("pricing plan") || text.includes("sign up") || text.includes("free trial") || text.includes("dashboard")) {
      return { primaryType: "saas", confidenceScore: 80 };
    }
    if (text.includes("news") || text.includes("magazine") || text.includes("daily") || text.includes("journal")) {
      return { primaryType: "news", confidenceScore: 75 };
    }
    if (text.includes("blog") || text.includes("post") || text.includes("author") || text.includes("article")) {
      return { primaryType: "blog", confidenceScore: 70 };
    }
    if (text.includes("portfolio") || text.includes("creative work") || text.includes("projects showcase")) {
      return { primaryType: "portfolio", confidenceScore: 80 };
    }
    if (text.includes("hospital") || text.includes("clinic") || text.includes("health") || text.includes("appointment")) {
      return { primaryType: "hospital", confidenceScore: 90 };
    }
    if (text.includes("school") || text.includes("university") || text.includes("course") || text.includes("learn")) {
      return { primaryType: "school", confidenceScore: 90 };
    }
    if (text.includes("restaurant") || text.includes("food") || text.includes("menu") || text.includes("order online")) {
      return { primaryType: "restaurant", confidenceScore: 95 };
    }
    if (text.includes("hotel") || text.includes("room booking") || text.includes("resort") || text.includes("lodging")) {
      return { primaryType: "hotel", confidenceScore: 90 };
    }
    if (text.includes("real estate") || text.includes("property listing") || text.includes("house for sale")) {
      return { primaryType: "real estate", confidenceScore: 90 };
    }
    if (text.includes("agency") || text.includes("marketing services") || text.includes("development services")) {
      return { primaryType: "agency", confidenceScore: 70 };
    }

    return { primaryType: "corporate", confidenceScore: 60 };
  }
}
export const websiteIntentEngine = new WebsiteIntentEngine();
