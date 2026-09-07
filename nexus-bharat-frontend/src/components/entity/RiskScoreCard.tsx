"use client";

import React from "react";
import { AlertTriangle, ShieldAlert, TrendingUp, AlertOctagon } from "lucide-react";
import { motion } from "framer-motion";
import { EntityProfile } from "@/types/entity";

export interface RiskScoreCardProps {
  profile: EntityProfile;
}

export function RiskScoreCard({ profile }: RiskScoreCardProps) {
  const score = profile.riskScore;

  // Determine color and range tier
  let tierLabel = "HIGH THREAT";
  let strokeColor = "#EF4444"; // Red
  let textColor = "text-red-400";
  let bgBadge = "border-red-500/30 bg-red-500/10 text-red-400";

  if (score <= 30) {
    tierLabel = "LOW THREAT";
    strokeColor = "#10B981"; // Emerald
    textColor = "text-emerald-400";
    bgBadge = "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  } else if (score <= 70) {
    tierLabel = "MEDIUM THREAT";
    strokeColor = "#F59E0B"; // Amber
    textColor = "text-amber-400";
    bgBadge = "border-amber-500/30 bg-amber-500/10 text-amber-400";
  }

  // Circular progress math
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="flex h-full flex-col justify-between rounded-xl border border-[#1F2937] bg-[#111827] p-5 font-mono text-xs"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <h3 className="font-bold uppercase tracking-wider text-[#E5E7EB]">
              Threat Risk Assessment
            </h3>
          </div>
          <span className={`rounded px-2 py-0.5 text-[9px] font-bold border ${bgBadge}`}>
            {tierLabel}
          </span>
        </div>

        {/* Circular Progress Gauge & Score */}
        <div className="flex items-center justify-around py-2">
          <div className="relative flex items-center justify-center">
            <svg className="h-28 w-28 -rotate-90 transform">
              {/* Background Track */}
              <circle
                cx="56"
                cy="56"
                r={radius}
                className="stroke-[#0B1020]"
                strokeWidth="9"
                fill="transparent"
              />
              {/* Animated Progress Track */}
              <motion.circle
                cx="56"
                cy="56"
                r={radius}
                stroke={strokeColor}
                strokeWidth="9"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: progressOffset }}
                transition={{ duration: 1, ease: "easeOut" }}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  filter: `drop-shadow(0 0 6px ${strokeColor}80)`,
                }}
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-3xl font-black ${textColor} leading-none`}>
                {score}
              </span>
              <span className="text-[9px] text-gray-500 uppercase mt-0.5">/ 100</span>
            </div>
          </div>

          {/* Scale Legend */}
          <div className="space-y-2 text-[10px]">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-gray-400">0 - 30: Low</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-gray-400">31 - 70: Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="font-bold text-red-400">71 - 100: Critical</span>
            </div>
          </div>
        </div>

        {/* Threat Factor Flags */}
        <div className="space-y-1.5 rounded-lg border border-[#1F2937] bg-[#0B1020] p-3 text-[11px]">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
            Contributing Threat Drivers
          </div>
          <div className="flex items-center justify-between text-gray-300">
            <span>Inter-State Coordination:</span>
            <span className="text-red-400 font-bold">+35 pts</span>
          </div>
          <div className="flex items-center justify-between text-gray-300">
            <span>Burner Device Rotation:</span>
            <span className="text-amber-400 font-bold">+28 pts</span>
          </div>
          <div className="flex items-center justify-between text-gray-300">
            <span>Layering Wire Conduit:</span>
            <span className="text-red-400 font-bold">+31 pts</span>
          </div>
        </div>
      </div>

      {/* Footer Tag */}
      <div className="mt-4 pt-3 border-t border-[#1F2937] flex items-center justify-between text-[10px] text-gray-500">
        <span>ASSESSMENT MODEL: RF-v4</span>
        <span className="text-red-400">ACTION RECOMMENDED</span>
      </div>
    </motion.div>
  );
}
