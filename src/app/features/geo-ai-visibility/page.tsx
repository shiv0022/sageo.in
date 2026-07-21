import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { GeoPreviewWidget } from "@/components/features/geo-preview-widget";
import { Sparkles, HelpCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { BASE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Generative Engine Optimization Software | Optimize AI Citations",
  description: "Boost AI visibility with generative engine optimization software. Scan AI crawler blocks (GPTBot, ClaudeBot), deploy llms.txt, and build entity authority.",
  alternates: {
    canonical: `${BASE_URL}/features/geo-ai-visibility`,
  },
  openGraph: {
    title: "Generative Engine Optimization Software | Optimize AI Citations",
    description: "Boost AI visibility with generative engine optimization software. Scan AI crawler blocks (GPTBot, ClaudeBot), deploy llms.txt, and build entity authority.",
    url: `${BASE_URL}/features/geo-ai-visibility`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Generative Engine Optimization Software | Optimize AI Citations",
    description: "Boost AI visibility with generative engine optimization software. Scan AI crawler blocks (GPTBot, ClaudeBot), deploy llms.txt, and build entity authority.",
  }
};

const faqs = [
  {
    q: "What is Generative Engine Optimization (GEO)?",
    a: "GEO is the process of optimizing websites so that generative artificial intelligence systems (like Gemini, ChatGPT Search, and Claude) can find, cite, and reference your business as an authoritative source of info."
  },
  {
    q: "Should I block GPTBot or ClaudeBot in robots.txt?",
    a: "If you want your website and services to be suggested by ChatGPT or Claude as citations or options, you must allow their scrapers access to crawl your site. Blocking them completely removes your site from AI responses."
  },
  {
    q: "What is the purpose of llms.txt?",
    a: "A llms.txt file is a markdown file placed at the root of your domain. It provides clean, token-efficient, and easy-to-digest structural info about your site specifically designed for LLMs to read quickly."
  }
];

export default function GeoAiVisibilityPage() {
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
        <Breadcrumbs items={[{ label: "Features", href: "/features/geo-ai-visibility" }, { label: "GEO & AI Visibility" }]} />

        {/* Feature Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-100 bg-purple-50 text-purple-600 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            Core Feature Pillar
          </div>
          <h1 className="text-4xl font-bold text-gray-900 font-sans tracking-tight">
            Generative Engine Optimization (GEO) & AI Citations
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed font-sans max-w-3xl">
            Ensure your website&apos;s content, authority parameters, and entity metadata are ready for next-generation AI engines. Audit robot crawl permissions and build authority signals to secure direct citations.
          </p>
        </div>

        {/* Interactive Widget */}
        <div className="py-6">
          <GeoPreviewWidget />
        </div>

        {/* Feature Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 border-t border-gray-100 pt-8">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">GEO Audits Included</h3>
            <ul className="space-y-2 text-xs text-gray-600 font-sans">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> AI bot blocking checks (GPTBot, ClaudeBot, Applebot)</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> Presence and configuration of llms.txt / llms-full.txt</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> Entity level schema and E-E-A-T parameter checking</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> External reference citation validation</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Why GEO is the future of SEO</h3>
            <p className="text-xs text-gray-600 font-sans leading-relaxed">
              As users pivot from traditional search bars to interactive AI systems, getting recommended as an LLM source is the new frontier. Traditional keyword stuffing fails; modern visibility requires entity clarity and technical crawler access.
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
            <h3 className="text-lg font-bold">Ready to optimize your AI visibility index?</h3>
            <p className="text-xs text-purple-200">Run a free audit on your robots.txt, entity signals, and llms.txt parameters.</p>
          </div>
          <Link
            href="/analyze"
            className="bg-white text-purple-900 px-6 py-3 rounded-xl text-xs font-bold hover:bg-purple-50 transition-colors flex items-center gap-2 cursor-pointer flex-shrink-0"
          >
            Audit AI Visibility
            <ArrowRight className="w-4 h-4 text-purple-900" />
          </Link>
        </div>
      </main>
    </div>
  );
}
