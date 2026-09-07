"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface LoadingStateProps {
  message?: string;
  cardsCount?: number;
  className?: string;
}

export function LoadingState({
  message = "Decrypting intelligence telemetry...",
  cardsCount = 4,
  className,
}: LoadingStateProps) {
  return (
    <div className={cn("w-full space-y-6 animate-pulse", className)}>
      {/* Header Skeleton */}
      <div className="space-y-2 border-b border-[#1F2937] pb-5">
        <div className="h-6 w-48 rounded-md bg-[#1F2937]" />
        <div className="h-3 w-96 rounded-md bg-[#1F2937]/60" />
      </div>

      {/* Grid of Skeleton Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: cardsCount }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[#1F2937] bg-[#111827] p-5 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2 w-2/3">
                <div className="h-3 w-20 rounded bg-[#1F2937]" />
                <div className="h-7 w-28 rounded bg-[#1F2937]" />
              </div>
              <div className="h-9 w-9 rounded-lg bg-[#1F2937]" />
            </div>
            <div className="h-3 w-full rounded bg-[#1F2937]/50 pt-2" />
          </div>
        ))}
      </div>

      {/* Loading Radar Status */}
      <div className="flex items-center justify-center gap-2 py-8 text-xs font-mono text-[#9CA3AF]">
        <div className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
        <span>{message}</span>
      </div>
    </div>
  );
}
