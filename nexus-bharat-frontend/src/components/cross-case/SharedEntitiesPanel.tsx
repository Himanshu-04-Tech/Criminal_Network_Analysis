"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SharedEntity } from "@/types";
import {
  Users,
  Search,
  ExternalLink,
  ShieldAlert,
  Flame,
  Filter,
  Layers,
} from "lucide-react";

interface SharedEntitiesPanelProps {
  sharedEntities: SharedEntity[];
}

export const SharedEntitiesPanel: React.FC<SharedEntitiesPanelProps> = ({
  sharedEntities,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const filteredEntities = sharedEntities.filter((entity) => {
    const matchesSearch =
      entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.connectionDetails.toLowerCase().includes(searchTerm.toLowerCase());

    if (roleFilter === "ALL") return matchesSearch;
    if (roleFilter === "SUSPECT") {
      return (
        matchesSearch &&
        (entity.role.toLowerCase().includes("coordinator") ||
          entity.role.toLowerCase().includes("kingpin") ||
          entity.role.toLowerCase().includes("lead") ||
          entity.role.toLowerCase().includes("handler"))
      );
    }
    if (roleFilter === "FINANCIAL") {
      return (
        matchesSearch &&
        (entity.role.toLowerCase().includes("mule") ||
          entity.role.toLowerCase().includes("hawala") ||
          entity.role.toLowerCase().includes("finance") ||
          entity.role.toLowerCase().includes("front"))
      );
    }
    if (roleFilter === "LOGISTICS") {
      return (
        matchesSearch &&
        (entity.role.toLowerCase().includes("courier") ||
          entity.role.toLowerCase().includes("transport") ||
          entity.role.toLowerCase().includes("escort"))
      );
    }
    return matchesSearch;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col h-[520px]">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Shared Entities Across FIRs
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 font-semibold">
            {sharedEntities.length} Detected
          </span>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter suspect or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 w-44"
            />
          </div>
        </div>
      </div>

      {/* Role Filter Chips */}
      <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 text-xs">
        {["ALL", "SUSPECT", "FINANCIAL", "LOGISTICS"].map((rf) => (
          <button
            key={rf}
            onClick={() => setRoleFilter(rf)}
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all ${
              roleFilter === rf
                ? "bg-cyan-950 border border-cyan-500 text-cyan-200 font-semibold"
                : "bg-slate-950/80 border border-slate-800/80 text-slate-400 hover:text-slate-200"
            }`}
          >
            {rf}
          </button>
        ))}
      </div>

      {/* Entities Scrollable List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1.5 custom-scrollbar">
        {filteredEntities.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
            <Users className="w-8 h-8 text-slate-400 mb-2" />
            <p>No shared entities match the current criteria.</p>
          </div>
        ) : (
          filteredEntities.map((entity) => {
            const isHighRisk = entity.riskScore >= 85;
            return (
              <div
                key={entity.id}
                className="bg-slate-950/70 border border-slate-800/90 hover:border-cyan-500/50 rounded-xl p-3.5 transition-all group"
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-cyan-400">
                        {entity.id}
                      </span>
                      <h4 className="text-sm font-semibold text-slate-100 group-hover:text-cyan-200 transition-colors">
                        {entity.name}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                        {entity.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold flex items-center gap-1 border ${
                        isHighRisk
                          ? "bg-rose-950/50 border-rose-800/60 text-rose-300"
                          : "bg-amber-950/50 border-amber-800/60 text-amber-300"
                      }`}
                    >
                      <ShieldAlert className="w-3 h-3" />
                      Risk {entity.riskScore}
                    </span>

                    <Link
                      href={`/entity/${entity.id}`}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500 text-slate-400 hover:text-cyan-300 transition-all"
                      title="Open Entity Dossier"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Connection Details */}
                <p className="text-xs text-slate-400 leading-relaxed mb-2">
                  {entity.connectionDetails}
                </p>

                {/* Cases Tags Footer */}
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/60">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[10px] uppercase font-mono">
                      Recorded in:
                    </span>
                    {entity.appearsIn.map((cId) => (
                      <span
                        key={cId}
                        className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-medium"
                      >
                        {cId}
                      </span>
                    ))}
                  </div>

                  <span className="text-[10px] text-cyan-400 font-mono">
                    Overlap: {entity.casesCount} Investigations
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
