"use client";

import React from "react";
import { Filter, CheckSquare, Square, RefreshCcw, Eye, EyeOff } from "lucide-react";
import { EntityType } from "@/types/entity";
import { NODE_TYPE_COLORS } from "./GraphLegend";

export interface GraphFiltersProps {
  selectedTypes: EntityType[];
  onToggleType: (type: EntityType) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  typeCounts?: Record<string, number>;
  selectedRole?: string;
  onSelectRole?: (role: string) => void;
}

const FILTER_TYPES: Array<{ type: EntityType; label: string }> = [
  { type: "PERSON", label: "Persons" },
  { type: "PHONE", label: "Phone Numbers" },
  { type: "ACCOUNT", label: "Bank Accounts" },
  { type: "VEHICLE", label: "Vehicles" },
  { type: "LOCATION", label: "Locations" },
  { type: "ORGANIZATION", label: "Organizations" },
];

export function GraphFilters({
  selectedTypes,
  onToggleType,
  onSelectAll,
  onClearAll,
  typeCounts = {},
  selectedRole,
  onSelectRole,
}: GraphFiltersProps) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 font-mono text-xs shadow-xs">
      <div className="space-y-4.5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3.5">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-blue-600" />
            <h3 className="font-bold uppercase tracking-wider text-slate-900 text-xs">
              Entity Filters
            </h3>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <button
              onClick={onSelectAll}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              All
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={onClearAll}
              className="text-slate-500 hover:text-slate-800 font-medium"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Type Toggles */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            FILTER BY ENTITY TYPE
          </span>
          <div className="space-y-1.5">
            {FILTER_TYPES.map(({ type, label }) => {
              const isSelected = selectedTypes.includes(type);
              const colorInfo = NODE_TYPE_COLORS[type] || { color: "#64748B" };
              const count = typeCounts[type] || 0;

              return (
                <button
                  key={type}
                  onClick={() => onToggleType(type)}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 border transition-all ${
                    isSelected
                      ? "border-blue-200 bg-blue-50/50 text-slate-900 hover:border-blue-300"
                      : "border-slate-100 bg-slate-50/50 text-slate-400 hover:bg-slate-100/70"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full ring-2 ring-white"
                      style={{
                        backgroundColor: isSelected ? colorInfo.color : "#CBD5E1",
                      }}
                    />
                    <span className={`text-xs ${isSelected ? "font-semibold text-slate-800" : "text-slate-400"}`}>
                      {label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-white px-2 py-0.5 text-[10px] text-slate-600 font-mono border border-slate-200">
                      {count}
                    </span>
                    {isSelected ? (
                      <Eye className="h-3.5 w-3.5 text-blue-600" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5 text-slate-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Role Intelligence Quick Filter */}
        {onSelectRole && (
          <div className="space-y-2 pt-3 border-t border-slate-200">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              INVESTIGATIVE ROLE
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              {["ALL", "BROKER", "HUB", "FINANCIAL_CONDUIT"].map((role) => (
                <button
                  key={role}
                  onClick={() => onSelectRole(role)}
                  className={`rounded-xl border px-2.5 py-1.5 transition-all truncate font-semibold ${
                    selectedRole === role
                      ? "border-amber-300 bg-amber-50 text-amber-800 shadow-2xs"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between font-medium">
        <span>Active Types: {selectedTypes.length}/6</span>
        <span className="text-emerald-700 font-semibold">Active Filter</span>
      </div>
    </div>
  );
}

