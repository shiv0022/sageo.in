import { IKBRule } from "@/types/knowledge-base";

export const schemaRules: IKBRule[] = [
  {
    ruleId: "SCH-001",
    ruleName: "Missing Organization Schema",
    category: "schema",
    description: "No Organization, Corporation, or LocalBusiness schema markup detected",
    whyItMatters: "Organization schema enables Google's Knowledge Panel and provides brand information directly in search results. It helps Google understand your brand identity, logo, social profiles, and contact information.",
    detectionKey: "schema.detectedSchemas.count",
    detectionCondition: { operator: "equals", value: 0 },
    recommendation: "Add Organization JSON-LD schema with your brand details.",
    implementationSteps: [
      "Create a JSON-LD block with @type: Organization.",
      "Include name, url, logo, description, and sameAs (social profiles).",
      "Add contactPoint for customer service information.",
      "Inject in the <head> or <body> of your homepage."
    ],
    codeSnippet: {
      code: '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "Your Brand Name",\n  "url": "https://yourdomain.com",\n  "logo": "https://yourdomain.com/logo.png",\n  "sameAs": [\n    "https://twitter.com/yourbrand",\n    "https://linkedin.com/company/yourbrand"\n  ]\n}\n</script>',
      language: "json"
    },
    aiPromptTemplate: "Generate Organization JSON-LD schema for my brand. Name: {brandName}, URL: {url}. Include logo, social profiles, and contact info.",
    expectedResult: "Eligibility for Google Knowledge Panel and enhanced brand presence in search results.",
    seoImpact: "High",
    googleVisibilityImpact: "High",
    aiVisibilityImpact: "High",
    accessibilityImpact: "None",
    securityImpact: "None",
    businessImpact: "High",
    difficulty: "Easy",
    estimatedFixTime: "10 minutes",
    confidenceLevel: 100,
    evidenceSource: "Schema.org — Organization",
    evidenceUrl: "https://schema.org/Organization",
    referenceType: "Schema.org",
    penaltyPoints: 15,
    priority: "high"
  },
  {
    ruleId: "SCH-002",
    ruleName: "Missing WebSite Schema",
    category: "schema",
    description: "No WebSite schema markup found on the page",
    whyItMatters: "WebSite schema enables the Sitelinks Searchbox feature in Google Search, allowing users to search within your site directly from the search results page.",
    detectionKey: "schema.intentRecommendation.hasRecommended",
    detectionCondition: { operator: "equals", value: false },
    recommendation: "Add WebSite JSON-LD schema with search action configuration.",
    implementationSteps: [
      "Create a JSON-LD block with @type: WebSite.",
      "Include site name and URL.",
      "Add potentialAction with SearchAction for site search.",
      "Inject on the homepage."
    ],
    codeSnippet: {
      code: '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "WebSite",\n  "name": "Your Brand",\n  "url": "https://yourdomain.com",\n  "potentialAction": {\n    "@type": "SearchAction",\n    "target": "https://yourdomain.com/search?q={search_term_string}",\n    "query-input": "required name=search_term_string"\n  }\n}\n</script>',
      language: "json"
    },
    aiPromptTemplate: "Generate WebSite JSON-LD schema with SearchAction for my site at {url}. The site search URL pattern is {searchPattern}.",
    expectedResult: "Google may display a Sitelinks Searchbox for your site in search results.",
    seoImpact: "Medium",
    googleVisibilityImpact: "High",
    aiVisibilityImpact: "Low",
    accessibilityImpact: "None",
    securityImpact: "None",
    businessImpact: "Medium",
    difficulty: "Easy",
    estimatedFixTime: "5 minutes",
    confidenceLevel: 100,
    evidenceSource: "Google Search Central — Sitelinks Searchbox",
    evidenceUrl: "https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox",
    referenceType: "Google Search Central",
    penaltyPoints: 8,
    priority: "medium"
  }
];
