"use client";

import React from "react";
import {
  Sparkles,
  ShieldAlert,
  TrendingUp,
  Share2,
  Layers,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { NetworkInsight } from "@/types";

export interface InvestigationInsightsProps {
  insights: NetworkInsight[];
}

export function InvestigationInsights({ insights }: InvestigationInsightsProps) {
  const getInsightIcon = (type: NetworkInsight["type"]) => {
    switch (type) {
      case "BROKER":
        return <ShieldAlert className="h-4 w-4 text-amber-600" />;
      case "INFLUENCE":
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case "RESOURCE":
        return <Share2 className="h-4 w-4 text-cyan-700" />;
      case "COMMUNITY":
        return <Layers className="h-4 w-4 text-purple-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const getPriorityBadge = (priority: NetworkInsight["priority"]) => {
    switch (priority) {
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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3.5 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 shadow-2xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Investigative Role Findings &amp; Tactical Recommendations
              </h3>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800">
                AI REASONING
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Automated intelligence insights derived from centrality, community reach, and cross-case bridging
            </p>
          </div>
        </div>

        <span className="text-[10px] text-slate-400 font-medium hidden sm:block">
          MODULE 4 // EXPLAINABLE REASONING
        </span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((ins) => (
          <div
            key={ins.id}
            className="rounded-xl border border-slate-200 bg-slate-50/70 p-4.5 space-y-2.5 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  {getInsightIcon(ins.type)}
                </div>
                <h4 className="text-xs font-bold text-slate-900 truncate max-w-[260px]">
                  {ins.title}
                </h4>
              </div>

              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${getPriorityBadge(
                  ins.priority
                )}`}
              >
                {ins.priority}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              {ins.description}
            </p>

            <div className="flex items-center justify-between pt-2.5 border-t border-slate-200 text-[10px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {ins.timestamp}
              </span>
              <span className="text-amber-800 font-bold">ACTIONABLE INTEL</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

