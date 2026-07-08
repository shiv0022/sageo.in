import { IEngine, IEngineContext, IEngineResult } from "@/lib/interfaces";
import { EngineError } from "@/lib/errors/exceptions";
import { logger } from "@/lib/logging/logger";

export class EngineRegistry {
  private engines: Map<string, IEngine> = new Map();

  /**
   * Register a new modular engine
   */
  public register(engine: IEngine): void {
    if (this.engines.has(engine.name)) {
      throw new EngineError(`Engine with name "${engine.name}" is already registered.`, engine.name);
    }
    this.engines.set(engine.name, engine);
    logger.info(`Engine registered: ${engine.name}`);
  }

  /**
   * Clears the registered engines (useful for tests)
   */
  public clear(): void {
    this.engines.clear();
  }

  /**
   * Get an engine by name
   */
  public getEngine(name: string): IEngine {
    const engine = this.engines.get(name);
    if (!engine) {
      throw new EngineError(`Engine "${name}" is not registered.`, name);
    }
    return engine;
  }

  /**
   * Perform topological sort on registered engines based on declared dependencies
   */
  public resolveDependencies(): IEngine[] {
    const resolved: IEngine[] = [];
    const visiting = new Set<string>();
    const visited = new Set<string>();

    const visit = (name: string) => {
      if (visiting.has(name)) {
        throw new EngineError(`Circular dependency detected in engine registry involving: "${name}"`, name);
      }

      if (!visited.has(name)) {
        visiting.add(name);

        const engine = this.engines.get(name);
        if (!engine) {
          throw new EngineError(`Required dependency engine "${name}" is not registered.`, name);
        }

        for (const dep of engine.dependencies) {
          visit(dep);
        }

        visiting.delete(name);
        visited.add(name);
        resolved.push(engine);
      }
    };

    for (const name of this.engines.keys()) {
      visit(name);
    }

    return resolved;
  }

  /**
   * Executes all registered engines in their resolved dependency order.
   * If an engine throws an exception, it registers as "degraded" (0 score) but allows the pipeline to continue.
   */
  public async executeAll(
    baseContext: Omit<IEngineContext, "previousEngineOutputs">,
    onEngineProgress?: (engineName: string, progressPercent: number) => void
  ): Promise<Record<string, IEngineResult>> {
    const sortedEngines = this.resolveDependencies();
    const results: Record<string, IEngineResult> = {};
    const totalCount = sortedEngines.length;

    for (let i = 0; i < totalCount; i++) {
      const engine = sortedEngines[i];
      logger.info(`Executing engine: ${engine.name}`);

      const context: IEngineContext = {
        ...baseContext,
        previousEngineOutputs: { ...results },
      };

      try {
        const engineResult = await engine.analyze(context);
        results[engine.name] = engineResult;
        logger.info(`Engine ${engine.name} finished successfully. Score: ${engineResult.score}`);
      } catch (error) {
        logger.error(`Engine ${engine.name} execution failed. Entering degraded mode.`, error);
        // Error containment: flag as degraded with 0 score and logged error, but don't halt registry
        results[engine.name] = {
          score: 0,
          findings: {
            error: error instanceof Error ? error.message : String(error),
            degraded: true,
          },
          recommendations: [],
        };
      }

      if (onEngineProgress) {
        const progressPercent = Math.round(((i + 1) / totalCount) * 100);
        onEngineProgress(engine.name, progressPercent);
      }
    }

    return results;
  }
}

export const engineRegistry = new EngineRegistry();

// Import and Register Sprint 2 Engines
import { BusinessContextEngine } from "./context";
import { WebsiteIntentEngine } from "./intent";
import { TechnologyDetectionEngine } from "./technology";
import { DiscoveryEngine } from "./discovery";

engineRegistry.register(new BusinessContextEngine());
engineRegistry.register(new WebsiteIntentEngine());
engineRegistry.register(new TechnologyDetectionEngine());
engineRegistry.register(new DiscoveryEngine());

// Import and Register Sprint 3 Engines
import { SEOIntelligenceEngine } from "./seo";
import { KeywordIntelligenceEngine } from "./keywords";
import { AEOEngine } from "./aeo";

engineRegistry.register(new SEOIntelligenceEngine());
engineRegistry.register(new KeywordIntelligenceEngine());
engineRegistry.register(new AEOEngine());

// Import and Register Sprint 4 Engines
import { GoogleVisibilityEngine } from "./google-visibility";
import { AIVisibilityEngine } from "./ai-visibility";
import { SecurityIntelligenceEngine } from "./security-intel";
import { PerformanceIntelligenceEngine } from "./performance-intel";
import { AccessibilityIntelligenceEngine } from "./accessibility-intel";
import { SchemaIntelligenceEngine } from "./schema-intel";

engineRegistry.register(new GoogleVisibilityEngine());
engineRegistry.register(new AIVisibilityEngine());
engineRegistry.register(new SecurityIntelligenceEngine());
engineRegistry.register(new PerformanceIntelligenceEngine());
engineRegistry.register(new AccessibilityIntelligenceEngine());
engineRegistry.register(new SchemaIntelligenceEngine());
