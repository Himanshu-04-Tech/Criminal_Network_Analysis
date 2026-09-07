"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  PhoneCall,
  UserCheck,
  Link2,
  Car,
  Clock,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertSeverity } from "@/types/alert";

export interface CriticalAlertsPanelProps {
  alerts?: Alert[];
  isLoading?: boolean;
}

const SEVERITY_CONFIG: Record<
  string,
  {
    border: string;
    bg: string;
    badge: string;
    dot: string;
    label: string;
  }
> = {
  CRITICAL: {
    border: "border-red-200 hover:border-red-300",
    bg: "bg-red-50/50 hover:bg-red-50/80",
    badge: "border-red-200 bg-red-100/70 text-red-700",
    dot: "bg-red-600",
    label: "CRITICAL",
  },
  HIGH: {
    border: "border-amber-200 hover:border-amber-300",
    bg: "bg-amber-50/50 hover:bg-amber-50/80",
    badge: "border-amber-200 bg-amber-100/70 text-amber-800",
    dot: "bg-amber-600",
    label: "HIGH",
  },
  MEDIUM: {
    border: "border-blue-200 hover:border-blue-300",
    bg: "bg-blue-50/50 hover:bg-blue-50/80",
    badge: "border-blue-200 bg-blue-100/70 text-blue-700",
    dot: "bg-blue-600",
    label: "MEDIUM",
  },
  MODERATE: {
    border: "border-amber-200 hover:border-amber-300",
    bg: "bg-amber-50/50 hover:bg-amber-50/80",
    badge: "border-amber-200 bg-amber-100/70 text-amber-800",
    dot: "bg-amber-600",
    label: "MODERATE",
  },
  LOW: {
    border: "border-slate-200 hover:border-slate-300",
    bg: "bg-slate-50 hover:bg-slate-100/70",
    badge: "border-slate-200 bg-slate-100 text-slate-700",
    dot: "bg-slate-400",
    label: "LOW",
  },
};

function getAlertIcon(type: string) {
  if (type.includes("COMMUNICATION") || type.includes("BURST")) {
    return PhoneCall;
  }
  if (type.includes("BROKER")) {
    return UserCheck;
  }
  if (type.includes("CROSS_CASE") || type.includes("CONNECTION")) {
    return Link2;
  }
  if (type.includes("VEHICLE")) {
    return Car;
  }
  return AlertTriangle;
}

export function CriticalAlertsPanel({ alerts, isLoading }: CriticalAlertsPanelProps) {
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");

  if (isLoading || !alerts) {
    return (
      <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-xs animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="h-4 w-40 rounded bg-slate-100" />
          <div className="h-3 w-20 rounded bg-slate-100" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  const filteredAlerts = alerts.filter(
    (a) => filterSeverity === "ALL" || a.severity === filterSeverity
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3.5 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-red-600 animate-ping" />
            <h3 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
              Critical Tactical Alerts
            </h3>
          </div>

          <Link
            href="/alerts"
            className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors font-mono"
          >
            <span>View All ({alerts.length})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mb-3.5 text-[10px] font-mono">
          <span className="text-slate-400 font-semibold mr-1">FILTER:</span>
          {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`rounded-lg px-2.5 py-1 transition-all font-semibold ${
                filterSeverity === sev
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredAlerts.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-400 font-mono">
                NO ACTIVE ALERTS FOR SELECTED FILTER
              </div>
            ) : (
              filteredAlerts.slice(0, 4).map((alert) => {
                const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.LOW;
                const Icon = getAlertIcon(alert.type);

                return (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`rounded-xl border p-3.5 transition-all shadow-2xs ${config.border} ${config.bg}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-lg p-2 border border-slate-200 bg-white shadow-2xs">
                          <Icon className="h-3.5 w-3.5 text-slate-700" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">
                              {alert.title}
                            </span>
                            {alert.caseId && (
                              <span className="rounded-md bg-white border border-slate-200 px-1.5 py-0.5 font-mono text-[9px] text-slate-600 font-semibold">
                                {alert.caseId}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                            {alert.description}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <span
                          className={`rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold ${config.badge}`}
                        >
                          {config.label}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 font-medium">
                          {alert.timestamp}
                        </span>
                      </div>
                    </div>

                    {/* Entities Tags */}
                    {((alert.entityTags && alert.entityTags.length > 0) ||
                      (alert.entitiesInvolved && alert.entitiesInvolved.length > 0)) && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/60">
                        <span className="text-[9px] font-mono uppercase text-slate-400 font-semibold">Targets:</span>
                        {(alert.entityTags || alert.entitiesInvolved || []).map((tag, idx) => (
                          <span
                            key={idx}
                            className="rounded-md bg-white border border-slate-200 px-2 py-0.5 font-mono text-[9px] text-blue-700 font-bold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-500 font-medium">
        <span>SEVERITY: RED / AMBER / BLUE</span>
        <span className="text-red-600 font-bold">IMMEDIATE TRIAGE REQUIRED</span>
      </div>
    </motion.div>
  );
}

