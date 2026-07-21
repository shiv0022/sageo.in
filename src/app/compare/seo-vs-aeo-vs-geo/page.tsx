import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CompareTable, CompareRow } from "@/components/compare-table";
import { ArrowRight, HelpCircle, Activity } from "lucide-react";
import { BASE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "SEO vs AEO vs GEO: What is the Difference? | Factual Guide",
  description: "Learn the differences between Search Engine Optimization (SEO), Answer Engine Optimization (AEO), and Generative Engine Optimization (GEO). Feature comparison.",
  alternates: {
    canonical: `${BASE_URL}/compare/seo-vs-aeo-vs-geo`,
  },
  openGraph: {
    title: "SEO vs AEO vs GEO: What is the Difference? | Factual Guide",
    description: "Learn the differences between Search Engine Optimization (SEO), Answer Engine Optimization (AEO), and Generative Engine Optimization (GEO). Feature comparison.",
    url: `${BASE_URL}/compare/seo-vs-aeo-vs-geo`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO vs AEO vs GEO: What is the Difference? | Factual Guide",
    description: "Learn the differences between Search Engine Optimization (SEO), Answer Engine Optimization (AEO), and Generative Engine Optimization (GEO). Feature comparison.",
  }
};

const compareRows: CompareRow[] = [
  {
    feature: "Primary Target System",
    ourSupport: "yes",
    competitorSupport: "yes",
    description: "SEO targets standard index crawlers (Googlebot); AEO targets voice text-to-speech assistants; GEO targets large language models (LLMs) using RAG systems."
  },
  {
    feature: "Optimal Content Structure",
    ourSupport: "yes",
    competitorSupport: "yes",
    description: "SEO focuses on keyword groupings and headings; AEO targets short natural language Q&A blocks; GEO requires factual entity maps and outbound research citations."
  },
  {
    feature: "Core Schema Validation",
    ourSupport: "yes",
    competitorSupport: "no",
    description: "Our platform validates FAQPage and SpeakableSpecification schema properties in real-time, mapping them to the rules engine. Traditional tools focus primarily on standard Open Graph or metadata tags."
  },
  {
    feature: "AI Crawler robots.txt Scans",
    ourSupport: "yes",
    competitorSupport: "no",
    description: "Scans robots.txt configurations specifically for GPTBot, ClaudeBot, and Applebot crawl blocks. Essential for maintaining generative citations."
  },
  {
    feature: "LCP / Core Web Vitals Scans",
    ourSupport: "yes",
    competitorSupport: "yes",
    description: "Both platforms use Lighthouse simulations to capture Largest Contentful Paint, First Contentful Paint, and visual layout shifts."
  }
];

const faqs = [
  {
    q: "Can I optimize a single page for SEO, AEO, and GEO simultaneously?",
    a: "Yes. In fact, a modern optimization strategy must integrate all three: use technical SEO for index accessibility, write conversational AEO paragraphs to secure featured snippet voice targets, and cite authoritative sources for GEO visibility."
  },
  {
    q: "How does our platform evaluate GEO visibility?",
    a: "We scan entity markup structures, outbound citation link ratios, E-E-A-T credentials, and verify that LLM scrapers are not blocked by crawler restriction files."
  }
];

export default function SeoAeoGeoComparePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-12">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: "Comparison Hub", href: "/compare" }, { label: "SEO vs AEO vs GEO" }]} />

        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-100 bg-purple-50 text-purple-600 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5" />
            Theoretical Framework Comparison
          </div>
          <h1 className="text-4xl font-bold text-gray-900 font-sans tracking-tight">
            SEO vs AEO vs GEO: What is the Difference?
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed font-sans max-w-3xl">
            Understand how target systems, optimal content layouts, and required metadata properties differ across Search, Answer, and Generative Engine optimization.
          </p>
        </div>

        {/* Reusable Compare Table */}
        <div className="py-4">
          <CompareTable
            title="Comparison Matrix"
            ourName="Standard Optimization Framework"
            competitorName="Generative / Conversational Framework"
            rows={compareRows}
          />
        </div>

        {/* Detailed Breakdown Section */}
        <div className="space-y-4 font-sans text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-8">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Analysis Summary</h2>
          <p>
            Traditional search engines (SEO) rank pages based on popularity algorithms, query matching, and technical core vitals. Answer engines (AEO) require exact Q&A formatting to render results within mobile speech interfaces. Generative systems (GEO) utilize complex RAG pipelines to build direct text answers based on statistical relevance, placing supreme value on entity nodes, citations, and trust networks.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="border-t border-gray-100 pt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 font-sans">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50/30">
                <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  {faq.q}
                </h4>
                <p className="text-xs text-gray-650 mt-1.5 leading-relaxed pl-5 font-sans">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-purple-900 to-purple-850 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-lg font-bold">Ready to analyze your website for all three models?</h3>
            <p className="text-xs text-purple-200">Run a free unified SEO, AEO, and GEO scan instantly.</p>
          </div>
          <Link
            href="/analyze"
            className="bg-white text-purple-900 px-6 py-3 rounded-xl text-xs font-bold hover:bg-purple-50 transition-colors flex items-center gap-2 cursor-pointer flex-shrink-0"
          >
            Start Free Audit
            <ArrowRight className="w-4 h-4 text-purple-900" />
          </Link>
        </div>
      </main>
    </div>
  );
}
