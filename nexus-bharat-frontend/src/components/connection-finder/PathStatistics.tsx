"use client";

import React from "react";
import { Network, GitCommit, ShieldAlert, AlertTriangle } from "lucide-react";
import { PathStatistics as IPathStatistics } from "@/types";

export interface PathStatisticsProps {
  statistics: IPathStatistics;
}

export function PathStatistics({ statistics }: PathStatisticsProps) {
  const stats = [
    {
      label: "NODES TRAVERSED",
      value: statistics.nodesTraversed,
      desc: "Entities across chain",
      icon: Network,
      color: "text-blue-600",
      bg: "bg-blue-50/50",
      border: "border-blue-200",
    },
    {
      label: "RELATIONSHIPS",
      value: statistics.relationshipsTraversed,
      desc: "Directed graph edges",
      icon: GitCommit,
      color: "text-cyan-600",
      bg: "bg-cyan-50/50",
      border: "border-cyan-200",
    },
    {
      label: "BRIDGE COUNT",
      value: statistics.bridgeCount,
      desc: "Intermediary brokers",
      icon: ShieldAlert,
      color: "text-amber-600",
      bg: "bg-amber-50/50",
      border: "border-amber-200",
    },
    {
      label: "PATH RISK SCORE",
      value: statistics.pathRiskScore,
      desc: "Combined network threat",
      icon: AlertTriangle,
      color: statistics.pathRiskScore >= 80 ? "text-red-600" : "text-amber-600",
      bg: statistics.pathRiskScore >= 80 ? "bg-red-50/50" : "bg-amber-50/50",
      border: statistics.pathRiskScore >= 80 ? "border-red-200" : "border-amber-200",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm font-mono flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Path Topology Metrics
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold">TELEMETRY</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className={`rounded-xl border ${s.border} ${s.bg} p-3.5 flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-500 uppercase font-semibold">
                    {s.label}
                  </span>
                  <Icon className={`h-3.5 w-3.5 ${s.color}`} />
                </div>
                <div className="mt-2">
                  <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">{s.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
        <span>TOPOLOGICAL DEGREE CALCULATION</span>
        <span className="text-emerald-600 font-semibold">VERIFIED VALID</span>
      </div>
    </div>
  );
}
