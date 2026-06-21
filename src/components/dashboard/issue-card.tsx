"use client";

import {
  AlertTriangle,
  ArrowUp,
  ChevronRight,
  Info,
  XCircle,
} from "lucide-react";
import type { Issue, Priority } from "@/types";

const priorityConfig: Record<
  Priority,
  { icon: typeof AlertTriangle; color: string; bg: string; label: string }
> = {
  critical: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    label: "Critical",
  },
  high: {
    icon: AlertTriangle,
    color: "text-orange-600",
    bg: "bg-orange-50",
    label: "High",
  },
  medium: {
    icon: ArrowUp,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    label: "Medium",
  },
  low: {
    icon: Info,
    color: "text-blue-600",
    bg: "bg-blue-50",
    label: "Low",
  },
};

interface IssueCardProps {
  issue: Issue;
  onClick?: () => void;
}

export function IssueCard({ issue, onClick }: IssueCardProps) {
  const config = priorityConfig[issue.priority];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 group"
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${config.bg} flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {issue.title}
            </h4>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}
            >
              {config.label}
            </span>
          </div>
          <p className="text-xs text-gray-500 line-clamp-2">
            {issue.description}
          </p>
          <div className="flex items-center gap-3 mt-2">
            {issue.impact && (
              <span className="text-xs text-gray-400">
                Impact: {issue.impact}
              </span>
            )}
            {issue.confidence > 0 && (
              <span className="text-xs text-gray-400">
                {issue.confidence}% confidence
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0 mt-1" />
      </div>
    </button>
  );
}

interface IssueListProps {
  issues: Issue[];
  maxItems?: number;
}

export function IssueList({ issues, maxItems }: IssueListProps) {
  const displayed = maxItems ? issues.slice(0, maxItems) : issues;

  if (displayed.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-gray-400">
        No issues found
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayed.map((issue) => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  );
}
