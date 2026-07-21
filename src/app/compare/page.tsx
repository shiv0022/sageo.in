import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ArrowRight, Scale, Target } from "lucide-react";
import { BASE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "SEO & AI Search Tool Comparisons | Evaluation Hub",
  description: "Compare standard SEO, Answer Engine Optimization (AEO), and Generative Engine Optimization (GEO) tools. Read factual feature-based breakdowns.",
  alternates: {
    canonical: `${BASE_URL}/compare`,
  },
  openGraph: {
    title: "SEO & AI Search Tool Comparisons | Evaluation Hub",
    description: "Compare standard SEO, Answer Engine Optimization (AEO), and Generative Engine Optimization (GEO) tools. Read factual feature-based breakdowns.",
    url: `${BASE_URL}/compare`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO & AI Search Tool Comparisons | Evaluation Hub",
    description: "Compare standard SEO, Answer Engine Optimization (AEO), and Generative Engine Optimization (GEO) tools. Read factual feature-based breakdowns.",
  }
};

const items = [
  {
    slug: "seo-vs-aeo-vs-geo",
    title: "SEO vs AEO vs GEO Comparison",
    desc: "A structural breakdown comparing standard search ranking parameters against answer extraction ready and Generative AI visibility optimization mechanisms.",
    target: "Webmasters and Content Strategy teams",
    icon: Scale
  },
  {
    slug: "our-platform-vs-competitors",
    title: "Feature-Based Competitor Table",
    desc: "A factual, line-by-line feature comparison highlighting supported audit rules, and planned roadmap enhancements against traditional industry tools.",
    target: "Enterprise Developers and SEO Consultants",
    icon: Target
  }
];

export default function CompareHubPage() {
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "AI Search Intelligence Comparison Hub",
    "description": "Factual, feature-based evaluations comparing traditional indexing models against AI citation readiness systems.",
    "url": `${BASE_URL}/compare`,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": items.map((item, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "url": `${BASE_URL}/compare/${item.slug}`,
        "name": item.title
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
        <Breadcrumbs items={[{ label: "Comparison Hub" }]} />

        {/* Hub Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 font-sans tracking-tight">
            Factual Platform comparisons
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed font-sans max-w-3xl">
            Read objective, feature-based breakdowns mapping the capabilities of SEO, AEO, and GEO optimization frameworks, and review how our platform stacks against alternatives.
          </p>
        </div>

        {/* Categories List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.slug}
                className="group p-6 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 premium-hover flex flex-col justify-between min-h-[220px]"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-gray-100 transition-colors">
                    <Icon className="w-5 h-5 text-gray-700" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-950 mb-2 group-hover:text-purple-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-sans mb-4">
                    {item.desc}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <span className="text-[10px] text-gray-400 font-semibold">{item.target}</span>
                  <Link
                    href={`/compare/${item.slug}`}
                    className="text-[10px] text-purple-600 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    View Comparison
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Disclaimer section */}
        <div className="p-5 rounded-xl border border-gray-100 bg-gray-50/50 space-y-2 text-xs text-gray-500 font-sans leading-relaxed">
          <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[10px]">Evaluation Guidelines</h4>
          <p>
            All comparisons displayed on these subpages are constructed using factual specifications. We explicitly distinguish active audit capabilities from our planned developmental milestones. We do not claim categorical superiority, but instead provide objective details to help teams select appropriate auditing setups.
          </p>
        </div>

        {/* Core CTA */}
        <div className="bg-gradient-to-r from-purple-900 to-purple-850 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-lg font-bold">Ready to benchmark your website?</h3>
            <p className="text-xs text-purple-200">Run an instant audit to verify technical, search, and voice schema scores.</p>
          </div>
          <Link
            href="/analyze"
            className="bg-white text-purple-900 px-6 py-3 rounded-xl text-xs font-bold hover:bg-purple-50 transition-colors flex items-center gap-2 cursor-pointer flex-shrink-0"
          >
            Start Free Comparison Audit
            <ArrowRight className="w-4 h-4 text-purple-900" />
          </Link>
        </div>
      </main>
    </div>
  );
}
