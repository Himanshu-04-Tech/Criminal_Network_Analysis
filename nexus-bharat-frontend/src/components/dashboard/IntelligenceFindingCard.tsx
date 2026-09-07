"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  GitBranch,
  Layers,
  Phone,
  CreditCard,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { IntelligenceFinding, FindingCategory } from "@/types/finding";

export interface IntelligenceFindingCardProps {
  findings?: IntelligenceFinding[];
  isLoading?: boolean;
}

const CATEGORY_CONFIG: Record<
  FindingCategory,
  {
    icon: React.ElementType;
    badge: string;
    border: string;
    label: string;
  }
> = {
  BROKER: {
    icon: ShieldAlert,
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    border: "border-amber-200",
    label: "CLANDESTINE BROKER",
  },
  CROSS_CASE: {
    icon: Layers,
    badge: "border-cyan-200 bg-cyan-50 text-cyan-800",
    border: "border-cyan-200",
    label: "CROSS-CASE LINK",
  },
  SHARED_RESOURCE: {
    icon: Phone,
    badge: "border-blue-200 bg-blue-50 text-blue-800",
    border: "border-blue-200",
    label: "SHARED ARTIFACT",
  },
  FINANCIAL_CONDUIT: {
    icon: CreditCard,
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
    border: "border-emerald-200",
    label: "FINANCIAL CONDUIT",
  },
  SYNDICATE_TOPOLOGY: {
    icon: GitBranch,
    badge: "border-purple-200 bg-purple-50 text-purple-800",
    border: "border-purple-200",
    label: "TOPOLOGY SHIFT",
  },
};

export function IntelligenceFindingCard({ findings, isLoading }: IntelligenceFindingCardProps) {
  const [expandedId, setExpandedId] = useState<string | null>("FND-001");

  if (isLoading || !findings) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs animate-pulse">
        <div className="h-4 w-48 rounded bg-slate-100" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5 shadow-xs"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600 shadow-2xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
              Key Intelligence Findings
            </h3>
            <p className="text-[11px] text-slate-500">
              High-confidence investigative hypotheses discovered by Graph Intelligence Modules
            </p>
          </div>
        </div>

        <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
          {findings.length} Verified Findings
        </span>
      </div>

      {/* Grid of Finding Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {findings.map((item) => {
          const catConfig = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.BROKER;
          const Icon = catConfig.icon;
          const isExpanded = expandedId === item.id;

          return (
            <motion.div
              key={item.id}
              layout
              className={`rounded-xl border border-slate-200 bg-slate-50/60 p-4.5 transition-all hover:border-slate-300 hover:bg-slate-50 shadow-2xs ${
                isExpanded ? "ring-2 ring-blue-500/20 bg-white" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-2xs">
                    <Icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-slate-500">
                        {item.id}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold ${catConfig.badge}`}
                      >
                        {catConfig.label}
                      </span>
                      <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {(item.confidence * 100).toFixed(0)}% Conf
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  </div>
                </div>

                <button
                  onClick={() => toggleExpand(item.id)}
                  aria-label={isExpanded ? "Collapse finding details" : "Expand finding details"}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>

              <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                {item.description}
              </p>

              {/* Case & Entity Tags */}
              <div className="mt-3.5 flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-slate-200">
                <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">Cases:</span>
                {item.cases.map((c) => (
                  <span
                    key={c}
                    className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 font-mono text-[9px] text-blue-700 font-semibold"
                  >
                    {c}
                  </span>
                ))}

                <span className="ml-2 text-[10px] font-mono text-slate-400 font-semibold uppercase">Nodes:</span>
                {item.entities.slice(0, 3).map((ent) => (
                  <span
                    key={ent}
                    className="rounded-md bg-white border border-slate-200 px-2 py-0.5 font-mono text-[9px] text-indigo-700 font-semibold"
                  >
                    {ent}
                  </span>
                ))}
              </div>

              {/* Expandable Forensic Grounding Section */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3.5 pt-3 border-t border-slate-200 space-y-2.5 overflow-hidden text-xs"
                  >
                    <div className="rounded-xl bg-white p-3.5 border border-slate-200 space-y-1.5 shadow-2xs">
                      <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold flex items-center gap-1.5">
                        <FileCheck2 className="h-3.5 w-3.5 text-emerald-600" />
                        Corroborating Evidence:
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700">
                        {item.evidence.map((ev, idx) => (
                          <li key={idx}>{ev}</li>
                        ))}
                      </ul>
                    </div>

                    {item.suggestedAction && (
                      <div className="flex items-center justify-between text-[11px] font-mono bg-blue-50 border border-blue-200 p-2.5 rounded-xl text-blue-800 font-semibold">
                        <span>Action: {item.suggestedAction}</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

