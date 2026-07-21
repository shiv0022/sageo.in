"use client";

import { Zap, Target, ArrowRight, ShieldCheck } from "lucide-react";
import type { IRecommendation } from "@/types/domain";

interface QuickWinsProps {
  recommendations: IRecommendation[];
}

export function QuickWins({ recommendations }: QuickWinsProps) {
  if (!recommendations) return null;

  // Filter Quick Wins: difficulty is easy, priority is critical or high
  const quickWins = recommendations.filter(
    r => r.difficulty === "easy" && (r.priority === "critical" || r.priority === "high")
  );

  // Filter Business Opportunities: difficulty is medium or hard, but priority is critical or high
  const opportunities = recommendations.filter(
    r => (r.difficulty === "medium" || r.difficulty === "hard") && (r.priority === "critical" || r.priority === "high")
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Quick Wins Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 premium-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-gray-50 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Quick Wins Section</h3>
              <p className="text-[10px] text-gray-400">High impact fixes requiring minimal time and effort.</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
            {quickWins.length} Easy Fixes
          </span>
        </div>

        {quickWins.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-400">
            No quick wins identified. All simple critical issues are resolved!
          </div>
        ) : (
          <div className="space-y-3">
            {quickWins.map((win) => (
              <div key={win.id} className="p-3 rounded-xl bg-gray-50/50 border border-gray-50 flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-gray-900 truncate">{win.problem}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-normal">{win.reason}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Business Opportunities Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 premium-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-gray-50 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Business Opportunities</h3>
              <p className="text-[10px] text-gray-400">Strategic modifications with high compound visibility gains.</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
            {opportunities.length} Strategic Items
          </span>
        </div>

        {opportunities.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-400">
            No major strategic business opportunities found in the audit.
          </div>
        ) : (
          <div className="space-y-3">
            {opportunities.map((opp) => (
              <div key={opp.id} className="p-3 rounded-xl bg-gray-50/50 border border-gray-50 flex items-start gap-3">
                <ArrowRight className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-gray-900 truncate">{opp.problem}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-normal">{opp.reason}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
