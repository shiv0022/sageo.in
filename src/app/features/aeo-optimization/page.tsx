import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { AeoPreviewWidget } from "@/components/features/aeo-preview-widget";
import { Sparkles, HelpCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { BASE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Answer Engine Optimization Tool | AEO Schema & Voice Audit",
  description: "Deploy answer engine optimization with our AEO tool. Audit voice search readiness, generate FAQ schemas, and optimize speakable content structures.",
  alternates: {
    canonical: `${BASE_URL}/features/aeo-optimization`,
  },
  openGraph: {
    title: "Answer Engine Optimization Tool | AEO Schema & Voice Audit",
    description: "Deploy answer engine optimization with our AEO tool. Audit voice search readiness, generate FAQ schemas, and optimize speakable content structures.",
    url: `${BASE_URL}/features/aeo-optimization`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Answer Engine Optimization Tool | AEO Schema & Voice Audit",
    description: "Deploy answer engine optimization with our AEO tool. Audit voice search readiness, generate FAQ schemas, and optimize speakable content structures.",
  }
};

const faqs = [
  {
    q: "What is Answer Engine Optimization (AEO)?",
    a: "Answer Engine Optimization (AEO) is the practice of optimizing content to be returned by conversational query interfaces and answer systems, such as Alexa, Siri, Google Assistant, and LLM chat interfaces."
  },
  {
    q: "How does FAQ schema help with AEO?",
    a: "FAQ schemas provide questions and answers in a highly structured JSON-LD format. This allows scrapers to easily extract accurate data points and display them in rich results or quote them in search snippets."
  },
  {
    q: "What is speakable schema markup?",
    a: "Speakable schema markup allows publishers to identify portions of a webpage that are especially suitable for audio text-to-speech rendering, making it easier for voice engines to speak the content out loud."
  }
];

export default function AeoOptimizationPage() {
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
        <Breadcrumbs items={[{ label: "Features", href: "/features/aeo-optimization" }, { label: "AEO Optimization" }]} />

        {/* Feature Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-100 bg-purple-50 text-purple-600 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            Core Feature Pillar
          </div>
          <h1 className="text-4xl font-bold text-gray-900 font-sans tracking-tight">
            Answer Engine Optimization & Voice Readiness
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed font-sans max-w-3xl">
            Optimize your site structure to answer specific user questions. Verify voice search compliance, generate speakable schema blocks, and check if search engine assistants can read your pages out loud.
          </p>
        </div>

        {/* Interactive Widget */}
        <div className="py-6">
          <AeoPreviewWidget />
        </div>

        {/* Feature Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 border-t border-gray-100 pt-8">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">AEO Diagnostics Included</h3>
            <ul className="space-y-2 text-xs text-gray-600 font-sans">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> FAQ structured schema checking</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> Speakable section metadata configuration</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> Voice narration formatting validation</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> Bulleted and numbered lists outline audit</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Why conversational structure matters</h3>
            <p className="text-xs text-gray-600 font-sans leading-relaxed">
              Modern search engines return paragraphs directly in featured snippets. Having concise, direct definitions and structures increases the chance of your site being featured at the very top of search outputs.
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
            <h3 className="text-lg font-bold">Ready to analyze your voice search readiness?</h3>
            <p className="text-xs text-purple-200">Run a free audit on your FAQ structured schemas and list elements.</p>
          </div>
          <Link
            href="/analyze"
            className="bg-white text-purple-900 px-6 py-3 rounded-xl text-xs font-bold hover:bg-purple-50 transition-colors flex items-center gap-2 cursor-pointer flex-shrink-0"
          >
            Check AEO Schema
            <ArrowRight className="w-4 h-4 text-purple-900" />
          </Link>
        </div>
      </main>
    </div>
  );
}
