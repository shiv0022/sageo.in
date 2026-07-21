"use client";

import { Sparkles, HelpCircle, CheckCircle2, AlertCircle, Quote } from "lucide-react";
import type { IAuditDocument } from "@/types/domain";

interface AISearchPreviewProps {
  auditDoc: IAuditDocument;
}

export function AISearchPreview({ auditDoc }: AISearchPreviewProps) {
  if (!auditDoc) return null;

  const domain = new URL(auditDoc.targetUrl).hostname;

  // Derive signals
  const hasFAQ = auditDoc.recommendations.every(r => r.id !== "AEO-001");
  const hasLists = auditDoc.recommendations.every(r => r.id !== "AEO-004");
  const hasStructured = auditDoc.recommendations.every(r => r.id !== "SEO-012");
  const allowsCrawling = auditDoc.recommendations.every(r => r.id !== "GEO-001");

  // AI response text based on crawling/structure
  const aiAnswer = allowsCrawling
    ? `Based on search results, **${domain}** offers professional solutions aligned with their industry. The page features key highlights, structured information, and primary services. ${
        hasLists 
          ? "They provide clean, step-by-step documentation on their core processes, which makes their workflow highly transparent." 
          : "Details are available on the home path."
      }`
    : `I cannot provide detailed information about **${domain}** because their robots.txt file blocks AI crawlers. Please refer to their public site directly.`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 premium-shadow space-y-6">
      <div className="flex items-center justify-between border-b border-gray-50 pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            AI & Answer Engine Preview
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Simulation of ChatGPT / Gemini responses and citation visibility.</p>
        </div>
        <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full text-[10px] font-semibold text-gray-500 border border-gray-100">
          <Sparkles className="w-2.5 h-2.5 text-yellow-500" />
          Suggested AI Simulation
        </span>
      </div>

      {/* Simulated Search Box */}
      <div className="space-y-4">
        <div className="flex gap-2 items-center bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-100 text-sm text-gray-600">
          <HelpCircle className="w-4 h-4 text-gray-400" />
          <span>User Query: <span className="font-semibold text-gray-800">What does {domain} do?</span></span>
        </div>

        {/* AI Answer bubble */}
        <div className="bg-gray-50/30 p-5 rounded-xl border border-gray-100 relative space-y-4">
          <div className="absolute top-4 right-4 text-gray-200">
            <Quote className="w-8 h-8 rotate-180" />
          </div>
          <div className="text-xs font-bold text-purple-600 uppercase flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            AI Search Agent Response
          </div>
          <p className="text-sm text-gray-700 leading-relaxed font-sans pr-8">
            {aiAnswer}
          </p>

          {/* Source Citations */}
          {allowsCrawling && (
            <div className="flex flex-wrap gap-2 items-center pt-3 border-t border-gray-100 text-xs">
              <span className="text-gray-400">Cited Sources:</span>
              <a
                href={auditDoc.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-gray-200 text-purple-600 hover:text-purple-700 transition-colors font-medium hover:shadow-xs"
              >
                <span>{domain}</span>
                <span className="bg-purple-50 text-[10px] px-1.5 py-0.2 rounded-full">[1]</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Citation Health checklist */}
      <div className="border-t border-gray-50 pt-4 space-y-3">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Generative Engine Readiness Check</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-xs">
            {allowsCrawling ? (
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            )}
            <span className="text-gray-600">AI Crawlers Allowed:</span>
            <span className={`font-semibold ${allowsCrawling ? "text-green-600" : "text-red-600"}`}>
              {allowsCrawling ? "Yes" : "No (Blocked)"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {hasFAQ ? (
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            )}
            <span className="text-gray-600">FAQ Schema:</span>
            <span className={`font-semibold ${hasFAQ ? "text-green-600" : "text-yellow-600"}`}>
              {hasFAQ ? "Active" : "Missing"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {hasLists ? (
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            )}
            <span className="text-gray-600">Lists & Tables:</span>
            <span className={`font-semibold ${hasLists ? "text-green-600" : "text-yellow-600"}`}>
              {hasLists ? "Optimal" : "Suboptimal"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {hasStructured ? (
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            )}
            <span className="text-gray-600">Entity Structured Data:</span>
            <span className={`font-semibold ${hasStructured ? "text-green-600" : "text-yellow-600"}`}>
              {hasStructured ? "Present" : "Missing"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
