import type { Metadata } from "next";
import { Suspense } from "react";
import { AnalyzeContent } from "@/components/analyze-content";
import { BASE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Free Website Intelligence Audit | Check SEO & AEO Scores",
  description: "Run a free website audit. Check your SEO, AEO, GEO, performance, and security score instantly. Identify AI scraper blocks and schema gaps.",
  alternates: {
    canonical: `${BASE_URL}/analyze`,
  },
  openGraph: {
    title: "Free Website Intelligence Audit | Check SEO & AEO Scores",
    description: "Run a free website audit. Check your SEO, AEO, GEO, performance, and security score instantly. Identify AI scraper blocks and schema gaps.",
    url: `${BASE_URL}/analyze`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Website Intelligence Audit | Check SEO & AEO Scores",
    description: "Run a free website audit. Check your SEO, AEO, GEO, performance, and security score instantly. Identify AI scraper blocks and schema gaps.",
  }
};

export default function AnalyzePage() {
  // SoftwareApplication Schema
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "AI Website Intelligence Auditor",
    "operatingSystem": "All",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <>
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />

      <Suspense
        fallback={
          <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading...</div>
          </div>
        }
      >
        <AnalyzeContent />
      </Suspense>
    </>
  );
}
