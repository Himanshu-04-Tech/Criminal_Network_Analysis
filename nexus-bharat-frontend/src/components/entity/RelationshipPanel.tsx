"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Share2,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  Filter,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { EntityRelationship } from "@/types/entity";

export interface RelationshipPanelProps {
  relationships: EntityRelationship[];
  isLoading?: boolean;
}

export function RelationshipPanel({ relationships, isLoading }: RelationshipPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-5 animate-pulse space-y-4 font-mono">
        <div className="h-4 w-48 rounded bg-[#1F2937]" />
        <div className="h-40 rounded-lg bg-[#0B1020]" />
      </div>
    );
  }

  const filtered = relationships.filter((rel) => {
    const matchesSearch =
      rel.targetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rel.targetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rel.relationshipType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "ALL" || rel.relationshipType === typeFilter;
    return matchesSearch && matchesType;
  });

  const uniqueTypes = ["ALL", ...Array.from(new Set(relationships.map((r) => r.relationshipType)))];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className="rounded-xl border border-[#1F2937] bg-[#111827] p-5 font-mono text-xs space-y-4"
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F2937] pb-3">
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-cyan-400" />
          <div>
            <h3 className="font-bold uppercase tracking-wider text-[#E5E7EB]">
              Associative Relationship Ledger
            </h3>
            <p className="text-[11px] text-gray-400">
              Verified multi-hop connections with confidence and evidence grounding
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-60">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search targets or type..."
            className="w-full rounded-lg border border-[#1F2937] bg-[#0B1020] pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder:text-gray-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Type Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
        <span className="text-gray-500 mr-1">TYPE:</span>
        {uniqueTypes.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`rounded px-2 py-0.5 transition-colors ${
              typeFilter === t
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                : "bg-[#0B1020] text-gray-400 hover:text-white border border-[#1F2937]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Relationships Table */}
      <div className="overflow-x-auto rounded-lg border border-[#1F2937]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0B1020] text-[10px] uppercase text-gray-400 border-b border-[#1F2937]">
            <tr>
              <th className="py-2.5 px-3">Target Entity</th>
              <th className="py-2.5 px-3">Relationship Type</th>
              <th className="py-2.5 px-3">Direction</th>
              <th className="py-2.5 px-3">Evidence Details</th>
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3 text-right">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937] bg-[#111827]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500 font-mono text-xs">
                  NO RELATIONSHIPS MATCH SEARCH FILTER
                </td>
              </tr>
            ) : (
              filtered.map((rel) => (
                <tr key={rel.id} className="hover:bg-[#0B1020]/60 transition-colors group">
                  <td className="py-3 px-3">
                    <Link
                      href={`/entity/${rel.targetId}`}
                      className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-semibold group-hover:underline"
                    >
                      <span>{rel.targetId}</span>
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </Link>
                    <div className="text-[10px] text-gray-400">{rel.targetName}</div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="rounded bg-[#0B1020] border border-cyan-500/30 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                      {rel.relationshipType}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="flex items-center gap-1 text-[11px] text-gray-400">
                      {rel.direction === "outgoing" ? (
                        <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <ArrowDownLeft className="h-3.5 w-3.5 text-blue-400" />
                      )}
                      <span className="capitalize">{rel.direction}</span>
                    </span>
                  </td>

                  <td className="py-3 px-3 text-gray-300 max-w-xs text-[11px] leading-snug">
                    {rel.details || "Telemetry association confirmed"}
                    {rel.caseId && (
                      <span className="ml-1.5 rounded bg-blue-950/40 border border-blue-500/30 px-1 py-0.2 text-[9px] text-blue-300">
                        {rel.caseId}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-gray-400 text-[10px] whitespace-nowrap">
                    {rel.date}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <span className="text-emerald-400 font-bold">
                      {(rel.confidence * 100).toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
