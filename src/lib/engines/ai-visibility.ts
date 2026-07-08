import { IEngine, IEngineContext, IEngineResult } from "@/lib/interfaces";
import { IRecommendation, DifficultyLevel, PriorityLevel } from "@/types/domain";
import { logger } from "@/lib/logging/logger";
import crypto from "crypto";

export class AIVisibilityEngine implements IEngine {
  public readonly name = "ai_visibility";
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
        aiPrompt: aiPrompt || `Optimize AI visibility for this issue: ${problem}. Evidence: ${evidence}`,
        expectedResult: "Website content gets successfully ingested and cited inside ChatGPT Search and Gemini."
      });
    };

    // 1. Robots.txt block check for AI scrapers
    const robotsTxt = snapshot.robotsTxt || "";
    const blockedAiCrawlers: string[] = [];
    const aiCrawlers = [
      "gptbot", "google-extended", "claudebot", "perplexitybot", "applebot-extended", "ccbot", "anthropic-ai", "cohere-ai"
    ];

    if (robotsTxt) {
      const lines = robotsTxt.split("\n");
      let currentAgent = "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.toLowerCase().startsWith("user-agent:")) {
          currentAgent = trimmed.split(":")[1]?.trim().toLowerCase() || "";
        }
        if (trimmed.toLowerCase().startsWith("disallow:") && aiCrawlers.includes(currentAgent)) {
          const path = trimmed.split(":")[1]?.trim();
          if (path === "/" || path === "/*") {
            if (!blockedAiCrawlers.includes(currentAgent)) {
              blockedAiCrawlers.push(currentAgent);
            }
          }
        }
      }
    }

    findings.aiCrawlerBlocking = { blockedAiCrawlers };
    if (blockedAiCrawlers.length > 0) {
      penaltyPoints += Math.min(30, blockedAiCrawlers.length * 10);
      addRecommendation(
        "AI Scrapers Blocked in robots.txt",
        "Blocking AI crawlers like GPTBot or ClaudeBot prevents your site content from being parsed and presented as citations inside conversational search answers (ChatGPT, Claude, Gemini).",
        `Robots.txt blocks agents: ${blockedAiCrawlers.join(", ")}`,
        { business: "High", seo: "Low", aiVisibility: "Critical", googleVisibility: "None", security: "None" },
        "easy",
        "2 minutes",
        "high",
        ["Review your robots.txt file.", "Remove Disallow statements targeting AI search scrapers to maximize citations opportunity."],
        { code: "User-agent: GPTBot\nAllow: /", language: "txt" }
      );
    }

    // 2. llms.txt detection
    const hasLlmsTxt = !!snapshot.specialFiles?.llmsTxt;
    findings.llmsTxt = { exists: hasLlmsTxt };
    if (!hasLlmsTxt) {
      penaltyPoints += 15;
      addRecommendation(
        "Missing llms.txt File",
        "The llms.txt file is a new standard for providing LLMs with clear, text-only summaries of your website context and pages structure.",
        "No llms.txt file was found at domain root.",
        { business: "Medium", seo: "Low", aiVisibility: "High", googleVisibility: "None", security: "None" },
        "easy",
        "10 minutes",
        "medium",
        [
          "Create a file named 'llms.txt' in the public folder root.",
          "Provide markdown-formatted concise summaries of page content and directories."
        ],
        { code: "# Title\n\n- [Page Name](/path): Short summary description...", language: "markdown", filename: "llms.txt" }
      );
    }

    // 3. Citation Readiness (Outbound high-quality reference links)
    const externalLinksCount = landingPage.links.external.length;
    findings.citationReadiness = { externalLinksCount };
    if (externalLinksCount === 0) {
      penaltyPoints += 15;
      addRecommendation(
        "No Outbound Citation Links Found",
        "Citing trusted primary sources increases content authority. AI engines evaluate external linking consistency to grade content reliability.",
        "The page contains 0 outbound external links.",
        { business: "Low", seo: "Medium", aiVisibility: "High", googleVisibility: "Medium", security: "None" },
        "easy",
        "15 minutes",
        "medium",
        ["Locate factual references in your content.", "Add links to authoritative sources (e.g. academic reports, official documentation)."],
        undefined
      );
    }

    // 4. Entity Coverage (Simple detection of clean structure)
    const entityMatches = landingPage.schemaMarkup.length;
    findings.entityCoverage = { schemaMarkupCount: entityMatches };
    if (entityMatches === 0) {
      penaltyPoints += 10;
      addRecommendation(
        "Low Structured Schema Entity Density",
        "AI scrapers map content to known conceptual entities using JSON-LD schema markup. Lack of entities reduces semantic indexing capabilities.",
        "Found 0 JSON-LD entities on the landing page.",
        { business: "Medium", seo: "Medium", aiVisibility: "High", googleVisibility: "High", security: "None" },
        "medium",
        "20 minutes",
        "medium",
        ["Create and inject standard JSON-LD schema blocks describing your business entities (Organization, Product, Service)."],
        undefined
      );
    }

    const score = Math.max(0, 100 - penaltyPoints);
    logger.info(`AI Visibility Engine complete. Score: ${score}`);

    return {
      score,
      findings,
      recommendations
    };
  }
}
export const aiVisibilityEngine = new AIVisibilityEngine();
