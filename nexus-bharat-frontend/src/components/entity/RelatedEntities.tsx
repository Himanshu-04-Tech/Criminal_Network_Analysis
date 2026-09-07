"use client";

import React from "react";
import Link from "next/link";
import { Users, ExternalLink, ShieldAlert, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { RelatedEntity } from "@/types/entity";

export interface RelatedEntitiesProps {
  related: RelatedEntity[];
  isLoading?: boolean;
}

export function RelatedEntities({ related, isLoading }: RelatedEntitiesProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-5 animate-pulse space-y-4 font-mono">
        <div className="h-4 w-48 rounded bg-[#1F2937]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-lg bg-[#0B1020]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.3 }}
      className="rounded-xl border border-[#1F2937] bg-[#111827] p-5 font-mono text-xs space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-purple-400" />
          <div>
            <h3 className="font-bold uppercase tracking-wider text-[#E5E7EB]">
              Primary Linked Associates
            </h3>
            <p className="text-[11px] text-gray-400">
              Highest-weight connected entities ranked by associative co-occurrence
            </p>
          </div>
        </div>

        <span className="text-[10px] text-gray-500">
          {related.length} High-Affinity Targets
        </span>
      </div>

      {/* Grid of Clickable Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {related.map((item) => (
          <Link
            key={item.id}
            href={`/entity/${item.id}`}
            className="group rounded-xl border border-[#1F2937] bg-[#0B1020] p-4 hover:border-blue-500/50 hover:bg-[#0f172a] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-blue-400 group-hover:text-blue-300">
                      {item.id}
                    </span>
                    <ExternalLink className="h-3 w-3 text-gray-500 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <h4 className="text-xs font-bold text-gray-200 mt-0.5 truncate max-w-[150px]">
                    {item.name}
                  </h4>
                </div>

                <span className="rounded border border-red-500/30 bg-red-500/10 px-1.5 py-0.2 text-[9px] font-bold text-red-400">
                  {item.riskScore}
                </span>
              </div>

              <div className="mt-2 text-[10px] text-amber-300 font-semibold truncate">
                {item.role || item.type}
              </div>

              <p className="mt-1 text-[11px] text-gray-400 leading-snug">
                {item.relationship}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-[#1F2937] flex items-center justify-between text-[10px] text-gray-500">
              <span>{item.sharedCases} Shared Cases</span>
              <span className="text-emerald-400 font-semibold">{item.connectionStrength}% fit</span>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
