import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CompareTable, CompareRow } from "@/components/compare-table";
import { ArrowRight, HelpCircle, Activity } from "lucide-react";
import { BASE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Platform Alternatives: Feature-Based Comparison Table",
  description: "Compare our SEO, AEO, and GEO auditing features against traditional industry tools. Review factual capabilities and roadmap enhancements.",
  alternates: {
    canonical: `${BASE_URL}/compare/our-platform-vs-competitors`,
  },
  openGraph: {
    title: "Platform Alternatives: Feature-Based Comparison Table",
    description: "Compare our SEO, AEO, and GEO auditing features against traditional industry tools. Review factual capabilities and roadmap enhancements.",
    url: `${BASE_URL}/compare/our-platform-vs-competitors`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Platform Alternatives: Feature-Based Comparison Table",
    description: "Compare our SEO, AEO, and GEO auditing features against traditional industry tools. Review factual capabilities and roadmap enhancements.",
  }
};

const compareRows: CompareRow[] = [
  {
    feature: "Standard SEO Tag Checking",
    ourSupport: "yes",
    competitorSupport: "yes",
    description: "Auditing of title, meta description, and heading outline structures for search engine readiness."
  },
  {
    feature: "Core Web Vitals Integration",
    ourSupport: "yes",
    competitorSupport: "yes",
    description: "Retrieves LCP, FCP, CLS metrics using local Chrome-Launcher audits or PageSpeed API fallbacks."
  },
  {
    feature: "LLM Crawl robots.txt Audits",
    ourSupport: "yes",
    competitorSupport: "no",
    description: "Identifies whether AI agents (GPTBot, ClaudeBot, Applebot, etc.) are explicitly blocked."
  },
  {
    feature: "Speakable & FAQ JSON-LD Scans",
    ourSupport: "yes",
    competitorSupport: "no",
    description: "Analyzes JSON-LD schema objects for Voice Search readiness and speech configuration properties."
  },
  {
    feature: "Centralized Rules Engine (v1.0)",
    ourSupport: "yes",
    competitorSupport: "no",
    description: "Audits flat crawler findings against 40+ structured rules containing official references and documentation urls."
  },
  {
    feature: "Rule Website Applicability (v1.1)",
    ourSupport: "roadmap",
    competitorSupport: "no",
    description: "Planned feature to filter rule recommendations based on website intent (SaaS, eCommerce, Blogs)."
  }
];

const faqs = [
  {
    q: "Why do traditional tools lack AEO and GEO metrics?",
    a: "Traditional SEO tools were designed for standard keyword indexing models. Analyzing schema structures, robots.txt blocks for LLMs, and citation metrics requires custom rules engines and specific crawler architectures."
  },
  {
    q: "Are the comparison features verified?",
    a: "Yes. The specifications are based on publicly documented capabilities. We do not claim categorical superiority, as traditional tools offer extensive keyword databases not present in our auditing platform."
  }
];

export default function PlatformVsCompetitorsPage() {
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
        <Breadcrumbs items={[{ label: "Comparison Hub", href: "/compare" }, { label: "Alternatives" }]} />

        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-100 bg-purple-50 text-purple-600 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5" />
            Line-By-Line Feature Comparison
          </div>
          <h1 className="text-4xl font-bold text-gray-900 font-sans tracking-tight">
            Feature Comparison Matrix
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed font-sans max-w-3xl">
            Compare active crawl diagnostics, rules engine mappings, and roadmap implementations side-by-side with traditional industry benchmarks.
          </p>
        </div>

        {/* Reusable Compare Table */}
        <div className="py-4">
          <CompareTable
            title="Capability Checklist"
            ourName="Website Intelligence Platform"
            competitorName="Traditional SEO Tools"
            rows={compareRows}
          />
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
            <h3 className="text-lg font-bold">Ready to check your website&apos;s capabilities?</h3>
            <p className="text-xs text-purple-200">Run a free audit to evaluate technical, search, and AI citation scores.</p>
          </div>
          <Link
            href="/analyze"
            className="bg-white text-purple-900 px-6 py-3 rounded-xl text-xs font-bold hover:bg-purple-50 transition-colors flex items-center gap-2 cursor-pointer flex-shrink-0"
          >
            Compare Your Site
            <ArrowRight className="w-4 h-4 text-purple-900" />
          </Link>
        </div>
      </main>
    </div>
  );
}
