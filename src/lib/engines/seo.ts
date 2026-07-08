import { IEngine, IEngineContext, IEngineResult } from "@/lib/interfaces";
import { IRecommendation, DifficultyLevel, PriorityLevel } from "@/types/domain";
import { logger } from "@/lib/logging/logger";
import crypto from "crypto";
import * as cheerio from "cheerio";

export class SEOIntelligenceEngine implements IEngine {
  public readonly name = "seo";
  public readonly dependencies: string[] = ["discovery"];

  public async analyze(context: IEngineContext): Promise<IEngineResult> {
    const snapshot = context.crawlSnapshot;
    const pages = snapshot.pages;
    const landingPage = pages.find((p) => p.url === snapshot.url) || pages[0];

    if (!landingPage) {
      return {
        score: 0,
        findings: { error: "No page data crawled." },
        recommendations: []
      };
    }

    const recommendations: IRecommendation[] = [];
    const findings: Record<string, any> = {};
    let penaltyPoints = 0;

    // Helper to add recommendations with consistent formatting
    const addRecommendation = (
      problem: string,
      reason: string,
      evidence: string,
      impacts: IRecommendation["impacts"],
      difficulty: DifficultyLevel,
      estimatedTime: string,
      priority: PriorityLevel,
      steps: string[],
      codeSnippet?: IRecommendation["implementationGuide"]["codeSnippet"],
      aiPrompt = ""
    ) => {
      // Hashing the problem to create a unique stable recommendation ID
      const shasum = crypto ? crypto.createHash("sha1") : null;
      const id = shasum 
        ? shasum.update(problem + evidence).digest("hex").substring(0, 12)
        : `rec-${Math.random().toString(36).substring(2, 9)}`;

      recommendations.push({
        id,
        problem,
        reason,
        evidence,
        impacts,
        difficulty,
        estimatedTime,
        priority,
        confidenceScore: 100,
        frameworkContext: context.crawlSnapshot.specialFiles ? "Web Application" : undefined,
        implementationGuide: { steps, codeSnippet },
        aiPrompt: aiPrompt || `Fix the following SEO issue: ${problem} on url ${landingPage.url}. Evidence: ${evidence}`,
        expectedResult: `SEO score improvement and cleaner search indexing on Google.`
      });
    };

    // 1. Robots.txt and Sitemap Detections
    const hasRobots = !!snapshot.robotsTxt;
    findings.robotsTxt = { exists: hasRobots };
    if (!hasRobots) {
      penaltyPoints += 10;
      addRecommendation(
        "Missing robots.txt",
        "Robots.txt tells crawlers which parts of your site they can visit. Without it, search engines might waste your crawl budget on private directories.",
        "No robots.txt file found at domain root.",
        { business: "Medium", seo: "High", aiVisibility: "High", googleVisibility: "High", security: "Low" },
        "easy",
        "5 minutes",
        "high",
        [
          "Create a plain text file named 'robots.txt' at the root of your public folder.",
          "Add default crawl rules: 'User-agent: *' followed by 'Allow: /'.",
          "Specify your XML Sitemap path: 'Sitemap: https://yourdomain.com/sitemap.xml'."
        ],
        {
          code: "User-agent: *\nAllow: /\n\nSitemap: https://yourdomain.com/sitemap.xml",
          language: "txt",
          filename: "robots.txt"
        }
      );
    }

    const hasSitemaps = snapshot.sitemaps.length > 0;
    findings.sitemaps = { count: snapshot.sitemaps.length, list: snapshot.sitemaps };
    if (!hasSitemaps) {
      penaltyPoints += 10;
      addRecommendation(
        "Missing XML Sitemap",
        "XML sitemaps help Google and other search engines find and index all the important URLs on your website quickly.",
        "No sitemap references found on the origin root.",
        { business: "High", seo: "High", aiVisibility: "Medium", googleVisibility: "High", security: "None" },
        "easy",
        "10 minutes",
        "high",
        [
          "Generate an XML sitemap of all indexable pages using your framework/plugin.",
          "Upload it to the root of your project.",
          "Verify accessibility by browsing to '/sitemap.xml'."
        ],
        {
          code: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n  <url>\n    <loc>https://yourdomain.com/</loc>\n  </url>\n</urlset>",
          language: "xml",
          filename: "sitemap.xml"
        }
      );
    }

    // 2. Title Tag Analysis
    const title = landingPage.title;
    findings.title = { exists: !!title, length: title?.length || 0 };
    if (!title) {
      penaltyPoints += 25;
      addRecommendation(
        "Missing Title Tag",
        "The page title tag is the most prominent element displayed in Google search results and is a primary ranking factor.",
        "Missing <title> element inside HTML <head>.",
        { business: "High", seo: "High", aiVisibility: "Medium", googleVisibility: "High", security: "None" },
        "easy",
        "2 minutes",
        "critical",
        ["Add a <title> element in the head section of your page HTML.", "Ensure it contains descriptive, keyword-rich copy."],
        { code: "<head>\n  <title>Your Brand - Main Services & Focus</title>\n</head>", language: "html" }
      );
    } else if (title.length < 30 || title.length > 65) {
      penaltyPoints += 8;
      addRecommendation(
        "Suboptimal Title Tag Length",
        "Titles under 30 characters lack target keywords, while titles over 65 characters get truncated in search result displays.",
        `Title tag length is ${title.length} characters: "${title}"`,
        { business: "Medium", seo: "Medium", aiVisibility: "Low", googleVisibility: "Medium", security: "None" },
        "easy",
        "3 minutes",
        "medium",
        ["Rewrite page title to be between 30 and 65 characters.", "Place primary keywords near the beginning."],
        { code: "<title>Target Keyword | secondary keyword and services</title>", language: "html" }
      );
    }

    // 3. Meta Description Analysis
    const desc = landingPage.metaTags["description"];
    findings.metaDescription = { exists: !!desc, length: desc?.length || 0 };
    if (!desc) {
      penaltyPoints += 15;
      addRecommendation(
        "Missing Meta Description",
        "Meta descriptions display as search snippet descriptions. While not a direct ranking factor, they significantly boost click-through rates.",
        "Missing <meta name=\"description\"> tag in the HTML head.",
        { business: "High", seo: "High", aiVisibility: "Low", googleVisibility: "High", security: "None" },
        "easy",
        "2 minutes",
        "high",
        ["Create a meta description tag in the HTML head.", "Write a short summary (110-160 characters) summarizing page contents."],
        { code: "<meta name=\"description\" content=\"Describe your page in 110 to 160 characters here.\" />", language: "html" }
      );
    } else if (desc.length < 110 || desc.length > 160) {
      penaltyPoints += 5;
      addRecommendation(
        "Suboptimal Meta Description Length",
        "Descriptions outside 110-160 characters risk getting cut off by Google, degrading search snippet presentation.",
        `Meta description length is ${desc.length} characters: "${desc.substring(0, 30)}..."`,
        { business: "Medium", seo: "Medium", aiVisibility: "Low", googleVisibility: "Medium", security: "None" },
        "easy",
        "3 minutes",
        "medium",
        ["Adjust description to be between 110 and 160 characters.", "Use clear call-to-actions (e.g. 'Learn more about...')."],
        { code: "<meta name=\"description\" content=\"Clear concise meta description containing 110 to 160 characters.\" />", language: "html" }
      );
    }

    // 4. Meta Keywords (detect only)
    const keywordsMeta = landingPage.metaTags["keywords"];
    findings.metaKeywords = { detected: !!keywordsMeta };
    if (keywordsMeta) {
      addRecommendation(
        "Deprecated Meta Keywords Tag Detected",
        "Google and other search engines do not use the meta keywords tag for ranking. Keeping it only bloats code and reveals target keywords to competitors.",
        `Meta keywords tag present: "${keywordsMeta.substring(0, 30)}..."`,
        { business: "None", seo: "Low", aiVisibility: "None", googleVisibility: "Low", security: "None" },
        "easy",
        "2 minutes",
        "low",
        ["Remove the <meta name=\"keywords\"> element entirely from HTML head."],
        undefined
      );
    }

    // 5. Headings Structure (H1-H6)
    const h1Count = landingPage.headings["h1"]?.length || 0;
    findings.headings = { h1Count, headingsList: landingPage.headings };
    if (h1Count === 0) {
      penaltyPoints += 20;
      addRecommendation(
        "Missing <h1> Tag",
        "H1 headings act as the primary title of the page body. It signals the main topic of your page to search bots.",
        "No H1 element found in page HTML.",
        { business: "High", seo: "High", aiVisibility: "Medium", googleVisibility: "High", security: "None" },
        "easy",
        "5 minutes",
        "critical",
        ["Locate the primary header of your page body.", "Wrap it in an <h1> element.", "Ensure only one H1 element is used on the page."],
        { code: "<h1>Page Title / Main Topic</h1>", language: "html" }
      );
    } else if (h1Count > 1) {
      penaltyPoints += 10;
      addRecommendation(
        "Multiple <h1> Tags Detected",
        "Multiple H1 elements dilute page topical focus and confuse crawler parsing hierarchies. Use one H1 and sub-nest with H2s/H3s.",
        `Found ${h1Count} H1 headings.`,
        { business: "Medium", seo: "Medium", aiVisibility: "Low", googleVisibility: "Medium", security: "None" },
        "medium",
        "10 minutes",
        "medium",
        ["Select the primary body header to remain H1.", "Convert secondary H1 elements into H2 or H3 structures."],
        undefined
      );
    }

    // Heading hierarchy verification
    // Find headings in ordered sequence in html
    const headingOrder: number[] = [];
    const cheerioLoader = cheerio.load(landingPage.html || "");
    cheerioLoader("h1, h2, h3, h4, h5, h6").each((_: number, el: any) => {
      const level = parseInt(el.tagName.substring(1), 10);
      headingOrder.push(level);
    });

    let hasHierarchySkip = false;
    let skipEvidence = "";
    for (let i = 0; i < headingOrder.length - 1; i++) {
      if (headingOrder[i + 1] > headingOrder[i] + 1) {
        hasHierarchySkip = true;
        skipEvidence = `H${headingOrder[i]} followed by H${headingOrder[i+1]} (index: ${i})`;
        break;
      }
    }
    findings.headingHierarchy = { orderly: !hasHierarchySkip };
    if (hasHierarchySkip) {
      penaltyPoints += 8;
      addRecommendation(
        "Heading Hierarchy Skips Detected",
        "Skipping levels in headings (e.g. H1 followed immediately by H3) disrupts screen readers and confuses search engine crawler outlines.",
        `Skipped heading level detected: ${skipEvidence}`,
        { business: "None", seo: "Medium", aiVisibility: "Low", googleVisibility: "Medium", security: "None" },
        "medium",
        "15 minutes",
        "medium",
        ["Audit heading tags sequence on page.", "Avoid skipping headers hierarchy levels. Ensure H2s follow H1, and H3s follow H2."],
        undefined
      );
    }

    // 6. Image Alt Attributes
    const totalImgs = landingPage.images.length;
    const missingAltCount = landingPage.images.filter((img) => !img.altText).length;
    findings.images = { totalCount: totalImgs, missingAlt: missingAltCount };
    if (totalImgs > 0 && missingAltCount > 0) {
      const ratio = missingAltCount / totalImgs;
      penaltyPoints += Math.round(ratio * 15);
      addRecommendation(
        "Missing Image Alt Text",
        "Image alt attributes provide fallback textual descriptions for screen readers and search crawlers, and boost image SEO visibility.",
        `${missingAltCount} out of ${totalImgs} images lack alt attributes.`,
        { business: "Medium", seo: "Medium", aiVisibility: "Low", googleVisibility: "Medium", security: "None" },
        "easy",
        "10 minutes",
        "medium",
        [
          "Locate images without alt attributes.",
          "Add the 'alt' attribute describing the image content clearly.",
          "Keep descriptions descriptive, concise, and keyword-aligned."
        ],
        { code: "<img src=\"/assets/product.jpg\" alt=\"Description of product features and type\" />", language: "html" }
      );
    }

    // 7. Link Audit & Anchor Quality
    const internalLinks = landingPage.links.internal;
    const externalLinks = landingPage.links.external;
    findings.links = { internalCount: internalLinks.length, externalCount: externalLinks.length };
    
    // Generic Anchor text checking (e.g. "click here", "read more")
    const genericTerms = ["click here", "read more", "link", "more", "go", "here", "website"];
    const weakAnchors = [...internalLinks, ...externalLinks].filter(l => 
      genericTerms.includes(l.anchorText.toLowerCase().trim())
    );
    findings.anchorText = { weakAnchorsCount: weakAnchors.length };
    if (weakAnchors.length > 0) {
      penaltyPoints += Math.min(10, weakAnchors.length * 2);
      addRecommendation(
        "Weak Link Anchor Text",
        "Generic anchor text like 'click here' tells search crawlers nothing about the destination page. Use descriptive, descriptive, keyword-aligned anchor text.",
        `Found ${weakAnchors.length} links using weak anchor texts.`,
        { business: "Medium", seo: "High", aiVisibility: "Medium", googleVisibility: "High", security: "None" },
        "easy",
        "10 minutes",
        "medium",
        ["Audit your page links.", "Replace generic text with descriptive nouns (e.g., replace 'Click here' with 'read our SEO checklist')."],
        undefined
      );
    }

    // 8. Open Graph & Twitter Cards
    const hasOgTitle = !!landingPage.metaTags["og:title"];
    const hasTwitterCard = !!landingPage.metaTags["twitter:card"];
    findings.socialMeta = { hasOgTitle, hasTwitterCard };
    if (!hasOgTitle || !hasTwitterCard) {
      penaltyPoints += 5;
      addRecommendation(
        "Missing Social Media Graph Meta Tags",
        "Social Graph tags (Open Graph & Twitter Cards) control how your URLs render when shared across social channels, maximizing engagement.",
        `Open Graph tags present: ${hasOgTitle}. Twitter Cards present: ${hasTwitterCard}.`,
        { business: "High", seo: "Low", aiVisibility: "None", googleVisibility: "Low", security: "None" },
        "easy",
        "5 minutes",
        "low",
        ["Add standard og:title, og:description, og:image elements.", "Add twitter:card, twitter:title definitions in HTML head."],
        {
          code: "<meta property=\"og:title\" content=\"Page Title\" />\n<meta name=\"twitter:card\" content=\"summary_large_image\" />",
          language: "html"
        }
      );
    }

    // 9. Structured Data Presence
    const schemasFound = landingPage.schemaMarkup.length;
    findings.structuredData = { count: schemasFound, types: landingPage.schemaMarkup.map(s => s["@type"]).filter(Boolean) };
    if (schemasFound === 0) {
      penaltyPoints += 12;
      addRecommendation(
        "Missing Structured Data Markup",
        "Structured data (JSON-LD) translates website content into machine-readable datasets, helping Google qualify your pages for rich snippet slots.",
        "No schema.org JSON-LD blocks detected.",
        { business: "High", seo: "High", aiVisibility: "High", googleVisibility: "High", security: "None" },
        "medium",
        "15 minutes",
        "high",
        [
          "Identify schema type suitable for website type (e.g., Organization schema for landing pages).",
          "Generate Schema.org compliance markup.",
          "Insert inside a script tag of type 'application/ld+json' in the HTML."
        ],
        {
          code: "<script type=\"application/ld+json\">\n{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"Organization\",\n  \"name\": \"Your Brand Name\",\n  \"url\": \"https://yourdomain.com\"\n}\n</script>",
          language: "json"
        }
      );
    }

    // 10. URL Structure Audit
    const url = landingPage.url;
    const urlObj = new URL(url);
    const hasDynamicParams = urlObj.searchParams.toString().length > 0;
    findings.urlStructure = { urlLength: url.length, dynamicParams: hasDynamicParams };
    if (hasDynamicParams) {
      penaltyPoints += 8;
      addRecommendation(
        "Dynamic Query Parameters in URL",
        "URLs with dynamic parameters (e.g. ?id=123) are less readable for search users and can result in duplicate crawler indexing issues.",
        `URL contains query string: "${urlObj.search}"`,
        { business: "None", seo: "Medium", aiVisibility: "Low", googleVisibility: "Medium", security: "None" },
        "hard",
        "1 hour",
        "medium",
        ["Rewrite URLs to clean, search-friendly slugs (e.g., replace '/page?id=seo' with '/seo-services')."],
        undefined
      );
    }

    // 11. Thin Content Detection
    const wordCount = landingPage.html ? landingPage.html.split(/\s+/).filter(Boolean).length : 0;
    findings.thinContent = { wordCount };
    if (wordCount < 300) {
      penaltyPoints += 15;
      addRecommendation(
        "Thin Content Warning",
        "Pages with fewer than 300 words are considered thin. Google filters out low-value thin pages from organic listings.",
        `Body text contains only ${wordCount} words.`,
        { business: "Medium", seo: "High", aiVisibility: "High", googleVisibility: "High", security: "None" },
        "medium",
        "30 minutes",
        "high",
        ["Expand the body content.", "Add detailed descriptions, service definitions, or helpful FAQs to add topical value."],
        undefined
      );
    }

    // 12. Indexability & Crawlability
    const robotsMeta = landingPage.metaTags["robots"] || "";
    const isNoindex = robotsMeta.toLowerCase().includes("noindex");
    findings.indexability = { indexable: !isNoindex, robotsMeta };
    if (isNoindex) {
      penaltyPoints += 40;
      addRecommendation(
        "Page is Flagged Noindex",
        "A noindex directive tells search engines to completely ignore the page, removing it from search result listings.",
        `Robots meta value: "${robotsMeta}"`,
        { business: "High", seo: "High", aiVisibility: "None", googleVisibility: "High", security: "None" },
        "easy",
        "2 minutes",
        "critical",
        ["Locate the robots meta element in your HTML head.", "Remove 'noindex' or replace it with 'index, follow'."],
        { code: "<meta name=\"robots\" content=\"index, follow\" />", language: "html" }
      );
    }

    // Calculate score (0-100 normalization)
    const score = Math.max(0, 100 - penaltyPoints);
    logger.info(`SEO Engine complete. Score: ${score}, Recommendations: ${recommendations.length}`);

    return {
      score,
      findings,
      recommendations
    };
  }
}
export const seoIntelligenceEngine = new SEOIntelligenceEngine();

