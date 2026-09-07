"use client";

import React from "react";
import {
  Sparkles,
  ShieldAlert,
  Share2,
  FolderGit2,
  Zap,
  Lightbulb,
} from "lucide-react";
import { ConnectionInsight } from "@/types";

export interface ConnectionInsightsProps {
  insights: ConnectionInsight[];
}

export function ConnectionInsights({ insights }: ConnectionInsightsProps) {
  const getInsightIcon = (type: ConnectionInsight["type"]) => {
    switch (type) {
      case "BROKER":
        return <ShieldAlert className="h-4 w-4 text-amber-600" />;
      case "SHARED_RESOURCE":
        return <Share2 className="h-4 w-4 text-cyan-600" />;
      case "CROSS_CASE":
        return <FolderGit2 className="h-4 w-4 text-blue-600" />;
      case "TACTICAL":
        return <Zap className="h-4 w-4 text-red-600" />;
      default:
        return <Lightbulb className="h-4 w-4 text-emerald-600" />;
    }
  };

  const getSeverityBadge = (severity: ConnectionInsight["severity"]) => {
    switch (severity) {
      case "CRITICAL":
        return "border-red-200 bg-red-50 text-red-700";
      case "HIGH":
        return "border-amber-200 bg-amber-50 text-amber-800";
      case "MEDIUM":
        return "border-blue-200 bg-blue-50 text-blue-700";
      default:
        return "border-slate-200 bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Investigative Intelligence Insights
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800">
                AI REASONING SYNTHESIS
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Explainable topological reasoning and strategic neutralization priorities
            </p>
          </div>
        </div>

        <span className="text-[11px] text-slate-400 hidden sm:block">
          SOURCE ENGINE // MODULE 3
        </span>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2 hover:border-slate-300 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-white border border-slate-200 shadow-xs">
                  {getInsightIcon(insight.type)}
                </div>
                <h4 className="text-xs font-bold text-slate-900 truncate max-w-[220px]">
                  {insight.title}
                </h4>
              </div>

              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${getSeverityBadge(
                  insight.severity
                )}`}
              >
                {insight.severity}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              {insight.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
