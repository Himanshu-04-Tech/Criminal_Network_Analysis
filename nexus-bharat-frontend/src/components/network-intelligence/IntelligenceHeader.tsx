"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Download,
  Compass,
  RefreshCw,
} from "lucide-react";

export interface IntelligenceHeaderProps {
  onRefresh?: () => void;
  onExport?: () => void;
}

export function IntelligenceHeader({ onRefresh, onExport }: IntelligenceHeaderProps) {
  return (
    <div className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-40 px-6 py-4 font-mono shadow-2xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title and Engine Telemetry */}
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 shadow-2xs">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-wider">
                  NETWORK ROLE INTELLIGENCE
                </h1>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                  MODULE 4 // ROLE ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Topological role classification, broker identification, influence mapping, and critical target prioritization
              </p>
            </div>
          </div>
        </div>

        {/* Actions & Links */}
        <div className="flex items-center gap-2.5 self-start md:self-auto text-xs">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-all shadow-2xs"
              title="Recalculate Centrality"
            >
              <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Recalculate</span>
            </button>
          )}

          {onExport && (
            <button
              onClick={onExport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-all shadow-2xs"
              title="Export Intelligence Sheet"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Export Sheet</span>
            </button>
          )}

          <Link
            href="/network-explorer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm"
          >
            <Compass className="h-3.5 w-3.5 text-blue-100" />
            <span>Link Explorer</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

