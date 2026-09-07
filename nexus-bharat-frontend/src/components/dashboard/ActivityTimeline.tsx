"use client";

import React from "react";
import {
  Clock,
  FolderPlus,
  ShieldAlert,
  GitMerge,
  PhoneCall,
  Activity,
  UserCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { ActivityEvent } from "@/types/activity";

export interface ActivityTimelineProps {
  activities?: ActivityEvent[];
  isLoading?: boolean;
}

function getActivityIcon(type: string) {
  if (type.includes("COMMUNICATION") || type.includes("BURST")) {
    return PhoneCall;
  }
  if (type.includes("BROKER")) {
    return ShieldAlert;
  }
  if (type.includes("COMMUNITY") || type.includes("MERGE")) {
    return GitMerge;
  }
  if (type.includes("CASE")) {
    return FolderPlus;
  }
  return Activity;
}

function getSeverityDot(severity?: string) {
  if (severity === "CRITICAL") return "bg-red-600 ring-red-100";
  if (severity === "HIGH") return "bg-amber-500 ring-amber-100";
  if (severity === "MEDIUM") return "bg-blue-600 ring-blue-100";
  return "bg-slate-400 ring-slate-100";
}

export function ActivityTimeline({ activities, isLoading }: ActivityTimelineProps) {
  if (isLoading || !activities) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs animate-pulse">
        <div className="h-4 w-44 rounded bg-slate-100" />
        <div className="space-y-4 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 rounded bg-slate-100" />
                <div className="h-3 w-full rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5 shadow-xs"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 shadow-2xs">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
              Recent Investigation Activity
            </h3>
            <p className="text-[11px] text-slate-500">
              Chronological log of multi-case graph mutations and operational detections
            </p>
          </div>
        </div>

        <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          Last 24 Hours Telemetry
        </span>
      </div>

      {/* Vertical Timeline */}
      <div className="relative pl-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {activities.map((event, index) => {
          const Icon = getActivityIcon(event.type);
          const dotClass = getSeverityDot(event.severity);

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="relative mb-5 last:mb-0 group"
            >
              {/* Timeline Node Dot */}
              <div
                className={`absolute -left-6 top-2 flex h-3 w-3 items-center justify-center rounded-full ring-4 ${dotClass}`}
              />

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition-all group-hover:border-slate-300 group-hover:bg-slate-50 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-lg p-1.5 border border-slate-200 bg-white text-blue-600 shadow-2xs">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      {event.title}
                    </span>
                    {event.caseId && (
                      <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-[9px] text-blue-700 font-semibold">
                        {event.caseId}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">{event.relativeTime}</span>
                    <span className="text-slate-300">//</span>
                    <span className="text-slate-400 text-[10px]">
                      {event.timestamp.replace("T", " ").substring(0, 16)}
                    </span>
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  {event.description}
                </p>

                {event.target && (
                  <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-slate-200 text-[10px] font-mono text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <span className="text-slate-400 uppercase font-semibold">Target:</span>
                      <strong className="text-slate-900">{event.target}</strong>
                    </span>

                    {event.metadata && (
                      <div className="flex items-center gap-2">
                        {Object.entries(event.metadata).map(([key, val]) => (
                          <span key={key} className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-slate-700 font-semibold shadow-2xs">
                            {key}: <strong className="text-blue-700">{String(val)}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

