"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, ArrowRight, ChevronRight, Target } from "lucide-react";

export function HomeHero() {
  const router = useRouter();
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [showCompetitor, setShowCompetitor] = useState(false);

  const handleAnalyze = () => {
    if (!websiteUrl.trim()) return;
    const params = new URLSearchParams({ url: websiteUrl.trim() });
    if (competitorUrl.trim()) {
      params.set("competitor", competitorUrl.trim());
    }
    router.push(`/analyze?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Main website URL input */}
      <div className="flex items-center gap-3 p-2 rounded-2xl border border-gray-200 bg-white premium-shadow-lg focus-within:border-gray-450 transition-colors">
        <div className="flex items-center gap-2 flex-1 pl-4">
          <Globe className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            type="url"
            placeholder="Enter website URL to analyze..."
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            className="w-full bg-transparent text-base outline-none placeholder:text-gray-400 py-3"
            id="website-url-input"
          />
        </div>
        <button
          onClick={handleAnalyze}
          disabled={!websiteUrl.trim()}
          className="bg-black text-white px-6 py-3.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0 cursor-pointer"
          id="analyze-button"
        >
          Analyze Website
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Competitor Toggle */}
      <div className="text-center">
        {!showCompetitor ? (
          <button
            onClick={() => setShowCompetitor(true)}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
            Add competitor URL for comparison
          </button>
        ) : (
          <div className="flex items-center gap-3 p-2 rounded-2xl border border-gray-150 bg-gray-50/50 animate-fade-in">
            <div className="flex items-center gap-2 flex-1 pl-4">
              <Target className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="url"
                placeholder="Competitor website URL (optional)"
                value={competitorUrl}
                onChange={(e) => setCompetitorUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400 py-2"
                id="competitor-url-input"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
