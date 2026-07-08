import { IEngineContext, IEngineResult } from "@/lib/interfaces";
import { IAuditDocument, IScores, IRecommendation } from "@/types/domain";

export class KnowledgeBaseEngine {
  public compile(
    context: IEngineContext,
    results: Record<string, IEngineResult>,
    finalRecommendations: IRecommendation[]
  ): IAuditDocument {
    // Collect scores across all engines
    const scores: IScores = {
      overall: 0,
      seo: results["seo"]?.score ?? 100,
      aeo: results["aeo"]?.score ?? 100,
      security: results["security"]?.score ?? 100,
      performance: results["performance"]?.score ?? 100,
      accessibility: results["accessibility"]?.score ?? 100,
      geo: results["ai_visibility"]?.score ?? 100,
      access: results["google_visibility"]?.score ?? 100,
    };

    // Calculate dynamic overall score
    const scoreValues = [
      scores.seo,
      scores.aeo,
      scores.security,
      scores.performance,
      scores.accessibility,
      scores.geo,
      scores.access,
    ];
    scores.overall = Math.round(
      scoreValues.reduce((sum, val) => sum + val, 0) / scoreValues.length
    );

    // Context & Intent & Discovery findings
    const businessContext = context.businessContext || {
      category: "Business Services",
      industry: "General Business",
      targetAudience: "General Audience",
      goals: ["brand visibility"],
      searchIntentProfile: "informational",
      language: "en",
      geographicScope: "global",
    };

    const websiteIntent = context.websiteIntent || {
      primaryType: "corporate",
      confidenceScore: 100,
    };

    const discoveryOutput = results["discovery"]?.findings || {};
    const discovery = {
      framework: discoveryOutput.framework || "Custom Stack",
      frameworkConfidence: discoveryOutput.frameworkConfidence || 100,
      hosting: discoveryOutput.hosting,
      cdn: discoveryOutput.cdn,
      specialFiles: discoveryOutput.specialFiles || {
        llmsTxt: false,
        humansTxt: false,
        securityTxt: false,
        adsTxt: false,
      },
    };

    return {
      id: context.crawlSnapshot.id,
      targetUrl: context.crawlSnapshot.url,
      createdAt: new Date().toISOString(),
      status: "completed",
      scores,
      context: businessContext,
      intent: websiteIntent,
      discovery,
      recommendations: finalRecommendations,
    };
  }
}

export const knowledgeBaseEngine = new KnowledgeBaseEngine();
