"use client";

import React, { useState } from "react";
import { FusionRecommendation } from "@/types";
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Layers,
  FileCheck,
  Check,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

interface FusionRecommendationProps {
  recommendation: FusionRecommendation;
}

export const FusionRecommendationCard: React.FC<FusionRecommendationProps> = ({
  recommendation,
}) => {
  const [taskForceCreated, setTaskForceCreated] = useState(false);

  const getDecisionTheme = () => {
    switch (recommendation.decision) {
      case "Merge Recommended":
        return {
          border: "border-emerald-500/40 hover:border-emerald-500/70",
          bg: "bg-emerald-950/20",
          badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          icon: CheckCircle2,
          iconColor: "text-emerald-400",
          title: "UNIFIED CASE FUSION RECOMMENDED",
          actionBtn: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30",
        };
      case "Further Review Needed":
        return {
          border: "border-amber-500/40 hover:border-amber-500/70",
          bg: "bg-amber-950/20",
          badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          icon: AlertTriangle,
          iconColor: "text-amber-400",
          title: "SUPERVISORY REVIEW REQUIRED",
          actionBtn: "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30",
        };
      default:
        return {
          border: "border-rose-500/40 hover:border-rose-500/70",
          bg: "bg-rose-950/20",
          badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
          icon: XCircle,
          iconColor: "text-rose-400",
          title: "KEEP CASES SEPARATE",
          actionBtn: "bg-slate-800 hover:bg-slate-700 text-slate-300 shadow-none",
        };
    }
  };

  const theme = getDecisionTheme();
  const IconComponent = theme.icon;

  const handleCreateTaskForce = () => {
    setTaskForceCreated(true);
  };

  return (
    <div
      className={`bg-slate-900/90 border ${theme.border} rounded-xl p-5 shadow-lg flex flex-col justify-between transition-all relative overflow-hidden h-full`}
    >
      {/* Background Subtle Glow */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Prosecution &amp; Fusion Recommendation
            </h3>
          </div>
          <span
            className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-bold tracking-wider flex items-center gap-1.5 ${theme.badge}`}
          >
            <IconComponent className="w-3.5 h-3.5" />
            {theme.title}
          </span>
        </div>

        {/* Reason & Statutory Clause */}
        <div className="space-y-2.5 my-2">
          <p className="text-xs text-slate-300 leading-relaxed">
            {recommendation.justification}
          </p>

          {/* Statutory Reference Box */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 font-mono text-cyan-400 font-semibold">
              <FileCheck className="w-3.5 h-3.5" />
              Statutory Fusion Foundation:
            </div>
            <p className="text-slate-400 font-mono">
              {recommendation.regulatoryClause}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs bg-cyan-950/30 border border-cyan-800/40 rounded-lg px-3 py-2">
            <span className="text-slate-400">Target Fusion Container:</span>
            <span className="font-mono font-bold text-cyan-300 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              {recommendation.suggestedFusionCaseId}
            </span>
          </div>
        </div>
      </div>

      {/* Action Strip */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
          <span>AI Fusion Confidence:</span>
          <span className="text-emerald-400 font-bold">{recommendation.confidence}%</span>
        </div>

        {recommendation.decision === "Merge Recommended" && (
          <button
            type="button"
            onClick={handleCreateTaskForce}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all active:scale-95 ${
              taskForceCreated
                ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-300"
                : theme.actionBtn
            }`}
          >
            {taskForceCreated ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Joint Task Force Established
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                Establish Joint Task Force
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
