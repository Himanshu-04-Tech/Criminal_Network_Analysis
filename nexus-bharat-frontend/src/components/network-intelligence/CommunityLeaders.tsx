"use client";

import React from "react";
import Link from "next/link";
import { Users, ExternalLink, MapPin, Layers } from "lucide-react";
import { CommunityLeader } from "@/types";
import { RoleBadge } from "./RoleBadge";

export interface CommunityLeadersProps {
  leaders: CommunityLeader[];
}

export function CommunityLeaders({ leaders }: CommunityLeadersProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs font-mono flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3.5 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl border border-purple-200 bg-purple-50 text-purple-600 shadow-2xs">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Community Leaders
              </h3>
              <span className="text-[10px] text-slate-500 font-semibold">
                DETECTED CLUSTER HEADS
              </span>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-purple-200 bg-purple-50 text-purple-800">
            {leaders.length} CLUSTERS
          </span>
        </div>

        {/* Leaders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {leaders.map((leader) => (
            <div
              key={leader.communityId}
              className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 transition-all hover:border-slate-300 hover:bg-slate-50 shadow-2xs"
            >
              {/* Community Label & Size */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {leader.communityId}
                </span>
                <span className="text-[10px] text-indigo-700 font-bold flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  {leader.memberCount} Members
                </span>
              </div>

              {/* Community Title */}
              <div className="text-xs font-bold text-slate-900 truncate" title={leader.communityName}>
                {leader.communityName}
              </div>

              {/* Leader Info */}
              <div className="pt-2.5 border-t border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/entity/${leader.leaderId}`}
                      className="font-bold text-blue-600 hover:underline flex items-center gap-1 text-xs"
                    >
                      <span>{leader.leaderId}</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </Link>
                    <RoleBadge role={leader.leaderRole} size="sm" showIcon={false} />
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold truncate max-w-[130px] mt-0.5">
                    {leader.leaderName}
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className="text-[9px] text-slate-400 font-semibold">Influence</div>
                  <div className="text-sm font-black text-purple-700">
                    {leader.influenceScore}
                  </div>
                </div>
              </div>

              {/* Jurisdiction */}
              <div className="text-[9px] text-slate-400 font-medium flex items-center gap-1 pt-1">
                <MapPin className="h-3 w-3 text-slate-400" />
                <span className="truncate">{leader.jurisdiction}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Classification */}
      <div className="mt-5 pt-3.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-medium">
        <span>COMMUNITY PARTITIONING ALGORITHM</span>
        <span className="text-purple-700 font-bold">LOUVAIN RESOLVED</span>
      </div>
    </div>
  );
}

