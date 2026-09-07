"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FolderGit2, Search, ArrowRight, Shield, FileText, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { EntityCase } from "@/types/entity";

export interface CasePanelProps {
  cases: EntityCase[];
  isLoading?: boolean;
}

export function CasePanel({ cases, isLoading }: CasePanelProps) {
  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-5 animate-pulse space-y-4 font-mono">
        <div className="h-4 w-40 rounded bg-[#1F2937]" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-[#0B1020]" />
          ))}
        </div>
      </div>
    );
  }

  const filtered = cases.filter(
    (c) =>
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.station.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2 }}
      className="rounded-xl border border-[#1F2937] bg-[#111827] p-5 font-mono text-xs space-y-4"
    >
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F2937] pb-3">
        <div className="flex items-center gap-2">
          <FolderGit2 className="h-4 w-4 text-blue-400" />
          <div>
            <h3 className="font-bold uppercase tracking-wider text-[#E5E7EB]">
              Linked FIR Dossiers
            </h3>
            <p className="text-[11px] text-gray-400">
              Active jurisdictional police cases where suspect is named
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-56">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter FIR cases..."
            className="w-full rounded-lg border border-[#1F2937] bg-[#0B1020] pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Cases List */}
      <div className="space-y-2.5">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-[#1F2937] bg-[#0B1020] p-3.5 hover:border-gray-600 transition-colors"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-blue-400">{c.id}</span>
                  <span
                    className={`rounded border px-1.5 py-0.2 text-[9px] font-bold ${
                      c.priority === "CRITICAL"
                        ? "border-red-500/30 bg-red-500/10 text-red-400"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {c.priority}
                  </span>
                  <span className="rounded border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.2 text-[9px] text-blue-300">
                    STATUS: {c.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-gray-200">{c.name}</h4>
              </div>

              <div className="text-right text-[10px] text-gray-500">
                <div>Filed: {c.filedDate}</div>
                <div className="text-cyan-400 font-semibold mt-0.5">
                  {c.evidenceCount} Evidence Exhibits
                </div>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[#1F2937]/70 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500 uppercase text-[10px]">Role in Case:</span>
                <span className="text-amber-300 font-medium">{c.entityRoleInCase}</span>
              </div>

              <Link
                href={`/cross-case?case=${c.id}`}
                className="flex items-center gap-1 text-[10px] font-semibold text-blue-400 hover:text-blue-300"
              >
                <span>Cross-Case Matrix</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
