import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SeoPreviewWidget } from "@/components/features/seo-preview-widget";
import { Sparkles, HelpCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { BASE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Semantic SEO Audit Tool | Optimize Title, Description & Headings",
  description: "Improve search visibility with our semantic SEO audit tool. Optimize titles, descriptions, heading structure, alt attributes, and internal links.",
  alternates: {
    canonical: `${BASE_URL}/features/seo-intelligence`,
  },
  openGraph: {
    title: "Semantic SEO Audit Tool | Optimize Title, Description & Headings",
    description: "Improve search visibility with our semantic SEO audit tool. Optimize titles, descriptions, heading structure, alt attributes, and internal links.",
    url: `${BASE_URL}/features/seo-intelligence`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Semantic SEO Audit Tool | Optimize Title, Description & Headings",
    description: "Improve search visibility with our semantic SEO audit tool. Optimize titles, descriptions, heading structure, alt attributes, and internal links.",
  }
};

const faqs = [
  {
    q: "Why is semantic SEO important for ranking?",
    a: "Semantic SEO focuses on matching user search intent and providing structured, topical context rather than just keyword density. Clean heading hierarchies, descriptive titles, and relevant internal links help search engines crawl and understand your pages accurately."
  },
  {
    q: "How does the Title and Description length affect CTR?",
    a: "Google truncates titles longer than 65 characters and descriptions longer than 160 characters in search results. Keeping tags within optimal lengths ensures the full message is visible, increasing click-through rates (CTR)."
  },
  {
    q: "What is a heading hierarchy skip?",
    a: "A heading hierarchy skip occurs when heading tags do not progress sequentially (e.g. H1 followed immediately by H3). Skipping levels breaks the document outline, confusing both web crawlers and screen reader accessibility tools."
  }
];

export default function SeoIntelligencePage() {
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
        <Breadcrumbs items={[{ label: "Features", href: "/features/seo-intelligence" }, { label: "Semantic SEO" }]} />

        {/* Feature Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-100 bg-purple-50 text-purple-600 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            Core Feature Pillar
          </div>
          <h1 className="text-4xl font-bold text-gray-900 font-sans tracking-tight">
            Semantic SEO Auditing & Technical Optimization
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed font-sans max-w-3xl">
            Evaluate heading layouts, title attributes, meta descriptions, image alternative tags, and keyword cannibalization problems. Structure your content to rank high on both desktop and mobile search engine result pages.
          </p>
        </div>

        {/* Interactive Widget */}
        <div className="py-6">
          <SeoPreviewWidget />
        </div>

        {/* Feature Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 border-t border-gray-100 pt-8">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Semantic Checks Included</h3>
            <ul className="space-y-2 text-xs text-gray-600 font-sans">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> Title tag character length validation</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> Meta description compelling CTA analysis</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> Heading outline validation (H1-H6)</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> Alt attribute check for all static images</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">How to resolve issues</h3>
            <p className="text-xs text-gray-600 font-sans leading-relaxed">
              Every identified violation in our dashboard is mapped directly to our centralized SEO Knowledge Base, sourcing evidence directly from Google Search Central. Use our customized AI Action Center code snippets to deploy immediate fixes.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="border-t border-gray-100 pt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50/30">
                <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  {faq.q}
                </h4>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed pl-5 font-sans">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-purple-900 to-purple-850 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-lg font-bold">Ready to analyze your website&apos;s semantic SEO?</h3>
            <p className="text-xs text-purple-200">Run a free metadata, heading, and image tag audit instantly.</p>
          </div>
          <Link
            href="/analyze"
            className="bg-white text-purple-900 px-6 py-3 rounded-xl text-xs font-bold hover:bg-purple-50 transition-colors flex items-center gap-2 cursor-pointer flex-shrink-0"
          >
            Analyze Page Headings
            <ArrowRight className="w-4 h-4 text-purple-900" />
          </Link>
        </div>
      </main>
    </div>
  );
}
