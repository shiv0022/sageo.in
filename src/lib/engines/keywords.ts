import { IEngine, IEngineContext, IEngineResult } from "@/lib/interfaces";
import { IRecommendation, DifficultyLevel, PriorityLevel } from "@/types/domain";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "@/lib/logging/logger";
import crypto from "crypto";

export class KeywordIntelligenceEngine implements IEngine {
  public readonly name = "keywords";
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

    const title = landingPage.title || "";
    const description = landingPage.metaTags["description"] || "";
    const htmlContent = landingPage.html || "";
    const words = htmlContent.toLowerCase().split(/\s+/).filter(Boolean);
    const totalWords = words.length;

    // Simple rule-based keyword extraction
    const densityMap: Record<string, number> = {};
    words.forEach((w) => {
      const cleanWord = w.replace(/[^a-z]/g, "");
      if (cleanWord.length > 4 && !this.isStopWord(cleanWord)) {
        densityMap[cleanWord] = (densityMap[cleanWord] || 0) + 1;
      }
    });

    // Calculate percentage densities
    const topKeywords = Object.entries(densityMap)
      .map(([word, count]) => ({
        word,
        count,
        density: totalWords > 0 ? parseFloat(((count / totalWords) * 100).toFixed(2)) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const findings: Record<string, any> = {
      totalWords,
      topKeywords,
      primaryKeywordCandidate: topKeywords[0]?.word || "None",
      cannibalizationIssues: [] // Populated via rules/Gemini
    };

    const recommendations: IRecommendation[] = [];

    // Helper to add 16-field recommendations
    const addRecommendation = (
      problem: string,
      reason: string,
      evidence: string,
      impacts: IRecommendation["impacts"],
      difficulty: DifficultyLevel,
      estimatedTime: string,
      priority: PriorityLevel,
      steps: string[],
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
        implementationGuide: { steps },
        aiPrompt: aiPrompt || `Optimize keywords for this issue: ${problem}. Evidence: ${evidence}`,
        expectedResult: "Better organic keyword match and search query alignment on Google."
      });
    };

    // Rule 1: High keyword stuffing check (density > 5%)
    const stuffedKeywords = topKeywords.filter((k) => k.density > 5.0);
    findings.stuffedKeywords = stuffedKeywords;
    if (stuffedKeywords.length > 0) {
      addRecommendation(
        `Keyword stuffing warning for term: "${stuffedKeywords[0].word}"`,
        "Using a keyword too frequently inside body text triggers keyword stuffing spam filters, reducing search ranking performance.",
        `Keyword "${stuffedKeywords[0].word}" density is ${stuffedKeywords[0].density}% (recommended: under 3.5%).`,
        { business: "Medium", seo: "High", aiVisibility: "Low", googleVisibility: "High", security: "None" },
        "medium",
        "20 minutes",
        "high",
        [
          `Review references to the term "${stuffedKeywords[0].word}" inside body copy.`,
          "Replace redundant references with pronouns or synonyms to increase content readability."
        ]
      );
    }

    // AI-driven analysis via Gemini API
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
          Analyze this website crawled contents and optimize keywords matching target context:
          URL: ${snapshot.url}
          Title: ${title}
          Description: ${description}
          Top Crawled Keywords: ${JSON.stringify(topKeywords)}
          Context goals: ${JSON.stringify(context.businessContext)}
          First 1000 characters: ${htmlContent.substring(0, 1000)}

          Return a JSON response conforming to this structure:
          {
            "primaryKeyword": string,
            "secondaryKeywords": string[],
            "placementIssues": string[],
            "intentAlignment": "informational" | "transactional" | "commercial" | "navigational",
            "aiSuggestions": {
              "betterMetaTitle": string,
              "betterMetaDescription": string,
              "betterH1": string,
              "betterSlug": string,
              "betterKeywords": string[],
              "missingPages": { "title": string, "reason": string }[],
              "faqSuggestions": { "question": string, "answer": string }[]
            },
            "cannibalizations": { "keyword": string, "competingUrls": string[] }[]
          }

          CRITICAL: Output ONLY valid JSON.
        `;

        const response = await model.generateContent(prompt);
        const text = response.response.text().trim();
        if (text) {
          const parsed = JSON.parse(text.replace(/^```json\s*/i, "").replace(/```$/, "").trim());
          
          findings.primaryKeyword = parsed.primaryKeyword;
          findings.secondaryKeywords = parsed.secondaryKeywords;
          findings.intentAlignment = parsed.intentAlignment;
          findings.aiSuggestions = parsed.aiSuggestions;
          findings.cannibalizationIssues = parsed.cannibalizations;

          // Ingest AI recommendation flags
          if (parsed.placementIssues && parsed.placementIssues.length > 0) {
            addRecommendation(
              "Improve Target Keyword Placement",
              "Primary keywords must appear in header H1, landing description and introductory paragraph text to align search crawling relevance.",
              `Placement alerts: ${parsed.placementIssues.join(", ")}`,
              { business: "Medium", seo: "High", aiVisibility: "Medium", googleVisibility: "High", security: "None" },
              "easy",
              "15 minutes",
              "high",
              [
                "Integrate the primary target keywords inside H1 headings.",
                "Ensure keyword is present in the first 100 words of introductory content."
              ]
            );
          }

          if (parsed.cannibalizations && parsed.cannibalizations.length > 0) {
            addRecommendation(
              `Keyword cannibalization detected for keyword: "${parsed.cannibalizations[0].keyword}"`,
              "Keyword cannibalization occurs when multiple pages target the same search query, causing Google to compete your URLs against each other.",
              `Competing paths: ${parsed.cannibalizations[0].competingUrls.join(", ")}`,
              { business: "Medium", seo: "High", aiVisibility: "Low", googleVisibility: "High", security: "None" },
              "hard",
              "2 hours",
              "medium",
              [
                "Audit target keywords mapping across pages.",
                "Modify competing pages body copy to focus on unique, non-overlapping terms.",
                "Consolidate content or add canonical links if topics are duplicate."
              ]
            );
          }
        }
      } catch (err) {
        logger.error("Failed to execute Keyword AI analysis. Falling back to rules.", err);
      }
    }

    return {
      score: 100, // Fact finding metrics
      findings,
      recommendations
    };
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
      "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
      "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't",
      "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have",
      "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself",
      "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into",
      "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my",
      "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our",
      "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's",
      "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs",
      "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
      "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't",
      "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's",
      "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't",
      "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself",
      "yourselves"
    ]);
    return stopWords.has(word);
  }
}
export const keywordIntelligenceEngine = new KeywordIntelligenceEngine();
