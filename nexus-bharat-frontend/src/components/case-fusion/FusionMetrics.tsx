"use client";

import React from "react";
import { FusionMetric } from "@/types";
import {
  FolderGit2,
  Share2,
  Network,
  GitMerge,
  Smartphone,
  ShieldAlert,
  Flame,
  TrendingUp,
} from "lucide-react";

interface FusionMetricsProps {
  metrics: FusionMetric;
}

export const FusionMetrics: React.FC<FusionMetricsProps> = ({ metrics }) => {
  const cards = [
    {
      title: "Cases Merged",
      value: metrics.casesMerged,
      sublabel: "Synthesized Dossiers",
      icon: FolderGit2,
      color: "text-blue-400",
      borderColor: "border-blue-500/30",
      bgGlow: "bg-blue-500/5",
    },
    {
      title: "New Connections",
      value: metrics.newConnections,
      sublabel: "Hidden Paths Revealed",
      icon: Share2,
      color: "text-cyan-400",
      borderColor: "border-cyan-500/30",
      bgGlow: "bg-cyan-500/5",
    },
    {
      title: "Bridge Entities",
      value: metrics.bridgeEntities,
      sublabel: "Cross-Case Nexus Nodes",
      icon: Network,
      color: "text-amber-400",
      borderColor: "border-amber-500/30",
      bgGlow: "bg-amber-500/5",
    },
    {
      title: "Communities Merged",
      value: metrics.communitiesMerged,
      sublabel: "Consolidated Rings",
      icon: GitMerge,
      color: "text-purple-400",
      borderColor: "border-purple-500/30",
      bgGlow: "bg-purple-500/5",
    },
    {
      title: "Shared Resources",
      value: metrics.sharedResources,
      sublabel: "SIMs, Mules & Transport",
      icon: Smartphone,
      color: "text-emerald-400",
      borderColor: "border-emerald-500/30",
      bgGlow: "bg-emerald-500/5",
    },
    {
      title: "New Brokers",
      value: metrics.newBrokers,
      sublabel: "Emergent Bottlenecks",
      icon: Flame,
      color: "text-rose-400",
      borderColor: "border-rose-500/30",
      bgGlow: "bg-rose-500/5",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`bg-slate-900/80 border ${card.borderColor} rounded-xl p-4 shadow-md relative overflow-hidden transition-all hover:scale-[1.02]`}
          >
            <div
              className={`absolute -bottom-6 -right-6 w-16 h-16 rounded-full blur-xl pointer-events-none ${card.bgGlow}`}
            />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                {card.title}
              </span>
              <Icon className={`w-3.5 h-3.5 ${card.color}`} />
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
