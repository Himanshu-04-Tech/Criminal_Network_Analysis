"use client";

import React from "react";
import Link from "next/link";
import {
  Share2,
  Phone,
  Car,
  CreditCard,
  Building,
  MapPin,
  Users,
  ExternalLink,
} from "lucide-react";
import { SharedResource, EntityType } from "@/types";

export interface SharedResourcesPanelProps {
  resources: SharedResource[];
}

export function SharedResourcesPanel({ resources }: SharedResourcesPanelProps) {
  const getResourceIcon = (type: EntityType) => {
    switch (type) {
      case "PHONE":
        return <Phone className="h-4 w-4 text-cyan-600" />;
      case "VEHICLE":
        return <Car className="h-4 w-4 text-amber-600" />;
      case "ACCOUNT":
      case "BANK_ACCOUNT":
        return <CreditCard className="h-4 w-4 text-emerald-600" />;
      case "ORGANIZATION":
        return <Building className="h-4 w-4 text-red-600" />;
      case "LOCATION":
        return <MapPin className="h-4 w-4 text-purple-600" />;
      default:
        return <Share2 className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm font-mono flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg border border-cyan-200 bg-cyan-50 text-cyan-700">
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Shared Operational Infrastructure
              </h3>
              <span className="text-[10px] text-slate-500">
                CO-UTILIZED ASSETS &amp; RELAYS
              </span>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-cyan-200 bg-cyan-50 text-cyan-700">
            {resources.length} ASSETS DETECTED
          </span>
        </div>

        {/* Resources List */}
        {resources.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
            No direct shared hardware, vehicle, or account resources detected within current search depth.
          </div>
        ) : (
          <div className="space-y-3">
            {resources.map((res) => (
              <div
                key={res.id}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2.5 transition-colors hover:border-slate-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                      {getResourceIcon(res.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{res.id}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-cyan-200 bg-cyan-50 text-cyan-700 uppercase">
                          {res.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{res.name}</div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    {res.confidence}% Link
                  </span>
                </div>

                {/* Used By Breakdown */}
                <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-1">
                    <Users className="h-3 w-3 text-slate-400" /> Co-Utilized By Primary Targets:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {res.usedBy.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-[11px]"
                      >
                        <Link
                          href={`/entity/${user.id}`}
                          className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <span>{user.id}</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </Link>
                        <span className="text-[10px] text-slate-500 truncate max-w-[100px]">
                          {user.relation}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Corroboration Note */}
                {res.evidence && (
                  <p className="text-[10px] text-slate-600 italic bg-white p-2 rounded-lg border border-slate-200">
                    {res.evidence}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Classification */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
        <span>INFRASTRUCTURE OVERLAP DETECTOR</span>
        <span className="text-slate-600 font-semibold">MODULE 3 ENGINE</span>
      </div>
    </div>
  );
}
