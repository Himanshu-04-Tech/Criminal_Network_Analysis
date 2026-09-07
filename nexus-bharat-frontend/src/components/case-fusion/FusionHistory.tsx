"use client";

import React, { useEffect, useState } from "react";
import { FusionHistoryItem } from "@/types";
import { History, Trash2, ArrowRight, Clock, Layers } from "lucide-react";

interface FusionHistoryProps {
  currentCaseIds: string[];
  fusionScore: number;
  recommendation: string;
  onSelectHistory: (caseIds: string[]) => void;
}

const STORAGE_KEY = "nexus_fusion_history";

export const FusionHistory: React.FC<FusionHistoryProps> = ({
  currentCaseIds,
  fusionScore,
  recommendation,
  onSelectHistory,
}) => {
  const [history, setHistory] = useState<FusionHistoryItem[]>([]);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      } else {
        const defaults: FusionHistoryItem[] = [
          {
            id: "fus-hist-1",
            caseIds: ["FIR001", "FIR003", "FIR007"],
            fusionScore: 91,
            timestamp: "10 mins ago",
            recommendation: "Merge Recommended",
            casesSummary: "Tripartite Cyber-Hawala-Logistics Cartel",
          },
          {
            id: "fus-hist-2",
            caseIds: ["FIR001", "FIR003"],
            fusionScore: 86,
            timestamp: "1 hour ago",
            recommendation: "Merge Recommended",
            casesSummary: "Phishing & Hawala Conduit",
          },
          {
            id: "fus-hist-3",
            caseIds: ["FIR002", "FIR006"],
            fusionScore: 58,
            timestamp: "Yesterday",
            recommendation: "Further Review Needed",
            casesSummary: "SIM Bank & Maritime Transit",
          },
        ];
        setHistory(defaults);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      }
    } catch (e) {}
  }, []);

  // Save current fusion query
  useEffect(() => {
    if (!currentCaseIds || currentCaseIds.length < 2) return;

    try {
      const sortedKeys = [...currentCaseIds].sort().join("+");
      const newItem: FusionHistoryItem = {
        id: `fus-hist-${Date.now()}`,
        caseIds: currentCaseIds,
        fusionScore,
        timestamp: "Just now",
        recommendation,
        casesSummary: `${currentCaseIds.length} Cases Synthesized`,
      };

      setHistory((prev) => {
        const filtered = prev.filter(
          (h) => [...h.caseIds].sort().join("+") !== sortedKeys
        );
        const updated = [newItem, ...filtered].slice(0, 6);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (e) {}
  }, [currentCaseIds, fusionScore, recommendation]);

  const handleClearHistory = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHistory([]);
    } catch (e) {}
  };

  if (history.length === 0) return null;

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">
          <History className="w-3.5 h-3.5 text-cyan-400" />
          <span>Recent Fusion Sessions (Audit Trail)</span>
        </div>
        <button
          onClick={handleClearHistory}
          className="text-[10px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
          title="Clear History"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {history.map((item) => {
          const isCurrent =
            [...item.caseIds].sort().join("+") === [...currentCaseIds].sort().join("+");

          return (
            <button
              key={item.id}
              onClick={() => onSelectHistory(item.caseIds)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-2 border ${
                isCurrent
                  ? "bg-cyan-950/80 border-cyan-500/70 text-cyan-200 shadow-sm"
                  : "bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300"
              }`}
            >
              <span className="font-bold">{item.caseIds.join(" + ")}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  item.fusionScore >= 80
                    ? "text-emerald-400 bg-emerald-950/50"
                    : "text-amber-400 bg-amber-950/50"
                }`}
              >
                {item.fusionScore}%
              </span>
              <span className="text-[10px] text-slate-400">{item.timestamp}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
