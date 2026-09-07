"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  actionButton?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  badge,
  badgeColor = "bg-blue-50 text-blue-700 border-blue-200",
  actionButton,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#E2E8F0] pb-5", className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
            {title}
          </h1>
          {badge && (
            <span className={cn("rounded-full border px-3 py-0.5 text-[11px] font-mono font-semibold tracking-wide uppercase shadow-2xs", badgeColor)}>
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-[#64748B] max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actionButton && (
        <div className="flex items-center gap-2 shrink-0">
          {actionButton}
        </div>
      )}
    </div>
  );
}
