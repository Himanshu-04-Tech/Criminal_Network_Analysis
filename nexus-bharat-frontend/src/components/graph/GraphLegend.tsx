"use client";

import React, { useState } from "react";
import { Info, ChevronUp, ChevronDown } from "lucide-react";

export const NODE_TYPE_COLORS: Record<string, { color: string; label: string; bg: string }> = {
  PERSON: { color: "#2563EB", label: "Person", bg: "bg-blue-600" },
  PHONE: { color: "#06B6D4", label: "Phone", bg: "bg-cyan-600" },
  ACCOUNT: { color: "#10B981", label: "Bank Account", bg: "bg-emerald-600" },
  VEHICLE: { color: "#F97316", label: "Vehicle", bg: "bg-orange-600" },
  LOCATION: { color: "#8B5CF6", label: "Location", bg: "bg-purple-600" },
  ORGANIZATION: { color: "#EF4444", label: "Organization", bg: "bg-red-600" },
};

export function GraphLegend() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white/90 backdrop-blur-xl p-3 shadow-lg font-mono text-xs text-[#0F172A]">
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-1.5 text-[#0F172A] font-bold uppercase tracking-wider text-[10px]">
          <Info className="h-3.5 w-3.5 text-[#2563EB]" />
          <span>Entity Legend</span>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand legend" : "Collapse legend"}
          className="text-[#64748B] hover:text-[#0F172A] transition-colors p-0.5 rounded hover:bg-slate-100"
        >
          {collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </button>
      </div>

      {!collapsed && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2.5">
          {Object.entries(NODE_TYPE_COLORS).map(([key, item]) => (
            <div key={key} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full shadow-2xs shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[#334155] text-[11px] font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
