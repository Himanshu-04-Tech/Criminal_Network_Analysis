"use client";

import React from "react";
import { Users, FolderGit2, Network, Calendar, Clock, MapPin, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { EntityProfile } from "@/types/entity";

export interface EntitySummaryProps {
  profile: EntityProfile;
}

export function EntitySummary({ profile }: EntitySummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex h-full flex-col justify-between rounded-xl border border-[#1F2937] bg-[#111827] p-5 font-mono text-xs"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <h3 className="font-bold uppercase tracking-wider text-[#E5E7EB]">
              Intelligence Summary
            </h3>
          </div>
          <span className="text-[10px] text-gray-500">DOSSIER #DS-{profile.id}</span>
        </div>

        {/* 3 Metrics Pills */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="rounded-lg border border-[#1F2937] bg-[#0B1020] p-2.5">
            <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 uppercase">
              <Users className="h-3 w-3 text-cyan-400" />
              Connections
            </div>
            <div className="text-xl font-bold text-cyan-400 mt-1">
              {profile.connectionsCount}
            </div>
          </div>

          <div className="rounded-lg border border-[#1F2937] bg-[#0B1020] p-2.5">
            <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 uppercase">
              <FolderGit2 className="h-3 w-3 text-blue-400" />
              Cases
            </div>
            <div className="text-xl font-bold text-blue-400 mt-1">
              {profile.casesCount}
            </div>
          </div>

          <div className="rounded-lg border border-[#1F2937] bg-[#0B1020] p-2.5">
            <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 uppercase">
              <Network className="h-3 w-3 text-purple-400" />
              Communities
            </div>
            <div className="text-xl font-bold text-purple-400 mt-1">
              {profile.communitiesCount}
            </div>
          </div>
        </div>

        {/* Operational Timeline Metadata */}
        <div className="space-y-2 rounded-lg border border-[#1F2937] bg-[#0B1020] p-3 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 flex items-center gap-1.5">
              <Calendar className="h-3 w-3 text-gray-400" />
              First Seen:
            </span>
            <span className="text-gray-300 font-semibold">{profile.firstSeen}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-emerald-400" />
              Last Active:
            </span>
            <span className="text-emerald-400 font-semibold">{profile.lastSeen}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-[#1F2937]">
            <span className="text-gray-500 flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-blue-400" />
              Jurisdiction:
            </span>
            <span className="text-blue-300 text-right truncate max-w-[170px]">
              {profile.jurisdiction}
            </span>
          </div>
        </div>

        {/* Known Aliases */}
        {profile.alias && profile.alias.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Tag className="h-3 w-3 text-amber-400" />
              Identified Aliases
            </span>
            <div className="flex flex-wrap gap-1.5">
              {profile.alias.map((a, i) => (
                <span
                  key={i}
                  className="rounded-md border border-[#1F2937] bg-[#0B1020] px-2 py-0.5 text-[10px] text-gray-300"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Tag */}
      <div className="mt-4 pt-3 border-t border-[#1F2937] flex items-center justify-between text-[10px] text-gray-500">
        <span>PROVENANCE: MULTI-AGENCY GRAPH</span>
        <span className="text-cyan-400">VERIFIED TARGET</span>
      </div>
    </motion.div>
  );
}
