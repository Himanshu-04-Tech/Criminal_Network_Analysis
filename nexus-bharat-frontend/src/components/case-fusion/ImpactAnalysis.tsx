"use client";

import React from "react";
import { ImpactAnalysisData } from "@/types";
import {
  TrendingUp,
  ShieldAlert,
  FileCheck2,
  Share2,
  Flame,
  Zap,
} from "lucide-react";

interface ImpactAnalysisProps {
  impactAnalysis: ImpactAnalysisData;
}

export const ImpactAnalysis: React.FC<ImpactAnalysisProps> = ({ impactAnalysis }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Investigation Impact Analysis
          </h3>
        </div>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${
            impactAnalysis.investigationPriority === "CRITICAL"
              ? "bg-rose-500/10 border-rose-500/40 text-rose-400"
              : "bg-amber-500/10 border-amber-500/40 text-amber-400"
          }`}
        >
          PRIORITY: {impactAnalysis.investigationPriority}
        </span>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400">
            Intelligence Findings
          </div>
          <div className="text-xl font-bold font-mono text-cyan-300">
            {impactAnalysis.newIntelligenceCount} New Leads
          </div>
          <p className="text-[11px] text-slate-400">Uncovered cross-case forensic trails</p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400">
            Hidden Paths Revealed
          </div>
          <div className="text-xl font-bold font-mono text-emerald-300">
            {impactAnalysis.hiddenLinksRevealed} Direct Links
          </div>
          <p className="text-[11px] text-slate-400">Connecting previously siloed actors</p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400">
            Network Expansion
          </div>
          <div className="text-xl font-bold font-mono text-purple-300">
            {impactAnalysis.networkExpansionRate}
          </div>
          <p className="text-[11px] text-slate-400">Gain in graph topological density</p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400">
            Combined Syndicate Threat
          </div>
          <div className="text-xl font-bold font-mono text-rose-400">
            {impactAnalysis.syndicateThreatLevel} / 100
          </div>
          <p className="text-[11px] text-slate-400">{impactAnalysis.prosecutionStrength}</p>
        </div>
      </div>
    </div>
  );
};
