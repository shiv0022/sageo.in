import { ConfigurationError } from "@/lib/errors/exceptions";

export interface ICrawlConfig {
  maxDepth: number;
  maxPages: number;
  timeoutMs: number;
}

export interface IGlobalConfig {
  environment: "development" | "staging" | "production";
  defaultAiProvider: "gemini" | "openai" | "claude";
  crawl: ICrawlConfig;
  dashboard: {
    mode: "beginner" | "advanced";
    theme: "light" | "dark";
  };
  features: {
    enableAiConsultant: boolean;
    enableCompetitorAnalysis: boolean;
    enableAccessibilityEngine: boolean;
    enableSecurityInspection: boolean;
  };
}

class ConfigurationSystem {
  private config!: IGlobalConfig;

  constructor() {
    this.loadConfiguration();
  }

  private loadConfiguration(): void {
    try {
      const environment = (process.env.NODE_ENV || "development") as IGlobalConfig["environment"];
      const defaultAiProvider = "gemini" as IGlobalConfig["defaultAiProvider"];

      const maxDepth = this.parseEnvInt("CRAWL_MAX_DEPTH", 3);
      const maxPages = this.parseEnvInt("CRAWL_MAX_PAGES", 10);
      const timeoutMs = this.parseEnvInt("CRAWL_TIMEOUT_MS", 30000);

      const dashboardMode = "beginner" as "beginner" | "advanced";
      const dashboardTheme = "dark" as "light" | "dark";

      const enableAiConsultant = this.parseEnvBool("FEATURE_ENABLE_AI_CONSULTANT", true);
      const enableCompetitorAnalysis = this.parseEnvBool("FEATURE_ENABLE_COMPETITOR_ANALYSIS", true);
      const enableAccessibilityEngine = this.parseEnvBool("FEATURE_ENABLE_ACCESSIBILITY", true);
      const enableSecurityInspection = this.parseEnvBool("FEATURE_ENABLE_SECURITY", true);

      this.config = {
        environment,
        defaultAiProvider,
        crawl: {
          maxDepth,
          maxPages,
          timeoutMs,
        },
        dashboard: {
          mode: dashboardMode,
          theme: dashboardTheme,
        },
        features: {
          enableAiConsultant,
          enableCompetitorAnalysis,
          enableAccessibilityEngine,
          enableSecurityInspection,
        },
      };
    } catch (error) {
      throw new ConfigurationError("Failed to parse environment variables configurations", {
        rawError: error,
      });
    }
  }

  private parseEnvInt(key: string, defaultValue: number): number {
    const value = process.env[key];
    if (!value) return defaultValue;
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new ConfigurationError(`Environment config key "${key}" must be an integer. Received: "${value}"`);
    }
    return parsed;
  }

  private parseEnvBool(key: string, defaultValue: boolean): boolean {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === "true" || value === "1";
  }

  public get<K extends keyof IGlobalConfig>(key: K): IGlobalConfig[K] {
    return this.config[key];
  }

  public getCrawlConfig(): ICrawlConfig {
    return this.config.crawl;
  }

  public isFeatureEnabled(featureName: keyof IGlobalConfig["features"]): boolean {
    return this.config.features[featureName] ?? false;
  }

  public getFullConfig(): IGlobalConfig {
    return { ...this.config };
  }
}

export const platformConfig = new ConfigurationSystem();
export const featureFlags = {
  isEnabled: (flag: keyof IGlobalConfig["features"]) => platformConfig.isFeatureEnabled(flag),
};
