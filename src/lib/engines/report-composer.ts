import { IAuditDocument } from "@/types/domain";

export interface IDashboardData {
  overallScore: number;
  scores: {
    seo: number;
    aeo: number;
    security: number;
    performance: number;
    accessibility: number;
    geo: number;
    access: number;
  };
  totalRecommendations: number;
  criticalIssuesCount: number;
  highIssuesCount: number;
  lowHangingFruitsCount: number;
  frameworkDetected: string;
}

export interface ISearchPreview {
  desktopTitle: string;
  desktopDescription: string;
  mobileTitle: string;
  mobileDescription: string;
}

export interface ISocialPreview {
  title: string;
  description: string;
  imageFallback: string;
  cardType: string;
}

export interface ISuggestionsReport {
  metaTitles: string[];
  metaDescriptions: string[];
  h1s: string[];
  faqs: { question: string; answer: string }[];
  missingPages: { title: string; path: string; reason: string }[];
}

export class ReportComposer {
  // 1. Executive Summary Generator
  public generateExecutiveSummary(auditDoc: IAuditDocument): string {
    const criticalRecs = auditDoc.recommendations.filter(r => r.priority === "critical");
    const highRecs = auditDoc.recommendations.filter(r => r.priority === "high");
    
    return `
Executive Summary for ${auditDoc.targetUrl}
==================================================
Conducted on: ${new Date(auditDoc.createdAt).toLocaleDateString()}
Overall Health Score: ${auditDoc.scores.overall}/100

Overview:
We analyzed your website across 13 core performance and intelligence criteria. 
The site currently scores ${auditDoc.scores.seo}/100 in Technical SEO and ${auditDoc.scores.geo}/100 in AI Search Visibility. 
We detected a total of ${auditDoc.recommendations.length} optimization opportunities, of which ${criticalRecs.length} are Critical and ${highRecs.length} are High Priority.

Key Actions:
1. Address the ${criticalRecs.length} critical issues immediately to prevent crawlers blocking.
2. Optimize E-E-A-T trust signals (current rating: ${auditDoc.scores.security > 70 ? "High" : "Medium"}).
    `.trim();
  }

  // 2. Website Health Dashboard Data
  public generateDashboardData(auditDoc: IAuditDocument): IDashboardData {
    const recs = auditDoc.recommendations || [];
    return {
      overallScore: auditDoc.scores.overall,
      scores: auditDoc.scores,
      totalRecommendations: recs.length,
      criticalIssuesCount: recs.filter(r => r.priority === "critical").length,
      highIssuesCount: recs.filter(r => r.priority === "high").length,
      lowHangingFruitsCount: recs.filter(r => r.difficulty === "easy" && r.priority === "high").length,
      frameworkDetected: auditDoc.discovery.framework
    };
  }

  // 3. Client-Friendly Report (Beginner Mode)
  public generateClientReport(auditDoc: IAuditDocument): string {
    let output = `# Client Optimization Report\n\n`;
    output += `This report outlines key business improvements for non-technical team members.\n\n`;
    output += `## Summary of Business Impacts\n`;
    
    const recs = auditDoc.recommendations;
    recs.forEach((r, idx) => {
      output += `${idx + 1}. **${r.problem}**\n`;
      output += `   - **Why this matters**: ${r.reason}\n`;
      output += `   - **Expected Business Gain**: ${r.expectedResult}\n`;
      output += `   - **Estimated Time to Fix**: ${r.estimatedTime}\n\n`;
    });
    return output;
  }

