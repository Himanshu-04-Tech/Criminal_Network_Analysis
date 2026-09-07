"use client";

import React from "react";
import { Activity } from "lucide-react";
import { InfluenceMetrics } from "@/types";

export interface InfluenceScoreCardProps {
  metrics: InfluenceMetrics;
  targetId?: string;
  targetName?: string;
}

export function InfluenceScoreCard({
  metrics,
  targetId = "NETWORK BENCHMARK",
  targetName = "Global Centrality Synthesis",
}: InfluenceScoreCardProps) {
  const bars = [
    {
      label: "Influence Reach",
      val: `${metrics.reachScore}/100`,
      percent: metrics.reachScore,
      color: "bg-blue-600",
      text: "text-blue-700",
      desc: "Eigenvector centrality across multi-case graph",
    },
    {
      label: "Betweenness Bottleneck",
      val: metrics.betweenness.toFixed(3),
      percent: Math.min(Math.round(metrics.betweenness * 200), 100),
      color: "bg-amber-500",
      text: "text-amber-800",
      desc: "Inter-cluster path brokerage capacity",
    },
    {
      label: "Direct Incident Degree",
      val: `${metrics.degree} Links`,
      percent: Math.min(Math.round((metrics.degree / 20) * 100), 100),
      color: "bg-emerald-600",
      text: "text-emerald-700",
      desc: "Immediate 1-hop physical/technical associations",
    },
    {
      label: "PageRank Weight",
      val: metrics.pagerank.toFixed(3),
      percent: Math.min(Math.round(metrics.pagerank * 800), 100),
      color: "bg-purple-600",
      text: "text-purple-700",
      desc: "Recursive structural prominence index",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs font-mono flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between border-b border-slate-200 pb-3.5 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-600 shadow-2xs">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Structural Centrality Scorecard
              </h3>
              <span className="text-[10px] text-slate-500 font-semibold">{targetId}</span>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700">
            NORMALIZED 0-100
          </span>
        </div>

        <div className="space-y-4">
          {bars.map((bar) => (
            <div key={bar.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-semibold">{bar.label}</span>
                <span className={`font-bold ${bar.text}`}>{bar.val}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full ${bar.color} transition-all duration-500`}
                  style={{ width: `${bar.percent}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 font-medium">{bar.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 pt-3.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-medium">
        <span>GRAPH METRICS KERNEL</span>
        <span className="text-emerald-700 font-bold">HARMONIC RATIO OK</span>
      </div>
    </div>
  );
}

