"use client";

import React from "react";
import { ShieldAlert, Activity, CheckCircle2, HelpCircle, Layers, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { EntityProfile } from "@/types/entity";

export interface EntityRoleCardProps {
  profile: EntityProfile;
}

export function EntityRoleCard({ profile }: EntityRoleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      className="flex h-full flex-col justify-between rounded-xl border border-[#1F2937] bg-[#111827] p-5 font-mono text-xs"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-400">
              <ShieldAlert className="h-3.5 w-3.5" />
            </div>
            <h3 className="font-bold uppercase tracking-wider text-[#E5E7EB]">
              Network Role Intelligence
            </h3>
          </div>
          <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold text-amber-400">
            MODULE 4
          </span>
        </div>

        {/* Primary Role Identity */}
        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-[#0B1020] to-[#0B1020] p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                CLASSIFIED INVESTIGATIVE ROLE
              </span>
              <div className="text-xl font-black text-amber-400 mt-0.5">
                {profile.role}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-400 uppercase">Influence Score</div>
              <div className="text-xl font-bold text-white mt-0.5">
                {profile.influenceScore}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-amber-500/20 pt-2.5 text-[11px]">
            <span className="text-gray-400">Cross-Cluster Reach:</span>
            <span className="font-bold text-cyan-400">
              {profile.communityReach} Criminal Communities
            </span>
          </div>
        </div>

        {/* Explainability Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-gray-300 font-semibold text-[11px]">
            <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
            <span>Why was this role assigned?</span>
          </div>

          <div className="rounded-lg border border-[#1F2937] bg-[#0B1020] p-3 space-y-1.5">
            {profile.roleReasons.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[11px] text-gray-300">
                <CheckCircle2 className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{reason}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Tag */}
      <div className="mt-4 pt-3 border-t border-[#1F2937] flex items-center justify-between text-[10px] text-gray-500">
        <span>ROLE ALGORITHM: Louvain + Betweenness</span>
        <span className="text-amber-400 font-semibold">94% CONFIDENCE</span>
      </div>
    </motion.div>
  );
}
