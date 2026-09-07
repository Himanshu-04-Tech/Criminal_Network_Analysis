"use client";

import React, { useState, useEffect } from "react";
import { History, ArrowRight, Trash2, Clock, Zap } from "lucide-react";
import { RecentSearch } from "@/types";

export interface RecentSearchesProps {
  onSelectSearch: (source: string, target: string) => void;
  currentSource?: string;
  currentTarget?: string;
}

export function RecentSearches({
  onSelectSearch,
  currentSource,
  currentTarget,
}: RecentSearchesProps) {
  const storageKey = "nexus_recent_searches";
  const [searches, setSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSearches(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn("Could not read recent searches", e);
    }

    // Default seeded history
    const defaultSearches: RecentSearch[] = [
      {
        id: "rec-1",
        source: "P001",
        sourceName: "Vikram Malhotra",
        target: "P020",
        targetName: "Rajesh Shrivastav",
        timestamp: "2026-08-31 10:15",
        strength: 84,
        hops: 4,
      },
      {
        id: "rec-2",
        source: "P017",
        sourceName: "Arjun Verma",
        target: "P031",
        targetName: "Karan Singhania",
        timestamp: "2026-08-30 16:40",
        strength: 78,
        hops: 3,
      },
      {
        id: "rec-3",
        source: "P001",
        sourceName: "Vikram Malhotra",
        target: "P017",
        targetName: "Arjun Verma",
        timestamp: "2026-08-28 09:20",
        strength: 95,
        hops: 2,
      },
    ];

    setSearches(defaultSearches);
    try {
      localStorage.setItem(storageKey, JSON.stringify(defaultSearches));
    } catch (e) {
      // ignore
    }
  }, []);

  const clearHistory = () => {
    setSearches([]);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {}
  };

  if (searches.length === 0) return null;

  return (
    <div className="rounded-xl border border-[#1F2937] bg-[#111827] px-4 py-3 font-mono text-xs shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase font-semibold">
          <History className="h-3.5 w-3.5 text-blue-400" />
          <span>Recent Investigations:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {searches.slice(0, 4).map((s) => {
            const isActive =
              s.source.toUpperCase() === currentSource?.toUpperCase() &&
              s.target.toUpperCase() === currentTarget?.toUpperCase();

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectSearch(s.source, s.target)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                  isActive
                    ? "border-blue-500 bg-blue-500/20 text-white font-bold"
                    : "border-[#1F2937] bg-[#0B1020] text-gray-300 hover:border-blue-500/50 hover:text-white"
                }`}
              >
                <span className="font-bold">{s.source}</span>
                <ArrowRight className="h-3 w-3 text-cyan-400" />
                <span className="font-bold">{s.target}</span>
                <span className="text-[10px] text-emerald-400 font-semibold ml-1">
                  ({s.strength}%)
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={clearHistory}
            className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-[#0B1020] transition-colors ml-1"
            title="Clear Recent History"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
