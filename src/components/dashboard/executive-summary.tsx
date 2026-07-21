"use client";

import { CheckCircle2, TrendingUp, Sparkles } from "lucide-react";
import type { IAuditDocument } from "@/types/domain";

interface ExecutiveSummaryProps {
  auditDoc: IAuditDocument;
}

export function ExecutiveSummary({ auditDoc }: ExecutiveSummaryProps) {
  if (!auditDoc) return null;

  const score = auditDoc.scores.overall;
  const criticalCount = auditDoc.recommendations.filter(r => r.priority === "critical").length;
  const highCount = auditDoc.recommendations.filter(r => r.priority === "high").length;
  const topActions = auditDoc.recommendations.slice(0, 3);

  // Health assessment
  const getHealthText = (s: number) => {
    if (s >= 80) return { text: "Excellent Health", desc: "Your site demonstrates solid performance, security, and search engine optimization. Keep up the good work!", color: "text-green-600", bg: "bg-green-50/50" };
    if (s >= 60) return { text: "Moderate Issues", desc: "Your site is functional but has key opportunities to boost search and AI engine rankings.", color: "text-yellow-600", bg: "bg-yellow-50/50" };
    return { text: "Needs Attention", desc: "Critical technical or structural issues are holding back your site visibility. Address these immediately.", color: "text-red-600", bg: "bg-red-50/50" };
  };

  const health = getHealthText(score);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden premium-shadow">
      {/* Top Gradient Banner */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Suggested Analysis Report</span>
          <h2 className="text-xl font-bold mt-1">Executive AI Intelligence Summary</h2>
        </div>
        <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-white/90">
          <Sparkles className="w-3 h-3 text-yellow-300" />
          Generated from Analysis
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Score and Quick assessment */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="flex items-center gap-4 col-span-2">
            <div className={`p-4 rounded-xl ${health.bg} ${health.color} flex-shrink-0`}>
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${health.color}`}>{health.text}</h3>
              <p className="text-sm text-gray-500 mt-1">{health.desc}</p>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
            <span className="text-xs text-gray-400 uppercase font-semibold">Priority Interventions</span>
            <div className="flex justify-center gap-4 mt-2">
              <div>
                <span className="block text-xl font-bold text-red-600">{criticalCount}</span>
                <span className="text-[10px] text-gray-400 uppercase font-medium">Critical</span>
              </div>
              <div className="border-r border-gray-200 h-8 self-center" />
              <div>
                <span className="block text-xl font-bold text-orange-500">{highCount}</span>
                <span className="text-[10px] text-gray-400 uppercase font-medium">High</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top 3 Actions */}
        {topActions.length > 0 && (
          <div className="border-t border-gray-100 pt-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Recommended Immediate Actions
            </h4>
            <div className="space-y-3">
              {topActions.map((action, idx) => (
                <div key={action.id} className="flex gap-3 items-start p-3 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors border border-gray-50">
                  <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-semibold text-gray-900 truncate">{action.problem}</h5>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        action.priority === "critical" ? "bg-red-50 text-red-600" :
                        action.priority === "high" ? "bg-orange-50 text-orange-600" :
                        "bg-yellow-50 text-yellow-600"
                      }`}>
                        {action.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{action.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
