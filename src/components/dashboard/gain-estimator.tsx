"use client";

import { Sparkles, TrendingUp, Search, Bot } from "lucide-react";
import type { IAuditDocument } from "@/types/domain";

interface GainEstimatorProps {
  auditDoc: IAuditDocument;
}

export function GainEstimator({ auditDoc }: GainEstimatorProps) {
  if (!auditDoc) return null;

  const seoCurrent = auditDoc.scores.seo;
  const aeoCurrent = auditDoc.scores.aeo;
  const geoCurrent = auditDoc.scores.geo;
  const accessCurrent = auditDoc.scores.access;

  // Calculate potential gains based on current score deficiencies
  const seoGain = 100 - seoCurrent;
  const aiGain = 100 - Math.round((aeoCurrent + geoCurrent) / 2);
  const googleGain = 100 - Math.round((seoCurrent + accessCurrent) / 2);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 premium-shadow space-y-6">
      <div className="flex items-center justify-between border-b border-gray-50 pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Visibility Gain Estimations
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Projected search and LLM indexing improvements upon implementing fixes.</p>
        </div>
        <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full text-[10px] font-semibold text-gray-500 border border-gray-100">
          <Sparkles className="w-2.5 h-2.5 text-yellow-500" />
          Suggested Gains
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SEO Gain */}
        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-gray-700">Estimated SEO Gain</span>
            </div>
            <span className="text-xs font-bold text-green-600">+{seoGain}% Potential</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-gray-400">
              <span>Current Score: {seoCurrent}</span>
              <span>Target: 100</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
              <div className="bg-gray-300 h-full" style={{ width: `${seoCurrent}%` }} />
              <div className="bg-green-500 h-full animate-pulse-subtle" style={{ width: `${seoGain}%` }} />
            </div>
          </div>
          <p className="text-[10px] text-gray-500 leading-normal">
            Calculated from page-level title tags, meta descriptions, alt texts, and heading optimizations.
          </p>
        </div>

        {/* AI Visibility Gain */}
        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-gray-700">Estimated AI Visibility</span>
            </div>
            <span className="text-xs font-bold text-purple-600">+{aiGain}% Potential</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-gray-400">
              <span>Current: {Math.round((aeoCurrent + geoCurrent) / 2)}</span>
              <span>Target: 100</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
              <div className="bg-gray-300 h-full" style={{ width: `${Math.round((aeoCurrent + geoCurrent) / 2)}%` }} />
              <div className="bg-purple-500 h-full animate-pulse-subtle" style={{ width: `${aiGain}%` }} />
            </div>
          </div>
          <p className="text-[10px] text-gray-500 leading-normal">
            Projected visibility in ChatGPT Search & Gemini citations upon unblocking scrapers and schema additions.
          </p>
        </div>

        {/* Google Visibility Gain */}
        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Search className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-gray-700">Estimated Google Vis.</span>
            </div>
            <span className="text-xs font-bold text-blue-600">+{googleGain}% Potential</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-gray-400">
              <span>Current: {Math.round((seoCurrent + accessCurrent) / 2)}</span>
              <span>Target: 100</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
              <div className="bg-gray-300 h-full" style={{ width: `${Math.round((seoCurrent + accessCurrent) / 2)}%` }} />
              <div className="bg-blue-500 h-full animate-pulse-subtle" style={{ width: `${googleGain}%` }} />
            </div>
          </div>
          <p className="text-[10px] text-gray-500 leading-normal">
            Estimated search index coverage improvement by resolving Robots.txt indexing conflicts and soft 404s.
          </p>
        </div>
      </div>
    </div>
  );
}
