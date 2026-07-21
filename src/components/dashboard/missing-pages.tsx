"use client";

import { Sparkles, FileText, CheckCircle2 } from "lucide-react";
import type { IAuditDocument } from "@/types/domain";

interface MissingPagesProps {
  auditDoc: IAuditDocument;
  crawlData?: any;
}

export function MissingPages({ auditDoc, crawlData }: MissingPagesProps) {
  if (!auditDoc) return null;

  const siteIntent = auditDoc.intent?.primaryType || "corporate";
  const pages = crawlData?.pages || [];
  const urls = pages.map((p: any) => new URL(p.url).pathname);

  // Define recommendations based on site intent
  const pageTemplates: Record<string, { path: string; name: string; desc: string; priority: "high" | "medium" | "low"; value: string }[]> = {
    ecommerce: [
      { path: "/privacy-policy", name: "Privacy Policy", desc: "Mandatory compliance page for user trust and ad campaign approval.", priority: "high", value: "Trust & Ads Approval" },
      { path: "/shipping-returns", name: "Shipping & Returns", desc: "Critical transparency for conversions and consumer rights.", priority: "high", value: "Conversion Boost" },
      { path: "/terms-of-service", name: "Terms of Service", desc: "Legal protection defining purchases, disputes, and rules.", priority: "medium", value: "Liability Limit" },
      { path: "/about", name: "About Us", desc: "Essential for brand credibility, human touch, and E-E-A-T rating.", priority: "medium", value: "E-E-A-T Trust" }
    ],
    saas: [
      { path: "/privacy-policy", name: "Privacy Policy", desc: "GDPR compliance defining data capture, storage, and processing rules.", priority: "high", value: "GDPR Compliance" },
      { path: "/terms", name: "Terms & Conditions", desc: "Protects proprietary software, subscriptions, and limits liability.", priority: "high", value: "Legal Safety" },
      { path: "/pricing", name: "Pricing Page", desc: "Primary page for conversions, showing plans and features clearly.", priority: "high", value: "Conversion Driver" },
      { path: "/security", name: "Security Compliance", desc: "Required for enterprise deals, showcasing SOC2/GDPR adherence.", priority: "medium", value: "Enterprise Sales" }
    ],
    corporate: [
      { path: "/about", name: "About Us", desc: "The core page describing company history, leadership, and mission.", priority: "high", value: "Brand Authority" },
      { path: "/contact", name: "Contact Page", desc: "Action page for inquiries, including address, maps, and forms.", priority: "high", value: "Lead Acquisition" },
      { path: "/privacy-policy", name: "Privacy Policy", desc: "Essential compliance page listing data usage policies.", priority: "medium", value: "Compliance" },
      { path: "/services", name: "Services", desc: "Direct listing of company capabilities and client solution sets.", priority: "high", value: "SEO Landing Target" }
    ]
  };

  // Fallback to corporate if none exists
  const activeTemplate = pageTemplates[siteIntent] || pageTemplates.corporate;

  // Check which pages are missing
  const missingPagesList = activeTemplate.filter(tpl => !urls.includes(tpl.path));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 premium-shadow space-y-6">
      <div className="flex items-center justify-between border-b border-gray-50 pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Suggested Missing Pages
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Pages recommended to complete your site architecture and compliance.</p>
        </div>
        <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full text-[10px] font-semibold text-gray-500 border border-gray-100">
          <Sparkles className="w-2.5 h-2.5 text-yellow-500" />
          Suggested from Analysis
        </span>
      </div>

      {missingPagesList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800">All Standard Pages Present</h4>
            <p className="text-xs text-gray-500 mt-1">Our audit found no missing critical structural or compliance pages.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {missingPagesList.map((page, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors bg-gray-50/20"
            >
              <div className="flex gap-3 items-start">
                <div className="p-2 rounded-lg bg-gray-100 text-gray-500 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    {page.name}
                    <span className="text-[10px] text-gray-400 font-mono font-medium">{page.path}</span>
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-lg">{page.desc}</p>
                </div>
              </div>

              <div className="flex flex-col items-end justify-between h-full space-y-2">
                <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                  page.priority === "high" ? "bg-red-50 text-red-600" :
                  page.priority === "medium" ? "bg-yellow-50 text-yellow-600" :
                  "bg-blue-50 text-blue-600"
                }`}>
                  {page.priority} priority
                </span>
                <span className="text-[10px] text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-md">
                  {page.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
