import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ArrowRight, HelpCircle, BookOpen, CheckCircle2, List } from "lucide-react";
import { BASE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "What is Answer Engine Optimization (AEO)? | Complete Guide",
  description: "Learn what Answer Engine Optimization (AEO) is, why it matters for voice search and LLM answers, and how to structure your site to get cited.",
  alternates: {
    canonical: `${BASE_URL}/learning/what-is-aeo`,
  },
  openGraph: {
    title: "What is Answer Engine Optimization (AEO)? | Complete Guide",
    description: "Learn what Answer Engine Optimization (AEO) is, why it matters for voice search and LLM answers, and how to structure your site to get cited.",
    url: `${BASE_URL}/learning/what-is-aeo`,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "What is Answer Engine Optimization (AEO)? | Complete Guide",
    description: "Learn what Answer Engine Optimization (AEO) is, why it matters for voice search and LLM answers, and how to structure your site to get cited.",
  }
};

const toc = [
  { id: "intro", label: "Introduction to AEO" },
  { id: "why-matters", label: "Why AEO Matters" },
  { id: "how-works", label: "How Answer Engines Work" },
  { id: "implementation", label: "Step-by-Step Implementation" },
  { id: "schema", label: "FAQ & Speakable Schemas" },
  { id: "faq", label: "AEO FAQs" }
];

const faqs = [
  {
    q: "How does AEO differ from traditional SEO?",
    a: "SEO optimizes websites for search engine ranking pages. AEO optimizes content to be digested and output directly by virtual assistant voice search or generative models, often bypassing click-through interactions entirely."
  },
  {
    q: "What is the optimal answer length for AEO?",
    a: "Keep conversational answers short and precise. Aim for paragraphs of 45-60 words that directly address the core query. Use clean list structures for step-by-step processes."
  }
];

export default function WhatIsAeoPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "What is Answer Engine Optimization (AEO)? | Complete Guide",
    "description": "Learn what Answer Engine Optimization (AEO) is, why it matters for voice search and LLM answers, and how to structure your site to get cited.",
    "url": `${BASE_URL}/learning/what-is-aeo`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${BASE_URL}/learning/what-is-aeo`
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
        <Breadcrumbs items={[{ label: "Learning Center", href: "/learning" }, { label: "What is AEO" }]} />

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
              <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">AEO Guide</span>
              <h1 className="text-3xl font-extrabold text-gray-900 font-sans tracking-tight">
                What is Answer Engine Optimization (AEO)?
              </h1>
              <p className="text-xs text-gray-400">Published July 2026 • 6 min read</p>
            </div>

            {/* Sections */}
            <section id="intro" className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">Introduction to AEO</h2>
              <p className="text-xs text-gray-650">
                Answer Engine Optimization (AEO) is the next evolution of search marketing. As users shift from querying directories to engaging with smart assistants (like Siri, Google Assistant, and Alexa) or AI chat clients (like ChatGPT), organic traffic is governed by citation readiness.
              </p>
              <p className="text-xs text-gray-650">
                Instead of returning a list of ten blue links, modern answer engines process natural queries and deliver a single, parsed textual response. If your website is not structured to serve these systems, you risk losing visibility entirely.
              </p>
            </section>

            <section id="why-matters" className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">Why AEO Matters</h2>
              <p className="text-xs text-gray-650 font-sans">
                Voice searches and AI prompts are inherently conversational. Rather than typing &ldquo;best SEO tool,&rdquo; a user asks: &ldquo;What is the best SEO tool that checks schema?&rdquo;
              </p>
              <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-purple-950 font-sans leading-normal">
                  Our dedicated <Link href="/features/aeo-optimization" className="underline hover:text-purple-800">AEO Optimization Feature Page</Link> highlights how to structure H2 headers and conversational list elements to help AI engines easily extract answers from your site.
                </p>
              </div>
            </section>

            <section id="how-works" className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">How Answer Engines Work</h2>
              <p className="text-xs text-gray-650">
                Answer engines utilize three core stages when serving a response:
              </p>
              <ol className="list-decimal pl-5 text-xs text-gray-650 space-y-2">
                <li><strong>Entity Parsing:</strong> Breaking down user prompts into semantic entities and identifying user intent.</li>
                <li><strong>Information Retrieval:</strong> Searching trusted sources (crawled data, knowledge graphs, schemas) for factual answers.</li>
                <li><strong>Response Generation:</strong> Synthesizing the final voice or text answer, citing the sources used.</li>
              </ol>
            </section>

            <section id="implementation" className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">Step-by-Step Implementation</h2>
              <p className="text-xs text-gray-650">
                To maximize your AEO performance, follow these guidelines:
              </p>
              <ul className="space-y-2 text-xs text-gray-650">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> Target long-tail conversational question keywords.</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> Format content using precise H2 headings mapping directly to user questions.</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> Follow headers immediately with a concise, factual 40-60 word paragraph answer.</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> Deploy schema markup to provide structured, machine-readable validation.</li>
              </ul>
            </section>

            <section id="schema" className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">FAQ & Speakable Schemas</h2>
              <p className="text-xs text-gray-650">
                Providing structured data is essential. Use `FAQPage` schema to map questions to answers, and `speakable` schema to tell voice assistants which paragraphs are optimized for TTS reading.
              </p>
              <pre className="text-[10px] bg-gray-950 p-4 rounded-xl font-mono text-white/90 overflow-x-auto leading-normal">
{`{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [".aeo-answer-summary"]
  }
}`}
              </pre>
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
                <h3 className="text-base font-bold">Verify your site&apos;s AEO compatibility</h3>
                <p className="text-[11px] text-purple-200">Run a free audit on your FAQ schemas and Speakable markup.</p>
              </div>
              <Link
                href="/analyze"
                className="bg-white text-purple-900 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-purple-50 transition-colors flex items-center gap-2 cursor-pointer flex-shrink-0"
              >
                Scan AEO Readiness
                <ArrowRight className="w-4 h-4 text-purple-900" />
              </Link>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
