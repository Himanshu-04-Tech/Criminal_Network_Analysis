"use client";

import React from "react";
import { Zap, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export interface ConnectionStrengthCardProps {
  strength: number; // 0 - 100
  confidenceLabel?: string;
}

export function ConnectionStrengthCard({
  strength,
  confidenceLabel = "ALGORITHMIC CONFIDENCE",
}: ConnectionStrengthCardProps) {
  // Ranges: 0-30 Weak, 31-70 Moderate, 71-100 Strong
  let tierLabel = "STRONG LINK";
  let strokeColor = "#10B981"; // Emerald
  let textColor = "text-emerald-700";
  let badgeBg = "border-emerald-200 bg-emerald-50 text-emerald-800";

  if (strength <= 30) {
    tierLabel = "WEAK LINK";
    strokeColor = "#94A3B8"; // Slate
    textColor = "text-slate-600";
    badgeBg = "border-slate-200 bg-slate-100 text-slate-700";
  } else if (strength <= 70) {
    tierLabel = "MODERATE LINK";
    strokeColor = "#F59E0B"; // Amber
    textColor = "text-amber-800";
    badgeBg = "border-amber-200 bg-amber-50 text-amber-800";
  }

  // Circular gauge math
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (strength / 100) * circumference;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs font-mono flex flex-col justify-between h-full">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3.5 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-600 shadow-2xs">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Connection Strength
              </h3>
              <span className="text-[10px] text-slate-500 font-semibold">PATHWAY COHESION INDEX</span>
            </div>
          </div>

          <span
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${badgeBg}`}
          >
            {tierLabel}
          </span>
        </div>

        {/* Circular Gauge and Score */}
        <div className="flex items-center justify-center py-5">
          <div className="relative flex items-center justify-center">
            <svg className="h-28 w-28 -rotate-90 transform" viewBox="0 0 100 100">
              {/* Background ring */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-slate-100"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Progress ring */}
              <motion.circle
                cx="50"
                cy="50"
                r={radius}
                stroke={strokeColor}
                strokeWidth="8"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner text */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className={`text-2xl font-black leading-none ${textColor}`}>
                {strength}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 mt-0.5">/ 100</span>
            </div>
          </div>
        </div>

        {/* Range Reference Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
            <span>0-30 Weak</span>
            <span>31-70 Moderate</span>
            <span>71-100 Strong</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 flex overflow-hidden border border-slate-200">
            <div className="w-[30%] bg-slate-300" />
            <div className="w-[40%] bg-amber-400" />
            <div className="w-[30%] bg-emerald-500" />
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-5 pt-3.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-medium">
        <span className="flex items-center gap-1 text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          {confidenceLabel}
        </span>
        <span className="text-slate-700 font-bold">{strength >= 70 ? "HIGH INTEGRITY" : "SUB-CRITICAL"}</span>
      </div>
    </div>
  );
}

