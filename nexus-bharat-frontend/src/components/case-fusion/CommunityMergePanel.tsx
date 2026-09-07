"use client";

import React from "react";
import { CommunityChange } from "@/types";
import { GitMerge, Users, ArrowRight, UserCheck, Layers } from "lucide-react";

interface CommunityMergePanelProps {
  communityChange: CommunityChange;
}

export const CommunityMergePanel: React.FC<CommunityMergePanelProps> = ({
  communityChange,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <GitMerge className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Community Consolidation Analysis
          </h3>
        </div>

        {/* Counter Summary Strip */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
            Before: <span className="font-bold text-slate-100">{communityChange.communitiesBefore}</span>
          </div>
          <span className="text-slate-400">→</span>
          <div className="px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-800/50 text-purple-300">
            After: <span className="font-bold">{communityChange.communitiesAfter} Unified</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-emerald-950/50 border border-emerald-800/50 text-emerald-300 font-semibold">
            {communityChange.mergedCommunitiesCount} Merged
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        {communityChange.consolidationSummary}
      </p>

      {/* Visual Merge Flow Diagram */}
      <div className="space-y-3">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
          Algorithmic Cluster Convergence Mapping (Louvain Modularity):
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {communityChange.mappings.map((m, idx) => (
            <div
              key={idx}
              className="bg-slate-950/80 border border-slate-800/90 hover:border-purple-500/40 rounded-xl p-4 transition-all space-y-3"
            >
              {/* Converging Sub-Clusters */}
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1.5">
                  Isolated Departmental Clusters:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {m.fromCommunities.map((fc, i) => (
                    <React.Fragment key={fc}>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        {fc}
                      </span>
                      {i < m.fromCommunities.length - 1 && (
                        <span className="text-slate-400 font-bold text-xs">+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Visual Flow Arrow */}
              <div className="flex items-center gap-2 text-xs font-mono text-purple-400 py-0.5">
                <ArrowRight className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  Consolidated into Single Syndicate Arm:
                </span>
              </div>

              {/* Unified Cluster Destination */}
              <div className="bg-purple-950/20 border border-purple-500/40 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-purple-200">
                    {m.toCommunity}
                  </h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950 border border-purple-800 text-purple-300">
                    {m.memberCount} Members
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-purple-900/40">
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-3 h-3 text-cyan-400" />
                    Cluster Leader: <strong className="text-cyan-300">{m.leaderName} ({m.leaderId})</strong>
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 font-mono">
                  Functional Scope: {m.primaryCrimeType}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
