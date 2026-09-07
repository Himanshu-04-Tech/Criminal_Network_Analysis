"use client";

import React from "react";
import { AlertTriangle, Clock, ShieldAlert, ChevronRight, Hash } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AlertSeverity } from "@/types";

export interface IntelligenceCardProps {
  title: string;
  description: string;
  severity: AlertSeverity;
  timestamp?: string;
  caseId?: string;
  entityTags?: string[];
  reasons?: string[];
  onAction?: () => void;
  className?: string;
}

const SEVERITY_STYLES: Record<AlertSeverity, {
  border: string;
  badge: string;
  iconBg: string;
  iconColor: string;
}> = {
  CRITICAL: {
    border: "border-red-200 hover:border-red-300",
    badge: "bg-red-50 text-red-700 border-red-200",
    iconBg: "bg-red-50 border-red-100",
    iconColor: "text-red-600",
  },
  HIGH: {
    border: "border-amber-200 hover:border-amber-300",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    iconBg: "bg-amber-50 border-amber-100",
    iconColor: "text-amber-600",
  },
  MEDIUM: {
    border: "border-blue-200 hover:border-blue-300",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    iconBg: "bg-blue-50 border-blue-100",
    iconColor: "text-blue-600",
  },
  MODERATE: {
    border: "border-cyan-200 hover:border-cyan-300",
    badge: "bg-cyan-50 text-cyan-700 border-cyan-200",
    iconBg: "bg-cyan-50 border-cyan-100",
    iconColor: "text-cyan-600",
  },
  LOW: {
    border: "border-emerald-200 hover:border-emerald-300",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconBg: "bg-emerald-50 border-emerald-100",
    iconColor: "text-emerald-600",
  },
};

export function IntelligenceCard({
  title,
  description,
  severity,
  timestamp = "2026-08-13T10:00:00Z",
  caseId,
  entityTags = [],
  reasons = [],
  onAction,
  className,
}: IntelligenceCardProps) {
  const styles = SEVERITY_STYLES[severity] || SEVERITY_STYLES.HIGH;

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        "group relative rounded-2xl border bg-white p-4.5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition-all duration-300",
        styles.border,
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={cn("rounded-xl border p-2", styles.iconBg)}>
            <AlertTriangle className={cn("h-4 w-4", styles.iconColor)} />
          </div>
          <div>
            <h4 className="text-sm font-semibold tracking-wide text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
              {title}
            </h4>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-[#64748B]">
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Clock className="h-3 w-3" />
                {timestamp.replace("T", " ").replace("Z", "")}
              </span>
              {caseId && (
                <span className="flex items-center gap-0.5 font-mono text-[11px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded-md border border-blue-200">
                  <Hash className="h-2.5 w-2.5" />
                  {caseId}
                </span>
              )}
            </div>
          </div>
        </div>

        <span className={cn("rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase font-mono shadow-2xs", styles.badge)}>
          {severity}
        </span>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-[#475569]">
        {description}
      </p>

      {/* Involved Entities Tags */}
      {entityTags.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-[#E2E8F0]">
          <span className="text-[10px] uppercase tracking-wider text-[#64748B] font-mono font-semibold">Targets:</span>
          {entityTags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-700"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Action Footer */}
      {onAction && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={onAction}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] hover:text-blue-700 transition-colors"
          >
            Investigate Anomaly
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
