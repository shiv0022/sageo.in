"use client";

import {
  Bot,
  CheckCircle2,
  Globe,
  Loader2,
  Search,
  Shield,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import type { AnalysisStatus } from "@/types";

const statusConfig: Record<
  AnalysisStatus,
  { icon: typeof Loader2; label: string; color: string }
> = {
  idle: { icon: Globe, label: "Ready to analyze", color: "text-gray-400" },
  crawling: { icon: Globe, label: "Crawling website...", color: "text-blue-500" },
  analyzing_seo: { icon: Search, label: "Analyzing SEO...", color: "text-green-500" },
  analyzing_aeo: { icon: Bot, label: "Analyzing AEO...", color: "text-purple-500" },
  analyzing_geo: { icon: Sparkles, label: "Analyzing GEO...", color: "text-indigo-500" },
  analyzing_access: { icon: Shield, label: "Checking access...", color: "text-orange-500" },
  detecting_technology: { icon: Zap, label: "Detecting technology...", color: "text-yellow-500" },
  running_lighthouse: { icon: Zap, label: "Running Lighthouse...", color: "text-cyan-500" },
  analyzing_competitor: { icon: Users, label: "Comparing competitor...", color: "text-pink-500" },
  generating_recommendations: { icon: Sparkles, label: "Generating recommendations...", color: "text-violet-500" },
  complete: { icon: CheckCircle2, label: "Analysis complete", color: "text-green-600" },
  error: { icon: Globe, label: "Analysis failed", color: "text-red-500" },
};

interface AnalysisProgressProps {
  status: AnalysisStatus;
  progress: number;
  message?: string;
}

export function AnalysisProgress({
  status,
  progress,
  message,
}: AnalysisProgressProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const isRunning = status !== "idle" && status !== "complete" && status !== "error";

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <div className={`${isRunning ? "animate-spin-slow" : ""}`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        <span className="text-sm font-medium text-gray-700">
          {message || config.label}
        </span>
        <span className="text-xs text-gray-400 ml-auto">{progress}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-black rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicators */}
      {isRunning && (
        <div className="flex items-center justify-between mt-4">
          {[
            "Crawl",
            "SEO",
            "AEO",
            "GEO",
            "Access",
            "Tech",
            "Lighthouse",
          ].map((step, i) => {
            const stepProgress = ((i + 1) / 7) * 100;
            const isDone = progress >= stepProgress;
            const isCurrent =
              progress >= stepProgress - 14 && progress < stepProgress;
            return (
              <div key={step} className="flex flex-col items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${
                    isDone
                      ? "bg-black"
                      : isCurrent
                      ? "bg-gray-400 animate-pulse"
                      : "bg-gray-200"
                  }`}
                />
                <span
                  className={`text-[10px] ${
                    isDone ? "text-gray-700 font-medium" : "text-gray-300"
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
