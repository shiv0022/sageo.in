"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { ScoreRing } from "@/components/dashboard/score-ring";
import { IssueList } from "@/components/dashboard/issue-card";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  ChevronRight,
  Code2,
  ExternalLink,
  FileText,
  Globe,
  Layers,
  Search,
  Shield,
  Sparkles,
  Tag,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { AnalysisResult, Issue, Priority } from "@/types";

// Stat card
function StatCard({
  icon: Icon,
  label,
  value,
  color = "text-gray-700",
  delay = 0,
}: {
  icon: typeof Globe;
  label: string;
  value: string | number;
  color?: string;
  delay?: number;
}) {
  return (
    <div
      className="animate-fade-in-up p-5 rounded-2xl border border-gray-100 premium-hover"
      style={{ opacity: 0, animationDelay: `${delay}s` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

// Gap item
function GapItem({
  label,
  count,
  type,
}: {
  label: string;
  count: number;
  type: "keyword" | "content" | "schema" | "authority" | "page";
}) {
  const colors: Record<string, string> = {
    keyword: "bg-blue-50 text-blue-600",
    content: "bg-purple-50 text-purple-600",
    schema: "bg-green-50 text-green-600",
    authority: "bg-orange-50 text-orange-600",
    page: "bg-red-50 text-red-600",
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span
        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors[type]}`}
      >
        {count} gaps
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLatest() {
      // 1. Always load localStorage data first (instant, works on Vercel without Supabase)
      let localResult: AnalysisResult | null = null;
      try {
        const localData = localStorage.getItem("latest_analysis");
        if (localData) {
          localResult = JSON.parse(localData);
          setResult(localResult);
        }
      } catch {
        // Corrupted localStorage, ignore
      }

      // 2. Try API for persistent database data
      try {
        const res = await fetch("/api/analysis/latest");
        if (res.ok) {
          const apiData = await res.json();

          // Check if API data has real scores (not empty InMemoryAdapter zeros)
          const apiHasScores =
            apiData?.audit &&
            ((apiData.audit.seo_score || 0) +
              (apiData.audit.aeo_score || 0) +
              (apiData.audit.geo_score || 0) +
              (apiData.audit.access_score || 0) > 0 ||
              apiData.auditDocument?.scores?.overall > 0);

          const localHasScores =
            localResult?.audit &&
            ((localResult.audit.seo_score || 0) +
              (localResult.audit.aeo_score || 0) +
              (localResult.audit.geo_score || 0) +
              (localResult.audit.access_score || 0) > 0 ||
              (localResult as any)?.auditDocument?.scores?.overall > 0);

          if (apiHasScores) {
            // API has real data (Supabase or same serverless instance) — use it
            setResult(apiData);
            localStorage.setItem("latest_analysis", JSON.stringify(apiData));
          } else if (!localHasScores && apiData) {
            // Neither has scores, but API returned something — use API as last resort
            setResult(apiData);
          }
          // else: localStorage has scores but API doesn't — keep localStorage (already set above)
        }
      } catch {
        // API failed — localStorage result (if any) is already set above
      } finally {
        setLoading(false);
      }
    }
    loadLatest();
  }, []);

  // Empty state
  if (!loading && !result) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <div
            className="animate-fade-in-up"
            style={{ opacity: 0, animationDelay: "0.1s" }}
          >
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-8 h-8 text-gray-300" />
            </div>
            <h1 className="text-2xl font-semibold mb-3">No analyses yet</h1>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Start by analyzing a website to see your SEO, AEO, GEO and Access
              scores with detailed recommendations.
            </p>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Analyze Website
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-100 rounded-lg w-64 mx-auto" />
            <div className="h-4 bg-gray-100 rounded w-96 mx-auto" />
            <div className="grid grid-cols-4 gap-4 mt-12">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-50 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Data state
  const auditDoc = result?.auditDocument;

  const seoScore = auditDoc ? auditDoc.scores.seo : (result?.audit.seo_score || 0);
  const aeoScore = auditDoc ? auditDoc.scores.aeo : (result?.audit.aeo_score || 0);
  const geoScore = auditDoc ? auditDoc.scores.geo : (result?.audit.geo_score || 0);
  const accessScore = auditDoc ? auditDoc.scores.access : (result?.audit.access_score || 0);
  const securityScore = auditDoc ? auditDoc.scores.security : (result?.lighthouseScores?.bestPractices || 0);
  const performanceScore = auditDoc ? auditDoc.scores.performance : (result?.lighthouseScores?.performance || 0);
  const accessibilityScore = auditDoc ? auditDoc.scores.accessibility : (result?.lighthouseScores?.accessibility || 0);
  const dbOverallScore = result?.audit
    ? Math.round(
        ((result.audit.seo_score || 0) +
          (result.audit.aeo_score || 0) +
          (result.audit.geo_score || 0) +
          (result.audit.access_score || 0)) /
          4
      )
    : 0;
  const overallHealth = auditDoc ? auditDoc.scores.overall : dbOverallScore;

  const techStackFramework = auditDoc ? auditDoc.discovery.framework : (result?.technologyStack?.framework || "Unknown");
  const pagesCrawledCount = result?.crawlResult?.pages?.length || 0;

  const schemasFoundCount = result?.crawlResult?.pages?.reduce(
    (sum: number, p: any) => sum + (p.schemaMarkup?.length || 0),
    0
  ) || 0;

  const issues = (auditDoc
    ? auditDoc.recommendations.map((r: any, i: number) => ({
        id: r.id || String(i),
        audit_id: auditDoc.id,
        category: r.frameworkContext ? "seo" as const : "access" as const,
        title: r.problem,
        description: r.reason,
        priority: r.priority,
        impact: r.impacts?.seo || r.impacts?.googleVisibility || "+5 SEO",
        difficulty: r.difficulty,
        confidence: r.confidenceScore,
      }))
    : (result?.recommendations?.map((r, i) => ({
        id: r.id || String(i),
        audit_id: result.audit.id,
        category: r.category,
        title: r.problem,
        description: r.reason,
        priority: r.priority,
        impact: r.impact,
        difficulty: r.difficulty,
        confidence: r.confidence,
      })) || [])) as Issue[];

  const criticalIssues = issues.filter(
    (i: Issue) => i.priority === "critical" || i.priority === "high"
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div
          className="animate-fade-in-up mb-8"
          style={{ opacity: 0, animationDelay: "0.1s" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Globe className="w-4 h-4" />
                <span>{result?.project.website_url}</span>
                <a
                  href={result?.project.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/reports"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Reports
              </Link>
              <Link
                href="/analyze"
                className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                New Analysis
              </Link>
            </div>
          </div>
        </div>

        {/* Score Rings */}
        <div
          className="animate-fade-in-up grid grid-cols-2 md:grid-cols-4 gap-8 p-8 rounded-2xl border border-gray-100 mb-8"
          style={{ opacity: 0, animationDelay: "0.2s" }}
        >
          <ScoreRing
            score={seoScore}
            label="SEO Score"
            delay={200}
          />
          <ScoreRing
            score={aeoScore}
            label="AEO Score"
            delay={400}
          />
          <ScoreRing
            score={geoScore}
            label="GEO Score"
            delay={600}
          />
          <ScoreRing
            score={accessScore}
            label="Access Score"
            delay={800}
          />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={AlertTriangle}
            label="Issues Found"
            value={issues.length}
            color="text-red-500"
            delay={0.3}
          />
          <StatCard
            icon={Zap}
            label="High Priority"
            value={criticalIssues.length}
            color="text-orange-500"
            delay={0.35}
          />
          <StatCard
            icon={Code2}
            label="Tech Stack"
            value={techStackFramework}
            color="text-blue-500"
            delay={0.4}
          />
          <StatCard
            icon={TrendingUp}
            label="Website Health"
            value={overallHealth ? `${overallHealth}/100` : "N/A"}
            color="text-green-500"
            delay={0.45}
          />
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Issues */}
          <div
            className="animate-fade-in-up lg:col-span-2"
            style={{ opacity: 0, animationDelay: "0.5s" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Top Issues</h2>
              <span className="text-xs text-gray-400">
                {criticalIssues.length} high priority
              </span>
            </div>
            <div className="rounded-2xl border border-gray-100 p-4">
              <IssueList issues={issues} maxItems={8} />
            </div>
          </div>

          {/* Side panel */}
          <div className="space-y-6">
            {/* Technology */}
            <div
              className="animate-fade-in-up rounded-2xl border border-gray-100 p-5"
              style={{ opacity: 0, animationDelay: "0.55s" }}
            >
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-gray-400" />
                Technology Stack
              </h3>
              <div className="space-y-3">
                {result?.technologyStack && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Framework</span>
                      <span className="font-medium">
                        {techStackFramework}
                      </span>
                    </div>
                    {result.technologyStack.cms && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">CMS</span>
                        <span className="font-medium">
                          {result.technologyStack.cms}
                        </span>
                      </div>
                    )}
                    {result.technologyStack.libraries.length > 0 && (
                      <div>
                        <span className="text-xs text-gray-400">Libraries</span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {result.technologyStack.libraries
                            .slice(0, 6)
                            .map((lib: string) => (
                              <span
                                key={lib}
                                className="text-xs px-2 py-1 rounded-md bg-gray-50 text-gray-600"
                              >
                                {lib}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Competitor Gaps */}
            {result?.competitorResult && (
              <div
                className="animate-fade-in-up rounded-2xl border border-gray-100 p-5"
                style={{ opacity: 0, animationDelay: "0.6s" }}
              >
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 text-gray-400" />
                  Competitor Gaps
                </h3>
                <div>
                  <GapItem
                    label="Missing Keywords"
                    count={result.competitorResult.gaps.keywordGap.length}
                    type="keyword"
                  />
                  <GapItem
                    label="Content Gaps"
                    count={result.competitorResult.gaps.contentGap.length}
                    type="content"
                  />
                  <GapItem
                    label="Schema Gaps"
                    count={result.competitorResult.gaps.schemaGap.length}
                    type="schema"
                  />
                  <GapItem
                    label="Missing Pages"
                    count={result.competitorResult.gaps.missingPages.length}
                    type="page"
                  />
                </div>
              </div>
            )}

            {/* Quick Metrics */}
            <div
              className="animate-fade-in-up rounded-2xl border border-gray-100 p-5"
              style={{ opacity: 0, animationDelay: "0.65s" }}
            >
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-gray-400" />
                Quick Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Pages Crawled</span>
                  <span className="font-medium">
                    {pagesCrawledCount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Schemas Found</span>
                  <span className="font-medium">
                    {schemasFoundCount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Performance</span>
                  <span className="font-medium">
                    {performanceScore}/100
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Accessibility</span>
                  <span className="font-medium">
                    {accessibilityScore}/100
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Security</span>
                  <span className="font-medium">
                    {securityScore}/100
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
