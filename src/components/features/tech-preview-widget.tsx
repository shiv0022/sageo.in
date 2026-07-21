"use client";

import { useState } from "react";
import { Sparkles, Clock, ShieldCheck, XCircle } from "lucide-react";

export function TechPreviewWidget() {
  const [lcp, setLcp] = useState(1800);
  const [fcp, setFcp] = useState(1200);
  const [hasHttps, setHasHttps] = useState(true);
  const [hasCsp, setHasCsp] = useState(false);
  const [hasHsts, setHasHsts] = useState(true);

  // Status mapping
  const getLcpStatus = (val: number) => {
    if (val <= 2500) return { label: "Good", color: "text-green-600", bg: "bg-green-500" };
    if (val <= 4000) return { label: "Needs Improvement", color: "text-yellow-600", bg: "bg-yellow-500" };
    return { label: "Poor", color: "text-red-600", bg: "bg-red-500" };
  };

  const getFcpStatus = (val: number) => {
    if (val <= 1800) return { label: "Good", color: "text-green-600", bg: "bg-green-500" };
    if (val <= 3000) return { label: "Needs Improvement", color: "text-yellow-600", bg: "bg-yellow-500" };
    return { label: "Poor", color: "text-red-600", bg: "bg-red-500" };
  };

  const lcpStatus = getLcpStatus(lcp);
  const fcpStatus = getFcpStatus(fcp);

  // Score calculation
  let securityPoints = 0;
  if (hasHttps) securityPoints += 50;
  if (hasCsp) securityPoints += 30;
  if (hasHsts) securityPoints += 20;

  let speedPoints = 100;
  if (lcp > 2500) speedPoints -= 20;
  if (lcp > 4000) speedPoints -= 20;
  if (fcp > 1800) speedPoints -= 30;
  if (fcp > 3000) speedPoints -= 30;

  const totalScore = Math.round((securityPoints + speedPoints) / 2);

  return (
    <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-purple-600" />
          Technical & Performance Scoring Simulator
        </h4>
        <span className="text-[10px] bg-purple-50 text-purple-600 font-semibold px-2 py-0.5 rounded-full">
          Core Web Vitals Audit
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sliders */}
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-gray-600">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Largest Contentful Paint (LCP)
              </span>
              <span className={lcpStatus.color}>{lcp}ms ({lcpStatus.label})</span>
            </div>
            <input
              type="range"
              min={500}
              max={5000}
              step={100}
              value={lcp}
              onChange={(e) => setLcp(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-gray-600">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                First Contentful Paint (FCP)
              </span>
              <span className={fcpStatus.color}>{fcp}ms ({fcpStatus.label})</span>
            </div>
            <input
              type="range"
              min={300}
              max={3000}
              step={100}
              value={fcp}
              onChange={(e) => setFcp(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>
        </div>

        {/* Checkboxes & Score */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600">Calculated Tech Score</span>
            <span className={`text-sm font-bold ${totalScore >= 80 ? "text-green-600" : totalScore >= 50 ? "text-yellow-600" : "text-red-600"}`}>
              {totalScore}/100
            </span>
          </div>

          {/* Security Headers checklist */}
          <div className="space-y-2">
            <button
              onClick={() => setHasHttps(!hasHttps)}
              className="flex items-center gap-2 text-xs font-medium text-gray-700 w-full text-left cursor-pointer"
            >
              {hasHttps ? (
                <ShieldCheck className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span>Inforce HTTPS SSL certificate (Weight: 50%)</span>
            </button>

            <button
              onClick={() => setHasCsp(!hasCsp)}
              className="flex items-center gap-2 text-xs font-medium text-gray-700 w-full text-left cursor-pointer"
            >
              {hasCsp ? (
                <ShieldCheck className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span>Content Security Policy CSP Header (Weight: 30%)</span>
            </button>

            <button
              onClick={() => setHasHsts(!hasHsts)}
              className="flex items-center gap-2 text-xs font-medium text-gray-700 w-full text-left cursor-pointer"
            >
              {hasHsts ? (
                <ShieldCheck className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span>Strict-Transport-Security HSTS (Weight: 20%)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
