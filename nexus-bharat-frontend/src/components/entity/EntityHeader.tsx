"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Download,
  GitBranch,
  Printer,
  Share2,
  AlertTriangle,
  FileCheck2
} from "lucide-react";
import { motion } from "framer-motion";
import { EntityProfile } from "@/types/entity";

export interface EntityHeaderProps {
  profile: EntityProfile;
}

export function EntityHeader({ profile }: EntityHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4 border-b border-[#1F2937] pb-6 sm:flex-row sm:items-center sm:justify-between font-mono"
    >
      {/* Target Identity & Badges */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Link
            href="/network-explorer"
            className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors mr-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Network Explorer</span>
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-gray-500">Entities</span>
          <span className="text-gray-600">/</span>
          <span className="font-bold text-blue-400">{profile.id}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl font-sans">
            {profile.name}
          </h1>
          <span className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-400">
            {profile.id}
          </span>
          <span className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-300">
            {profile.type}
          </span>
        </div>

        {/* Security / Threat Badges */}
        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-bold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            STATUS: {profile.status}
          </span>

          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-bold text-amber-400">
            INTERPOL / LEA WATCHLIST
          </span>

          <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 font-bold text-red-400">
            HIGH RISK TARGET
          </span>

          <span className="text-gray-500">//</span>
          <span className="text-gray-400">{profile.jurisdiction}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Link
          href={`/connection-finder?source=${profile.id}`}
          className="flex items-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-500/20 px-3.5 py-2 font-semibold text-blue-300 hover:bg-blue-500/30 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.15)]"
        >
          <GitBranch className="h-3.5 w-3.5" />
          <span>Trace Multi-Hop</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 rounded-lg border border-[#1F2937] bg-[#111827] px-3.5 py-2 font-medium text-gray-200 hover:bg-[#1f2937] hover:border-gray-600 transition-colors"
        >
          <Printer className="h-3.5 w-3.5 text-gray-400" />
          <span className="hidden sm:inline">Print Dossier</span>
        </button>

        <button
          className="flex items-center gap-1.5 rounded-lg border border-[#1F2937] bg-[#111827] px-3.5 py-2 font-medium text-gray-200 hover:bg-[#1f2937] hover:border-gray-600 transition-colors"
        >
          <Download className="h-3.5 w-3.5 text-gray-400" />
          <span>Export PDF</span>
        </button>
      </div>
    </motion.div>
  );
}
