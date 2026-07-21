import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ArrowRight, HelpCircle, Sparkles, CheckCircle2, List } from "lucide-react";
import { BASE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "What is Generative Engine Optimization (GEO)? | AI SEO Guide",
  description: "Discover what Generative Engine Optimization (GEO) is, how AI engines cite websites, and strategies to increase your visibility in ChatGPT and Gemini.",
  alternates: {
    canonical: `${BASE_URL}/learning/what-is-geo`,
  },
  openGraph: {
    title: "What is Generative Engine Optimization (GEO)? | AI SEO Guide",
    description: "Discover what Generative Engine Optimization (GEO) is, how AI engines cite websites, and strategies to increase your visibility in ChatGPT and Gemini.",
    url: `${BASE_URL}/learning/what-is-geo`,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "What is Generative Engine Optimization (GEO)? | AI SEO Guide",
    description: "Discover what Generative Engine Optimization (GEO) is, how AI engines cite websites, and strategies to increase your visibility in ChatGPT and Gemini.",
  }
};

const toc = [
  { id: "intro", label: "Introduction to GEO" },
  { id: "difference", label: "SEO vs AEO vs GEO" },
  { id: "citation-signals", label: "AI Citation Signals" },
  { id: "optimization", label: "GEO Optimization Tactics" },
  { id: "llms-txt", label: "The Role of llms.txt" },
  { id: "faq", label: "GEO FAQs" }
];

const faqs = [
  {
    q: "How do LLMs select websites to cite?",
    a: "Generative models search the web in real-time using retrieval-augmented generation (RAG). They prioritize sites with high entity authority, clean schemas, outbound academic references, and search relevance matching the user's intent."
  },
  {
    q: "Is keyword density useful for GEO?",
    a: "No. Key phrase stuffing is ignored or penalized by LLMs. Instead, write in an authoritative, evidence-backed tone, incorporating clear facts, statistics, and citations."
  }
];

export default function WhatIsGeoPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "What is Generative Engine Optimization (GEO)? | AI SEO Guide",
    "description": "Discover what Generative Engine Optimization (GEO) is, how AI engines cite websites, and strategies to increase your visibility in ChatGPT and Gemini.",
    "url": `${BASE_URL}/learning/what-is-geo`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${BASE_URL}/learning/what-is-geo`
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
        <Breadcrumbs items={[{ label: "Learning Center", href: "/learning" }, { label: "What is GEO" }]} />

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
              <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">GEO Guide</span>
              <h1 className="text-3xl font-extrabold text-gray-900 font-sans tracking-tight">
                What is Generative Engine Optimization (GEO)?
              </h1>
              <p className="text-xs text-gray-400">Published July 2026 • 7 min read</p>
            </div>

            {/* Sections */}
            <section id="intro" className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">Introduction to GEO</h2>
              <p className="text-xs text-gray-650 font-sans">
                Generative Engine Optimization (GEO) represents the newest shift in digital visibility. Large language models (LLMs) like GPT-4, Claude 3, and Gemini are replacing static index query match models with real-time text synthesizers.
              </p>
              <p className="text-xs text-gray-650 font-sans">
                GEO involves structuring content, metadata, and citation signals so that artificial intelligence search systems retrieve and cite your brand as an authoritative reference in their generated answers.
              </p>
            </section>

            <section id="difference" className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">SEO vs AEO vs GEO</h2>
              <p className="text-xs text-gray-650">
                While SEO targets search bots, and AEO focuses on smart speaker voice assistants:
              </p>
              <ul className="list-disc pl-5 text-xs text-gray-650 space-y-2">
                <li><strong>SEO:</strong> Focuses on keywords, links, meta descriptions, and search rankings.</li>
                <li><strong>AEO:</strong> Focuses on short, single-paragraph voice answers and FAQ schemas.</li>
                <li><strong>GEO:</strong> Focuses on citations, scientific facts, external validation, entity graphs, and unstructured readability.</li>
              </ul>
              <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-purple-950 font-sans leading-normal">
                  Read our full <Link href="/features/geo-ai-visibility" className="underline hover:text-purple-800">GEO Feature Page</Link> to see how ChatGPT Search displays citations and learn how our platform tests your domain against AI crawler block flags.
                </p>
              </div>
            </section>

            <section id="citation-signals" className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">AI Citation Signals</h2>
              <p className="text-xs text-gray-650">
                AI engines value credibility. Research demonstrates that generative engines prioritize citing content that features:
              </p>
              <ol className="list-decimal pl-5 text-xs text-gray-650 space-y-2">
                <li><strong>Authoritative Tone:</strong> Clear, confident assertions backed by professional evidence.</li>
                <li><strong>Outbound Sources:</strong> Link directly to scientific publications, government resources, or industry leaders.</li>
                <li><strong>E-E-A-T:</strong> Clear profiles mapping back to real author credentials and legal disclosures.</li>
              </ol>
            </section>

            <section id="optimization" className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">GEO Optimization Tactics</h2>
              <p className="text-xs text-gray-650 font-sans">
                Deploy these strategies to increase your citation index:
              </p>
              <ul className="space-y-2 text-xs text-gray-650 font-sans">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> Cite external evidence urls.</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> Provide statistics and verifiable historical facts.</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> Structure entities clearly using Schema.org schema types.</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> Ensure bots (like GPTBot and ClaudeBot) are not blocked in robots.txt.</li>
              </ul>
            </section>

            <section id="llms-txt" className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">The Role of llms.txt</h2>
              <p className="text-xs text-gray-650 font-sans">
                The `/llms.txt` file is the new sitemap. Serving a clean, markdown file detailing website structure and core APIs helps LLMs bypass raw HTML scraping, preserving token length and improving semantic indexing.
              </p>
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
                <h3 className="text-base font-bold">Audit your AI visibility score</h3>
                <p className="text-[11px] text-purple-200">Scan robots.txt, schema parameters, and citation signals instantly.</p>
              </div>
              <Link
                href="/analyze"
                className="bg-white text-purple-900 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-purple-50 transition-colors flex items-center gap-2 cursor-pointer flex-shrink-0"
              >
                Run AI Citations Scan
                <ArrowRight className="w-4 h-4 text-purple-900" />
              </Link>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
