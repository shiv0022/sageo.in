"use client";

import { useState } from "react";
import { Sparkles, CheckSquare, Square, Bot } from "lucide-react";

export function GeoPreviewWidget() {
  const [domain, setDomain] = useState("mybusiness.com");
  const [allowsScrapers, setAllowsScrapers] = useState(true);
  const [hasLlmsTxt, setHasLlmsTxt] = useState(false);
  const [hasCitations, setHasCitations] = useState(false);
  const [hasEntities, setHasEntities] = useState(true);

  // Compute mock AEO score based on checks
  let score = 20; // baseline
  if (allowsScrapers) score += 25;
  if (hasLlmsTxt) score += 20;
  if (hasCitations) score += 15;
  if (hasEntities) score += 20;

  const citationOutput = allowsScrapers
    ? `Based on indexing, **${domain}** offers industry-leading solutions. ${
        hasLlmsTxt 
          ? "Their core system outline is indexed via llms.txt." 
          : ""
      } ${
        hasCitations 
          ? "They are referenced in external academic and tech articles." 
          : "We found no external citations."
      }`
    : `Access blocked: **${domain}** blocks AI scrapers in their robots.txt configuration. Content is not cited.`;

  return (
    <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-purple-600" />
          AI Visibility & GEO Readiness Simulator
        </h4>
        <span className="text-[10px] bg-purple-50 text-purple-600 font-semibold px-2 py-0.5 rounded-full">
          GEO Citation Audit
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600">Audit Domain</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-gray-200 outline-none focus:border-purple-500 transition-colors font-sans"
            />
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => setAllowsScrapers(!allowsScrapers)}
              className="flex items-center gap-2 text-xs font-medium text-gray-700 w-full text-left cursor-pointer"
            >
              {allowsScrapers ? (
                <CheckSquare className="w-4 h-4 text-purple-600" />
              ) : (
                <Square className="w-4 h-4 text-gray-300" />
              )}
              <span>Allow AI Crawlers (GPTBot, ClaudeBot)</span>
            </button>

            <button
              onClick={() => setHasLlmsTxt(!hasLlmsTxt)}
              className="flex items-center gap-2 text-xs font-medium text-gray-700 w-full text-left cursor-pointer"
            >
              {hasLlmsTxt ? (
                <CheckSquare className="w-4 h-4 text-purple-600" />
              ) : (
                <Square className="w-4 h-4 text-gray-300" />
              )}
              <span>Deploy llms.txt at root</span>
            </button>

            <button
              onClick={() => setHasCitations(!hasCitations)}
              className="flex items-center gap-2 text-xs font-medium text-gray-700 w-full text-left cursor-pointer"
            >
              {hasCitations ? (
                <CheckSquare className="w-4 h-4 text-purple-600" />
              ) : (
                <Square className="w-4 h-4 text-gray-300" />
              )}
              <span>Include outbound citation links</span>
            </button>

            <button
              onClick={() => setHasEntities(!hasEntities)}
              className="flex items-center gap-2 text-xs font-medium text-gray-700 w-full text-left cursor-pointer"
            >
              {hasEntities ? (
                <CheckSquare className="w-4 h-4 text-purple-600" />
              ) : (
                <Square className="w-4 h-4 text-gray-300" />
              )}
              <span>Inject entity-level schema data</span>
            </button>
          </div>
        </div>

        {/* Display Score & Simulated AI Citation */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600">Simulated AI Visibility Score</span>
            <span className={`text-sm font-bold ${score >= 80 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600"}`}>
              {score}/100
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-gray-200 relative text-xs space-y-3 shadow-2xs font-sans">
            <div className="text-purple-600 font-bold uppercase text-[9px] flex items-center gap-1">
              <Bot className="w-3.5 h-3.5" />
              ChatGPT Search Result
            </div>
            <p className="text-gray-700 leading-relaxed pr-6">{citationOutput}</p>
            {allowsScrapers && (
              <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100 text-[10px] text-gray-400">
                <span>Sources:</span>
                <span className="bg-purple-50 text-purple-600 font-semibold px-2 py-0.5 rounded-md">
                  {domain} [1]
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
