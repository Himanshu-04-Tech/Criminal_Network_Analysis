"use client";

import React, { useState } from "react";
import { FusedCaseProfile } from "@/types";
import {
  CheckSquare,
  Square,
  Search,
  CheckCheck,
  XCircle,
  Sparkles,
  RefreshCw,
  Building,
  Layers,
  Flame,
} from "lucide-react";

interface CaseSelectionPanelProps {
  cases: FusedCaseProfile[];
  selectedCaseIds: string[];
  onToggleCase: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onFuse: () => void;
  isLoading: boolean;
}

export const CaseSelectionPanel: React.FC<CaseSelectionPanelProps> = ({
  cases,
  selectedCaseIds,
  onToggleCase,
  onSelectAll,
  onClearSelection,
  onFuse,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCases = cases.filter(
    (c) =>
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.policeStation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.section.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSelectedNodes = cases
    .filter((c) => selectedCaseIds.includes(c.id))
    .reduce((sum, c) => sum + c.nodes, 0);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
      {/* Top Header & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              FIR Dossier Selection Workspace
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 font-semibold">
              {selectedCaseIds.length} Selected ({totalSelectedNodes} Candidate Nodes)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Non-destructive analytical simulation — underlying police dockets remain immutable.
          </p>
        </div>

        {/* Search and Action Buttons */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter FIR, IPC, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 w-44 sm:w-48"
            />
          </div>

          <button
            type="button"
            onClick={onSelectAll}
            className="px-2.5 py-1 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950 text-[11px] font-medium text-slate-300 hover:text-white flex items-center gap-1 transition-all"
            title="Select all available FIRs"
          >
            <CheckCheck className="w-3 h-3 text-cyan-400" />
            <span>All</span>
          </button>

          <button
            type="button"
            onClick={onClearSelection}
            disabled={selectedCaseIds.length === 0}
            className="px-2.5 py-1 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950 text-[11px] font-medium text-slate-400 hover:text-rose-400 disabled:opacity-40 transition-all flex items-center gap-1"
            title="Clear current selection"
          >
            <XCircle className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Case Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredCases.map((c) => {
          const isSelected = selectedCaseIds.includes(c.id);
          return (
            <div
              key={c.id}
              onClick={() => onToggleCase(c.id)}
              className={`cursor-pointer rounded-xl border p-3.5 transition-all select-none group relative overflow-hidden ${
                isSelected
                  ? "border-cyan-500/80 bg-cyan-950/20 shadow-md shadow-cyan-950/40"
                  : "border-slate-800/90 bg-slate-950/70 hover:border-slate-700 text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-xs font-bold ${
                      isSelected ? "text-cyan-300" : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  >
                    {c.id}
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full font-mono bg-slate-900 border border-slate-800 text-slate-400">
                    {c.status}
                  </span>
                </div>

                <div className="text-cyan-400">
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 group-hover:text-slate-400" />
                  )}
                </div>
              </div>

              <h4
                className={`text-xs font-semibold truncate ${
                  isSelected ? "text-slate-100" : "text-slate-300"
                }`}
              >
                {c.name}
              </h4>

              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {c.policeStation} • {c.section}
              </p>

              {/* Sub Metadata Strip */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2.5 mt-2 border-t border-slate-800/60">
                <span className="flex items-center gap-1">
                  <Building className="w-3 h-3 text-slate-400" />
                  {c.location}
                </span>
                <span>
                  {c.nodes} Nodes // {c.edges} Edges
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Fusion Trigger Deck */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800/80">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" />
          <span>
            Target Configuration:{" "}
            <strong className="text-slate-200 font-mono">
              {selectedCaseIds.length > 0
                ? selectedCaseIds.join(" + ")
                : "No Cases Selected"}
            </strong>
          </span>
        </div>

        <button
          type="button"
          onClick={onFuse}
          disabled={selectedCaseIds.length < 2 || isLoading}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-mono text-xs font-bold tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 ${
            selectedCaseIds.length >= 2 && !isLoading
              ? "bg-gradient-to-r from-cyan-600 via-cyan-500 to-emerald-500 hover:from-cyan-500 hover:to-emerald-400 text-slate-950 shadow-cyan-500/20 cursor-pointer"
              : "bg-slate-800/80 border border-slate-700/50 text-slate-400 cursor-not-allowed shadow-none"
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              <span>Synthesizing Unified Topology...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>FUSE {selectedCaseIds.length} CASES</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