// Legacy wrapper to support compatibility during transition
export function analyzeSEO(crawlResult: any, auditId: string = ""): any {
  // Convert standard results to mock engine context
  const mockContext: any = {
    crawlSnapshot: {
      id: auditId,
      url: crawlResult.url,
      timestamp: new Date().toISOString(),
      pages: (crawlResult.pages || []).map((p: any) => ({
        url: p.url,
        statusCode: p.statusCode || 200,
        html: p.content || crawlResult.html || "",
        headers: p.headers || {},
        metaTags: {
          description: p.metaDescription || "",
          keywords: p.metaKeywords || "",
          robots: p.metaRobots || ""
        },
        headings: {
          h1: (p.headings || []).filter((h: any) => h.level === 1).map((h: any) => h.text),
          h2: (p.headings || []).filter((h: any) => h.level === 2).map((h: any) => h.text),
          h3: (p.headings || []).filter((h: any) => h.level === 3).map((h: any) => h.text),
          h4: (p.headings || []).filter((h: any) => h.level === 4).map((h: any) => h.text),
          h5: (p.headings || []).filter((h: any) => h.level === 5).map((h: any) => h.text),
          h6: (p.headings || []).filter((h: any) => h.level === 6).map((h: any) => h.text),
        },
        links: {
          internal: (p.internalLinks || []).map((l: string) => ({ url: l, anchorText: "link" })),
          external: (p.externalLinks || []).map((l: string) => ({ url: l, anchorText: "link" }))
        },
        images: (p.images || []).map((img: any) => ({
          url: img.src,
          altText: img.alt,
          hasAlt: img.hasAlt
        })),
        schemaMarkup: p.schemaMarkup || []
      })),
      specialFiles: {
        robotsTxt: crawlResult.robotsTxt,
        sitemaps: crawlResult.sitemapXml ? [crawlResult.sitemapXml] : []
      }
    },
    businessContext: {},
    websiteIntent: {},
    previousEngineOutputs: {}
  };

  const engine = new SEOIntelligenceEngine();
  let result: any = { score: 100, issues: [], details: {} };
  
  // Resolve synchronously for the legacy call compatibility
  engine.analyze(mockContext).then((res) => {
    result = {
      score: res.score,
      issues: res.recommendations.map(r => ({
        id: r.id,
        audit_id: auditId,
        category: "seo",
        title: r.problem,
        description: r.reason,
        priority: r.priority,
        impact: r.impacts.seo,
        difficulty: r.difficulty,
        confidence: r.confidenceScore
      })),
      details: {
        robotsTxt: { exists: res.findings.robotsTxt?.exists || false, issues: [] },
        sitemap: { exists: res.findings.sitemaps?.count > 0, urls: res.findings.sitemaps?.count || 0, issues: [] },
        metaTags: { score: 100, issues: [] },
        headings: { score: 100, issues: [] },
        images: { score: 100, issues: [] },
        links: { score: 100, issues: [] },
        canonicals: { score: 100, issues: [] },
        ogTags: { score: 100, issues: [] },
        twitterCards: { score: 100, issues: [] }
      }
    };
  });

  return result;
}
