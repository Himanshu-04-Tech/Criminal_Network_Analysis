"use client";

import React from "react";
import Link from "next/link";
import { AlertOctagon, ExternalLink } from "lucide-react";
import { RiskEntity } from "@/types";
import { RoleBadge } from "./RoleBadge";

export interface HighRiskEntitiesProps {
  entities: RiskEntity[];
}

export function HighRiskEntities({ entities }: HighRiskEntitiesProps) {
  const getRiskBadge = (score: number) => {
    if (score >= 90) {
      return {
        label: "CRITICAL",
        color: "text-red-700",
        border: "border-red-200",
        bg: "bg-red-50",
      };
    }
    if (score >= 70) {
      return {
        label: "HIGH",
        color: "text-amber-800",
        border: "border-amber-200",
        bg: "bg-amber-50",
      };
    }
    if (score >= 40) {
      return {
        label: "MEDIUM",
        color: "text-blue-700",
        border: "border-blue-200",
        bg: "bg-blue-50",
      };
    }
    return {
      label: "LOW",
      color: "text-emerald-700",
      border: "border-emerald-200",
      bg: "bg-emerald-50",
    };
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs font-mono flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3.5 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl border border-red-200 bg-red-50 text-red-600 shadow-2xs">
              <AlertOctagon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                High Risk Threat Entities
              </h3>
              <span className="text-[10px] text-slate-500 font-semibold">
                PRIORITY SURVEILLANCE TARGETS
              </span>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-red-200 bg-red-50 text-red-700">
            {entities.filter((e) => e.riskScore >= 90).length} CRITICAL
          </span>
        </div>

        {/* Entities List */}
        <div className="space-y-3">
          {entities.slice(0, 6).map((entity) => {
            const risk = getRiskBadge(entity.riskScore);

            return (
              <div
                key={entity.id}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 transition-all hover:border-slate-300 hover:bg-slate-50 flex items-center justify-between gap-3 shadow-2xs"
              >
                {/* Left: Entity & Role */}
                <div className="flex items-center gap-3">
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs border shadow-2xs ${risk.border} ${risk.bg} ${risk.color}`}
                  >
                    {entity.riskScore}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/entity/${entity.id}`}
                        className="font-bold text-slate-900 hover:text-blue-600 transition-colors flex items-center gap-1 text-xs"
                      >
                        <span>{entity.id}</span>
                        <ExternalLink className="h-2.5 w-2.5 text-slate-400 hover:text-blue-600" />
                      </Link>
                      <RoleBadge role={entity.role} size="sm" showIcon={false} />
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold truncate max-w-[140px]">
                      {entity.name}
                    </div>
                  </div>
                </div>

                {/* Right: Cases & Connections */}
                <div className="flex items-center gap-3 text-right">
                  <div className="text-[11px] font-medium">
                    <span className="text-slate-500">{entity.casesCount} Cases</span>
                    <span className="text-slate-300 mx-1">•</span>
                    <span className="text-indigo-700 font-bold">{entity.connectionsCount} Links</span>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase hidden sm:inline-block ${risk.border} ${risk.bg} ${risk.color}`}
                  >
                    {risk.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Classification */}
      <div className="mt-5 pt-3.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-medium">
        <span>DYNAMIC THREAT INDEX</span>
        <span className="text-red-700 font-bold">ACTIONABLE INTEL</span>
      </div>
    </div>
  );
}

