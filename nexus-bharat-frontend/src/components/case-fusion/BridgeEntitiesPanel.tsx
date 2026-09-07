"use client";

import React from "react";
import Link from "next/link";
import { FusionBridgeEntity } from "@/types";
import {
  Network,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Target,
  GitFork,
} from "lucide-react";

interface BridgeEntitiesPanelProps {
  bridgeEntities: FusionBridgeEntity[];
}

export const BridgeEntitiesPanel: React.FC<BridgeEntitiesPanelProps> = ({
  bridgeEntities,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Emergent Cross-Case Bridge Brokers
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/50 text-amber-300 font-semibold">
          {bridgeEntities.length} Brokers Identified
        </span>
      </div>

      {/* Scrollable Bridge Cards */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1.5 custom-scrollbar">
        {bridgeEntities.map((bridge) => (
          <div
            key={bridge.id}
            className="bg-slate-950/80 border border-slate-800/90 hover:border-amber-500/50 rounded-xl p-3.5 transition-all relative overflow-hidden group shadow-md"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-950/50 border border-amber-800/50 text-amber-400">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-amber-400">
                      {bridge.id}
                    </span>
                    <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-200 transition-colors">
                      {bridge.name}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-400">{bridge.role}</p>
                </div>
              </div>

              {/* Centrality & Brokerage Pills */}
              <div className="flex items-center gap-2">
                <div className="text-center px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                  <div className="text-[9px] text-slate-400 font-mono">BETWEENNESS</div>
                  <div className="text-xs font-mono font-bold text-amber-300">
                    {bridge.betweennessCentrality}
                  </div>
                </div>
                <div className="text-center px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                  <div className="text-[9px] text-slate-400 font-mono">INFLUENCE</div>
                  <div className="text-xs font-mono font-bold text-cyan-300">
                    {bridge.influenceScore}
                  </div>
                </div>
                <div className="text-center px-2 py-0.5 rounded bg-rose-950/40 border border-rose-800/50">
                  <div className="text-[9px] text-rose-400 font-mono">RISK</div>
                  <div className="text-xs font-mono font-bold text-rose-300">
                    {bridge.riskScore}
                  </div>
                </div>
              </div>
            </div>

            {/* Bridge Reason Analysis */}
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 mb-2.5">
              {bridge.bridgeReason}
            </p>

            {/* Footer with Connected Cases & Entity Link */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-[10px] uppercase text-slate-400">Connected FIRs:</span>
                {bridge.casesConnected.map((c) => (
                  <span
                    key={c}
                    className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300 font-semibold"
                  >
                    {c}
                  </span>
                ))}
              </div>

              {bridge.type === "PERSON" && (
                <Link
                  href={`/entity/${bridge.id}`}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 hover:border-amber-500 text-amber-300 text-[11px] font-semibold flex items-center gap-1 transition-all active:scale-95"
                >
                  <span>Entity Profile</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