  // 4. Technical Developer Report (Advanced Mode)
  public generateDeveloperReport(auditDoc: IAuditDocument): string {
    let output = `# Developer Technical Implementation Report\n\n`;
    output += `This report lists precise technical adjustments, evidence lines, and implementation guides.\n\n`;
    
    const recs = auditDoc.recommendations;
    recs.forEach((r, idx) => {
      output += `### Dev Check ${idx + 1}: ${r.problem}\n`;
      output += `- **Evidence detected**: \`${r.evidence}\`\n`;
      output += `- **Difficulty level**: ${r.difficulty}\n`;
      output += `- **Technical impact area**: ${r.frameworkContext || "Core Web Stack"}\n`;
      output += `- **Step-by-step guidance**:\n`;
      r.implementationGuide.steps.forEach(step => {
        output += `  1. ${step}\n`;
      });
      if (r.implementationGuide.codeSnippet) {
        output += `\n\`\`\`${r.implementationGuide.codeSnippet.language}\n${r.implementationGuide.codeSnippet.code}\n\`\`\`\n`;
      }
      output += `\n`;
    });
    return output;
  }

  // 5. AI Implementation Blueprint
  public generateAIBlueprint(auditDoc: IAuditDocument): string {
    let output = `# AI Prompt Engineering Blueprint\n\n`;
    output += `Use the prompts below inside ChatGPT, Gemini, or Claude to generate complete, ready-to-paste code fixes for your codebase.\n\n`;
    
    const recs = auditDoc.recommendations;
    recs.forEach((r, idx) => {
      output += `## Blueprint Prompt ${idx + 1}: Fix "${r.problem}"\n`;
      output += `\`\`\`text\n${r.aiPrompt}\n\`\`\`\n\n`;
    });
    return output;
  }

  // 6. Google Search Preview Generator
  public generateSearchPreview(auditDoc: IAuditDocument, title: string, description: string): ISearchPreview {
    const cleanTitle = title.substring(0, 60);
    const cleanDesc = description.substring(0, 160);
    
    return {
      desktopTitle: cleanTitle,
      desktopDescription: cleanDesc,
      mobileTitle: cleanTitle.substring(0, 50),
      mobileDescription: cleanDesc.substring(0, 120)
    };
  }

  // 7. Social Preview Generator
  public generateSocialPreview(auditDoc: IAuditDocument, title: string, description: string): ISocialPreview {
    return {
      title,
      description,
      imageFallback: "/assets/social-card-default.png",
      cardType: "summary_large_image"
    };
  }

  // 8. Suggestions Engine (Meta, Title, Description, H1, FAQ, Missing Pages)
  public generateSuggestions(auditDoc: IAuditDocument): ISuggestionsReport {
    // Collect suggestions from keywords engine if present, or generate heuristics
    const metaTitles = [
      `${auditDoc.context.industry} Services | ${auditDoc.targetUrl.replace(/https?:\/\/(www\.)?/, "")}`,
      `Best ${auditDoc.context.category} Platforms and Tools`
    ];

    const metaDescriptions = [
      `Looking for professional ${auditDoc.context.industry} solutions? Explore our services targeting ${auditDoc.context.targetAudience} to achieve ${auditDoc.context.goals[0] || "brand growth"}.`,
      `Learn about our ${auditDoc.context.category} strategies. Fully optimized for search engines and user visibility.`
    ];

    const h1s = [
      `Optimize Your ${auditDoc.context.industry} Workflow`,
      `The Ultimate ${auditDoc.context.category} Resource`
    ];

    const faqs = [
      {
        question: `What makes our ${auditDoc.context.category} services unique?`,
        answer: `We provide specialized ${auditDoc.context.industry} solutions tailored directly to the needs of ${auditDoc.context.targetAudience}.`
      },
      {
        question: `How do we measure success?`,
        answer: `We track concrete goals such as ${auditDoc.context.goals.join(", ")} using integrated data analytics.`
      }
    ];

    const missingPages = [
      {
        title: "Frequently Asked Questions (FAQ)",
        path: "/faq",
        reason: "Boosts conversational AI and voice search query indexation rate."
      },
      {
        title: "Privacy Policy & Terms",
        path: "/privacy",
        reason: "Crucial E-E-A-T signal for Google quality raters and secure index status."
      }
    ];

    return {
      metaTitles,
      metaDescriptions,
      h1s,
      faqs,
      missingPages
    };
  }

