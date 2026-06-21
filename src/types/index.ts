// ============================================================
// SEO-AEO-GEO Intelligence Platform - Core Types
// ============================================================

// --- Database Models ---

export interface Project {
  id: string;
  website_url: string;
  competitor_url?: string;
  github_url?: string;
  created_at: string;
}

export interface Audit {
  id: string;
  project_id: string;
  seo_score: number;
  aeo_score: number;
  geo_score: number;
  access_score: number;
  lighthouse_scores?: LighthouseScores;
  technology_stack?: TechnologyStack;
  website_understanding?: WebsiteUnderstanding;
  created_at: string;
}

export interface Issue {
  id: string;
  audit_id: string;
  category: IssueCategory;
  title: string;
  description: string;
  priority: Priority;
  impact: string;
  difficulty: Difficulty;
  confidence: number;
}

export interface Report {
  id: string;
  audit_id: string;
  report_type: ReportType;
  file_url: string;
  created_at: string;
}

// --- Enums & Unions ---

export type IssueCategory =
  | "seo"
  | "aeo"
  | "geo"
  | "access"
  | "performance"
  | "content"
  | "competitor";

export type Priority = "critical" | "high" | "medium" | "low";

export type Difficulty = "easy" | "medium" | "hard";

export type ReportType =
  | "website_analysis"
  | "competitor_analysis"
  | "seo_report"
  | "aeo_report"
  | "geo_report"
  | "keyword_report"
  | "meta_tag_report"
  | "content_gap_report"
  | "implementation_blueprint"
  | "full_master_report";

// --- Crawler Types ---

export interface CrawlResult {
  url: string;
  html: string;
  renderedHtml?: string;
  statusCode: number;
  headers: Record<string, string>;
  pages: PageData[];
  robotsTxt?: string;
  sitemapXml?: string;
  loadTime: number;
}

export interface PageData {
  url: string;
  title: string;
  metaDescription: string;
  canonical: string;
  metaRobots: string;
  ogTags: Record<string, string>;
  twitterTags: Record<string, string>;
  schemaMarkup: object[];
  headings: HeadingData[];
  images: ImageData[];
  internalLinks: string[];
  externalLinks: string[];
  content: string;
  wordCount: number;
}

export interface HeadingData {
  level: number;
  text: string;
}

export interface ImageData {
  src: string;
  alt: string;
  hasAlt: boolean;
}

// --- Lighthouse Types ---

export interface LighthouseScores {
  seo: number;
  performance: number;
  accessibility: number;
  bestPractices: number;
  coreWebVitals?: CoreWebVitals;
}

export interface CoreWebVitals {
  lcp: number; // Largest Contentful Paint (ms)
  fid: number; // First Input Delay (ms)
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint (ms)
  ttfb: number; // Time to First Byte (ms)
}

// --- Technology Detection ---

export interface TechnologyStack {
  framework: string;
  languages: string[];
  cms?: string;
  hosting?: string;
  analytics: string[];
  cdns: string[];
  libraries: string[];
  meta: Record<string, string>;
}

// --- Website Understanding ---

export interface WebsiteUnderstanding {
  industry: string;
  services: string[];
  businessType: string;
  targetAudience: string;
  geographicFocus: string;
  keywords: string[];
  entities: string[];
  topics: string[];
  contentStructure: string;
}

// --- Engine Scores ---

export interface SEOResult {
  score: number;
  issues: Issue[];
  details: {
    robotsTxt: { exists: boolean; issues: string[] };
    sitemap: { exists: boolean; urls: number; issues: string[] };
    metaTags: { score: number; issues: string[] };
    headings: { score: number; issues: string[] };
    images: { score: number; issues: string[] };
    links: { score: number; issues: string[] };
    canonicals: { score: number; issues: string[] };
    ogTags: { score: number; issues: string[] };
    twitterCards: { score: number; issues: string[] };
  };
}

