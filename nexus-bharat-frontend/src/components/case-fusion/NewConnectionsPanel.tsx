"use client";

import React, { useState } from "react";
import { NewConnection } from "@/types";
import {
  Share2,
  Search,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  Info,
  Filter,
  Layers,
} from "lucide-react";

interface NewConnectionsPanelProps {
  newConnections: NewConnection[];
}

export const NewConnectionsPanel: React.FC<NewConnectionsPanelProps> = ({
  newConnections,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [sortByImportance, setSortByImportance] = useState<boolean>(true);

  const importanceWeights: Record<string, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  const filtered = newConnections
    .filter((conn) => {
      const matchesSearch =
        conn.sourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conn.targetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conn.sourceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conn.targetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conn.relationship.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conn.significance.toLowerCase().includes(searchTerm.toLowerCase());

      if (typeFilter === "ALL") return matchesSearch;
      return matchesSearch && conn.type === typeFilter;
    })
    .sort((a, b) => {
      if (sortByImportance) {
        return (importanceWeights[b.importance] || 0) - (importanceWeights[a.importance] || 0);
      }
      return 0;
    });

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case "CRITICAL":
        return "bg-rose-500/10 border-rose-500/40 text-rose-400";
      case "HIGH":
        return "bg-amber-500/10 border-amber-500/40 text-amber-400";
      case "MEDIUM":
        return "bg-cyan-500/10 border-cyan-500/40 text-cyan-400";
      default:
        return "bg-slate-500/10 border-slate-500/40 text-slate-400";
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Emergent Cross-Case Connections
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 font-semibold">
            {newConnections.length} Revealed
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search entities, type, reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 w-44"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800/60">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {["ALL", "LOGISTICS", "FINANCIAL", "COMMUNICATION", "ASSOCIATE"].map((tf) => (
            <button
              key={tf}
              onClick={() => setTypeFilter(tf)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-medium transition-all ${
                typeFilter === tf
                  ? "bg-cyan-950 border border-cyan-500 text-cyan-200"
                  : "bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <button
          onClick={() => setSortByImportance(!sortByImportance)}
          className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
            sortByImportance
              ? "bg-slate-800 border-slate-700 text-cyan-300"
              : "bg-slate-950 border-slate-800 text-slate-400"
          }`}
        >
          Priority Sort
        </button>
      </div>

      {/* Scrollable Links List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1.5 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
            <Share2 className="w-8 h-8 text-slate-400 mb-2" />
            <p>No new connections found for current criteria.</p>
          </div>
        ) : (
          filtered.map((conn) => (
            <div
              key={conn.id}
              className="bg-slate-950/70 border border-slate-800/90 hover:border-cyan-500/50 rounded-xl p-3 transition-all group"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  {/* Source Node */}
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-bold text-cyan-300">
                      {conn.sourceId}
                    </span>
                    <span className="text-slate-200 font-medium">{conn.sourceName}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {conn.sourceCase}
                    </span>
                  </div>

                  {/* Direction Arrow & Label */}
                  <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 px-1">
                    <ArrowRight className="w-3 h-3 text-cyan-400" />
                    <span className="font-semibold">{conn.relationship}</span>
                    <ArrowRight className="w-3 h-3 text-cyan-400" />
                  </div>

                  {/* Target Node */}
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-bold text-purple-300">
                      {conn.targetId}
                    </span>
                    <span className="text-slate-200 font-medium">{conn.targetName}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {conn.targetCase}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${getImportanceBadge(
                    conn.importance
                  )}`}
                >
                  {conn.importance}
                </span>
              </div>

              {/* Significance Note */}
              <p className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                {conn.significance}
              </p>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 mt-1">
                <span>Direct Path ({conn.hops} Hop)</span>
                <span className="text-cyan-400 font-medium">Revealed Exclusively Post-Fusion</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
