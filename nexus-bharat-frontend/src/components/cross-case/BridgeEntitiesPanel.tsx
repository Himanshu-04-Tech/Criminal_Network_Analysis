"use client";

import React from "react";
import Link from "next/link";
import { BridgeEntity } from "@/types";
import {
  Network,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Flame,
  GitMerge,
  Cpu,
  Target,
} from "lucide-react";

interface BridgeEntitiesPanelProps {
  bridgeEntities: BridgeEntity[];
}

export const BridgeEntitiesPanel: React.FC<BridgeEntitiesPanelProps> = ({
  bridgeEntities,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Topological Bridge Entities
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/50 text-amber-300 font-semibold">
            {bridgeEntities.length} Key Broker Detected
          </span>
        </div>

        {/* Bridge Cards */}
        <div className="space-y-4">
          {bridgeEntities.map((bridge) => (
            <div
              key={bridge.id}
              className="bg-slate-950/80 border border-amber-500/30 hover:border-amber-500/60 rounded-xl p-4 transition-all relative overflow-hidden group shadow-md"
            >
              {/* Subtle amber gradient glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
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
                    <p className="text-xs text-slate-400">{bridge.role}</p>
                  </div>
                </div>

                {/* Score Pills */}
                <div className="flex items-center gap-2">
                  <div className="text-center px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-mono">BROKERAGE</div>
                    <div className="text-xs font-mono font-bold text-amber-300">
                      {bridge.brokerScore}
                    </div>
                  </div>
                  <div className="text-center px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-mono">INFLUENCE</div>
                    <div className="text-xs font-mono font-bold text-cyan-300">
                      {bridge.influenceScore}
                    </div>
                  </div>
                  <div className="text-center px-2.5 py-1 rounded bg-rose-950/40 border border-rose-800/50">
                    <div className="text-[10px] text-rose-400 font-mono">RISK</div>
                    <div className="text-xs font-mono font-bold text-rose-300">
                      {bridge.riskScore}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bridge Reason Analysis */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 mb-3">
                <span className="text-amber-400 font-mono font-semibold text-[10px] block mb-1 uppercase tracking-wider flex items-center gap-1.5">
                  <GitMerge className="w-3.5 h-3.5" />
                  Cross-Case Bridge Mechanics:
                </span>
                <p className="leading-relaxed text-slate-300">{bridge.bridgeReason}</p>
              </div>

              {/* Connected Cases & Jump Link */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400">
                    Bridging Investigations:
                  </span>
                  <div className="flex items-center gap-1">
                    {bridge.casesConnected.map((c, i) => (
                      <React.Fragment key={c}>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-200 font-semibold">
                          {c}
                        </span>
                        {i < bridge.casesConnected.length - 1 && (
                          <span className="text-slate-400 text-xs font-bold">↔</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <Link
                  href={`/entity/${bridge.id}`}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 hover:border-amber-500 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  <span>Investigate In Entity Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