  // 9. Composed Output Centers
  public composeJson(auditDoc: IAuditDocument, trustReport: any, opportunityReport: any, crawlSnapshot?: any): string {
    return JSON.stringify(
      {
        document: auditDoc,
        trust: trustReport,
        opportunities: opportunityReport,
        crawlSnapshot,
        composedAt: new Date().toISOString(),
      },
      null,
      2
    );
  }

  public composeMarkdown(auditDoc: IAuditDocument, trustReport: any, opportunityReport: any): string {
    let md = `# SEO & AI Intelligence Audit Report\n\n`;
    md += `**Target URL**: ${auditDoc.targetUrl}\n`;
    md += `**Date**: ${auditDoc.createdAt}\n`;
    md += `**Overall Score**: ${auditDoc.scores.overall}/100\n\n`;

    md += `## 1. Engine Scores\n`;
    md += `- Technical SEO: ${auditDoc.scores.seo}/100\n`;
    md += `- AEO Readiness: ${auditDoc.scores.aeo}/100\n`;
    md += `- AI / GEO Visibility: ${auditDoc.scores.geo}/100\n`;
    md += `- Google Indexability: ${auditDoc.scores.access}/100\n`;
    md += `- Security Status: ${auditDoc.scores.security}/100\n`;
    md += `- Page Speed / Performance: ${auditDoc.scores.performance}/100\n`;
    md += `- User Accessibility: ${auditDoc.scores.accessibility}/100\n\n`;

    md += `## 2. Trust & E-E-A-T Signals\n`;
    md += `- **Trust Score**: ${trustReport.score}/100 (${trustReport.rating})\n`;
    md += `- Secure HTTPS: ${trustReport.signals.httpsActive ? "✅ Yes" : "❌ No"}\n`;
    md += `- Legal Pages: ${trustReport.signals.hasLegalDocuments ? "✅ Verified" : "❌ Missing"}\n`;
    md += `- Identity/About Pages: ${trustReport.signals.hasAboutPage ? "✅ Verified" : "❌ Missing"}\n\n`;

    md += `## 3. High-Priority Recommendations\n`;
    const highRecs = auditDoc.recommendations.filter(
      (r) => r.priority === "critical" || r.priority === "high"
    );
    if (highRecs.length === 0) {
      md += `*No high-priority issues detected! Your site is performing excellently.*\n`;
    } else {
      highRecs.forEach((r, idx) => {
        md += `### ${idx + 1}. [${r.priority.toUpperCase()}] ${r.problem}\n`;
        md += `- **Reason**: ${r.reason}\n`;
        md += `- **Evidence**: ${r.evidence}\n`;
        md += `- **Estimated Effort**: ${r.estimatedTime} (${r.difficulty} difficulty)\n`;
        md += `- **Expected Gain**: ${r.expectedResult}\n`;
        if (r.implementationGuide?.codeSnippet) {
          md += `\n\`\`\`${r.implementationGuide.codeSnippet.language}\n${r.implementationGuide.codeSnippet.code}\n\`\`\`\n`;
        }
        md += `\n`;
      });
    }

    if (opportunityReport) {
      md += `## 4. Growth & Citation Opportunities\n`;
      if (opportunityReport.richResultOpportunities?.length > 0) {
        md += `### Rich Results:\n`;
        opportunityReport.richResultOpportunities.forEach((opp: string) => {
          md += `- ${opp}\n`;
        });
        md += `\n`;
      }
      if (opportunityReport.aiCitationOpportunities?.length > 0) {
        md += `### AI Citation Opportunities:\n`;
        opportunityReport.aiCitationOpportunities.forEach((opp: string) => {
          md += `- ${opp}\n`;
        });
        md += `\n`;
      }
    }

    return md;
  }
}

export const reportComposer = new ReportComposer();
