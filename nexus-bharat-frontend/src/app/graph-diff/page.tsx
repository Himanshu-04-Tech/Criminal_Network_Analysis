"use client";

import React, { useState } from "react";
import {
  GitCompare,
  ArrowRight,
  PlusCircle,
  MinusCircle,
  AlertOctagon,
  RefreshCw,
  Layers,
  Download
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";

export default function GraphDiffPage() {
  const [snapshotA, setSnapshotA] = useState("Snapshot_1_Aug01_15");
  const [snapshotB, setSnapshotB] = useState("Snapshot_2_Aug16_31");

  const diffSummary = {
    entitiesAdded: 12,
    entitiesRemoved: 4,
    relationshipsAdded: 31,
    relationshipsRemoved: 8,
    newBrokers: ["P017 (Arjun Verma)", "P020 (Rajesh Shrivastav)"],
    communitiesMerged: 1,
    overallImpactScore: 0.84,
  };

  const structuralChanges = [
    {
      id: "CHG-01",
      category: "EMERGENT_BROKER",
      severity: "CRITICAL",
      entity: "P017 (Arjun Verma)",
      detail: "Promoted to primary broker role between Cyber cell and Mumbai hawala accounts. Betweenness score surged +0.34.",
    },
    {
      id: "CHG-02",
      category: "NEW_BURST_LINK",
      severity: "HIGH",
      entity: "PH001 ↔ PH016",
      detail: "37 high-frequency encrypted burner calls emerged in snapshot B that were nonexistent in snapshot A.",
    },
    {
      id: "CHG-03",
      category: "MULE_REPLACEMENT",
      severity: "HIGH",
      entity: "ACC001 → ACC018",
      detail: "ACC001 transaction volume ceased after freezing; traffic redirected through newly registered ICICI aggregator ACC018.",
    },
    {
      id: "CHG-04",
      category: "INACTIVE_ENTITY",
      severity: "LOW",
      entity: "P009 (Courier)",
      detail: "Zero recorded calls or transactions in Snapshot B. Entity appears abandoned or discarded by syndicate.",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Structural Graph Diff Engine"
        subtitle="Algorithmic topological differencing between temporal snapshots to track syndicate evolution and evasive mutations."
        badge="MODULE 8 // GRAPH DIFF"
        badgeColor="bg-blue-500/10 text-blue-400 border-blue-500/30"
        actionButton={
          <button className="flex items-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-500/20 px-3.5 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-500/30 transition-colors">
            <Download className="h-3.5 w-3.5" />
            Export Diff Analysis
          </button>
        }
      />

      {/* Snapshot Comparison Header */}
      <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-5">
            <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1.5">
              Baseline Graph (Snapshot A)
            </label>
            <select
              value={snapshotA}
              onChange={(e) => setSnapshotA(e.target.value)}
              className="w-full rounded-lg border border-[#1F2937] bg-[#0B1020] px-3.5 py-2 text-xs font-mono text-gray-200 focus:outline-none focus:border-blue-500"
            >
              <option value="Snapshot_1_Aug01_15">Snapshot 1: Aug 01 – Aug 15 (Early Phase)</option>
              <option value="Snapshot_Baseline">Snapshot 0: Historical Baseline</option>
            </select>
          </div>

          <div className="flex justify-center items-center md:col-span-2">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono text-gray-500 uppercase">Topological Diff</span>
              <GitCompare className="h-5 w-5 text-blue-400 my-1" />
            </div>
          </div>

          <div className="md:col-span-5">
            <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1.5">
              Evolved Graph (Snapshot B)
            </label>
            <select
              value={snapshotB}
              onChange={(e) => setSnapshotB(e.target.value)}
              className="w-full rounded-lg border border-[#1F2937] bg-[#0B1020] px-3.5 py-2 text-xs font-mono text-gray-200 focus:outline-none focus:border-blue-500"
            >
              <option value="Snapshot_2_Aug16_31">Snapshot 2: Aug 16 – Aug 31 (Peak Phase)</option>
              <option value="Snapshot_Current">Snapshot Live: Real-Time State</option>
            </select>
          </div>
        </div>
      </div>

      {/* Metric Delta Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-4">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span>ENTITIES</span>
            <PlusCircle className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-emerald-400">+{diffSummary.entitiesAdded}</span>
            <span className="text-xs font-mono text-red-400">-{diffSummary.entitiesRemoved}</span>
          </div>
          <div className="text-[10px] text-gray-500 mt-1">Net: +8 nodes</div>
        </div>

        <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-4">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span>RELATIONSHIPS</span>
            <PlusCircle className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-cyan-400">+{diffSummary.relationshipsAdded}</span>
            <span className="text-xs font-mono text-red-400">-{diffSummary.relationshipsRemoved}</span>
          </div>
          <div className="text-[10px] text-gray-500 mt-1">Net: +23 edges</div>
        </div>

        <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-4">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span>NEW BROKERS</span>
            <AlertOctagon className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="mt-1 text-xl font-bold font-mono text-amber-400">2 Emerged</div>
          <div className="text-[10px] text-gray-400 mt-1">P017 & P020</div>
        </div>

        <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-4">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span>EVOLUTION IMPACT</span>
            <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
          </div>
          <div className="mt-1 text-xl font-bold font-mono text-red-400">
            {(diffSummary.overallImpactScore * 100).toFixed(0)}%
          </div>
          <div className="text-[10px] text-red-400/80 mt-1">Critical Structural Shift</div>
        </div>
      </div>

      {/* Structural Changes List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
          <h2 className="text-sm font-bold tracking-wider text-[#E5E7EB] uppercase">
            Topological Intelligence Diff Log
          </h2>
          <span className="text-xs font-mono text-gray-400">
            Engine: GraphDiffService (Module 8)
          </span>
        </div>

        {structuralChanges.map((chg) => (
          <div
            key={chg.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#1F2937] bg-[#111827] p-4 hover:border-gray-600 transition-colors"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-400">{chg.id}</span>
                <span className="font-mono text-[10px] uppercase text-gray-400 bg-[#0B1020] px-2 py-0.5 rounded border border-[#1F2937]">
                  {chg.category}
                </span>
                <span className="font-semibold text-xs text-white">{chg.entity}</span>
              </div>
              <p className="text-xs text-gray-300">{chg.detail}</p>
            </div>

            <div className="shrink-0">
              <span
                className={`rounded border px-2 py-0.5 text-[10px] font-mono font-bold ${
                  chg.severity === "CRITICAL"
                    ? "border-red-500/30 bg-red-500/10 text-red-400"
                    : chg.severity === "HIGH"
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                    : "border-gray-600 bg-gray-800 text-gray-400"
                }`}
              >
                {chg.severity}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
