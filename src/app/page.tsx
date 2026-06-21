"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  ChevronRight,
  FileText,
  Globe,
  Search,
  Shield,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/navbar";

const features = [
  {
    icon: Search,
    title: "SEO Intelligence",
    description:
      "Deep analysis of meta tags, headings, links, crawlability and indexability with actionable recommendations.",
  },
  {
    icon: Bot,
    title: "AEO Intelligence",
    description:
      "Answer Engine Optimization analysis for featured snippets, FAQ readiness and voice search optimization.",
  },
  {
    icon: Sparkles,
    title: "GEO Intelligence",
    description:
      "Generative Engine Optimization with E-E-A-T signals, entity coverage and topical authority analysis.",
  },
  {
    icon: Shield,
    title: "Access Analysis",
    description:
      "Detect robots.txt blocking, noindex tags, AI crawler restrictions and rendering issues.",
  },
  {
    icon: Target,
    title: "Competitor Analysis",
    description:
      "Compare keywords, schemas, content structure and authority signals against competitors.",
  },
  {
    icon: FileText,
    title: "PDF Reports",
    description:
      "Professional analysis reports and implementation blueprints with step-by-step fixes.",
  },
];

const stats = [
  { value: "50+", label: "Analysis Checks" },
  { value: "4", label: "Score Engines" },
  { value: "10+", label: "Report Types" },
  { value: "Real", label: "Lighthouse Audits" },
];

export default function HomePage() {
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
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="px-6 pt-24 pb-20 max-w-7xl mx-auto text-center">
        {/* Badge */}
        <div
          className="animate-fade-in-up inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-gray-200 bg-gray-50/50"
          style={{ opacity: 0, animationDelay: "0.1s" }}
        >
          <Activity className="w-4 h-4 text-black" />
          <span className="text-sm font-medium text-gray-700">
            SEO · AEO · GEO Intelligence
          </span>
        </div>

        {/* Main Heading */}
        <h1
          className="animate-fade-in-up text-5xl md:text-6xl lg:text-[72px] font-semibold leading-[1.1] tracking-tight mb-6"
          style={{ opacity: 0, animationDelay: "0.2s" }}
        >
          Analyze Any Website.
          <br />
          <span className="bg-gradient-to-r from-black via-gray-500 to-gray-400 bg-clip-text text-transparent">
            Find Every Ranking Opportunity.
          </span>
        </h1>

        {/* Subheading */}
        <p
          className="animate-fade-in-up text-lg md:text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed"
          style={{ opacity: 0, animationDelay: "0.3s" }}
        >
          Discover technical issues, content gaps, competitor advantages and
          implementation opportunities using SEO, AEO and GEO intelligence.
        </p>

        {/* Input Section */}
        <div
          className="animate-fade-in-up max-w-2xl mx-auto mb-6"
          style={{ opacity: 0, animationDelay: "0.4s" }}
        >
          <div className="flex items-center gap-3 p-2 rounded-2xl border border-gray-200 bg-white premium-shadow-lg">
            <div className="flex items-center gap-2 flex-1 pl-4">
              <Globe className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="url"
                placeholder="Enter website URL to analyze..."
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                className="w-full bg-transparent text-base outline-none placeholder:text-gray-400"
                id="website-url-input"
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={!websiteUrl.trim()}
              className="bg-black text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0"
              id="analyze-button"
            >
              Analyze Website
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Competitor Toggle */}
        <div
          className="animate-fade-in-up max-w-2xl mx-auto mb-16"
          style={{ opacity: 0, animationDelay: "0.45s" }}
        >
          {!showCompetitor ? (
            <button
              onClick={() => setShowCompetitor(true)}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-1"
            >
              <ChevronRight className="w-3 h-3" />
              Add competitor URL for comparison
            </button>
          ) : (
            <div className="flex items-center gap-3 p-2 rounded-2xl border border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2 flex-1 pl-4">
                <Target className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="url"
                  placeholder="Competitor website URL (optional)"
                  value={competitorUrl}
                  onChange={(e) => setCompetitorUrl(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                  id="competitor-url-input"
                />
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div
          className="animate-fade-in-up flex items-center justify-center gap-12 mb-24"
          style={{ opacity: 0, animationDelay: "0.5s" }}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-black">{stat.value}</div>
              <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Feature Cards */}
        <div
          className="animate-fade-in-up grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto"
          style={{ opacity: 0, animationDelay: "0.6s" }}
        >
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl border border-gray-100 hover:border-gray-200 text-left premium-hover cursor-default"
                style={{
                  opacity: 0,
                  animation: `fadeInUp 0.5s ease-out ${0.7 + i * 0.08}s forwards`,
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-gray-100 transition-colors">
                  <Icon className="w-5 h-5 text-gray-700" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-24 bg-gray-50/50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-4">
            How it works
          </h2>
          <p className="text-gray-500 text-center mb-16 max-w-lg mx-auto">
            From URL to actionable intelligence in minutes
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Enter URL",
                description: "Paste any website URL and optionally a competitor URL.",
                icon: Globe,
              },
              {
                step: "02",
                title: "Deep Crawl",
                description: "Playwright crawls pages, Cheerio extracts metadata, Lighthouse audits performance.",
                icon: Search,
              },
              {
                step: "03",
                title: "AI Analysis",
                description: "SEO, AEO, GEO and Access engines score and identify every issue.",
                icon: BarChart3,
              },
              {
                step: "04",
                title: "Get Reports",
                description: "Download professional PDF reports with implementation blueprints.",
                icon: FileText,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mx-auto mb-4 premium-shadow">
                    <Icon className="w-5 h-5 text-gray-700" />
                  </div>
                  <div className="text-xs font-mono text-gray-400 mb-2">
                    {item.step}
                  </div>
                  <h3 className="text-sm font-semibold mb-2">{item.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="text-sm font-medium">Intelligence Platform</span>
          </div>
          <p className="text-xs text-gray-400">
            Analysis only · Read-only · No modifications
          </p>
        </div>
      </footer>
    </div>
  );
}
