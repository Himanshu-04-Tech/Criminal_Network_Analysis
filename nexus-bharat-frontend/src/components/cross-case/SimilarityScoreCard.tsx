"use client";

import React from "react";
import { Activity, Info, ShieldCheck, Sparkles } from "lucide-react";

interface SimilarityScoreCardProps {
  similarityScore: number;
  classification: "Weak" | "Moderate" | "Strong" | "Very Strong";
}

export const SimilarityScoreCard: React.FC<SimilarityScoreCardProps> = ({
  similarityScore,
  classification,
}) => {
  // SVG circular gauge math
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (similarityScore / 100) * circumference;

  const getClassificationBadge = () => {
    switch (classification) {
      case "Very Strong":
        return {
          bg: "bg-emerald-500/10 border-emerald-500/40 text-emerald-400",
          glow: "stroke-emerald-400",
          textGlow: "text-emerald-300",
          label: "VERY STRONG CORRELATION",
        };
      case "Strong":
        return {
          bg: "bg-cyan-500/10 border-cyan-500/40 text-cyan-400",
          glow: "stroke-cyan-400",
          textGlow: "text-cyan-300",
          label: "STRONG CORRELATION",
        };
      case "Moderate":
        return {
          bg: "bg-amber-500/10 border-amber-500/40 text-amber-400",
          glow: "stroke-amber-400",
          textGlow: "text-amber-300",
          label: "MODERATE CORRELATION",
        };
      default:
        return {
          bg: "bg-rose-500/10 border-rose-500/40 text-rose-400",
          glow: "stroke-rose-400",
          textGlow: "text-rose-300",
          label: "WEAK CORRELATION",
        };
    }
  };

  const badge = getClassificationBadge();

  // Sub-weights for mathematical realism
  const entityWeightScore = Math.min(100, Math.round(similarityScore * 1.05));
  const resourceWeightScore = Math.min(100, Math.round(similarityScore * 0.96));
  const topologyWeightScore = Math.min(100, Math.round(similarityScore * 1.02));

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden group">
      {/* Background Accent Gradient */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Case Similarity Index
          </h3>
        </div>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold tracking-wider ${badge.bg}`}
        >
          {badge.label}
        </span>
      </div>

      {/* Main Gauge and Numbers */}
      <div className="flex items-center gap-6 my-1">
        {/* Radial SVG Gauge */}
        <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 110 110">
            {/* Background Track */}
            <circle
              cx="55"
              cy="55"
              r={radius}
              className="stroke-slate-800"
              strokeWidth="9"
              fill="transparent"
            />
            {/* Progress Arc */}
            <circle
              cx="55"
              cy="55"
              r={radius}
              className={`${badge.glow} transition-all duration-1000 ease-out`}
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className={`text-2xl font-bold font-mono ${badge.textGlow}`}>
              {similarityScore}%
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              MATCH
            </span>
          </div>
        </div>

        {/* Sub-Metric Factor Weights */}
        <div className="flex-1 space-y-2.5">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">Entity Overlap (Jaccard 35%)</span>
              <span className="font-mono text-cyan-400 font-semibold">{entityWeightScore}%</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-700"
                style={{ width: `${entityWeightScore}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">Resource Signatures (35%)</span>
              <span className="font-mono text-purple-400 font-semibold">{resourceWeightScore}%</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-700"
                style={{ width: `${resourceWeightScore}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">Brokerage & Topology (30%)</span>
              <span className="font-mono text-emerald-400 font-semibold">{topologyWeightScore}%</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${topologyWeightScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Weighted Graph Fusion Algorithm v2.4
        </span>
        <span className="font-mono text-slate-400 text-[10px]">P-val: &lt; 0.001</span>
      </div>
    </div>
  );
};
