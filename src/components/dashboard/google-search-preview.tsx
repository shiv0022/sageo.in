"use client";

import { useState } from "react";
import { Monitor, Smartphone, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import type { IAuditDocument } from "@/types/domain";

interface GoogleSearchPreviewProps {
  auditDoc: IAuditDocument;
  crawlData?: any;
}

export function GoogleSearchPreview({ auditDoc, crawlData }: GoogleSearchPreviewProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const landingPage = crawlData?.pages?.[0] || {};
  const currentTitle = landingPage?.title || "No Title Found";
  const currentDesc = landingPage?.metaTags?.description || "No description found. Please write a description.";
  const siteUrl = auditDoc?.targetUrl || "https://example.com";
  const parsedUrl = new URL(siteUrl);

  const titleLength = currentTitle.length;
  const descLength = currentDesc.length;

  const isTitleOptimal = titleLength >= 30 && titleLength <= 65;
  const isDescOptimal = descLength >= 110 && descLength <= 160;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 premium-shadow space-y-6">
      <div className="flex items-center justify-between border-b border-gray-50 pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Google Search Preview
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">See how your homepage appears in Google search engine listings.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-50 rounded-lg p-0.5 border border-gray-100">
            <button
              onClick={() => setDevice("desktop")}
              className={`p-1.5 rounded-md transition-all ${
                device === "desktop" ? "bg-white text-gray-900 shadow-xs" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`p-1.5 rounded-md transition-all ${
                device === "mobile" ? "bg-white text-gray-900 shadow-xs" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
          <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full text-[10px] font-semibold text-gray-500 border border-gray-100">
            <Sparkles className="w-2.5 h-2.5 text-yellow-500" />
            Generated from Analysis
          </span>
        </div>
      </div>

      {/* Actual Simulation Box */}
      <div className="flex justify-center bg-gray-50/50 p-6 rounded-xl border border-gray-100">
        <div
          className={`w-full bg-white p-5 rounded-lg border border-gray-200/60 shadow-xs font-sans ${
            device === "mobile" ? "max-w-[360px]" : "max-w-[600px]"
          }`}
        >
          {/* Breadcrumb / Site URL */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1 truncate">
            <span className="font-semibold text-gray-800">{parsedUrl.hostname}</span>
            <span>›</span>
            <span>home</span>
          </div>

          {/* Title tag */}
          <h4 className="text-[#1a0dab] hover:underline font-medium cursor-pointer text-lg leading-tight mb-1 font-sans">
            {currentTitle.length > 70 ? `${currentTitle.substring(0, 67)}...` : currentTitle}
          </h4>

          {/* Snippet Meta description */}
          <p className="text-[#4d5156] text-sm leading-normal font-sans">
            {currentDesc.length > 165 ? `${currentDesc.substring(0, 160)}...` : currentDesc}
          </p>
        </div>
      </div>

      {/* Metrics & indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700">Title Tag Length</span>
            <span className="text-xs text-gray-500">{titleLength} chars</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${isTitleOptimal ? "bg-green-500" : "bg-yellow-500"}`}
              style={{ width: `${Math.min(100, (titleLength / 70) * 100)}%` }}
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {isTitleOptimal ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                <span className="text-green-600 font-medium">Optimal (30-65 chars)</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-yellow-500" />
                <span className="text-yellow-600 font-medium">
                  {titleLength < 30 ? "Too short (under 30 chars)" : "Too long (truncates in SERP)"}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700">Description Length</span>
            <span className="text-xs text-gray-500">{descLength} chars</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${isDescOptimal ? "bg-green-500" : "bg-yellow-500"}`}
              style={{ width: `${Math.min(100, (descLength / 180) * 100)}%` }}
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {isDescOptimal ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                <span className="text-green-600 font-medium">Optimal (110-160 chars)</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-yellow-500" />
                <span className="text-yellow-600 font-medium">
                  {descLength < 110 ? "Too short (under 110 chars)" : "Too long (truncates in SERP)"}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
