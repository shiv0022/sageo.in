// ============================================================
// Knowledge Base Types — v1.0
// ============================================================

export type ImpactLevel = "None" | "Low" | "Medium" | "High" | "Critical";
export type KBDifficulty = "Easy" | "Medium" | "Hard";
export type RuleCategory = "seo" | "aeo" | "geo" | "security" | "performance" | "accessibility" | "google_visibility" | "schema";
export type ReferenceType =
  | "Google Search Central"
  | "Schema.org"
  | "W3C"
  | "WCAG 2.1"
  | "OWASP"
  | "web.dev"
  | "MDN Web Docs"
  | "RFC Standard"
  | "Chromium Documentation"
  | "Industry Best Practice";

export interface IKBRule {
  ruleId: string;
  ruleName: string;
  category: RuleCategory;
  description: string;
  whyItMatters: string;
  detectionKey: string;
  detectionCondition: {
    operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "not_contains" | "missing";
    value: any;
  };
  recommendation: string;
  implementationSteps: string[];
  codeSnippet?: {
    code: string;
    language: string;
    filename?: string;
  };
  aiPromptTemplate: string;
  expectedResult: string;

  seoImpact: ImpactLevel;
  googleVisibilityImpact: ImpactLevel;
  aiVisibilityImpact: ImpactLevel;
  accessibilityImpact: ImpactLevel;
  securityImpact: ImpactLevel;
  businessImpact: ImpactLevel;

  difficulty: KBDifficulty;
  estimatedFixTime: string;
  confidenceLevel: number;
  evidenceSource: string;
  evidenceUrl: string;
  referenceType: ReferenceType;
  penaltyPoints: number;
  priority: "critical" | "high" | "medium" | "low";
}

export interface IKBRuleMatch {
  rule: IKBRule;
  detectedEvidence: string;
  matchedAt: string;
}
