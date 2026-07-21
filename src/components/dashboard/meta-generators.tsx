"use client";

import { useState } from "react";
import { Copy, Check, Sparkles } from "lucide-react";
import type { IAuditDocument } from "@/types/domain";

interface MetaGeneratorsProps {
  auditDoc: IAuditDocument;
}

export function MetaGenerators({ auditDoc }: MetaGeneratorsProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const hostname = new URL(auditDoc.targetUrl).hostname;
  const brand = hostname.split(".")[0];
  const capitalizedBrand = brand.charAt(0).toUpperCase() + brand.slice(1);
  const category = auditDoc.context.category || "Solutions";
  const industry = auditDoc.context.industry || "Business";

  // Formulate high-quality recommendations based on context template
  const suggestedTitles = [
    `${capitalizedBrand} | Expert ${category} & Enterprise Services`,
    `Top-Rated ${category} Solutions — ${capitalizedBrand}`,
    `${capitalizedBrand} — Transforming ${industry} with Modern ${category}`
  ];

  const suggestedDescriptions = [
    `Discover premium ${category} services by ${capitalizedBrand}. Tailored solutions designed to accelerate growth and maximize efficiency in ${industry}. Get started today!`,
    `Partner with ${capitalizedBrand} for leading ${category} solutions. Learn how our custom systems power reliability and scalability across ${industry} industries.`,
    `Looking for trusted ${category} experts? ${capitalizedBrand} delivers innovative systems built to optimize performance and elevate your business operations.`
  ];

  const suggestedH1s = [
    `Innovative ${category} Designed for Sustainable Growth`,
    `Empowering Your Enterprise with Trusted ${category} Solutions`,
    `Scale Your Business Operations with ${capitalizedBrand}`
  ];

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 premium-shadow space-y-8">
      <div className="flex items-center justify-between border-b border-gray-50 pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Suggested Tag & Heading Generator
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Optimized recommendations based on website intent and business context.</p>
        </div>
        <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full text-[10px] font-semibold text-gray-500 border border-gray-100">
          <Sparkles className="w-2.5 h-2.5 text-yellow-500" />
          Generated from Analysis
        </span>
      </div>

      <div className="space-y-6">
        {/* Title Tag Generator */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Suggested Meta Titles</h4>
          <div className="space-y-2">
            {suggestedTitles.map((title, idx) => {
              const key = `title-${idx}`;
              return (
                <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 border border-gray-100 hover:bg-gray-50 transition-colors">
                  <span className="text-sm text-gray-800 font-medium font-sans pr-4">{title}</span>
                  <button
                    onClick={() => copyToClipboard(title, key)}
                    className="p-2 rounded-lg hover:bg-gray-200/50 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    {copiedKey === key ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Meta Description Generator */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Suggested Meta Descriptions</h4>
          <div className="space-y-2">
            {suggestedDescriptions.map((desc, idx) => {
              const key = `desc-${idx}`;
              return (
                <div key={key} className="flex items-start justify-between p-3 rounded-xl bg-gray-50/50 border border-gray-100 hover:bg-gray-50 transition-colors">
                  <span className="text-xs text-gray-600 font-sans leading-relaxed pr-4">{desc}</span>
                  <button
                    onClick={() => copyToClipboard(desc, key)}
                    className="p-2 rounded-lg hover:bg-gray-200/50 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer flex-shrink-0"
                  >
                    {copiedKey === key ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* H1 Heading Generator */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Suggested H1 Headings</h4>
          <div className="space-y-2">
            {suggestedH1s.map((h1, idx) => {
              const key = `h1-${idx}`;
              return (
                <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 border border-gray-100 hover:bg-gray-50 transition-colors">
                  <span className="text-sm text-gray-800 font-bold font-sans pr-4">{h1}</span>
                  <button
                    onClick={() => copyToClipboard(h1, key)}
                    className="p-2 rounded-lg hover:bg-gray-200/50 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    {copiedKey === key ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
