import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Sparkles, BookOpen, ArrowRight, HelpCircle, Code } from "lucide-react";
import { BASE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Learning Academy | Master AI Search Optimization (AEO & GEO)",
  description: "A complete educational guide to AI Search Optimization. Learn about Answer Engine Optimization (AEO), Generative Engine Optimization (GEO), and schema markup.",
  alternates: {
    canonical: `${BASE_URL}/learning`,
  },
  openGraph: {
    title: "Learning Academy | Master AI Search Optimization (AEO & GEO)",
    description: "A complete educational guide to AI Search Optimization. Learn about Answer Engine Optimization (AEO), Generative Engine Optimization (GEO), and schema markup.",
    url: `${BASE_URL}/learning`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Learning Academy | Master AI Search Optimization (AEO & GEO)",
    description: "A complete educational guide to AI Search Optimization. Learn about Answer Engine Optimization (AEO), Generative Engine Optimization (GEO), and schema markup.",
  }
};

const guides = [
  {
    slug: "what-is-aeo",
    title: "What is Answer Engine Optimization (AEO)?",
    desc: "A beginner-to-advanced guide exploring how voice assistants and LLM search results process natural language questions, and how to format answers for maximum citations.",
    readTime: "6 min read",
    icon: BookOpen
  },
  {
    slug: "what-is-geo",
    title: "What is Generative Engine Optimization (GEO)?",
    desc: "Understand how generative search models (like ChatGPT Search and Google AI Overviews) reference websites, and learn entity optimization strategies to build topical authority.",
    readTime: "7 min read",
    icon: Sparkles
  },
  {
    slug: "structured-data-for-ai",
    title: "Schema Markup for AI Search: JSON-LD Guide",
    desc: "A technical walkthrough of deploying schema markup (FAQ, Organization, Product, Profile) to construct machine-readable context for AI crawlers.",
    readTime: "8 min read",
    icon: Code
  }
];

export default function LearningHubPage() {
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "AI Search Intelligence Learning Academy",
    "description": "Educational resource hub containing step-by-step guides on SEO, AEO, GEO, and JSON-LD schema markup architectures.",
    "url": `${BASE_URL}/learning`,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": guides.map((guide, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "url": `${BASE_URL}/learning/${guide.slug}`,
        "name": guide.title
      }))
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-12">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: "Learning Center" }]} />

        {/* Hub Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 font-sans tracking-tight">
            Learning Academy & AI SEO Guides
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed font-sans max-w-3xl">
            Welcome to the Academy. Standard search models are shifting towards conversational AI answers. Learn how to adapt your content structure, optimize schemas, and build visibility.
          </p>
        </div>

        {/* Articles List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {guides.map((guide) => {
            const Icon = guide.icon;
            return (
              <div
                key={guide.slug}
                className="group p-5 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 premium-hover flex flex-col justify-between min-h-[260px]"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-gray-100 transition-colors">
                    <Icon className="w-5 h-5 text-gray-700" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-950 mb-2 group-hover:text-purple-700 transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-4 font-sans">
                    {guide.desc}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                  <span className="text-[10px] text-gray-400 font-medium">{guide.readTime}</span>
                  <Link
                    href={`/learning/${guide.slug}`}
                    className="text-[10px] text-purple-600 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    Read Guide
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Preview Banner */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-150 space-y-4">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-purple-600" />
            Why optimize for LLM crawlers?
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed font-sans">
            AI search engines read natural language. If your site blocks these engines in robots.txt or fails to format answers clearly, it will not be cited as a source. Our guides provide copy-paste solutions and technical blueprints to make your site indexable.
          </p>
        </div>

        {/* Core CTA */}
        <div className="bg-gradient-to-r from-purple-900 to-purple-850 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-lg font-bold">Ready to analyze your website&apos;s current AI visibility?</h3>
            <p className="text-xs text-purple-200">Scan robots.txt crawl flags, schema validation, and citation readiness.</p>
          </div>
          <Link
            href="/analyze"
            className="bg-white text-purple-900 px-6 py-3 rounded-xl text-xs font-bold hover:bg-purple-50 transition-colors flex items-center gap-2 cursor-pointer flex-shrink-0"
          >
            Start Free Site Audit
            <ArrowRight className="w-4 h-4 text-purple-900" />
          </Link>
        </div>
      </main>
    </div>
  );
}
