"use client";

import React, { useState } from "react";
import {
  Clock,
  Search,
  PhoneCall,
  CreditCard,
  Building,
  MapPin,
  Activity,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { EntityTimelineEvent } from "@/types/entity";

export interface TimelinePanelProps {
  timeline: EntityTimelineEvent[];
  isLoading?: boolean;
}

function getEventIcon(type: string) {
  if (type === "COMMUNICATION") return PhoneCall;
  if (type === "FINANCIAL") return CreditCard;
  if (type === "CORPORATE") return Building;
  if (type === "MOVEMENT") return MapPin;
  return Activity;
}

function getSeverityDot(sev: string) {
  if (sev === "CRITICAL") return "bg-red-500 ring-red-500/30";
  if (sev === "HIGH") return "bg-amber-500 ring-amber-500/30";
  return "bg-blue-500 ring-blue-500/30";
}

export function TimelinePanel({ timeline, isLoading }: TimelinePanelProps) {
  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-5 animate-pulse space-y-4 font-mono">
        <div className="h-4 w-44 rounded bg-[#1F2937]" />
        <div className="h-32 rounded-lg bg-[#0B1020]" />
      </div>
    );
  }

  const filtered = timeline.filter(
    (ev) =>
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ev.target && ev.target.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.25 }}
      className="rounded-xl border border-[#1F2937] bg-[#111827] p-5 font-mono text-xs space-y-4"
    >
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F2937] pb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-400" />
          <div>
            <h3 className="font-bold uppercase tracking-wider text-[#E5E7EB]">
              Chronological Intelligence Timeline
            </h3>
            <p className="text-[11px] text-gray-400">
              Sorted newest first // multi-source operational event log
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-56">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search timeline events..."
            className="w-full rounded-lg border border-[#1F2937] bg-[#0B1020] pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder:text-gray-500 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Vertical Timeline Track */}
      <div className="relative pl-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1F2937] space-y-4">
        {filtered.map((event) => {
          const Icon = getEventIcon(event.type);
          const dotClass = getSeverityDot(event.severity);

          return (
            <div key={event.id} className="relative group">
              {/* Dot */}
              <div
                className={`absolute -left-6 top-1.5 flex h-3 w-3 items-center justify-center rounded-full ring-4 ${dotClass}`}
              />

              <div className="rounded-xl border border-[#1F2937] bg-[#0B1020] p-3.5 transition-all group-hover:border-gray-600">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded p-1 border border-[#1F2937] bg-[#111827] text-cyan-400">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-bold text-gray-200">{event.title}</span>
                    {event.caseId && (
                      <span className="rounded bg-blue-950/40 border border-blue-500/30 px-1.5 py-0.2 text-[9px] text-blue-300">
                        {event.caseId}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <span className="text-gray-300 font-semibold">{event.relativeTime}</span>
                    <span className="text-gray-600">//</span>
                    <span>{event.date}</span>
                  </div>
                </div>

                <p className="mt-1.5 text-xs text-gray-300 leading-relaxed">
                  {event.description}
                </p>

                {(event.target || event.location) && (
                  <div className="mt-2 pt-2 border-t border-[#1F2937]/70 flex items-center justify-between text-[10px] text-gray-400">
                    {event.target && (
                      <span>
                        Target: <strong className="text-cyan-300">{event.target}</strong>
                      </span>
                    )}
                    {event.location && (
                      <span>
                        Location: <strong className="text-purple-300">{event.location}</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
