"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { AnalysisProgress } from "@/components/analysis-progress";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Globe,
  Target,
  Github,
  FileText,
  Sparkles,
} from "lucide-react";
import type { AnalysisStatus, ReportType } from "@/types";

const reportOptions: { id: ReportType; label: string; description: string }[] = [
  {
    id: "website_analysis",
    label: "Website Analysis Report",
    description: "Complete website audit with scores and issues",
  },
  {
    id: "competitor_analysis",
    label: "Competitor Analysis Report",
    description: "Side-by-side comparison with competitor",
  },
  {
    id: "seo_report",
    label: "SEO Report",
    description: "Deep SEO analysis with meta tags and crawlability",
  },
  {
    id: "aeo_report",
    label: "AEO Report",
    description: "Answer engine optimization and FAQ readiness",
  },
  {
    id: "geo_report",
    label: "GEO Report",
    description: "E-E-A-T signals and topical authority",
  },
  {
    id: "keyword_report",
    label: "Keyword Report",
    description: "Keyword analysis and suggestions",
  },
  {
    id: "meta_tag_report",
    label: "Meta Tag Report",
    description: "All meta tags with improvements",
  },
  {
    id: "content_gap_report",
    label: "Content Gap Report",
    description: "Missing content and topics",
  },
  {
    id: "implementation_blueprint",
    label: "Implementation Blueprint",
    description: "Step-by-step fix guide with code suggestions",
  },
  {
    id: "full_master_report",
    label: "Full Master Report",
    description: "Everything combined in one report",
  },
];

function AnalyzeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [websiteUrl, setWebsiteUrl] = useState(searchParams.get("url") || "");
  const [competitorUrl, setCompetitorUrl] = useState(
    searchParams.get("competitor") || ""
  );
  const [githubUrl, setGithubUrl] = useState("");
  const [selectedReports, setSelectedReports] = useState<Set<ReportType>>(
    new Set(["website_analysis", "implementation_blueprint"])
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [analysisId, setAnalysisId] = useState<string | null>(null);

  const toggleReport = (id: ReportType) => {
    setSelectedReports((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedReports(new Set(reportOptions.map((r) => r.id)));
  };

  const handleStartAnalysis = useCallback(async () => {
    if (!websiteUrl.trim()) return;
    setStatus("crawling");
    setProgress(0);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          websiteUrl: websiteUrl.trim(),
          competitorUrl: competitorUrl.trim() || undefined,
          githubUrl: githubUrl.trim() || undefined,
          reports: Array.from(selectedReports),
        }),
      });

      if (!res.ok) {
        throw new Error("Analysis failed");
      }

      // Stream progress from SSE or poll
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.status) setStatus(data.status);
                if (data.progress !== undefined) setProgress(data.progress);
                if (data.message) setStatusMessage(data.message);
                if (data.analysisId) setAnalysisId(data.analysisId);
                if (data.status === "complete") {
                  // Cache results and reports locally for stateless/Vercel compatibility
                  if (data.result) {
                    localStorage.setItem("latest_analysis", JSON.stringify(data.result));
                  }
                  if (data.reports) {
                    localStorage.setItem("latest_reports", JSON.stringify(data.reports));
                  }
                  setTimeout(() => {
                    router.push(
                      `/dashboard?project=${data.projectId || ""}`
                    );
                  }, 1500);
                }
              } catch {
                // ignore invalid JSON
              }
            }
          }
        }
      }
    } catch (error) {
      setStatus("error");
      setStatusMessage(
        error instanceof Error ? error.message : "Analysis failed"
      );
    }
  }, [websiteUrl, competitorUrl, githubUrl, selectedReports, router]);

  // Auto-start if URL param is present
  useEffect(() => {
    if (searchParams.get("url") && searchParams.get("autostart") === "true") {
      handleStartAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAnalyzing = status !== "idle" && status !== "complete" && status !== "error";

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div
          className="animate-fade-in-up text-center mb-12"
          style={{ opacity: 0, animationDelay: "0.1s" }}
        >
          <h1 className="text-3xl font-semibold mb-3">Analyze Website</h1>
          <p className="text-gray-500">
            Enter a website URL to start a comprehensive SEO, AEO, GEO and
            Access analysis.
          </p>
        </div>

        {/* Main Form */}
        {status === "idle" || status === "error" ? (
          <div className="space-y-6">
            {/* Website URL */}
            <div
              className="animate-fade-in-up"
              style={{ opacity: 0, animationDelay: "0.2s" }}
            >
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Website URL <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 focus-within:border-gray-400 transition-colors">
                <Globe className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full bg-transparent outline-none text-base placeholder:text-gray-400"
                  id="analyze-website-url"
                />
              </div>
            </div>

            {/* Competitor URL */}
            <div
              className="animate-fade-in-up"
              style={{ opacity: 0, animationDelay: "0.25s" }}
            >
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Competitor URL{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 focus-within:border-gray-400 transition-colors">
                <Target className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  type="url"
                  placeholder="https://competitor.com"
                  value={competitorUrl}
                  onChange={(e) => setCompetitorUrl(e.target.value)}
                  className="w-full bg-transparent outline-none text-base placeholder:text-gray-400"
                  id="analyze-competitor-url"
                />
              </div>
            </div>

            {/* GitHub URL */}
            <div
              className="animate-fade-in-up"
              style={{ opacity: 0, animationDelay: "0.3s" }}
            >
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                GitHub Repository URL{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 focus-within:border-gray-400 transition-colors">
                <Github className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  type="url"
                  placeholder="https://github.com/user/repo"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full bg-transparent outline-none text-base placeholder:text-gray-400"
                  id="analyze-github-url"
                />
              </div>
            </div>

            {/* Report Selection */}
            <div
              className="animate-fade-in-up"
              style={{ opacity: 0, animationDelay: "0.35s" }}
            >
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors mb-4"
              >
                <FileText className="w-4 h-4" />
                Report Selection
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showAdvanced ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showAdvanced && (
                <div className="animate-fade-in rounded-xl border border-gray-100 p-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">
                      {selectedReports.size} selected
                    </span>
                    {selectedReports.size === reportOptions.length ? (
                      <button
                        onClick={() => setSelectedReports(new Set())}
                        className="text-xs text-gray-500 hover:text-black transition-colors"
                      >
                        Deselect All
                      </button>
                    ) : (
                      <button
                        onClick={selectAll}
                        className="text-xs text-gray-500 hover:text-black transition-colors"
                      >
                        Select All
                      </button>
                    )}
                  </div>
                  {reportOptions.map((report) => (
                    <label
                      key={report.id}
                      onClick={() => toggleReport(report.id)}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="mt-0.5">
                        <div
                           className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            selectedReports.has(report.id)
                              ? "bg-black border-black"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedReports.has(report.id) && (
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">
                          {report.label}
                        </div>
                        <div className="text-xs text-gray-400">
                          {report.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Error message */}
            {status === "error" && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
                {statusMessage || "Analysis failed. Please try again."}
              </div>
            )}

            {/* Action Buttons */}
            <div
              className="animate-fade-in-up flex items-center gap-4 pt-4"
              style={{ opacity: 0, animationDelay: "0.4s" }}
            >
              <button
                onClick={handleStartAnalysis}
                disabled={!websiteUrl.trim()}
                className="flex-1 bg-black text-white py-3.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                id="start-analysis-button"
              >
                <Sparkles className="w-4 h-4" />
                Start Analysis
              </button>
              <button
                onClick={() => {
                  selectAll();
                  handleStartAnalysis();
                }}
                disabled={!websiteUrl.trim()}
                className="px-6 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Full Report
              </button>
            </div>
          </div>
        ) : (
          /* Analysis in Progress */
          <div
            className="animate-scale-in py-12"
            style={{ opacity: 0, animationDelay: "0.1s" }}
          >
            <div className="text-center mb-12">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-gray-400 animate-pulse" />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                {status === "complete"
                  ? "Analysis Complete"
                  : "Analyzing Website"}
              </h2>
              <p className="text-sm text-gray-500">
                {status === "complete"
                  ? "Redirecting to dashboard..."
                  : websiteUrl}
              </p>
            </div>

            <AnalysisProgress
              status={status}
              progress={progress}
              message={statusMessage}
            />

            {status === "complete" && (
              <div className="text-center mt-8">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  View Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      }
    >
      <AnalyzeContent />
    </Suspense>
  );
}
