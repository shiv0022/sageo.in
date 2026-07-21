import type { Metadata } from "next";
import Link from "next/link";
import { BASE_URL } from "@/lib/constants";
import { 
  Activity, 
  Search, 
  Bot, 
  Sparkles, 
  Shield, 
  FileText, 
  Globe, 
  ArrowRight,
  HelpCircle
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { HomeHero } from "@/components/home-hero";

export const metadata: Metadata = {
  title: "AI Search Optimization Platform | SEO, AEO, GEO Intelligence",
  description: "Audit and optimize your site for AI engines & Google. Scan technical SEO, FAQ schemas, AI crawler blocks, and LCP. Run a free instant audit today.",
  alternates: {
    canonical: `${BASE_URL}/`,
  },
  openGraph: {
    title: "AI Search Optimization Platform | SEO, AEO, GEO Intelligence",
    description: "Audit and optimize your site for AI engines & Google. Scan technical SEO, FAQ schemas, AI crawler blocks, and LCP. Run a free instant audit today.",
    url: `${BASE_URL}/`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Search Optimization Platform | SEO, AEO, GEO Intelligence",
    description: "Audit and optimize your site for AI engines & Google. Scan technical SEO, FAQ schemas, AI crawler blocks, and LCP. Run a free instant audit today.",
  }
};

const faqs = [
  {
    q: "What is AI search optimization?",
    a: "AI search optimization (including AEO and GEO) is the practice of structuring website content and metadata so that large language models (like ChatGPT Search, Gemini, and Claude) can crawl, index, parse, and cite your site as a trusted source."
  },
  {
    q: "How does the SEO, AEO, and GEO audit work?",
    a: "Our platform simulates search engine crawls. We verify technical tags, evaluate structured JSON-LD data, check if AI scrapers are blocked, test Core Web Vitals, and run competitor comparison audits to identify visibility opportunities."
  },
  {
    q: "Which search and AI engines do you support?",
    a: "We support auditing for traditional search engines (Google, Bing) and LLM-based answer engines (ChatGPT Search, Google AI Overviews, Claude, Gemini, Siri, and Alexa)."
  }
];

const features = [
  {
    icon: Search,
    title: "SEO Intelligence",
    href: "/features/seo-intelligence",
    description: "Deep analysis of meta tags, headings, links, crawlability and indexability with actionable recommendations."
  },
  {
    icon: Bot,
    title: "AEO Intelligence",
    href: "/features/aeo-optimization",
    description: "Answer Engine Optimization analysis for featured snippets, FAQ readiness and voice search optimization."
  },
  {
    icon: Sparkles,
    title: "GEO Intelligence",
    href: "/features/geo-ai-visibility",
    description: "Generative Engine Optimization with E-E-A-T signals, entity coverage and topical authority analysis."
  },
  {
    icon: Shield,
    title: "Access & Security",
    href: "/features/technical-performance-security",
    description: "Detect robots.txt blocking, noindex tags, AI crawler restrictions and server security headers."
  }
];

export default function HomePage() {
  // Schema markup data
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "AI Search Intelligence Platform",
    "url": `${BASE_URL}/`,
    "logo": `${BASE_URL}/favicon.ico`
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AI Search Intelligence Platform",
    "url": `${BASE_URL}/`,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${BASE_URL}/analyze?url={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Navbar />

      <main>
        {/* Hero Section */}
      <section className="px-6 pt-24 pb-20 max-w-7xl mx-auto text-center">
        {/* Badge */}
        <div className="animate-fade-in-up inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-gray-200 bg-gray-50/50">
          <Activity className="w-4 h-4 text-black animate-pulse" />
          <span className="text-sm font-medium text-gray-700">
            SEO · AEO · GEO Intelligence Platform
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="animate-fade-in-up text-5xl md:text-6xl lg:text-[72px] font-semibold leading-[1.1] tracking-tight mb-6 text-gray-900">
          Analyze Any Website.
          <br />
          <span className="bg-gradient-to-r from-black via-gray-600 to-gray-400 bg-clip-text text-transparent">
            Find Every AI & Search Opportunity.
          </span>
        </h1>

        {/* Subheading */}
        <p className="animate-fade-in-up text-lg md:text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
          Audit technical tags, content structure, schema markup, and competitor gaps to optimize visibility across Google Search Central and generative LLM answers.
        </p>

        {/* Input Hero Form */}
        <HomeHero />

        {/* Shimmer Stats */}
        <div className="animate-fade-in-up flex flex-wrap items-center justify-center gap-8 md:gap-16 mt-16 mb-24">
          {[
            { value: "50+", label: "Audit Verifications" },
            { value: "8", label: "Intelligence Categories" },
            { value: "10+", label: "Custom Blueprints" },
            { value: "Real-Time", label: "Crawler Simulation" }
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Pillar Feature Cards Grid */}
        <div className="animate-fade-in-up space-y-6 max-w-5xl mx-auto text-left">
          <h2 className="text-lg font-bold text-gray-400 uppercase tracking-wider text-center">Core Platform pillars</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="group p-5 rounded-2xl border border-gray-100 hover:border-gray-200 premium-hover cursor-pointer flex flex-col justify-between min-h-[200px]"
                >
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-gray-100 transition-colors">
                      <Icon className="w-5 h-5 text-gray-700" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-950 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-normal">
                      {feature.description}
                    </p>
                  </div>
                  <span className="text-[10px] text-purple-600 font-semibold mt-4 group-hover:underline flex items-center gap-1">
                    Explore Pillar
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20 bg-gray-50/50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-3">
            Site Optimization Workflow
          </h2>
          <p className="text-gray-500 text-center mb-16 max-w-lg mx-auto text-sm">
            Automated intelligence mapping your data to evidence-based search rules.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Paste URL",
                description: "Input website domain and specify target competitors.",
                icon: Globe,
              },
              {
                step: "02",
                title: "Deep Scan",
                description: "Playwright grabs HTML, parses schemas, and tests security.",
                icon: Search,
              },
              {
                step: "03",
                title: "Match Rules",
                description: "Centralized Knowledge Base checks findings against 40+ rules.",
                icon: Activity,
              },
              {
                step: "04",
                title: "AI Action Center",
                description: "Deploy code suggestions and custom AI fix prompts.",
                icon: FileText,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="text-center">
                  <div className="w-11 h-11 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mx-auto mb-4 premium-shadow">
                    <Icon className="w-5 h-5 text-gray-700" />
                  </div>
                  <div className="text-xs font-mono text-gray-400 mb-1">
                    {item.step}
                  </div>
                  <h3 className="text-sm font-semibold mb-2">{item.title}</h3>
                  <p className="text-xs text-gray-500 leading-normal max-w-[200px] mx-auto">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Structured Q&A FAQ Section */}
      <section className="px-6 py-20 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-gray-100 bg-gray-50/20">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  {faq.q}
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      </main>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-gray-100 bg-gray-50/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-bold">SEO-AEO-GEO Platform</span>
            </div>
            <p className="text-xs text-gray-400 leading-normal">
              Empowering publishers, SaaS platforms, and ecommerce sites to optimize visibility in standard search and LLM answer engines.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">Platform Features</h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li><Link href="/features/seo-intelligence" className="hover:underline">Semantic SEO Audit</Link></li>
              <li><Link href="/features/aeo-optimization" className="hover:underline">AEO & Voice Search</Link></li>
              <li><Link href="/features/geo-ai-visibility" className="hover:underline">GEO & AI Citations</Link></li>
              <li><Link href="/features/technical-performance-security" className="hover:underline">Technical Performance</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">Academy & Help</h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li><Link href="/learning" className="hover:underline">Learning Academy</Link></li>
              <li><Link href="/learning/what-is-aeo" className="hover:underline">What is AEO?</Link></li>
              <li><Link href="/learning/what-is-geo" className="hover:underline">What is GEO?</Link></li>
              <li><Link href="/learning/structured-data-for-ai" className="hover:underline">Schema Markup Guide</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">Comparisons</h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li><Link href="/compare" className="hover:underline">Comparisons Hub</Link></li>
              <li><Link href="/compare/seo-vs-aeo-vs-geo" className="hover:underline">SEO vs AEO vs GEO</Link></li>
              <li><Link href="/compare/our-platform-vs-competitors" className="hover:underline">Platform Alternatives</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-6 border-t border-gray-150 flex items-center justify-between text-xs text-gray-400">
          <span>&copy; {new Date().getFullYear()} Website Intelligence Platform. All rights reserved.</span>
          <span>Sitemap compliant • Topic Cluster Architecture v1.0</span>
        </div>
      </footer>
    </div>
  );
}
