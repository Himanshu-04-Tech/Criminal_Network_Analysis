"use client";

import React from "react";
import { Activity, Network, TrendingUp, Layers, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { EntityProfile } from "@/types/entity";

export interface EntityMetricsProps {
  profile: EntityProfile;
}

export function EntityMetrics({ profile }: EntityMetricsProps) {
  const m = profile.metrics;

  const metricsData = [
    {
      label: "Degree Centrality",
      val: m.degree,
      percent: Math.min(Math.round((m.degree / 20) * 100), 100),
      color: "bg-emerald-500",
      text: "text-emerald-400",
      desc: "Direct incident connections",
    },
    {
      label: "Betweenness Bottleneck",
      val: m.betweenness,
      percent: Math.min(Math.round((m.betweenness / 0.5) * 100), 100),
      color: "bg-amber-500",
      text: "text-amber-400",
      desc: "Shortest path bridging score",
    },
    {
      label: "Eigenvector Influence",
      val: m.eigenvector,
      percent: Math.min(Math.round(m.eigenvector * 100), 100),
      color: "bg-blue-500",
      text: "text-blue-400",
      desc: "Connection to powerful hubs",
    },
    {
      label: "Clustering Coefficient",
      val: m.clusteringCoeff,
      percent: Math.min(Math.round(m.clusteringCoeff * 100), 100),
      color: "bg-purple-500",
      text: "text-purple-400",
      desc: "Inter-associate density",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.35 }}
      className="flex h-full flex-col justify-between rounded-xl border border-[#1F2937] bg-[#111827] p-5 font-mono text-xs space-y-4"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1F2937] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            <div>
              <h3 className="font-bold uppercase tracking-wider text-[#E5E7EB]">
                Topological Graph Metrics
              </h3>
              <p className="text-[11px] text-gray-400">
                Network centrality calculations computed by Graph Analytics Engine
              </p>
            </div>
          </div>

          <span className="rounded border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-bold text-cyan-300">
            NETWORKX ANALYTICS
          </span>
        </div>

        {/* Visual Progress Indicators */}
        <div className="space-y-3.5">
          {metricsData.map((item) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300">{item.label}</span>
                <span className={`font-bold ${item.text}`}>{item.val}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#0B1020] border border-[#1F2937]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${item.color}`}
                />
              </div>
              <div className="text-[10px] text-gray-500">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-[#1F2937] text-[10px] text-gray-500 flex justify-between">
        <span>GRAPH: In-Memory MultiDiGraph</span>
        <span className="text-emerald-400">CENTRALITY: HIGH</span>
      </div>
    </motion.div>
  );
}
