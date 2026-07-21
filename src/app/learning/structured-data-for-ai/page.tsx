import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ArrowRight, HelpCircle, Code, CheckCircle2, List } from "lucide-react";
import { BASE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Schema Markup for AI Search: How to Use JSON-LD for LLMs",
  description: "Learn how to deploy schema markup and structured JSON-LD data to optimize your website for AI search engines like ChatGPT and Google AI Overviews.",
  alternates: {
    canonical: `${BASE_URL}/learning/structured-data-for-ai`,
  },
  openGraph: {
    title: "Schema Markup for AI Search: How to Use JSON-LD for LLMs",
    description: "Learn how to deploy schema markup and structured JSON-LD data to optimize your website for AI search engines like ChatGPT and Google AI Overviews.",
    url: `${BASE_URL}/learning/structured-data-for-ai`,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Schema Markup for AI Search: How to Use JSON-LD for LLMs",
    description: "Learn how to deploy schema markup and structured JSON-LD data to optimize your website for AI search engines like ChatGPT and Google AI Overviews.",
  }
};

const toc = [
  { id: "intro", label: "Introduction to Schema" },
  { id: "importance", label: "Why Schema Matters for AI" },
  { id: "jsonld-vs-microdata", label: "JSON-LD vs Microdata" },
  { id: "core-types", label: "Core Schema Types for AI" },
  { id: "best-practices", label: "Implementation Best Practices" },
  { id: "faq", label: "Schema FAQs" }
];

const faqs = [
  {
    q: "Which schema formats do LLM search crawlers support?",
    a: "LLM crawlers support all standard schema formats, but they strongly prefer JSON-LD (JavaScript Object Notation for Linked Data) injected in the HTML header, as it is easiest to parse without tokenizing page layout styles."
  },
  {
    q: "Does invalid schema markup impact search visibility?",
    a: "Yes. Parser syntax errors in JSON-LD prevent search bots and AI scrapers from resolving entities, causing them to fall back to raw HTML pattern scraping and degrading citation scoring."
  }
];

export default function StructuredDataForAiPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Schema Markup for AI Search: How to Use JSON-LD for LLMs",
    "description": "Learn how to deploy schema markup and structured JSON-LD data to optimize your website for AI search engines like ChatGPT and Google AI Overviews.",
    "url": `${BASE_URL}/learning/structured-data-for-ai`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${BASE_URL}/learning/structured-data-for-ai`
    },
    "author": {
      "@type": "Organization",
      "name": "AI Search Intelligence Academy",
      "url": `${BASE_URL}/`
    },
    "publisher": {
      "@type": "Organization",
      "name": "AI Search Intelligence Platform",
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/favicon.ico`
      }
    },
    "datePublished": "2026-07-19T00:00:00Z"
  };

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: "Learning Center", href: "/learning" }, { label: "Schema for AI" }]} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
          {/* Table of Contents sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            <div className="sticky top-6 p-4 bg-gray-50 rounded-xl border border-gray-150 space-y-3">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <List className="w-4 h-4 text-purple-600" />
                On This Page
              </h3>
              <nav className="space-y-2 text-xs">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-gray-500 hover:text-purple-600 transition-colors font-medium"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Article Content */}
          <article className="lg:col-span-3 space-y-8 text-gray-800 font-sans leading-relaxed">
            {/* Header */}
            <div className="space-y-3 pb-6 border-b border-gray-100">
              <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Technical Guide</span>
              <h1 className="text-3xl font-extrabold text-gray-900 font-sans tracking-tight">
                Schema Markup for AI Search
              </h1>
              <p className="text-xs text-gray-400">Published July 2026 • 8 min read</p>
            </div>

            {/* Sections */}
            <section id="intro" className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">Introduction to Schema</h2>
              <p className="text-xs text-gray-650 font-sans">
                Schema markup is a semantic vocabulary of tags that you add to your HTML. It helps search engines understand the context of your data, transforming unstructured text into explicit relationship entities.
              </p>
            </section>

            <section id="importance" className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">Why Schema Matters for AI</h2>
              <p className="text-xs text-gray-650 font-sans">
                Generative AI models read websites to construct factual response databases. Since LLMs process information through tokens, reading a structured JSON-LD block is significantly faster and less ambiguous than scraping narrative text blocks.
              </p>
              <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 flex items-start gap-3">
                <Code className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-purple-950 font-sans leading-normal">
                  Our <Link href="/features/technical-performance-security" className="underline hover:text-purple-800">Technical SEO pillar page</Link> shows how schema validity checks prevent parser truncation, protecting indexability.
                </p>
              </div>
            </section>

            <section id="jsonld-vs-microdata" className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">JSON-LD vs Microdata</h2>
              <p className="text-xs text-gray-650 font-sans">
                While microdata nests structured markers directly inside HTML tag attributes (bloating code templates), JSON-LD compiles all parameters inside a single script tag. This separation of concern simplifies database queries and decreases script latency.
              </p>
            </section>

            <section id="core-types" className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">Core Schema Types for AI</h2>
              <p className="text-xs text-gray-650">
                To maximize search and citation performance, deploy these core schema structures:
              </p>
              <ul className="list-disc pl-5 text-xs text-gray-650 space-y-2">
                <li><strong>Organization:</strong> Declares company name, logo, official URLs, and social profiles.</li>
                <li><strong>WebSite:</strong> Identifies domain entity relationships and links to internal search capabilities.</li>
                <li><strong>FAQPage:</strong> Embeds key question-answer pairs directly for snippets.</li>
                <li><strong>ProfilePage:</strong> Connects author names to social entities, reinforcing E-E-A-T signals.</li>
              </ul>
            </section>

            <section id="best-practices" className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">Implementation Best Practices</h2>
              <p className="text-xs text-gray-650">
                Ensure perfect compliance during integration:
              </p>
              <ul className="space-y-2 text-xs text-gray-650">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> Serve JSON-LD on client and server routes.</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> Verify syntax using Google Rich Results validator.</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> Avoid linking phantom pages that return HTTP 404 codes.</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> Synchronize text present in HTML nodes with properties inside schemas.</li>
              </ul>
            </section>

            <section id="faq" className="space-y-4 border-t border-gray-100 pt-6">
              <h2 className="text-lg font-bold text-gray-900">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50/20">
                    <h4 className="text-xs font-bold text-gray-950 flex items-center gap-1.5">
                      <HelpCircle className="w-4.5 h-4.5 text-purple-600 flex-shrink-0" />
                      {faq.q}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed pl-5 font-sans">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Core CTA */}
            <div className="bg-gradient-to-r from-purple-900 to-purple-850 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm border-0">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-base font-bold">Audit your schema markup</h3>
                <p className="text-[11px] text-purple-200">Scan JSON-LD errors and rich snippet opportunities instantly.</p>
              </div>
              <Link
                href="/analyze"
                className="bg-white text-purple-900 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-purple-50 transition-colors flex items-center gap-2 cursor-pointer flex-shrink-0"
              >
                Scan Schema Markup
                <ArrowRight className="w-4 h-4 text-purple-900" />
              </Link>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
