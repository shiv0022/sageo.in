import { IAuditDocument } from "@/types/domain";

export interface ITrustReport {
  score: number;
  signals: {
    httpsActive: boolean;
    hasLegalDocuments: boolean;
    hasAboutPage: boolean;
    hasAuthorAttributions: boolean;
    outboundAuthorityLinks: number;
  };
  rating: "High" | "Medium" | "Low";
}

export class TrustEngine {
  public analyze(auditDoc: IAuditDocument, rawResults: Record<string, any>): ITrustReport {
    const secOutput = rawResults["security"];
    const seoOutput = rawResults["seo"];
    const aiVisOutput = rawResults["ai_visibility"];

    const httpsActive = secOutput?.findings?.https?.active || false;
    
    // Check legal documents presence in internal link paths
    const internalLinks = rawResults["discovery"]?.findings?.websiteStructure?.pagesList || [];
    const hasLegalDocuments = internalLinks.some((p: any) =>
      /\b(privacy|terms|legal|cookie)\b/i.test(p.url)
    ) || secOutput?.findings?.headers?.hasHsts || false;

    const hasAboutPage = internalLinks.some((p: any) =>
      /\b(about|team|who-we-are|company)\b/i.test(p.url)
    ) || aiVisOutput?.findings?.citationReadiness?.externalLinksCount > 0;

    const hasAuthorAttributions = seoOutput?.findings?.structuredData?.types?.includes("Person") || false;
    const outboundAuthorityLinks = aiVisOutput?.findings?.citationReadiness?.externalLinksCount || 0;

    let points = 0;
    if (httpsActive) points += 30;
    if (hasLegalDocuments) points += 25;
    if (hasAboutPage) points += 20;
    if (hasAuthorAttributions) points += 15;
    if (outboundAuthorityLinks > 0) points += 10;

    const score = Math.min(100, points);
    const rating = score >= 80 ? "High" : score >= 50 ? "Medium" : "Low";

    return {
      score,
      signals: {
        httpsActive,
        hasLegalDocuments,
        hasAboutPage,
        hasAuthorAttributions,
        outboundAuthorityLinks,
      },
      rating,
    };
  }
}

export const trustEngine = new TrustEngine();
