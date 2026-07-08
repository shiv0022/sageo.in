import {
  ICrawlSnapshot,
  IBusinessContext,
  IWebsiteIntent,
  IRecommendation,
  IAuditDocument
} from "@/types/domain";

export interface IEngineContext {
  crawlSnapshot: ICrawlSnapshot;
  businessContext: IBusinessContext;
  websiteIntent: IWebsiteIntent;
  previousEngineOutputs: Record<string, any>;
}

export interface IEngineResult {
  score: number;
  findings: Record<string, any>;
  recommendations: IRecommendation[];
}

export interface IEngine {
  name: string;
  dependencies: string[];
  analyze(context: IEngineContext): Promise<IEngineResult>;
}

export interface IAIPromptConfig {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  jsonFormat?: boolean;
}

export interface IAIResponse {
  text: string;
  tokenCount?: {
    prompt: number;
    completion: number;
  };
}

export interface IAIProvider {
  name: string;
  completion(prompt: IAIPromptConfig): Promise<IAIResponse>;
  stream(prompt: IAIPromptConfig, onChunk: (text: string) => void): Promise<IAIResponse>;
}

export interface IDatabaseAdapter {
  writeAudit(doc: IAuditDocument): Promise<void>;
  readAudit(auditId: string): Promise<IAuditDocument | null>;
  queryAudits(filter: Record<string, any>): Promise<IAuditDocument[]>;
  updateJobProgress(jobId: string, progress: number, status: string): Promise<void>;
}

export interface IFileStorageAdapter {
  uploadFile(key: string, data: Buffer, contentType: string): Promise<string>;
  getDownloadUrl(key: string): Promise<string>;
  deleteFile(key: string): Promise<void>;
}
