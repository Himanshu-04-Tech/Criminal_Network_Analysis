"use client";

import React, { useEffect, useState } from "react";
import { CaseComparisonHistoryItem } from "@/types";
import { History, Trash2, ArrowRight, Clock } from "lucide-react";

interface CrossCaseHistoryProps {
  currentCaseA: string;
  currentCaseB: string;
  similarityScore: number;
  recommendation: string;
  onSelectHistory: (caseA: string, caseB: string) => void;
}

const STORAGE_KEY = "nexus_cross_case_history";

export const CrossCaseHistory: React.FC<CrossCaseHistoryProps> = ({
  currentCaseA,
  currentCaseB,
  similarityScore,
  recommendation,
  onSelectHistory,
}) => {
  const [history, setHistory] = useState<CaseComparisonHistoryItem[]>([]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      } else {
        // Initialize with default history items
        const defaults: CaseComparisonHistoryItem[] = [
          {
            id: "hist-1",
            caseA: "FIR001",
            caseB: "FIR007",
            similarityScore: 82,
            timestamp: "10 mins ago",
            recommendation: "RECOMMENDED",
          },
          {
            id: "hist-2",
            caseA: "FIR001",
            caseB: "FIR003",
            similarityScore: 86,
            timestamp: "1 hour ago",
            recommendation: "RECOMMENDED",
          },
          {
            id: "hist-3",
            caseA: "FIR003",
            caseB: "FIR007",
            similarityScore: 79,
            timestamp: "Yesterday",
            recommendation: "REQUIRES_REVIEW",
          },
        ];
        setHistory(defaults);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      }
    } catch (e) {
      // Fallback
    }
  }, []);

  // Save current comparison when it changes
  useEffect(() => {
    if (!currentCaseA || !currentCaseB) return;

    try {
      const newItem: CaseComparisonHistoryItem = {
        id: `hist-${Date.now()}`,
        caseA: currentCaseA,
        caseB: currentCaseB,
        similarityScore,
        timestamp: "Just now",
        recommendation,
      };

      setHistory((prev) => {
        const filtered = prev.filter(
          (h) =>
            !(
              (h.caseA === currentCaseA && h.caseB === currentCaseB) ||
              (h.caseA === currentCaseB && h.caseB === currentCaseA)
            )
        );
        const updated = [newItem, ...filtered].slice(0, 8);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      // localStorage error guard
    }
  }, [currentCaseA, currentCaseB, similarityScore, recommendation]);

  const handleClearHistory = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHistory([]);
    } catch (e) {}
  };

  if (history.length === 0) return null;

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">
          <History className="w-3.5 h-3.5 text-cyan-400" />
          <span>Recent Comparison Audits</span>
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
          const isActive =
            (item.caseA === currentCaseA && item.caseB === currentCaseB) ||
            (item.caseA === currentCaseB && item.caseB === currentCaseA);

          return (
            <button
              key={item.id}
              onClick={() => onSelectHistory(item.caseA, item.caseB)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-2 border ${
                isActive
                  ? "bg-cyan-950/80 border-cyan-500/70 text-cyan-200 shadow-sm"
                  : "bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300"
              }`}
            >
              <span className="font-bold">
                {item.caseA} ↔ {item.caseB}
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  item.similarityScore >= 80
                    ? "text-emerald-400 bg-emerald-950/50"
                    : "text-amber-400 bg-amber-950/50"
                }`}
              >
                {item.similarityScore}%
              </span>
              <span className="text-[10px] text-slate-400">{item.timestamp}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
