"use client";

import React from "react";
import { SimilarCase } from "@/types";
import { Sparkles, ArrowRight, ShieldCheck, GitMerge } from "lucide-react";

interface RelatedCasesProps {
  primaryCaseId: string;
  similarCases: SimilarCase[];
  onCompareWith: (targetCaseId: string) => void;
}

export const RelatedCases: React.FC<RelatedCasesProps> = ({
  primaryCaseId,
  similarCases,
  onCompareWith,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Similar Investigations Radar
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            For {primaryCaseId}
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-3">
          Automated cross-FIR correlation engine detected closest topological matches across jurisdictional registries:
        </p>

        <div className="space-y-2.5">
          {similarCases.map((sc) => {
            const isVeryHigh = sc.similarityScore >= 80;
            return (
              <div
                key={sc.caseId}
                className="bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3 transition-all flex items-center justify-between gap-3 group"
              >
                <div className="space-y-1 flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-300">
                      {sc.caseId}
                    </span>
                    <h4 className="text-xs font-semibold text-slate-200 truncate max-w-[220px]">
                      {sc.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="truncate max-w-[160px]">{sc.station}</span>
                    <span>•</span>
                    <span className="text-amber-400 font-mono">Bridge: {sc.keyBridge}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                    <div
                      className={`h-full rounded-full ${
                        isVeryHigh ? "bg-emerald-400" : "bg-cyan-400"
                      }`}
                      style={{ width: `${sc.similarityScore}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                      isVeryHigh
                        ? "text-emerald-300 bg-emerald-950/60 border border-emerald-800/40"
                        : "text-cyan-300 bg-cyan-950/60 border border-cyan-800/40"
                    }`}
                  >
                    {sc.similarityScore}%
                  </span>

                  <button
                    onClick={() => onCompareWith(sc.caseId)}
                    className="text-[11px] px-2 py-1 rounded bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-200 flex items-center gap-1 transition-all active:scale-95"
                    title={`Compare ${primaryCaseId} with ${sc.caseId}`}
                  >
                    <span>Correlate</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
