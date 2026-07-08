// ============================================================
// Website Intelligence Platform - Core Domain Types
// ============================================================

export type PriorityLevel = "critical" | "high" | "medium" | "low";
export type DifficultyLevel = "easy" | "medium" | "hard";
export type JobStatus = "pending" | "crawling" | "analyzing" | "completed" | "failed";

export interface ICrawlPage {
  url: string;
  statusCode: number;
  html: string;
  headers: Record<string, string>;
  title?: string;
  metaTags: Record<string, string>;
  headings: Record<string, string[]>;
  links: {
    internal: { url: string; anchorText: string }[];
    external: { url: string; anchorText: string }[];
  };
  images: { url: string; altText?: string; width?: number; height?: number }[];
  schemaMarkup: Record<string, any>[];
  performanceMetrics?: Record<string, number>;
}

export interface ICrawlSnapshot {
  id: string;
  url: string;
  timestamp: string;
  pages: ICrawlPage[];
  robotsTxt?: string;
  sitemaps: string[];
  specialFiles: {
    llmsTxt?: string;
    humansTxt?: string;
    securityTxt?: string;
    adsTxt?: string;
  };
}

export interface IProgressReport {
  jobId: string;
  status: JobStatus;
  progressPercent: number;
  statusMessage: string;
  completedAt?: string;
}

export interface IBusinessContext {
  category: string;
  industry: string;
  targetAudience: string;
  goals: string[];
  searchIntentProfile: string;
  language: string;
  geographicScope: "local" | "regional" | "national" | "global";
}

export interface IWebsiteIntent {
  primaryType: "ecommerce" | "saas" | "blog" | "news" | "portfolio" | "agency" | "hospital" | "school" | "restaurant" | "hotel" | "movie ticket booking" | "real estate" | "marketplace" | "corporate" | "government" | "ngo" | "personal website" | "other";
  confidenceScore: number;
}

export interface IDiscoveryReport {
  framework: string;
  frameworkConfidence: number;
  hosting?: string;
  cdn?: string;
  specialFiles: {
    llmsTxt: boolean;
    humansTxt: boolean;
    securityTxt: boolean;
    adsTxt: boolean;
  };
}

export interface IScores {
  overall: number;
  seo: number;
  aeo: number;
  security: number;
  performance: number;
  accessibility: number;
  geo: number;
  access: number;
}

export interface IRecommendation {
  id: string;
  problem: string;
  reason: string;
  evidence: string;
  impacts: {
    business: string;
    seo: string;
    aiVisibility: string;
    googleVisibility: string;
    security: string;
  };
  difficulty: DifficultyLevel;
  estimatedTime: string;
  priority: PriorityLevel;
  confidenceScore: number;
  frameworkContext?: string;
  implementationGuide: {
    steps: string[];
    codeSnippet?: {
      code: string;
      language: string;
      filename?: string;
    };
  };
  aiPrompt: string;
  expectedResult: string;
}

export interface IAuditDocument {
  id: string;
  targetUrl: string;
  createdAt: string;
  status: JobStatus;
  scores: IScores;
  context: IBusinessContext;
  intent: IWebsiteIntent;
  discovery: IDiscoveryReport;
  recommendations: IRecommendation[];
}
