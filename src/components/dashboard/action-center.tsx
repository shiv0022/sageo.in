"use client";

import { useState } from "react";
import { 
  Sparkles, 
  Terminal, 
  Copy, 
  Check, 
  BookOpen, 
  ChevronRight, 
  ChevronDown, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Info
} from "lucide-react";
import type { IRecommendation, PriorityLevel } from "@/types/domain";

interface ActionCenterProps {
  recommendations: IRecommendation[];
}

export function ActionCenter({ recommendations }: ActionCenterProps) {
  const [activeTab, setActiveTab] = useState<"ai" | "fix">("ai");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-400">
        No recommendations generated for this crawl.
      </div>
    );
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const getPriorityConfig = (priority: PriorityLevel) => {
    switch (priority) {
      case "critical": return { label: "Critical", bg: "bg-red-50 text-red-600 border-red-100", icon: XCircle };
      case "high": return { label: "High", bg: "bg-orange-50 text-orange-600 border-orange-100", icon: AlertTriangle };
      case "medium": return { label: "Medium", bg: "bg-yellow-50 text-yellow-600 border-yellow-100", icon: AlertTriangle };
      default: return { label: "Low", bg: "bg-blue-50 text-blue-600 border-blue-100", icon: Info };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden premium-shadow space-y-6">
      {/* Tabs Selector */}
      <div className="flex border-b border-gray-100 bg-gray-50/50 p-2">
        <button
          onClick={() => setActiveTab("ai")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === "ai" 
              ? "bg-white text-gray-900 shadow-sm border border-gray-100" 
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          AI Action Center
        </button>
        <button
          onClick={() => setActiveTab("fix")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === "fix" 
              ? "bg-white text-gray-900 shadow-sm border border-gray-100" 
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Terminal className="w-4 h-4 text-gray-700" />
          Fix Center (Developer View)
        </button>
      </div>

      <div className="p-6 pt-0">
        {/* ==========================================
            AI Action Center Tab
            ========================================== */}
        {activeTab === "ai" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">AI Copilot Prompts</h3>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-gray-400">
                <Sparkles className="w-3 h-3 text-purple-500" />
                Prompt templates optimized for OpenAI & Gemini
              </span>
            </div>
            <div className="space-y-4">
              {recommendations.map((rec) => {
                const config = getPriorityConfig(rec.priority);
                const PriorityIcon = config.icon;
                const copyKey = `prompt-${rec.id}`;

                return (
                  <div key={rec.id} className="border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-colors">
                    {/* Header */}
                    <div className="p-4 bg-gray-50/30 flex flex-wrap items-start justify-between gap-3 border-b border-gray-100">
                      <div className="flex gap-2 items-start">
                        <div className={`p-1.5 rounded-lg ${config.bg} flex-shrink-0 mt-0.5`}>
                          <PriorityIcon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">{rec.problem}</h4>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              Source: <span className="font-medium text-gray-600">{rec.frameworkContext || "Industry Best Practice"}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Est: <span className="font-medium text-gray-600">{rec.estimatedTime}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${config.bg}`}>
                        {config.label}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-4">
                      {/* Reason & Evidence */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">Why it matters</span>
                          <p className="text-gray-600 leading-relaxed font-sans">{rec.reason}</p>
                        </div>
                        <div>
                          <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">Evidence Detected</span>
                          <p className="text-gray-600 leading-relaxed font-sans font-medium">{rec.evidence}</p>
                        </div>
                      </div>

                      {/* AI Prompt Box */}
                      <div className="bg-purple-50/20 rounded-xl border border-purple-100/30 overflow-hidden">
                        <div className="px-4 py-2 bg-purple-50/40 border-b border-purple-100/30 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-purple-600 uppercase flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 fill-current" />
                            AI Fix Prompt
                          </span>
                          <button
                            onClick={() => copyToClipboard(rec.aiPrompt, copyKey)}
                            className="flex items-center gap-1 text-[10px] font-bold text-purple-600 hover:text-purple-700 cursor-pointer"
                          >
                            {copiedKey === copyKey ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                Copy Prompt
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-4 text-xs text-purple-900 font-sans leading-relaxed whitespace-pre-wrap select-all">
                          {rec.aiPrompt}
                        </pre>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==========================================
            Fix Center (Developer View) Tab
            ========================================== */}
        {activeTab === "fix" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Priority Issues List</h3>
              <span className="text-xs text-gray-400">Expand to view implementation code and steps</span>
            </div>

            <div className="space-y-3">
              {recommendations.map((rec) => {
                const config = getPriorityConfig(rec.priority);
                const isExpanded = expandedId === rec.id;
                const PriorityIcon = config.icon;
                const copyKey = `code-${rec.id}`;

                return (
                  <div key={rec.id} className="border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-colors bg-white">
                    {/* Interactive Header Row */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                      className="w-full text-left p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/20"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-1.5 rounded-lg ${config.bg} flex-shrink-0`}>
                          <PriorityIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">{rec.problem}</h4>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{rec.evidence}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${config.bg}`}>
                          {config.label}
                        </span>
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                      </div>
                    </button>

                    {/* Expandable Fix Details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-gray-50 space-y-4 text-xs">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">Business Impact</span>
                            <p className="text-gray-600 leading-relaxed font-sans">{rec.reason}</p>
                          </div>
                          <div>
                            <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">Expected Result</span>
                            <p className="text-gray-600 leading-relaxed font-sans font-medium text-green-600">{rec.expectedResult}</p>
                          </div>
                        </div>

                        {/* Implementation Steps */}
                        <div className="space-y-2">
                          <span className="font-bold text-gray-400 uppercase tracking-wider block">Implementation Steps</span>
                          <ol className="list-decimal pl-4 space-y-1.5 text-gray-600 font-sans">
                            {rec.implementationGuide.steps.map((step, idx) => (
                              <li key={idx} className="leading-relaxed">{step}</li>
                            ))}
                          </ol>
                        </div>

                        {/* Code Snippet if present */}
                        {rec.implementationGuide.codeSnippet && (
                          <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-gray-400 uppercase tracking-wider block">
                                Recommended Code Fix 
                                {rec.implementationGuide.codeSnippet.filename && (
                                  <span className="font-mono text-[10px] text-gray-400 lowercase ml-2">({rec.implementationGuide.codeSnippet.filename})</span>
                                )}
                              </span>
                              <button
                                onClick={() => copyToClipboard(rec.implementationGuide.codeSnippet!.code, copyKey)}
                                className="flex items-center gap-1 text-[10px] font-bold text-purple-600 hover:text-purple-700 cursor-pointer"
                              >
                                {copiedKey === copyKey ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    Copied Code!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    Copy Code
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="p-3 text-[10px] bg-gray-950 text-gray-200 rounded-lg font-mono overflow-x-auto max-h-[200px] leading-normal">
                              {rec.implementationGuide.codeSnippet.code}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
