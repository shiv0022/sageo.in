// ============================================================
// SEO Engine - Technical SEO & Metadata Analysis
// ============================================================

import type { CrawlResult, SEOResult, Issue } from "@/types";
import { v4 as uuidv4 } from "uuid";

export function analyzeSEO(crawlResult: CrawlResult, auditId: string = ""): SEOResult {
  const mainPage = crawlResult.pages[0];
  const issues: Issue[] = [];
  
  if (!mainPage) {
    return {
      score: 0,
      issues: [],
      details: {
        robotsTxt: { exists: false, issues: ["No pages crawled"] },
        sitemap: { exists: false, urls: 0, issues: ["No pages crawled"] },
        metaTags: { score: 0, issues: ["No pages crawled"] },
        headings: { score: 0, issues: ["No pages crawled"] },
        images: { score: 0, issues: ["No pages crawled"] },
        links: { score: 0, issues: ["No pages crawled"] },
        canonicals: { score: 0, issues: ["No pages crawled"] },
        ogTags: { score: 0, issues: ["No pages crawled"] },
        twitterCards: { score: 0, issues: ["No pages crawled"] },
      },
    };
  }

  // 1. Robots.txt
  const robotsExists = !!crawlResult.robotsTxt;
  const robotsIssues: string[] = [];
  if (!robotsExists) {
    robotsIssues.push("robots.txt file is missing at root.");
    issues.push({
      id: uuidv4(),
      audit_id: auditId,
      category: "seo",
      title: "Missing robots.txt",
      description: "Robots.txt tells search engine crawlers which URLs they can access on your site. Create a robots.txt at the root.",
      priority: "high",
      impact: "+5 SEO",
      difficulty: "easy",
      confidence: 100,
    });
  }

  // 2. Sitemap
  const sitemapExists = !!crawlResult.sitemapXml;
  const sitemapIssues: string[] = [];
  let sitemapUrlCount = 0;
  if (!sitemapExists) {
    sitemapIssues.push("sitemap.xml file is missing at root.");
    issues.push({
      id: uuidv4(),
      audit_id: auditId,
      category: "seo",
      title: "Missing XML Sitemap",
      description: "XML sitemaps help search engines discover and crawl all your important pages. Generate and submit a sitemap.xml to Google Search Console.",
      priority: "high",
      impact: "+5 SEO",
      difficulty: "easy",
      confidence: 100,
    });
  } else {
    // Basic count
    sitemapUrlCount = (crawlResult.sitemapXml.match(/<loc>/g) || []).length;
  }

  // 3. Meta Tags (Title & Description)
  let metaScore = 100;
  const metaIssues: string[] = [];
  if (!mainPage.title) {
    metaScore -= 50;
    metaIssues.push("Missing title tag.");
    issues.push({
      id: uuidv4(),
      audit_id: auditId,
      category: "seo",
      title: "Missing Page Title Tag",
      description: "The title tag is crucial for search engine ranking and click-through rates. Add a title tag to the home page.",
      priority: "critical",
      impact: "+15 SEO",
      difficulty: "easy",
      confidence: 100,
    });
  } else {
    const titleLen = mainPage.title.length;
    if (titleLen < 30 || titleLen > 65) {
      metaScore -= 15;
      metaIssues.push(`Title tag length (${titleLen} chars) is outside the recommended range of 30-65 chars.`);
      issues.push({
        id: uuidv4(),
        audit_id: auditId,
        category: "seo",
        title: "Suboptimal Title Length",
        description: `Your title length is ${titleLen} characters. Titles should be between 30 and 65 characters to avoid truncation and display properly in search results.`,
        priority: "medium",
        impact: "+3 SEO",
        difficulty: "easy",
        confidence: 90,
      });
    }
  }

  if (!mainPage.metaDescription) {
    metaScore -= 40;
    metaIssues.push("Missing meta description.");
    issues.push({
      id: uuidv4(),
      audit_id: auditId,
      category: "seo",
      title: "Missing Meta Description",
      description: "Meta descriptions summarize the page for search users. Add a unique, keyword-rich meta description.",
      priority: "high",
      impact: "+8 SEO",
      difficulty: "easy",
      confidence: 100,
    });
  } else {
    const descLen = mainPage.metaDescription.length;
    if (descLen < 110 || descLen > 160) {
      metaScore -= 10;
      metaIssues.push(`Meta description length (${descLen} chars) is outside the recommended 110-160 range.`);
      issues.push({
        id: uuidv4(),
        audit_id: auditId,
        category: "seo",
        title: "Suboptimal Meta Description Length",
        description: `Your description is ${descLen} characters. Aim for 110 to 160 characters so Google does not truncate it in search listings.`,
        priority: "medium",
        impact: "+2 SEO",
        difficulty: "easy",
        confidence: 95,
      });
    }
  }
  metaScore = Math.max(0, metaScore);

  // 4. Headings
  let headingsScore = 100;
  const headingsIssues: string[] = [];
  const h1s = mainPage.headings.filter((h) => h.level === 1);
  if (h1s.length === 0) {
    headingsScore -= 50;
    headingsIssues.push("Missing <h1> heading.");
    issues.push({
      id: uuidv4(),
      audit_id: auditId,
      category: "seo",
      title: "Missing <h1> Tag",
      description: "An <h1> tag serves as the main heading of a page and is important for search bots. Ensure there is one clear <h1> tag on the page.",
      priority: "critical",
      impact: "+10 SEO",
      difficulty: "easy",
      confidence: 100,
    });
  } else if (h1s.length > 1) {
    headingsScore -= 20;
    headingsIssues.push(`Multiple <h1> headings found (${h1s.length}).`);
    issues.push({
      id: uuidv4(),
      audit_id: auditId,
      category: "seo",
      title: "Multiple <h1> Tags",
      description: "Having multiple H1 tags can dilute page focus. Use a single main H1 and nest H2s and H3s underneath it.",
      priority: "medium",
      impact: "+3 SEO",
      difficulty: "medium",
      confidence: 90,
    });
  }
  
  // Check heading hierarchy
  let hierarchyBroken = false;
  for (let i = 0; i < mainPage.headings.length - 1; i++) {
    const cur = mainPage.headings[i].level;
    const next = mainPage.headings[i + 1].level;
    if (next > cur + 1) {
      hierarchyBroken = true;
      break;
    }
  }
  if (hierarchyBroken) {
    headingsScore -= 15;
    headingsIssues.push("Heading nesting hierarchy is skipped (e.g. <h1> followed by <h3>).");
  }
  headingsScore = Math.max(0, headingsScore);

  // 5. Image Alt texts
  let imagesScore = 100;
  const imagesIssues: string[] = [];
  const totalImages = mainPage.images.length;
  const imagesWithoutAlt = mainPage.images.filter((img) => !img.hasAlt).length;
  if (totalImages > 0 && imagesWithoutAlt > 0) {
    const ratio = imagesWithoutAlt / totalImages;
    imagesScore -= Math.round(ratio * 80);
    imagesIssues.push(`${imagesWithoutAlt} out of ${totalImages} images do not have an alt attribute.`);
    issues.push({
      id: uuidv4(),
      audit_id: auditId,
      category: "seo",
      title: "Images Missing Alt Text",
      description: `${imagesWithoutAlt} out of ${totalImages} image elements lack alternative text. Add descriptive alt text to improve image search ranking and accessibility.`,
      priority: "medium",
      impact: "+5 SEO",
      difficulty: "easy",
      confidence: 95,
    });
  }
  imagesScore = Math.max(0, imagesScore);

  // 6. Links structure
  let linksScore = 100;
  const linksIssues: string[] = [];
  const totalInternal = mainPage.internalLinks.length;
  if (totalInternal === 0) {
    linksScore -= 40;
    linksIssues.push("No internal links found on page.");
    issues.push({
      id: uuidv4(),
      audit_id: auditId,
      category: "seo",
      title: "No Internal Links",
      description: "Internal linking is critical for search spiders to discover subpages and pass page juice. Add navigation or footer internal links.",
      priority: "high",
      impact: "+7 SEO",
      difficulty: "easy",
      confidence: 95,
    });
  }
  linksScore = Math.max(0, linksScore);

  // 7. Canonical Tag
  let canonicalsScore = 100;
  const canonicalsIssues: string[] = [];
  if (!mainPage.canonical) {
    canonicalsScore -= 50;
    canonicalsIssues.push("Missing canonical link tag.");
    issues.push({
      id: uuidv4(),
      audit_id: auditId,
      category: "seo",
      title: "Missing Canonical Tag",
      description: "Canonical tags prevent duplicate content issues by telling search engines which version of a page is official. Add a canonical link element.",
      priority: "high",
      impact: "+6 SEO",
      difficulty: "easy",
      confidence: 95,
    });
  }
  canonicalsScore = Math.max(0, canonicalsScore);

  // 8. Open Graph (OG) Tags
  let ogScore = 100;
  const ogIssues: string[] = [];
  const requiredOg = ["og:title", "og:description", "og:image", "og:url"];
  const missingOg = requiredOg.filter((tag) => !mainPage.ogTags[tag]);
  if (missingOg.length > 0) {
    ogScore -= missingOg.length * 25;
    ogIssues.push(`Missing Open Graph tags: ${missingOg.join(", ")}`);
    issues.push({
      id: uuidv4(),
      audit_id: auditId,
      category: "seo",
      title: "Missing Open Graph Tags",
      description: `Your pages lack important Open Graph metadata tags (${missingOg.join(", ")}). Add these to control how links display when shared on social media or messaging platforms.`,
      priority: "medium",
      impact: "+2 SEO (Social sharing)",
      difficulty: "easy",
      confidence: 90,
    });
  }
  ogScore = Math.max(0, ogScore);

  // 9. Twitter Cards
  let twitterScore = 100;
  const twitterIssues: string[] = [];
  const requiredTwitter = ["twitter:card", "twitter:title", "twitter:description", "twitter:image"];
  const missingTwitter = requiredTwitter.filter((tag) => !mainPage.twitterTags[tag]);
  if (missingTwitter.length > 0) {
    twitterScore -= missingTwitter.length * 25;
    twitterIssues.push(`Missing Twitter Card tags: ${missingTwitter.join(", ")}`);
  }
  twitterScore = Math.max(0, twitterScore);

  // Calculate overall SEO Score
  const weights = {
    robots: 0.05,
    sitemap: 0.1,
    meta: 0.25,
    headings: 0.15,
    images: 0.1,
    links: 0.1,
    canonical: 0.1,
    og: 0.075,
    twitter: 0.075,
  };

  const finalScore = Math.round(
    (robotsExists ? 100 : 0) * weights.robots +
    (sitemapExists ? 100 : 0) * weights.sitemap +
    metaScore * weights.meta +
    headingsScore * weights.headings +
    imagesScore * weights.images +
    linksScore * weights.links +
    canonicalsScore * weights.canonical +
    ogScore * weights.og +
    twitterScore * weights.twitter
  );

  return {
    score: Math.min(100, Math.max(0, finalScore)),
    issues,
    details: {
      robotsTxt: { exists: robotsExists, issues: robotsIssues },
      sitemap: { exists: sitemapExists, urls: sitemapUrlCount, issues: sitemapIssues },
      metaTags: { score: metaScore, issues: metaIssues },
      headings: { score: headingsScore, issues: headingsIssues },
      images: { score: imagesScore, issues: imagesIssues },
      links: { score: linksScore, issues: linksIssues },
      canonicals: { score: canonicalsScore, issues: canonicalsIssues },
      ogTags: { score: ogScore, issues: ogIssues },
      twitterCards: { score: twitterScore, issues: twitterIssues },
    },
  };
}
