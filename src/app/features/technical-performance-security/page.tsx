import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { TechPreviewWidget } from "@/components/features/tech-preview-widget";
import { Sparkles, HelpCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { BASE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Technical SEO Performance Audit | Speed & Security Scanner",
  description: "Audit Core Web Vitals (LCP, FCP, CLS) and website security headers with our technical SEO performance audit tool. Get actionable server-side fixes.",
  alternates: {
    canonical: `${BASE_URL}/features/technical-performance-security`,
  },
  openGraph: {
    title: "Technical SEO Performance Audit | Speed & Security Scanner",
    description: "Audit Core Web Vitals (LCP, FCP, CLS) and website security headers with our technical SEO performance audit tool. Get actionable server-side fixes.",
    url: `${BASE_URL}/features/technical-performance-security`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Technical SEO Performance Audit | Speed & Security Scanner",
    description: "Audit Core Web Vitals (LCP, FCP, CLS) and website security headers with our technical SEO performance audit tool. Get actionable server-side fixes.",
  }
};

const faqs = [
  {
    q: "Why are Core Web Vitals important for SEO?",
    a: "Core Web Vitals measure user experience speed, visual stability, and interaction responsiveness. Google uses these metrics (especially LCP, FID/INP, and CLS) as a ranking signal, making speed directly linked to organic performance."
  },
  {
    q: "What is Largest Contentful Paint (LCP)?",
    a: "LCP measures the time it takes for the main content of a page to render. A good LCP is 2.5 seconds or faster. Higher times prompt Google search warnings."
  },
  {
    q: "Why are security headers like CSP and HSTS crawled?",
    a: "Search engines prioritize secure, trusted web destinations. Having correct Content Security Policy (CSP) and HTTP Strict Transport Security (HSTS) headers protects visitors from scripting injections and reinforces search trust signals."
  }
];

export default function TechnicalPerformanceSecurityPage() {
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
        <Breadcrumbs items={[{ label: "Features", href: "/features/technical-performance-security" }, { label: "Technical Performance" }]} />

        {/* Feature Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-100 bg-purple-50 text-purple-600 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            Core Feature Pillar
          </div>
          <h1 className="text-4xl font-bold text-gray-900 font-sans tracking-tight">
            Technical Performance, Security, & Core Web Vitals
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed font-sans max-w-3xl">
            Scan loading speed metrics, render times, script efficiency, SSL validity, and HTTPS security headers. Receive structured diagnostics to keep your page experience fast and secure.
          </p>
        </div>

        {/* Interactive Widget */}
        <div className="py-6">
          <TechPreviewWidget />
        </div>

        {/* Feature Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 border-t border-gray-100 pt-8">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Technical Checks Included</h3>
            <ul className="space-y-2 text-xs text-gray-600 font-sans">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> Core Web Vitals speed audit (LCP, FCP, CLS, TTFB)</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> Security headers presence scanner (CSP, HSTS, X-Frame)</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> SSL certificate and HTTPS redirection checks</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> Canonical tag matches and sitemap linking validity</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Automated Fix Center Suggestions</h3>
            <p className="text-xs text-gray-600 font-sans leading-relaxed">
              Whenever speed degradation is found, our rules engine identifies the root cause and suggests specific code updates (e.g. Next.js image optimization settings, server header snippets, or script deferment options).
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
            <h3 className="text-lg font-bold">Ready to audit your technical performance?</h3>
            <p className="text-xs text-purple-200">Run a free Core Web Vitals and security header scan instantly.</p>
          </div>
          <Link
            href="/analyze"
            className="bg-white text-purple-900 px-6 py-3 rounded-xl text-xs font-bold hover:bg-purple-50 transition-colors flex items-center gap-2 cursor-pointer flex-shrink-0"
          >
            Audit Site Speed
            <ArrowRight className="w-4 h-4 text-purple-900" />
          </Link>
        </div>
      </main>
    </div>
  );
}
