// ============================================================
// Technology Detection Engine
// ============================================================

import type { CrawlResult, TechnologyStack } from "@/types";

interface TechSignature {
  name: string;
  type: "framework" | "cms" | "library" | "analytics" | "cdn";
  patterns: {
    html?: RegExp[];
    headers?: { key: string; pattern: RegExp }[];
    meta?: { name: string; pattern: RegExp }[];
    scripts?: RegExp[];
    globals?: string[];
  };
}

const SIGNATURES: TechSignature[] = [
  // Frameworks
  {
    name: "Next.js",
    type: "framework",
    patterns: {
      html: [
        /__next/i,
        /_next\/static/i,
        /next-route-announcer/i,
        /__NEXT_DATA__/i,
      ],
      meta: [{ name: "generator", pattern: /next\.js/i }],
      headers: [{ key: "x-powered-by", pattern: /next\.js/i }],
    },
  },
  {
    name: "React",
    type: "framework",
    patterns: {
      html: [/__react/i, /data-reactroot/i, /react-root/i, /reactDOM/i],
      scripts: [/react\.production\.min/i, /react-dom/i],
    },
  },
  {
    name: "Vue.js",
    type: "framework",
    patterns: {
      html: [/data-v-[a-f0-9]/i, /v-cloak/i, /__vue/i],
      scripts: [/vue\.js/i, /vue\.min\.js/i, /vue\.runtime/i],
    },
  },
  {
    name: "Angular",
    type: "framework",
    patterns: {
      html: [/ng-version/i, /ng-app/i, /_ngcontent/i, /ng-reflect/i],
      scripts: [/angular\.js/i, /angular\.min\.js/i, /@angular/i],
    },
  },
  {
    name: "Svelte",
    type: "framework",
    patterns: {
      html: [/svelte-[a-z0-9]/i, /__svelte/i],
      scripts: [/svelte/i],
    },
  },
  {
    name: "Nuxt.js",
    type: "framework",
    patterns: {
      html: [/__nuxt/i, /_nuxt\//i, /nuxt-link/i],
      meta: [{ name: "generator", pattern: /nuxt/i }],
    },
  },
  {
    name: "Gatsby",
    type: "framework",
    patterns: {
      html: [/___gatsby/i, /gatsby-/i],
      meta: [{ name: "generator", pattern: /gatsby/i }],
    },
  },
  {
    name: "Astro",
    type: "framework",
    patterns: {
      html: [/astro-/i],
      meta: [{ name: "generator", pattern: /astro/i }],
    },
  },

  // CMS
  {
    name: "WordPress",
    type: "cms",
    patterns: {
      html: [/wp-content/i, /wp-includes/i, /wp-json/i, /wordpress/i],
      meta: [{ name: "generator", pattern: /wordpress/i }],
      headers: [{ key: "x-powered-by", pattern: /wordpress/i }],
    },
  },
  {
    name: "Shopify",
    type: "cms",
    patterns: {
      html: [/shopify/i, /cdn\.shopify\.com/i, /myshopify\.com/i],
      meta: [{ name: "generator", pattern: /shopify/i }],
      headers: [{ key: "x-shopid", pattern: /.+/ }],
    },
  },
  {
    name: "Webflow",
    type: "cms",
    patterns: {
      html: [/webflow/i, /wf-page/i, /assets\.website-files\.com/i],
      meta: [{ name: "generator", pattern: /webflow/i }],
    },
  },
  {
    name: "Squarespace",
    type: "cms",
    patterns: {
      html: [/squarespace/i, /sqsp/i],
      meta: [{ name: "generator", pattern: /squarespace/i }],
    },
  },
  {
    name: "Wix",
    type: "cms",
    patterns: {
      html: [/wixsite/i, /wix\.com/i, /_wix_/i],
      meta: [{ name: "generator", pattern: /wix/i }],
    },
  },

  // Libraries
  {
    name: "jQuery",
    type: "library",
    patterns: {
      scripts: [/jquery/i],
      html: [/jquery\.min\.js/i],
    },
  },
  {
    name: "Bootstrap",
    type: "library",
    patterns: {
      html: [/bootstrap/i],
      scripts: [/bootstrap\.min\.js/i, /bootstrap\.bundle/i],
    },
  },
  {
    name: "Tailwind CSS",
    type: "library",
    patterns: {
      html: [
        /tailwindcss/i,
        /class="[^"]*\b(flex|grid|bg-|text-|p-|m-|rounded|shadow)/i,
      ],
    },
  },
  {
    name: "Material UI",
    type: "library",
    patterns: {
      html: [/MuiBox|MuiButton|MuiTypography/i, /mui-/i],
    },
  },

  // Analytics
  {
    name: "Google Analytics",
    type: "analytics",
    patterns: {
      html: [
        /google-analytics\.com/i,
        /gtag\(/i,
        /googletagmanager\.com/i,
        /ga\.js/i,
        /analytics\.js/i,
      ],
      scripts: [/www\.googletagmanager\.com\/gtag/i],
    },
  },
  {
    name: "Google Tag Manager",
    type: "analytics",
    patterns: {
      html: [/googletagmanager\.com\/gtm/i, /GTM-[A-Z0-9]+/i],
    },
  },
  {
    name: "Hotjar",
    type: "analytics",
    patterns: {
      html: [/hotjar\.com/i, /hj\(/i],
      scripts: [/static\.hotjar\.com/i],
    },
  },
  {
    name: "Segment",
    type: "analytics",
    patterns: {
      html: [/segment\.com/i, /analytics\.min\.js/i],
      scripts: [/cdn\.segment\.com/i],
    },
  },
  {
    name: "Facebook Pixel",
    type: "analytics",
    patterns: {
      html: [/fbq\(/i, /facebook\.net\/en_US\/fbevents/i],
    },
  },

  // CDNs
  {
    name: "Cloudflare",
    type: "cdn",
    patterns: {
      headers: [
        { key: "cf-ray", pattern: /.+/ },
        { key: "server", pattern: /cloudflare/i },
      ],
    },
  },
  {
    name: "Vercel",
    type: "cdn",
    patterns: {
      headers: [
        { key: "x-vercel-id", pattern: /.+/ },
        { key: "server", pattern: /vercel/i },
      ],
    },
  },
  {
    name: "Netlify",
    type: "cdn",
    patterns: {
      headers: [
        { key: "x-nf-request-id", pattern: /.+/ },
        { key: "server", pattern: /netlify/i },
      ],
    },
  },
  {
    name: "AWS CloudFront",
    type: "cdn",
    patterns: {
      headers: [
        { key: "x-amz-cf-id", pattern: /.+/ },
        { key: "via", pattern: /cloudfront/i },
      ],
    },
  },

  // Server frameworks
  {
    name: "Laravel",
    type: "framework",
    patterns: {
      html: [/laravel/i, /csrf-token/i],
      headers: [{ key: "x-powered-by", pattern: /laravel/i }],
    },
  },
  {
    name: "Django",
    type: "framework",
    patterns: {
      html: [/csrfmiddlewaretoken/i, /django/i],
      headers: [{ key: "x-frame-options", pattern: /DENY/i }],
    },
  },
  {
    name: "Ruby on Rails",
    type: "framework",
    patterns: {
      headers: [{ key: "x-powered-by", pattern: /phusion passenger/i }],
      html: [/turbolinks/i, /csrf-token/i],
    },
  },
];

export function detectTechnology(crawlResult: CrawlResult): TechnologyStack {
  const html = crawlResult.html || "";
  const headers = crawlResult.headers || {};
  const detectedFrameworks: string[] = [];
  const detectedLibraries: string[] = [];
  const detectedAnalytics: string[] = [];
  const detectedCdns: string[] = [];
  let detectedCms: string | undefined;

  for (const sig of SIGNATURES) {
    let matched = false;

    // Check HTML patterns
    if (sig.patterns.html) {
      for (const pattern of sig.patterns.html) {
        if (pattern.test(html)) {
          matched = true;
          break;
        }
      }
    }

    // Check header patterns
    if (!matched && sig.patterns.headers) {
      for (const headerPattern of sig.patterns.headers) {
        const headerValue = headers[headerPattern.key.toLowerCase()] || "";
        if (headerPattern.pattern.test(headerValue)) {
          matched = true;
          break;
        }
      }
    }

    // Check meta patterns
    if (!matched && sig.patterns.meta) {
      for (const metaPattern of sig.patterns.meta) {
        const metaRegex = new RegExp(
          `<meta[^>]*name=["']${metaPattern.name}["'][^>]*content=["']([^"']*)["']`,
          "i"
        );
        const match = html.match(metaRegex);
        if (match && metaPattern.pattern.test(match[1])) {
          matched = true;
          break;
        }
      }
    }

    // Check script patterns
    if (!matched && sig.patterns.scripts) {
      for (const scriptPattern of sig.patterns.scripts) {
        if (scriptPattern.test(html)) {
          matched = true;
          break;
        }
      }
    }

    if (matched) {
      switch (sig.type) {
        case "framework":
          detectedFrameworks.push(sig.name);
          break;
        case "cms":
          if (!detectedCms) detectedCms = sig.name;
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

  // Detect languages from file extensions and patterns
  const languages: string[] = [];
  if (/\.tsx?|typescript/i.test(html)) languages.push("TypeScript");
  if (/\.jsx?|javascript/i.test(html)) languages.push("JavaScript");
  if (/\.php/i.test(html)) languages.push("PHP");
  if (/\.py/i.test(html)) languages.push("Python");
  if (/\.rb/i.test(html)) languages.push("Ruby");

  // Extract meta generator
  const meta: Record<string, string> = {};
  const generatorMatch = html.match(
    /<meta[^>]*name=["']generator["'][^>]*content=["']([^"']*)["']/i
  );
  if (generatorMatch) {
    meta.generator = generatorMatch[1];
  }

  // Determine hosting from headers
  let hosting: string | undefined;
  if (headers["server"]) {
    hosting = headers["server"];
  }
  if (headers["x-vercel-id"]) hosting = "Vercel";
  if (headers["x-nf-request-id"]) hosting = "Netlify";
  if (headers["cf-ray"]) hosting = "Cloudflare";

  return {
    framework: detectedFrameworks[0] || detectedCms || "Custom Stack",
    languages: languages.length > 0 ? languages : ["JavaScript"],
    cms: detectedCms,
    hosting,
    analytics: detectedAnalytics,
    cdns: detectedCdns,
    libraries: detectedLibraries,
    meta,
  };
}
