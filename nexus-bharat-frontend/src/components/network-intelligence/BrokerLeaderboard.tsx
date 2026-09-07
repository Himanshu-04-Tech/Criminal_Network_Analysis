"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ExternalLink, Layers } from "lucide-react";
import { BrokerEntity } from "@/types";

export interface BrokerLeaderboardProps {
  brokers: BrokerEntity[];
}

export function BrokerLeaderboard({ brokers }: BrokerLeaderboardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs font-mono flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3.5 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-600 shadow-2xs">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Top Network Brokers
              </h3>
              <span className="text-[10px] text-slate-500 font-semibold">
                INTER-COMMUNITY BOTTLENECK RANKING
              </span>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800">
            TOP {brokers.length} IDENTIFIED
          </span>
        </div>

        {/* List */}
        <div className="space-y-3">
          {brokers.map((broker) => {
            const isTop3 = broker.rank <= 3;

            return (
              <div
                key={broker.id}
                className={`rounded-xl border p-3.5 transition-all hover:border-slate-300 flex items-center justify-between gap-3 shadow-2xs ${
                  isTop3
                    ? "border-amber-200 bg-amber-50/40"
                    : "border-slate-200 bg-slate-50/70"
                }`}
              >
                {/* Left: Rank + Entity */}
                <div className="flex items-center gap-3">
                  <div
                    className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-2xs ${
                      broker.rank === 1
                        ? "bg-amber-400 text-amber-950 font-black"
                        : broker.rank === 2
                        ? "bg-slate-200 text-slate-800 font-black"
                        : broker.rank === 3
                        ? "bg-amber-700 text-white font-black"
                        : "bg-white text-slate-600 border border-slate-200"
                    }`}
                  >
                    #{broker.rank}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/entity/${broker.id}`}
                        className="font-bold text-slate-900 hover:text-blue-600 transition-colors flex items-center gap-1 text-xs"
                      >
                        <span>{broker.id}</span>
                        <ExternalLink className="h-2.5 w-2.5 text-slate-400 hover:text-blue-600" />
                      </Link>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-white border border-slate-200 text-slate-600 font-semibold">
                        {broker.type}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold truncate max-w-[130px]">
                      {broker.name}
                    </div>
                  </div>
                </div>

                {/* Right: Metrics */}
                <div className="flex items-center gap-4 text-right">
                  {/* Communities */}
                  <div className="hidden sm:block">
                    <div className="text-[9px] text-slate-400 uppercase font-semibold">Communities</div>
                    <div className="text-xs font-bold text-indigo-700 flex items-center justify-end gap-1">
                      <Layers className="h-3 w-3" />
                      <span>{broker.communitiesConnected} Clusters</span>
                    </div>
                  </div>

                  {/* Broker Score */}
                  <div className="min-w-[80px]">
                    <div className="text-[9px] text-slate-400 uppercase font-semibold">Broker Score</div>
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-sm font-black text-amber-700">
                        {broker.brokerScore}
                      </span>
                      <span className="text-[9px] text-slate-400">/ 100</span>
                    </div>
                    {/* Small progress meter */}
                    <div className="w-full h-1.5 rounded-full bg-slate-200/80 mt-1 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${broker.brokerScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Alert */}
      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-medium">
        <span>TOPOLOGICAL BOTTLENECK ANALYSIS</span>
        <span className="text-amber-800 font-bold">PRIORITY NEUTRALIZATION</span>
      </div>
    </div>
  );
}