export interface AEOResult {
  score: number;
  issues: Issue[];
  details: {
    faqReadiness: { score: number; hasFaqSchema: boolean; faqCount: number };
    featuredSnippets: { score: number; readyCount: number };
    voiceSearch: { score: number; issues: string[] };
    speakableContent: { score: number; hasSpeakable: boolean };
    answerBlocks: { score: number; count: number };
  };
}

export interface GEOResult {
  score: number;
  issues: Issue[];
  details: {
    entityCoverage: { score: number; entities: string[] };
    eeat: { score: number; signals: string[] };
    authority: { score: number; signals: string[] };
    trust: { score: number; signals: string[] };
    topicalAuthority: { score: number; topics: string[] };
    aiReadability: { score: number; issues: string[] };
    sourceAttribution: { score: number; hasCitations: boolean };
    aboutInfo: { score: number; hasAboutPage: boolean };
    authorSignals: { score: number; hasAuthor: boolean };
  };
}

export interface AccessResult {
  score: number;
  issues: Issue[];
  details: {
    robotsTxt: { score: number; blockedPaths: string[] };
    noindex: { score: number; noindexPages: string[] };
    xRobotsTag: { score: number; headers: Record<string, string> };
    sitemap: { score: number; accessible: boolean };
    aiCrawlerBlocking: { score: number; blockedCrawlers: string[] };
    loginWalls: { score: number; detected: boolean };
    renderingIssues: { score: number; issues: string[] };
  };
}

// --- Competitor Types ---

export interface CompetitorResult {
  competitorUrl: string;
  comparison: {
    pageCount: { yours: number; competitor: number };
    contentStructure: { yours: string; competitor: string };
    keywords: { yours: string[]; competitor: string[]; gap: string[] };
    schemas: { yours: string[]; competitor: string[]; gap: string[] };
    metaTitles: { avgLength: { yours: number; competitor: number } };
    metaDescriptions: { avgLength: { yours: number; competitor: number } };
    faqs: { yours: number; competitor: number };
    internalLinks: { yours: number; competitor: number };
    authoritySignals: { yours: string[]; competitor: string[] };
  };
  gaps: {
    keywordGap: string[];
    contentGap: string[];
    schemaGap: string[];
    authorityGap: string[];
    missingPages: string[];
  };
}

// --- Content Intelligence ---

export interface ContentSuggestions {
  metaTitles: { page: string; current: string; suggested: string }[];
  metaDescriptions: { page: string; current: string; suggested: string }[];
  keywords: string[];
  faqSuggestions: { question: string; answer: string }[];
  missingPages: { title: string; reason: string }[];
  improvements: { page: string; suggestion: string; impact: string }[];
  topicClusters: { topic: string; subtopics: string[] }[];
}

// --- Recommendation ---

export interface Recommendation {
  id: string;
  problem: string;
  reason: string;
  priority: Priority;
  impact: string;
  difficulty: Difficulty;
  confidence: number;
  expectedGain: string;
  category: IssueCategory;
}

// --- Full Analysis Result ---

export interface AnalysisResult {
  project: Project;
  audit: Audit;
  crawlResult: CrawlResult;
  seoResult: SEOResult;
  aeoResult: AEOResult;
  geoResult: GEOResult;
  accessResult: AccessResult;
  competitorResult?: CompetitorResult;
  contentSuggestions?: ContentSuggestions;
  recommendations: Recommendation[];
  technologyStack: TechnologyStack;
  websiteUnderstanding: WebsiteUnderstanding;
  lighthouseScores: LighthouseScores;
}

// --- Analysis Status ---

export type AnalysisStatus =
  | "idle"
  | "crawling"
  | "analyzing_seo"
  | "analyzing_aeo"
  | "analyzing_geo"
  | "analyzing_access"
  | "detecting_technology"
  | "running_lighthouse"
  | "analyzing_competitor"
  | "generating_recommendations"
  | "complete"
  | "error";

export interface AnalysisProgress {
  status: AnalysisStatus;
  progress: number; // 0-100
  message: string;
  startedAt: string;
  completedAt?: string;
}
