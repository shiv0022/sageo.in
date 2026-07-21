"use client";

import { CheckCircle2, XCircle, Clock } from "lucide-react";

export interface CompareRow {
  feature: string;
  ourSupport: "yes" | "no" | "roadmap";
  competitorSupport: "yes" | "no" | "roadmap";
  description: string;
}

interface CompareTableProps {
  title: string;
  ourName: string;
  competitorName: string;
  rows: CompareRow[];
}

export function CompareTable({ title, ourName, competitorName, rows }: CompareTableProps) {
  const renderSupportIcon = (val: "yes" | "no" | "roadmap") => {
    switch (val) {
      case "yes":
        return (
          <div className="flex items-center gap-1.5 text-green-600 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-[11px]">Supported</span>
          </div>
        );
      case "roadmap":
        return (
          <div className="flex items-center gap-1.5 text-amber-600 font-semibold">
            <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span className="text-[11px]">Roadmap (Q3)</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 text-red-500 font-semibold">
            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="text-[11px]">Not Available</span>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-150 shadow-2xs overflow-hidden">
      {title && (
        <div className="bg-gray-50/50 border-b border-gray-150 px-6 py-4">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">{title}</h4>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-150 text-gray-500 font-semibold">
              <th className="px-6 py-3.5 font-semibold">Audited Capability</th>
              <th className="px-6 py-3.5 font-semibold">{ourName}</th>
              <th className="px-6 py-3.5 font-semibold">{competitorName}</th>
              <th className="px-6 py-3.5 font-semibold">Technical Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">{row.feature}</td>
                <td className="px-6 py-4">{renderSupportIcon(row.ourSupport)}</td>
                <td className="px-6 py-4">{renderSupportIcon(row.competitorSupport)}</td>
                <td className="px-6 py-4 text-gray-500 leading-normal font-sans max-w-[280px]">
                  {row.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
