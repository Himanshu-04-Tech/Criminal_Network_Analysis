"use client";

import React from "react";
import {
  Shield,
  Phone,
  CreditCard,
  Car,
  MapPin,
  Building,
  AlertTriangle,
  FolderGit2,
  Share2,
  ExternalLink,
  ArrowUpRight,
  Clock,
  Activity,
  UserCheck
} from "lucide-react";
import { GraphEntity } from "@/types/graph";
import { NODE_TYPE_COLORS } from "./GraphLegend";

export interface NodeDetailsProps {
  entity: GraphEntity;
  onNavigateEntity?: (id: string) => void;
}

export function NodeDetails({ entity, onNavigateEntity }: NodeDetailsProps) {
  const colorInfo = NODE_TYPE_COLORS[entity.type] || { color: "#2563EB", label: entity.type };
  const riskScore = entity.riskScore || 75;

  const getRiskColor = (score: number) => {
    if (score >= 90) return "text-red-700 border-red-200 bg-red-50";
    if (score >= 70) return "text-amber-700 border-amber-200 bg-amber-50";
    return "text-emerald-700 border-emerald-200 bg-emerald-50";
  };

  return (
    <div className="space-y-4 font-mono text-xs text-slate-800">
      {/* Target Identity Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4.5 space-y-3 shadow-xs">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center border font-bold shadow-xs"
              style={{
                backgroundColor: `${colorInfo.color}12`,
                borderColor: `${colorInfo.color}35`,
                color: colorInfo.color,
              }}
            >
              <span>{entity.id.substring(0, 3)}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">{entity.id}</span>
                <span
                  className="rounded-full px-2 py-0.5 text-[9px] font-bold border uppercase"
                  style={{
                    color: colorInfo.color,
                    borderColor: `${colorInfo.color}30`,
                    backgroundColor: `${colorInfo.color}10`,
                  }}
                >
                  {colorInfo.label}
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-0.5">{entity.name}</div>
            </div>
          </div>

          {/* Risk Score Pill */}
          <div
            className={`rounded-xl border px-3 py-1.5 text-center font-bold shadow-2xs ${getRiskColor(
              riskScore
            )}`}
          >
            <div className="text-[9px] uppercase tracking-wider opacity-80">Risk Score</div>
            <div className="text-base leading-tight font-bold mt-0.5">{riskScore}</div>
          </div>
        </div>

        {/* Alias if any */}
        {entity.alias && entity.alias.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-slate-100 text-[11px]">
            <span className="text-slate-400 text-[10px] font-semibold">ALIASES:</span>
            {entity.alias.map((a, i) => (
              <span key={i} className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-700 border border-slate-200 text-[10px]">
                {a}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2.5 text-center">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
          <div className="text-[10px] font-semibold text-slate-500 uppercase">Role</div>
          <div className="font-bold text-amber-700 mt-1 text-xs truncate">
            {entity.role || "ASSOCIATE"}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
          <div className="text-[10px] font-semibold text-slate-500 uppercase">Cases</div>
          <div className="font-bold text-blue-700 mt-1 text-xs">
            {entity.cases.length} Dossiers
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
          <div className="text-[10px] font-semibold text-slate-500 uppercase">Connections</div>
          <div className="font-bold text-indigo-700 mt-1 text-xs">
            {entity.connectionsCount || entity.degree || 0} Links
          </div>
        </div>
      </div>

      {/* Case Dossiers Attached */}
      <div className="space-y-2">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          LINKED INVESTIGATION CASES
        </span>
        <div className="flex flex-wrap gap-1.5">
          {entity.cases.map((c) => (
            <span
              key={c}
              className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700"
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Centrality Analysis */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2 shadow-2xs">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-blue-600" />
          Topological Centrality
        </span>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <span className="text-slate-400">Degree:</span>{" "}
            <span className="text-slate-900 font-bold">{entity.degree || entity.connectionsCount || 0} links</span>
          </div>
          <div>
            <span className="text-slate-400">Betweenness:</span>{" "}
            <span className="text-blue-700 font-bold">{entity.betweenness ?? 0.28}</span>
          </div>
        </div>
      </div>

      {/* Notes / Intelligence Summary */}
      {entity.notes && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            INVESTIGATIVE NOTES
          </span>
          <p className="text-[11px] text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            {entity.notes}
          </p>
        </div>
      )}

      {/* Direct Neighbor Subgraph Table */}
      {entity.neighbors && entity.neighbors.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              DIRECT 1-HOP ASSOCIATES ({entity.neighbors.length})
            </span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {entity.neighbors.map((nb, i) => (
              <div
                key={i}
                onClick={() => onNavigateEntity && onNavigateEntity(nb.id)}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-2.5 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all shadow-2xs group"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 group-hover:text-blue-600">
                    {nb.id}
                  </span>
                  <span className="text-[11px] text-slate-600 truncate max-w-[120px]">
                    {nb.name}
                  </span>
                </div>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700 border border-slate-200 font-semibold">
                  {nb.relationship}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

