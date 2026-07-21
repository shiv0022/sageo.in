"use client";

import { useState } from "react";
import { Copy, Check, Sparkles, Code, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import type { IAuditDocument } from "@/types/domain";

interface FAQGeneratorProps {
  auditDoc: IAuditDocument;
}

export function FAQGenerator({ auditDoc }: FAQGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const hostname = new URL(auditDoc.targetUrl).hostname;
  const brand = hostname.split(".")[0];
  const capitalizedBrand = brand.charAt(0).toUpperCase() + brand.slice(1);
  const category = auditDoc.context.category || "Solutions";
  const industry = auditDoc.context.industry || "Business";

  // Create FAQ schema and Q&A template
  const faqs = [
    {
      q: `What services does ${capitalizedBrand} specialize in?`,
      a: `${capitalizedBrand} is a leading provider specializing in professional ${category} and custom systems tailored for optimal efficiency in the ${industry} sector.`
    },
    {
      q: `How does ${capitalizedBrand} add value to my business operations?`,
      a: `By implementing state-of-the-art ${category} protocols, we streamline workflows, optimize resource allocation, and enhance performance across all enterprise operations.`
    },
    {
      q: `Is ${capitalizedBrand} suitable for small and medium enterprises (SMEs)?`,
      a: `Yes, our modular ${category} solutions are designed to scale, making them highly effective for both startups and established enterprise businesses.`
    }
  ];

  // Convert to Schema Markup JSON
  const schemaJson = {
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

  const schemaString = `<script type="application/ld+json">\n${JSON.stringify(schemaJson, null, 2)}\n</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(schemaString);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 premium-shadow space-y-6">
      <div className="flex items-center justify-between border-b border-gray-50 pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Suggested FAQ & Schema Generator
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Structured Q&A patterns complete with pre-configured JSON-LD schema.</p>
        </div>
        <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full text-[10px] font-semibold text-gray-500 border border-gray-100">
          <Sparkles className="w-2.5 h-2.5 text-yellow-500" />
          Generated from Analysis
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Q&A Cards */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Interactive Preview</h4>
          {faqs.map((faq, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div
                key={idx}
                className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50/30 hover:bg-gray-50 transition-colors"
              >
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="w-full text-left p-4 flex items-center justify-between gap-3 text-sm font-semibold text-gray-900 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-500" />
                    {faq.q}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3 bg-white font-sans">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Code Snippet Box */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5" />
              JSON-LD Schema Code
            </h4>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 font-semibold cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Schema
                </>
              )}
            </button>
          </div>
          <div className="relative">
            <pre className="text-[10px] text-gray-700 bg-gray-950 p-4 rounded-xl font-mono overflow-x-auto max-h-[220px] text-white/90 leading-normal">
              {schemaString}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
