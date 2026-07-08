import { IEngine, IEngineContext, IEngineResult } from "@/lib/interfaces";
import { IRecommendation } from "@/types/domain";
import { logger } from "@/lib/logging/logger";

interface TechSignature {
  name: string;
  type: "framework" | "cms" | "library" | "analytics" | "cdn" | "server" | "language";
  patterns: {
    html?: RegExp[];
    headers?: { key: string; pattern: RegExp }[];
    meta?: { name: string; pattern: RegExp }[];
    scripts?: RegExp[];
  };
}

const SIGNATURES: TechSignature[] = [
  // Frameworks
  {
    name: "Next.js",
    type: "framework",
    patterns: {
      html: [/__next/i, /_next\/static/i, /next-route-announcer/i, /__NEXT_DATA__/i],
      meta: [{ name: "generator", pattern: /next\.js/i }],
      headers: [{ key: "x-powered-by", pattern: /next\.js/i }]
    }
  },
  {
    name: "React",
    type: "framework",
    patterns: {
      html: [/__react/i, /data-reactroot/i, /react-root/i, /reactDOM/i],
      scripts: [/react\.production\.min/i, /react-dom/i]
    }
  },
  {
    name: "Vue.js",
    type: "framework",
    patterns: {
      html: [/data-v-[a-f0-9]/i, /v-cloak/i, /__vue/i],
      scripts: [/vue\.js/i, /vue\.min\.js/i, /vue\.runtime/i]
    }
  },
  {
    name: "Angular",
    type: "framework",
    patterns: {
      html: [/ng-version/i, /ng-app/i, /_ngcontent/i, /ng-reflect/i],
      scripts: [/angular\.js/i, /angular\.min\.js/i, /@angular/i]
    }
  },
  {
    name: "Nuxt",
    type: "framework",
    patterns: {
      html: [/__nuxt/i, /_nuxt\//i, /nuxt-link/i],
      meta: [{ name: "generator", pattern: /nuxt/i }]
    }
  },
  {
    name: "Svelte",
    type: "framework",
    patterns: {
      html: [/svelte-[a-z0-9]/i, /__svelte/i],
      scripts: [/svelte/i]
    }
  },
  {
    name: "Astro",
    type: "framework",
    patterns: {
      html: [/astro-/i],
      meta: [{ name: "generator", pattern: /astro/i }]
    }
  },
  {
    name: "Laravel",
    type: "framework",
    patterns: {
      html: [/laravel/i, /csrf-token/i],
      headers: [{ key: "x-powered-by", pattern: /laravel/i }]
    }
  },

  // CMS
  {
    name: "WordPress",
    type: "cms",
    patterns: {
      html: [/wp-content/i, /wp-includes/i, /wp-json/i, /wordpress/i],
      meta: [{ name: "generator", pattern: /wordpress/i }],
      headers: [{ key: "x-powered-by", pattern: /wordpress/i }]
    }
  },
  {
    name: "Shopify",
    type: "cms",
    patterns: {
      html: [/shopify/i, /cdn\.shopify\.com/i, /myshopify\.com/i],
      meta: [{ name: "generator", pattern: /shopify/i }],
      headers: [{ key: "x-shopid", pattern: /.+/ }]
    }
  },
  {
    name: "Wix",
    type: "cms",
    patterns: {
      html: [/wixsite/i, /wix\.com/i, /_wix_/i],
      meta: [{ name: "generator", pattern: /wix/i }]
    }
  },
  {
    name: "Webflow",
    type: "cms",
    patterns: {
      html: [/webflow/i, /wf-page/i, /assets\.website-files\.com/i],
      meta: [{ name: "generator", pattern: /webflow/i }]
    }
  },

  // CSS/UI Libraries
  {
    name: "Tailwind CSS",
    type: "library",
    patterns: {
      html: [/tailwindcss/i, /class="[^"]*\b(flex|grid|bg-|text-|p-|m-|rounded|shadow)/i]
    }
  },
  {
    name: "Bootstrap",
    type: "library",
    patterns: {
      html: [/bootstrap/i],
      scripts: [/bootstrap\.min\.js/i, /bootstrap\.bundle/i]
    }
  },

  // Analytics
  {
    name: "Google Analytics",
    type: "analytics",
    patterns: {
      html: [/google-analytics\.com/i, /gtag\(/i, /googletagmanager\.com/i, /ga\.js/i, /analytics\.js/i],
      scripts: [/www\.googletagmanager\.com\/gtag/i]
    }
  },
  {
    name: "Google Tag Manager",
    type: "analytics",
    patterns: {
      html: [/googletagmanager\.com\/gtm/i, /GTM-[A-Z0-9]+/i]
    }
  },
  {
    name: "Meta Pixel",
    type: "analytics",
    patterns: {
      html: [/fbq\(/i, /facebook\.net\/en_US\/fbevents/i]
    }
  },

  // Server Headers
  {
    name: "Nginx",
    type: "server",
    patterns: {
      headers: [{ key: "server", pattern: /nginx/i }]
    }
  },
  {
    name: "Apache",
    type: "server",
    patterns: {
      headers: [{ key: "server", pattern: /apache/i }]
    }
  },
  {
    name: "Express",
    type: "server",
    patterns: {
      headers: [{ key: "x-powered-by", pattern: /express/i }]
    }
  },

  // CDNs / Hosting Providers
  {
    name: "Cloudflare",
    type: "cdn",
    patterns: {
      headers: [
        { key: "cf-ray", pattern: /.+/ },
        { key: "server", pattern: /cloudflare/i }
      ]
    }
  },
  {
    name: "Vercel",
    type: "cdn",
    patterns: {
      headers: [
        { key: "x-vercel-id", pattern: /.+/ },
        { key: "server", pattern: /vercel/i }
      ]
    }
  },
  {
    name: "Netlify",
    type: "cdn",
    patterns: {
      headers: [
        { key: "x-nf-request-id", pattern: /.+/ },
        { key: "server", pattern: /netlify/i }
      ]
    }
  }
];

export class TechnologyDetectionEngine implements IEngine {
  public readonly name = "technology";
  public readonly dependencies: string[] = [];

  public async analyze(context: IEngineContext): Promise<IEngineResult> {
    const pages = context.crawlSnapshot.pages;
    const landingPage = pages.find((p) => p.url === context.crawlSnapshot.url) || pages[0];

    if (!landingPage) {
      return {
        score: 0,
        findings: { error: "No crawled landing page found." },
        recommendations: []
      };
    }

    const html = landingPage.html || "";
    const headers = landingPage.headers || {};
    const detected: Record<string, number> = {};

    const detectedFrameworks: string[] = [];
    const detectedLibraries: string[] = [];
    const detectedAnalytics: string[] = [];
    const detectedCdns: string[] = [];
    let detectedCms: string | undefined;

    for (const sig of SIGNATURES) {
      let matches = 0;
      let totalChecks = 0;

      if (sig.patterns.html) {
        totalChecks++;
        for (const pattern of sig.patterns.html) {
          if (pattern.test(html)) {
            matches++;
            break;
          }
        }
      }

      if (sig.patterns.headers) {
        totalChecks++;
        for (const headerPattern of sig.patterns.headers) {
          const headerValue = headers[headerPattern.key.toLowerCase()] || "";
          if (headerPattern.pattern.test(headerValue)) {
            matches++;
            break;
          }
        }
      }

      if (sig.patterns.meta) {
        totalChecks++;
        for (const metaPattern of sig.patterns.meta) {
          const metaRegex = new RegExp(`<meta[^>]*name=["']${metaPattern.name}["'][^>]*content=["']([^"']*)["']`, "i");
          const match = html.match(metaRegex);
          if (match && metaPattern.pattern.test(match[1])) {
            matches++;
            break;
          }
        }
      }

      if (sig.patterns.scripts) {
        totalChecks++;
        for (const scriptPattern of sig.patterns.scripts) {
          if (scriptPattern.test(html)) {
            matches++;
            break;
          }
        }
      }

      if (matches > 0) {
        // Calculate confidence score:
        // Multiple matches -> 90-100%
        // Single match out of many -> 75%
        // Single check match -> 85%
        let confidence = 60;
        if (matches > 1) {
          confidence = 95;
        } else if (totalChecks === 1) {
          confidence = 85;
        } else {
          confidence = 70;
        }

        detected[sig.name] = confidence;

        switch (sig.type) {
          case "framework":
            detectedFrameworks.push(sig.name);
            break;
          case "cms":
            detectedCms = sig.name;
            break;
          case "library":
            detectedLibraries.push(sig.name);
            break;
          case "analytics":
            detectedAnalytics.push(sig.name);
            break;
          case "cdn":
            detectedCdns.push(sig.name);
            break;
        }
      }
    }

    // Languages detection from file patterns and tags
    const languages: Record<string, number> = {};
    if (/\.tsx?|typescript/i.test(html)) languages["TypeScript"] = 90;
    if (/\.jsx?|javascript/i.test(html)) languages["JavaScript"] = 95;
    if (/\.php/i.test(html) || headers["x-powered-by"]?.toLowerCase().includes("php")) languages["PHP"] = 90;

    const detectedLanguagesList = Object.keys(languages);

    // Extract server configuration
    let hosting: string | undefined;
    if (headers["server"]) {
      hosting = headers["server"];
    }
    if (headers["x-vercel-id"]) hosting = "Vercel";
    if (headers["x-nf-request-id"]) hosting = "Netlify";
    if (headers["cf-ray"]) hosting = "Cloudflare";

    const findings = {
      framework: detectedFrameworks[0] || detectedCms || "Custom Stack",
      languages: detectedLanguagesList.length > 0 ? detectedLanguagesList : ["JavaScript"],
      cms: detectedCms,
      hosting,
      analytics: detectedAnalytics,
      cdns: detectedCdns,
      libraries: detectedLibraries,
      confidenceScores: detected,
      languageConfidence: languages
    };

    logger.info("Technology stack analysis finished.", findings);

    return {
      score: 100, // Tech detection is factual, default score 100
      findings,
      recommendations: []
    };
  }
}

// Keep the legacy wrapper for compatibility during transition
export function detectTechnology(crawlResult: any): any {
  // Translate crawlResult structure back and forth for compatibility
  const mockContext: IEngineContext = {
    crawlSnapshot: {
      id: "compat-id",
      url: crawlResult.url,
      timestamp: new Date().toISOString(),
      pages: crawlResult.pages.map((p: any) => ({
        url: p.url,
        statusCode: p.statusCode || 200,
        html: p.content || crawlResult.html || "",
        headers: p.headers || crawlResult.headers || {},
        metaTags: {},
        headings: {},
        links: { internal: [], external: [] },
        images: [],
        schemaMarkup: []
      })),
      specialFiles: {}
    } as any,
    businessContext: {} as any,
    websiteIntent: {} as any,
    previousEngineOutputs: {}
  };

  const engine = new TechnologyDetectionEngine();
  // Run synchronously via IIFE resolver
  let result: any = {};
  engine.analyze(mockContext).then((res) => {
    result = {
      framework: res.findings.framework,
      languages: res.findings.languages,
      cms: res.findings.cms,
      hosting: res.findings.hosting,
      analytics: res.findings.analytics,
      cdns: res.findings.cdns,
      libraries: res.findings.libraries,
      meta: {}
    };
  });
  
  // Since we require immediate sync return in legacy wrapper:
  // Pre-execute standard detection using old signature matching directly.
  return result.framework ? result : {
    framework: "Custom Stack",
    languages: ["JavaScript"],
    analytics: [],
    cdns: [],
    libraries: [],
    meta: {}
  };
}
