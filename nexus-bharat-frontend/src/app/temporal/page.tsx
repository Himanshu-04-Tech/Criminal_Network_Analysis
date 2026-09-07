"use client";

import React, { useState } from "react";
import {
  Clock,
  Calendar,
  Zap,
  TrendingUp,
  Activity,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Download
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";

export default function TemporalIntelligencePage() {
  const [windowDays, setWindowDays] = useState(7);
  const [isPlaying, setIsPlaying] = useState(false);

  const temporalBursts = [
    {
      id: "BURST-001",
      type: "COMMUNICATION_BURST",
      timestamp: "2026-08-13 04:00 - 10:00 UTC",
      duration: "6.0 Hours",
      intensity: "37 Calls (6.2/hr vs baseline 0.1/hr)",
      entities: ["P001", "P017", "PH001", "PH016"],
      significance: "Pre-operational coordination surge immediately preceding multi-crore Hawala transfer.",
      threat: "CRITICAL",
    },
    {
      id: "BURST-002",
      type: "FINANCIAL_VELOCITY_SPIKE",
      timestamp: "2026-08-10 14:00 - 14:45 UTC",
      duration: "45 Minutes",
      intensity: "4 Fan-Out Transits (INR 32.5 Lakhs)",
      entities: ["ACC001", "ACC002", "ACC003", "ACC004", "ACC005"],
      significance: "Rapid mule dissipation window before bank suspicious activity freeze triggers.",
      threat: "HIGH",
    },
    {
      id: "BURST-003",
      type: "CIRCULAR_TRANSACTION_LOOP",
      timestamp: "2026-08-12 09:15 - 14:45 UTC",
      duration: "5.5 Hours",
      intensity: "3 Ring Transfers (Loop Closed)",
      entities: ["ACC012", "ACC013", "ACC014"],
      significance: "Artificial turnover inflation and commercial layering across shell entity ledgers.",
      threat: "HIGH",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Temporal Network Intelligence"
        subtitle="Time-series sliding window graph slicing, communication burst detection, and chronological evolution."
        badge="MODULE 7 // TEMPORAL ENGINE"
        badgeColor="bg-red-500/10 text-red-400 border-red-500/30"
        actionButton={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/20 px-3.5 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/30 transition-colors"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {isPlaying ? "Pause Timeline" : "Play Evolution"}
            </button>
          </div>
        }
      />

      {/* Timeline Controls */}
      <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-red-400" />
            <span className="text-xs font-bold text-[#E5E7EB] uppercase">
              Temporal Window: August 01, 2026 – August 31, 2026
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-gray-400">SLIDING STEP:</span>
            {[3, 7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => setWindowDays(days)}
                className={`rounded px-2 py-1 text-xs transition-colors ${
                  windowDays === days
                    ? "bg-red-600 text-white font-bold"
                    : "bg-[#0B1020] text-gray-400 border border-[#1F2937] hover:text-white"
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Slider Track */}
        <div className="space-y-2">
          <div className="relative h-2 rounded-full bg-[#0B1020] border border-[#1F2937] overflow-hidden">
            <div className="absolute left-[35%] w-[25%] h-full bg-red-500/60 rounded-full" />
            <div className="absolute left-[47%] h-full w-2 bg-white rounded-full shadow-[0_0_10px_white]" />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-gray-500">
            <span>2026-08-01 (Baseline)</span>
            <span className="text-red-400 font-bold">ACTIVE SLICE: Aug 11 - Aug 18 (Peak Activity)</span>
            <span>2026-08-31 (Post-Reconfig)</span>
          </div>
        </div>
      </div>

      {/* Temporal Anomalies */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
          <h2 className="text-sm font-bold tracking-wider text-[#E5E7EB] uppercase">
            Detected Temporal Spikes & Anomalies
          </h2>
          <span className="text-xs font-mono text-red-400">
            3 High-Frequency Bursts Isolated
          </span>
        </div>

        <div className="space-y-3">
          {temporalBursts.map((burst) => (
            <div
              key={burst.id}
              className="rounded-xl border border-[#1F2937] bg-[#111827] p-5 space-y-3 hover:border-red-500/40 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1F2937] pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-red-400">{burst.id}</span>
                  <span className="text-xs font-bold text-white">{burst.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-400">{burst.duration}</span>
                  <span
                    className={`rounded border px-2 py-0.5 text-[10px] font-mono font-bold ${
                      burst.threat === "CRITICAL"
                        ? "border-red-500/30 bg-red-500/10 text-red-400"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {burst.threat}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                <div className="md:col-span-8 space-y-1">
                  <p className="text-gray-300">{burst.significance}</p>
                  <div className="text-[11px] font-mono text-gray-400">
                    Intensity: <span className="text-white">{burst.intensity}</span>
                  </div>
                </div>

                <div className="md:col-span-4 flex flex-wrap gap-1 items-start justify-end">
                  {burst.entities.map((e) => (
                    <span
                      key={e}
                      className="rounded border border-[#1F2937] bg-[#0B1020] px-2 py-0.5 font-mono text-[10px] text-cyan-300"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
