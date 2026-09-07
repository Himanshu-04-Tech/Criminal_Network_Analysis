"use client";

import React from "react";
import { Activity, ShieldCheck, Layers, Share2, Database, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { DashboardMetrics } from "@/types/dashboard";

export interface NetworkHealthCardProps {
  metrics?: DashboardMetrics;
  isLoading?: boolean;
}

export function NetworkHealthCard({ metrics, isLoading }: NetworkHealthCardProps) {
  if (isLoading || !metrics) {
    return (
      <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-xs animate-pulse">
        <div className="h-4 w-36 rounded bg-slate-100 mb-6" />
        <div className="space-y-4">
          <div className="h-10 rounded-xl bg-slate-100" />
          <div className="h-10 rounded-xl bg-slate-100" />
          <div className="h-10 rounded-xl bg-slate-100" />
          <div className="h-10 rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }

  // Visual percentages for progress indicators
  const densityPercent = Math.min(Math.round((metrics.networkDensity / 0.5) * 100), 100);
  const componentsPercent = Math.min(Math.round((metrics.connectedComponents / 15) * 100), 100);
  const resourcesPercent = Math.min(Math.round((metrics.sharedResources / 25) * 100), 100);
  const avgDegreePercent = Math.min(Math.round((metrics.avgConnections / 8) * 100), 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3.5 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 shadow-2xs">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
                Network Health & Topology
              </h3>
              <p className="text-[11px] text-slate-500">
                Structural integrity metrics from Graph Engine
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
            CONSOLIDATED
          </span>
        </div>

        {/* Health Indicators Grid */}
        <div className="space-y-4.5">
          {/* 1. Network Density */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-700 font-medium flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-blue-600" />
                Network Density
              </span>
              <span className="font-bold text-blue-700">{metrics.networkDensity}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${densityPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-blue-600 rounded-full shadow-2xs"
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Sparse (0.05)</span>
              <span className="text-slate-600 font-semibold">+118% growth</span>
              <span>Tight (0.50)</span>
            </div>
          </div>

          {/* 2. Connected Components */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-700 font-medium flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-indigo-600" />
                Connected Components
              </span>
              <span className="font-bold text-indigo-700">{metrics.connectedComponents} Subgraphs</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${componentsPercent}%` }}
                transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                className="h-full bg-indigo-600 rounded-full shadow-2xs"
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Isolated (15+)</span>
              <span className="text-emerald-700 font-semibold">Consolidated from 12</span>
              <span>Unified (1)</span>
            </div>
          </div>

          {/* 3. Shared Resources */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-700 font-medium flex items-center gap-1.5">
                <Share2 className="h-3.5 w-3.5 text-amber-600" />
                Shared Resources
              </span>
              <span className="font-bold text-amber-700">{metrics.sharedResources} Artifacts</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${resourcesPercent}%` }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="h-full bg-amber-500 rounded-full shadow-2xs"
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Phones / Burners (7)</span>
              <span>Accounts (5)</span>
              <span>Vehicles (3)</span>
            </div>
          </div>

          {/* 4. Average Connections */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-700 font-medium flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Average Connections (Degree)
              </span>
              <span className="font-bold text-emerald-700">{metrics.avgConnections} / node</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${avgDegreePercent}%` }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                className="h-full bg-emerald-500 rounded-full shadow-2xs"
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Low (1.5)</span>
              <span className="text-slate-600 font-semibold">Hub capacity: High</span>
              <span>High (8.0+)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Footnote */}
      <div className="mt-5 pt-3.5 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span>GRAPH MODEL: MultiDiGraph</span>
        <span className="text-emerald-700 font-bold">DIAGNOSTIC: STABLE</span>
      </div>
    </motion.div>
  );
}

