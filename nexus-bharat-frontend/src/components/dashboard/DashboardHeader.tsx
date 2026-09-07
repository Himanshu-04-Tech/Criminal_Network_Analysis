"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Download, Share2, Clock } from "lucide-react";
import { motion } from "framer-motion";

export interface DashboardHeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function DashboardHeader({ onRefresh, isRefreshing }: DashboardHeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [timestamp, setTimestamp] = useState("2026-09-07 16:25:00 UTC");

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      setTimestamp(
        now.toISOString().replace("T", " ").substring(0, 19) + " UTC"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between"
    >
      {/* Title & Classification */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-xs font-semibold tracking-wider text-blue-600">
            NEXUS-BHARAT INTELLIGENCE PLATFORM
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            SYS STATUS: OPERATIONAL
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Operational Overview
        </h1>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>Last Updated:</span>
          <span className="text-slate-800 font-semibold">{mounted ? timestamp : "2026-09-07 16:25:00 UTC"}</span>
          <span className="text-slate-300">//</span>
          <span className="text-blue-600 font-semibold">NODE: DELHI-HQ-01</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Refresh telemetry data"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
            <span>{isRefreshing ? "Syncing..." : "Sync Feeds"}</span>
          </button>
        )}

        <button
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-2xs"
        >
          <Download className="h-3.5 w-3.5 text-slate-500" />
          <span>Export Report</span>
        </button>

        <Link
          href="/case-fusion"
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white transition-all shadow-sm"
        >
          <Share2 className="h-3.5 w-3.5 text-blue-100" />
          <span>Fuse Investigations</span>
        </Link>
      </div>
    </motion.div>
  );
}

