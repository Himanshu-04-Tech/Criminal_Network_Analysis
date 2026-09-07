"use client";

import React from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Telemetry Feed Disrupted",
  message = "An error occurred while communicating with the graph intelligence engine. Verify backend service health.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-red-500/30 bg-red-950/10 p-8 text-center",
        className
      )}
    >
      <div className="rounded-full border border-red-500/30 bg-red-500/10 p-3 text-red-400">
        <AlertOctagon className="h-6 w-6" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-[#E5E7EB]">{title}</h3>
      <p className="mt-1.5 max-w-md text-xs text-[#9CA3AF] leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/20 px-3.5 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/30 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reconnect Feed
        </button>
      )}
    </div>
  );
}
