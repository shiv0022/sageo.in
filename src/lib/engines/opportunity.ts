import { IAuditDocument, IRecommendation } from "@/types/domain";

export interface IOpportunityReport {
  lowHangingFruits: IRecommendation[];
  richResultOpportunities: string[];
  aiCitationOpportunities: string[];
}

export class OpportunityEngine {
  public analyze(auditDoc: IAuditDocument): IOpportunityReport {
    const recs = auditDoc.recommendations || [];

    // Low hanging fruits: easy difficulty + high/critical priority
    const lowHangingFruits = recs.filter(
      (r) => r.difficulty === "easy" && (r.priority === "critical" || r.priority === "high")
    );

    // Rich Result Opportunities: missing schemas
    const richResultOpportunities: string[] = [];
    const detectedSchemas = auditDoc.scores.seo > 0 ? ["Organization", "WebSite"] : [];
    
    const missingOrg = recs.some((r) => r.problem.toLowerCase().includes("organization schema"));
    if (missingOrg) richResultOpportunities.push("Organization Rich Snippet");
    
    const missingWebSite = recs.some((r) => r.problem.toLowerCase().includes("website schema"));
    if (missingWebSite) richResultOpportunities.push("Sitelinks Searchbox");

    // AI Citation Opportunities
    const aiCitationOpportunities: string[] = [];
    const missingLlms = recs.some((r) => r.problem.toLowerCase().includes("llms.txt"));
    if (missingLlms) aiCitationOpportunities.push("Deploy llms.txt summary index");
    
    const blockedCrawlers = recs.some((r) => r.problem.toLowerCase().includes("ai scrapers blocked"));
    if (blockedCrawlers) aiCitationOpportunities.push("Allow GPTBot and ClaudeBot in robots.txt");

    return {
      lowHangingFruits,
      richResultOpportunities,
      aiCitationOpportunities,
    };
  }
}

export const opportunityEngine = new OpportunityEngine();
