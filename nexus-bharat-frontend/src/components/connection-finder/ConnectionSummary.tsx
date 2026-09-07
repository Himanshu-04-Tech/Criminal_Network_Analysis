"use client";

import React from "react";
import { GitBranch, Activity, ShieldAlert, Share2 } from "lucide-react";
import { motion } from "framer-motion";

export interface ConnectionSummaryProps {
  hops: number;
  strength: number;
  bridgeCount: number;
  sharedResourceCount: number;
}

export function ConnectionSummary({
  hops,
  strength,
  bridgeCount,
  sharedResourceCount,
}: ConnectionSummaryProps) {
  const cards = [
    {
      label: "PATH LENGTH",
      value: `${hops} Hops`,
      sub: `${hops + 1} Entities in chain`,
      icon: GitBranch,
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-200",
    },
    {
      label: "CONNECTION STRENGTH",
      value: `${strength}%`,
      sub: strength >= 70 ? "Strong Link Affinity" : "Moderate Link",
      icon: Activity,
      color: strength >= 70 ? "text-emerald-700" : "text-amber-700",
      bg: strength >= 70 ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200",
    },
    {
      label: "BRIDGE ENTITIES",
      value: `${bridgeCount}`,
      sub: bridgeCount > 0 ? "Critical Bottleneck" : "Direct Linkage",
      icon: ShieldAlert,
      color: "text-amber-700",
      bg: "bg-amber-50 border-amber-200",
    },
    {
      label: "SHARED RESOURCES",
      value: `${sharedResourceCount}`,
      sub: "Common Burners / Shells",
      icon: Share2,
      color: "text-cyan-700",
      bg: "bg-cyan-50 border-cyan-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between"
          >
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                {c.label}
              </div>
              <div className={`text-xl font-bold mt-1 ${c.color}`}>{c.value}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{c.sub}</div>
            </div>

            <div className={`p-2.5 rounded-xl border ${c.bg} ${c.color}`}>
              <Icon className="h-5 w-5" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
