"use client";

import React from "react";
import { FusionScoreResult } from "@/types";
import { Activity, Sparkles, ShieldCheck } from "lucide-react";

interface FusionScoreCardProps {
  score: FusionScoreResult;
}

export const FusionScoreCard: React.FC<FusionScoreCardProps> = ({ score }) => {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score.fusionScore / 100) * circumference;

  const getTheme = () => {
    switch (score.classification) {
      case "Extremely Strong":
        return {
          glow: "stroke-emerald-400",
          textGlow: "text-emerald-300",
          badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/40",
          label: "EXTREMELY STRONG FUSION",
        };
      case "Strong":
        return {
          glow: "stroke-cyan-400",
          textGlow: "text-cyan-300",
          badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/40",
          label: "STRONG FUSION",
        };
      case "Moderate":
        return {
          glow: "stroke-amber-400",
          textGlow: "text-amber-300",
          badge: "bg-amber-500/10 text-amber-400 border-amber-500/40",
          label: "MODERATE FUSION",
        };
      default:
        return {
          glow: "stroke-rose-400",
          textGlow: "text-rose-300",
          badge: "bg-rose-500/10 text-rose-400 border-rose-500/40",
          label: "WEAK FUSION",
        };
    }
  };

  const theme = getTheme();

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden group h-full">
      {/* Background Accent Glow */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Composite Fusion Score
            </h3>
          </div>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold tracking-wider ${theme.badge}`}
          >
            {theme.label}
          </span>
        </div>

        {/* Main Gauge and Numbers */}
        <div className="flex items-center gap-6 my-2">
          {/* Radial SVG Gauge */}
          <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 110 110">
              <circle
                cx="55"
                cy="55"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="9"
                fill="transparent"
              />
              <circle
                cx="55"
                cy="55"
                r={radius}
                className={`${theme.glow} transition-all duration-1000 ease-out`}
                strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className={`text-2xl font-bold font-mono ${theme.textGlow}`}>
                {score.fusionScore}
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                INDEX
              </span>
            </div>
          </div>

          {/* Sub-Metric Factor Weights */}
          <div className="flex-1 space-y-2">
            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-slate-400">Broker Emergence</span>
                <span className="font-mono text-amber-400 font-semibold">
                  {score.factors.brokerEmergence}%
                </span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-700"
                  style={{ width: `${score.factors.brokerEmergence}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-slate-400">Resource Signatures</span>
                <span className="font-mono text-purple-400 font-semibold">
                  {score.factors.resourceSharing}%
                </span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-700"
                  style={{ width: `${score.factors.resourceSharing}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-slate-400">Modus Operandi Fit</span>
                <span className="font-mono text-cyan-400 font-semibold">
                  {score.factors.modusOperandiFit}%
                </span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all duration-700"
                  style={{ width: `${score.factors.modusOperandiFit}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-slate-400">Density Gain</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {score.factors.networkDensityGain}%
                </span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${score.factors.networkDensityGain}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Module 6 Analytical Cohesion Model
        </span>
        <span className="font-mono text-slate-400 text-[10px]">
          Classification: {score.classification}
        </span>
      </div>
    </div>
  );
};
