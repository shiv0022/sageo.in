"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import {
  Download,
  FileText,
  Calendar,
  Loader2,
  FolderOpen,
} from "lucide-react";
import type { Report } from "@/types";

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch("/api/reports");
        if (res.ok) {
          const data = await res.json();
          setReports(data);
        }
      } catch {
        // No reports
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const reportTypeLabels: Record<string, string> = {
    website_analysis: "Website Analysis",
    competitor_analysis: "Competitor Analysis",
    seo_report: "SEO Report",
    aeo_report: "AEO Report",
    geo_report: "GEO Report",
    keyword_report: "Keyword Report",
    meta_tag_report: "Meta Tag Report",
    content_gap_report: "Content Gap Report",
    implementation_blueprint: "Implementation Blueprint",
    full_master_report: "Full Master Report",
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div
          className="animate-fade-in-up mb-8"
          style={{ opacity: 0, animationDelay: "0.1s" }}
        >
          <h1 className="text-2xl font-semibold mb-2">Reports</h1>
          <p className="text-gray-500 text-sm">
            View and download generated analysis reports.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div
            className="animate-fade-in-up text-center py-24"
            style={{ opacity: 0, animationDelay: "0.2s" }}
          >
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-8 h-8 text-gray-300" />
            </div>
            <h2 className="text-lg font-semibold mb-2 text-gray-700">
              No reports yet
            </h2>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Run an analysis to generate professional PDF reports with
              recommendations and implementation blueprints.
            </p>
          </div>
        ) : (
          <div
            className="animate-fade-in-up space-y-3"
            style={{ opacity: 0, animationDelay: "0.2s" }}
          >
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-5 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                    <FileText className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {reportTypeLabels[report.report_type] ||
                        report.report_type}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {formatDate(report.created_at)}
                    </div>
                  </div>
                </div>
                <a
                  href={report.file_url}
                  download
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
