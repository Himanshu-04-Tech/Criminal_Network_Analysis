"use client";

import React, { useState } from "react";
import { CaseFinding } from "@/types";
import {
  Lightbulb,
  AlertOctagon,
  AlertTriangle,
  Info,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface IntelligenceFindingsProps {
  findings: CaseFinding[];
}

export const IntelligenceFindings: React.FC<IntelligenceFindingsProps> = ({ findings }) => {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    [findings[0]?.id || ""]: true,
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return {
          icon: AlertOctagon,
          badge: "bg-rose-500/10 text-rose-400 border-rose-500/40",
          border: "border-rose-500/30",
        };
      case "HIGH":
        return {
          icon: AlertTriangle,
          badge: "bg-amber-500/10 text-amber-400 border-amber-500/40",
          border: "border-amber-500/30",
        };
      case "MEDIUM":
        return {
          icon: Info,
          badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/40",
          border: "border-cyan-500/30",
        };
      default:
        return {
          icon: ShieldCheck,
          badge: "bg-slate-500/10 text-slate-400 border-slate-500/40",
          border: "border-slate-500/30",
        };
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Synthesized Intelligence Findings
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 font-semibold">
          {findings.length} Strategic Hypotheses
        </span>
      </div>

      <div className="space-y-3">
        {findings.map((f) => {
          const style = getSeverityBadge(f.severity);
          const Icon = style.icon;
          const isExpanded = !!expandedIds[f.id];

          return (
            <div
              key={f.id}
              className={`bg-slate-950/70 border ${style.border} rounded-xl p-3.5 transition-all`}
            >
              <div
                onClick={() => toggleExpand(f.id)}
                className="flex items-start justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">
                    <Icon className="w-4 h-4 text-slate-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${style.badge}`}>
                        {f.severity}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {f.type}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-100">{f.title}</h4>
                  </div>
                </div>

                <button
                  type="button"
                  className="p-1 rounded text-slate-400 hover:text-slate-200"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed animate-in fade-in duration-150">
                  <p>{f.description}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
