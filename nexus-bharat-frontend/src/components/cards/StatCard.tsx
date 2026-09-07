"use client";

import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  accent?: "blue" | "cyan" | "amber" | "red" | "emerald" | "purple";
  subtitle?: string;
  badge?: string;
  className?: string;
}

const ACCENT_STYLES = {
  blue: {
    iconBg: "bg-blue-50 text-[#2563EB] border border-blue-100",
    indicator: "bg-[#2563EB]",
  },
  cyan: {
    iconBg: "bg-cyan-50 text-cyan-600 border border-cyan-100",
    indicator: "bg-cyan-500",
  },
  purple: {
    iconBg: "bg-purple-50 text-purple-600 border border-purple-100",
    indicator: "bg-purple-500",
  },
  amber: {
    iconBg: "bg-amber-50 text-amber-600 border border-amber-100",
    indicator: "bg-amber-500",
  },
  red: {
    iconBg: "bg-red-50 text-red-600 border border-red-100",
    indicator: "bg-red-500",
  },
  emerald: {
    iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    indicator: "bg-emerald-500",
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  accent = "blue",
  subtitle,
  badge,
  className,
}: StatCardProps) {
  const styles = ACCENT_STYLES[accent] || ACCENT_STYLES.blue;

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        "group relative overflow-hidden rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition-all duration-300",
        className
      )}
    >
      {/* Top Subtle Accent Indicator Line */}
      <div className={cn("absolute top-0 left-0 right-0 h-1", styles.indicator, "opacity-80 group-hover:opacity-100 transition-opacity")} />

      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold tracking-wider text-[#64748B] uppercase">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold tracking-tight text-[#0F172A] font-mono">
              {value}
            </h3>
            {badge && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-600">
                {badge}
              </span>
            )}
          </div>
        </div>

        <div className={cn("rounded-2xl p-3 transition-transform group-hover:scale-105 shadow-2xs", styles.iconBg)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {/* Footer Details / Trend */}
      <div className="mt-4 flex items-center justify-between border-t border-[#E2E8F0] pt-3 text-xs">
        {trend ? (
          <div className="flex items-center gap-1.5 font-medium">
            {trend.isPositive !== false ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
            )}
            <span className={trend.isPositive !== false ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold"}>
              {trend.value}
            </span>
            {trend.label && (
              <span className="text-[#64748B] text-[11px]">{trend.label}</span>
            )}
          </div>
        ) : (
          <span className="text-[#64748B] text-[11px]">{subtitle || "Telemetry active"}</span>
        )}

        <span className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-widest font-semibold">
          LIVE // AGY
        </span>
      </div>
    </motion.div>
  );
}
