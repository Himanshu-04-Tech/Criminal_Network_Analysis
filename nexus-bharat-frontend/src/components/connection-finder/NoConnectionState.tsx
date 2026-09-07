"use client";

import React from "react";
import { AlertCircle, Sliders, ArrowUpRight, Compass, ShieldOff } from "lucide-react";

export interface NoConnectionStateProps {
  source: string;
  target: string;
  depth: number;
  onIncreaseDepth: () => void;
}

export function NoConnectionState({
  source,
  target,
  depth,
  onIncreaseDepth,
}: NoConnectionStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-[#1F2937] bg-[#111827]/70 p-12 text-center font-mono space-y-4 shadow-xl">
      <div className="mx-auto w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
        <ShieldOff className="h-7 w-7" />
      </div>

      <div className="max-w-md mx-auto space-y-1.5">
        <h3 className="text-base font-bold text-white uppercase tracking-wider">
          No Discovered Path Within {depth} Hops
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          No indirect relationships or shared operational relays were discovered between{" "}
          <span className="text-blue-400 font-bold">{source}</span> and{" "}
          <span className="text-cyan-400 font-bold">{target}</span> within the specified search depth.
        </p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onIncreaseDepth}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-900/30 font-mono"
        >
          <Sliders className="h-4 w-4" />
          <span>Increase Search Depth to {Math.min(depth + 2, 8)} Hops</span>
        </button>
      </div>

      <div className="pt-4 text-[10px] text-gray-500 uppercase tracking-wider">
        STATUS: 0 GRAPH PATHWAYS DISCOVERED // RE-RUN WITH RELAXED CONSTRAINTS
      </div>
    </div>
  );
}
