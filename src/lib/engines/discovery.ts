import { IEngine, IEngineContext, IEngineResult } from "@/lib/interfaces";
import { IDiscoveryReport } from "@/types/domain";
import { logger } from "@/lib/logging/logger";

export class DiscoveryEngine implements IEngine {
  public readonly name = "discovery";
  public readonly dependencies: string[] = ["technology"];

  public async analyze(context: IEngineContext): Promise<IEngineResult> {
    const snapshot = context.crawlSnapshot;
    const previous = context.previousEngineOutputs;
    const techResult = previous["technology"];

    const pages = snapshot.pages;
    const landingPage = pages.find((p) => p.url === snapshot.url) || pages[0];

    const specialFilesPresence = {
      llmsTxt: !!snapshot.specialFiles?.llmsTxt,
      humansTxt: !!snapshot.specialFiles?.humansTxt,
      securityTxt: !!snapshot.specialFiles?.securityTxt,
      adsTxt: !!snapshot.specialFiles?.adsTxt
    };

    // Tech discovery attributes
    const framework = techResult?.findings?.framework || "Custom Stack";
    const frameworkConfidence = techResult?.findings?.confidenceScores?.[framework] || 70;
    const hosting = techResult?.findings?.hosting || landingPage?.headers?.["server"] || "Unknown";
    const cdn = techResult?.findings?.cdns?.[0] || undefined;

    const findings: IDiscoveryReport & Record<string, any> = {
      framework,
      frameworkConfidence,
      hosting,
      cdn,
      specialFiles: specialFilesPresence,
      // Comprehensive details required by discovery engine output TDD specs:
      crawlSnapshot: {
        id: snapshot.id,
        url: snapshot.url,
        timestamp: snapshot.timestamp,
        pagesCount: pages.length,
        sitemapsCount: snapshot.sitemaps.length
      },
      websiteStructure: {
        pagesList: pages.map(p => ({
          url: p.url,
          title: p.title,
          headingsCount: Object.values(p.headings).reduce((sum, list) => sum + list.length, 0),
          schemasCount: p.schemaMarkup.length,
          wordCount: p.html ? p.html.split(/\s+/).filter(Boolean).length : 0
        }))
      },
      serverHeaders: landingPage?.headers || {},
      specialFilesContent: {
        robotsTxt: snapshot.robotsTxt,
        sitemaps: snapshot.sitemaps
      }
    };

    logger.info("Discovery Engine finished analysis.", {
      framework,
      hosting,
      specialFiles: specialFilesPresence
    });

    return {
      score: 100, // Fact-finding engine
      findings,
      recommendations: []
    };
  }
}
export const discoveryEngine = new DiscoveryEngine();
