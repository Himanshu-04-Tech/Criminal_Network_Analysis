"use client";

import React, { useState } from "react";
import { CrossCaseResource, EntityType } from "@/types";
import {
  Smartphone,
  CreditCard,
  Building2,
  Car,
  MapPin,
  Search,
  CheckCircle2,
  FileCheck2,
  Database,
} from "lucide-react";

interface SharedResourcesPanelProps {
  sharedResources: CrossCaseResource[];
}

export const SharedResourcesPanel: React.FC<SharedResourcesPanelProps> = ({
  sharedResources,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const getIconForType = (type: EntityType) => {
    switch (type) {
      case "PHONE":
        return Smartphone;
      case "BANK_ACCOUNT":
        return CreditCard;
      case "ORGANIZATION":
        return Building2;
      case "VEHICLE":
        return Car;
      case "LOCATION":
        return MapPin;
      default:
        return Database;
    }
  };

  const filteredResources = sharedResources.filter((res) => {
    const matchesSearch =
      res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.evidence.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.role.toLowerCase().includes(searchTerm.toLowerCase());

    if (typeFilter === "ALL") return matchesSearch;
    return matchesSearch && res.type === typeFilter;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Shared Resources &amp; Infrastructure
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-800/50 text-purple-300 font-semibold">
            {sharedResources.length} Artifacts
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search SIM, Account, Org..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-purple-500 w-44"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 text-xs">
        {["ALL", "PHONE", "BANK_ACCOUNT", "ORGANIZATION", "LOCATION"].map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all ${
              typeFilter === t
                ? "bg-purple-950 border border-purple-500 text-purple-200 font-semibold"
                : "bg-slate-950/80 border border-slate-800/80 text-slate-400 hover:text-slate-200"
            }`}
          >
            {t.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Scrollable Resources List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1.5 custom-scrollbar">
        {filteredResources.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
            <Database className="w-8 h-8 text-slate-400 mb-2" />
            <p>No shared resources found for current filters.</p>
          </div>
        ) : (
          filteredResources.map((resource) => {
            const IconComponent = getIconForType(resource.type);
            return (
              <div
                key={resource.id}
                className="bg-slate-950/70 border border-slate-800/90 hover:border-purple-500/50 rounded-xl p-3.5 transition-all group"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-lg bg-purple-950/50 border border-purple-800/50 text-purple-400 mt-0.5">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-purple-400">
                          {resource.id}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-100 group-hover:text-purple-200 transition-colors">
                          {resource.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{resource.role}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 inline-flex items-center gap-1">
                      <FileCheck2 className="w-3 h-3" />
                      {resource.confidence}% Match
                    </span>
                  </div>
                </div>

                {/* Evidence Note */}
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2.5 text-xs text-slate-300 mb-2">
                  <span className="text-purple-400 font-semibold font-mono text-[10px] block mb-0.5 uppercase tracking-wider">
                    Forensic Trail Evidence:
                  </span>
                  {resource.evidence}
                </div>

                {/* Case Links Strip */}
                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-800/60">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[10px] uppercase font-mono">
                      Correlated in:
                    </span>
                    {resource.usedInCases.map((c) => (
                      <span
                        key={c}
                        className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-purple-300 font-medium"
                      >
                        {c}
                      </span>
                    ))}
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    Hard Technical Artifact
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
