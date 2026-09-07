"use client";

import React from "react";
import { CaseComparisonMetrics } from "@/types";
import {
  Users,
  Smartphone,
  Network,
  Share2,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

interface ComparisonMetricsProps {
  metrics: CaseComparisonMetrics;
}

export const ComparisonMetrics: React.FC<ComparisonMetricsProps> = ({ metrics }) => {
  const cards = [
    {
      title: "Shared Entities",
      value: metrics.sharedEntities,
      sublabel: "Cross-FIR Co-Suspects",
      icon: Users,
      color: "text-cyan-400",
      borderColor: "border-cyan-500/30",
      bgGlow: "bg-cyan-500/5",
    },
    {
      title: "Shared Resources",
      value: metrics.sharedResources,
      sublabel: "Phones, Accounts, Corridors",
      icon: Smartphone,
      color: "text-purple-400",
      borderColor: "border-purple-500/30",
      bgGlow: "bg-purple-500/5",
    },
    {
      title: "Key Brokers",
      value: metrics.bridgeCount,
      sublabel: "Topological Bridge Hubs",
      icon: Network,
      color: "text-amber-400",
      borderColor: "border-amber-500/30",
      bgGlow: "bg-amber-500/5",
    },
    {
      title: "Cross-Case Links",
      value: metrics.crossCaseEdges,
      sublabel: "Synthesized Graph Edges",
      icon: Share2,
      color: "text-emerald-400",
      borderColor: "border-emerald-500/30",
      bgGlow: "bg-emerald-500/5",
    },
    {
      title: "Syndicate Threat",
      value: `${metrics.riskScore}/100`,
      sublabel: "Critical Threat Level",
      icon: ShieldAlert,
      color: "text-rose-400",
      borderColor: "border-rose-500/30",
      bgGlow: "bg-rose-500/5",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`bg-slate-900/80 border ${card.borderColor} rounded-xl p-4 shadow-md relative overflow-hidden transition-all hover:scale-[1.02]`}
          >
            <div
              className={`absolute -bottom-6 -right-6 w-20 h-20 rounded-full blur-xl pointer-events-none ${card.bgGlow}`}
            />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {card.title}
              </span>
              <Icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono ${card.color}`}>
                {card.value}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 truncate">{card.sublabel}</p>
          </div>
        );
      })}
    </div>
  );
};
