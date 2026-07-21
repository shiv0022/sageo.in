"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { ScoreRing } from "@/components/dashboard/score-ring";
import { IssueList } from "@/components/dashboard/issue-card";
import {
  ArrowRight,
  BarChart3,
  Code2,
  ExternalLink,
  FileText,
  Globe,
  Layers
} from "lucide-react";
import type { AnalysisResult, Issue } from "@/types";

// Sprint 7 Dashboard Subcomponents
import { ExecutiveSummary } from "@/components/dashboard/executive-summary";
import { GoogleSearchPreview } from "@/components/dashboard/google-search-preview";
import { AISearchPreview } from "@/components/dashboard/ai-search-preview";
import { MetaGenerators } from "@/components/dashboard/meta-generators";
import { FAQGenerator } from "@/components/dashboard/faq-generator";
import { MissingPages } from "@/components/dashboard/missing-pages";
import { ActionCenter } from "@/components/dashboard/action-center";
import { QuickWins } from "@/components/dashboard/quick-wins";
import { GainEstimator } from "@/components/dashboard/gain-estimator";



export default function DashboardPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardTab, setDashboardTab] = useState<"overview" | "previews" | "generators" | "actions">("overview");

  useEffect(() => {
    // Try to load latest analysis from API
    async function loadLatest() {
      try {
        const res = await fetch("/api/analysis/latest");
        if (res.ok) {
          const data = await res.json();
          setResult(data);
          // Sync database data to localStorage
          localStorage.setItem("latest_analysis", JSON.stringify(data));
        } else {
          // Fallback to localStorage if API returned an error (e.g. 404 on Vercel without Supabase)
          const localData = localStorage.getItem("latest_analysis");
          if (localData) {
            setResult(JSON.parse(localData));
          }
        }
      } catch {
        // Fallback to localStorage on network error
        const localData = localStorage.getItem("latest_analysis");
        if (localData) {
          setResult(JSON.parse(localData));
        }
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


  // Construct a fallback IAuditDocument if missing (legacy mode support)
  const resolvedAuditDoc = auditDoc || {
    id: result?.audit.id || "fallback-id",
    targetUrl: result?.project.website_url || "https://example.com",
    createdAt: result?.audit.created_at || new Date().toISOString(),
    status: "completed" as const,
    scores: {
      overall: overallHealth,
      seo: seoScore,
      aeo: aeoScore,
      security: securityScore,
      performance: performanceScore,
      accessibility: accessibilityScore,
      geo: geoScore,
      access: accessScore
    },
    context: {
      category: "Business Services",
      industry: "General Business",
      targetAudience: "General Audience",
      goals: ["brand visibility"],
      searchIntentProfile: "informational",
      language: "en",
      geographicScope: "global" as const
    },
    intent: {
      primaryType: (result?.websiteUnderstanding?.businessType || "corporate") as any,
      confidenceScore: 100
    },
    discovery: {
      framework: techStackFramework,
      frameworkConfidence: 100,
      specialFiles: {
        llmsTxt: false,
        humansTxt: false,
        securityTxt: false,
        adsTxt: false
      }
    },
    recommendations: result?.auditDocument?.recommendations || (result?.recommendations || []).map((r, i) => ({
      id: r.id || String(i),
      problem: r.problem || "Optimization opportunity",
      reason: r.reason || "",
      evidence: "Detected during crawl.",
      impacts: {
        business: r.impact || "Medium",
        seo: r.impact || "Medium",
        aiVisibility: r.impact || "Medium",
        googleVisibility: r.impact || "Medium",
        security: "None"
      },
      difficulty: (r.difficulty || "medium") as any,
      estimatedTime: "15 minutes",
      priority: (r.priority || "medium") as any,
      confidenceScore: r.confidence || 100,
      implementationGuide: {
        steps: ["Implement standard optimizations."]
      },
      aiPrompt: `Fix the following issue: ${r.problem}`,
      expectedResult: "Improved indexing and search visibility."
    }))
  };

  return (
    <div className="min-h-screen bg-white print:bg-white print:text-black">
      {/* Hide navbar on print */}
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div
          className="animate-fade-in-up mb-8 print:mb-12"
          style={{ opacity: 0, animationDelay: "0.1s" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold mb-1 print:text-3xl">Website Audit Intelligence Dashboard</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500 print:text-gray-700">
                <Globe className="w-4 h-4" />
                <span>{result?.project.website_url}</span>
                <a
                  href={result?.project.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 print:hidden"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3 print:hidden">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Print Report
              </button>
              <Link
                href="/reports"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Download PDF
              </Link>
            </div>
          </div>
        </div>

        {/* Score Rings (Full width grid on desktop) */}
        <div
          className="animate-fade-in-up grid grid-cols-2 md:grid-cols-4 gap-8 p-8 rounded-2xl border border-gray-100 mb-8 print:border-gray-300 print:bg-gray-50"
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

        {/* Sprint 7 Sub-navigation tab bar */}
        <div className="flex items-center gap-2 border-b border-gray-100 mb-8 overflow-x-auto pb-px print:hidden">
          <button
            onClick={() => setDashboardTab("overview")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              dashboardTab === "overview"
                ? "border-black text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Overview & Gains
          </button>
          <button
            onClick={() => setDashboardTab("previews")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              dashboardTab === "previews"
                ? "border-black text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Search Previews
          </button>
          <button
            onClick={() => setDashboardTab("generators")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              dashboardTab === "generators"
                ? "border-black text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            FAQ & Tag Generators
          </button>
          <button
            onClick={() => setDashboardTab("actions")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              dashboardTab === "actions"
                ? "border-black text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Action & Fix Centers
          </button>
        </div>

        {/* Tab contents */}
        <div className="space-y-8 print:space-y-12">
          {/* ==========================================
              OVERVIEW TAB (Always shown on print)
              ========================================== */}
          {(dashboardTab === "overview" || typeof window === "undefined" || (typeof window !== "undefined" && window.matchMedia("print").matches)) && (
            <div className="space-y-8 animate-fade-in">
              <ExecutiveSummary auditDoc={resolvedAuditDoc} />
              
              <GainEstimator auditDoc={resolvedAuditDoc} />
              
              <QuickWins recommendations={resolvedAuditDoc.recommendations} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top Issues List */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Top Technical Issues</h3>
                  <div className="rounded-2xl border border-gray-100 p-4">
                    <IssueList issues={issues} maxItems={6} />
                  </div>
                </div>

                {/* Tech stack & Quick metrics sidebar */}
                <div className="space-y-6 print:grid print:grid-cols-2 print:gap-6 print:space-y-0">
                  {/* Technology */}
                  <div className="rounded-2xl border border-gray-100 p-5 print:border-gray-300">
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-gray-400" />
                      Technology Stack
                    </h3>
                    <div className="space-y-3">
                      {result?.technologyStack && (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Framework</span>
                            <span className="font-medium">{techStackFramework}</span>
                          </div>
                          {result.technologyStack.cms && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">CMS</span>
                              <span className="font-medium">{result.technologyStack.cms}</span>
                            </div>
                          )}
                          {result.technologyStack.libraries.length > 0 && (
                            <div>
                              <span className="text-xs text-gray-400">Libraries</span>
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {result.technologyStack.libraries.slice(0, 5).map((lib: string) => (
                                  <span key={lib} className="text-xs px-2 py-0.5 rounded-md bg-gray-50 text-gray-600 border border-gray-100">
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

                  {/* Quick Metrics */}
                  <div className="rounded-2xl border border-gray-100 p-5 print:border-gray-300">
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-gray-400" />
                      Audited Core Metrics
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Pages Crawled</span>
                        <span className="font-medium">{pagesCrawledCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Structured Schemas</span>
                        <span className="font-medium">{schemasFoundCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Performance Index</span>
                        <span className="font-medium">{performanceScore}/100</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Accessibility (WCAG)</span>
                        <span className="font-medium">{accessibilityScore}/100</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Security Audit</span>
                        <span className="font-medium">{securityScore}/100</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              PREVIEWS TAB (Show on print too)
              ========================================== */}
          {(dashboardTab === "previews" || typeof window === "undefined" || (typeof window !== "undefined" && window.matchMedia("print").matches)) && (
            <div className="space-y-8 animate-fade-in print:page-break-before">
              <GoogleSearchPreview auditDoc={resolvedAuditDoc} crawlData={result?.crawlResult} />
              <AISearchPreview auditDoc={resolvedAuditDoc} />
            </div>
          )}

          {/* ==========================================
              GENERATORS TAB
              ========================================== */}
          {(dashboardTab === "generators" || typeof window === "undefined" || (typeof window !== "undefined" && window.matchMedia("print").matches)) && (
            <div className="space-y-8 animate-fade-in print:page-break-before">
              <MetaGenerators auditDoc={resolvedAuditDoc} />
              <FAQGenerator auditDoc={resolvedAuditDoc} />
              <MissingPages auditDoc={resolvedAuditDoc} crawlData={result?.crawlResult} />
            </div>
          )}

          {/* ==========================================
              ACTION CENTER TAB
              ========================================== */}
          {(dashboardTab === "actions" || typeof window === "undefined" || (typeof window !== "undefined" && window.matchMedia("print").matches)) && (
            <div className="space-y-8 animate-fade-in print:page-break-before">
              <ActionCenter recommendations={resolvedAuditDoc.recommendations} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
