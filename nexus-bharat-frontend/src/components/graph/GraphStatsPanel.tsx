"use client";

import React from "react";
import { Users, Share2, Network, ShieldAlert, Activity, Database } from "lucide-react";
import { GraphStatistics } from "@/types/graph";

export interface GraphStatsPanelProps {
  statistics?: GraphStatistics;
  isLoading?: boolean;
}

export function GraphStatsPanel({ statistics, isLoading }: GraphStatsPanelProps) {
  if (isLoading || !statistics) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-slate-100 border border-slate-200" />
        ))}
      </div>
    );
  }

  const items = [
    { label: "NODES", value: statistics.totalNodes, icon: Users, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { label: "EDGES", value: statistics.totalEdges, icon: Share2, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
    { label: "COMMUNITIES", value: statistics.communitiesCount, icon: Network, color: "text-purple-600 bg-purple-50 border-purple-200" },
    { label: "BROKERS", value: statistics.brokersCount, icon: ShieldAlert, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { label: "DENSITY", value: statistics.density, icon: Database, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { label: "AVG DEGREE", value: `${statistics.avgDegree} / node`, icon: Activity, color: "text-rose-600 bg-rose-50 border-rose-200" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <div
            key={it.label}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-2xs"
          >
            <div>
              <div className="text-[10px] font-mono font-semibold text-slate-500 uppercase">
                {it.label}
              </div>
              <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                {it.value}
              </div>
            </div>
            <div className={`p-2 rounded-xl border ${it.color}`}>
              <Icon className="h-4 w-4" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

