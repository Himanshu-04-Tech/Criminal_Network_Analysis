"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieIcon } from "lucide-react";
import { RoleDistribution } from "@/types";

export interface RoleDistributionChartProps {
  distribution: RoleDistribution[];
}

export function RoleDistributionChart({ distribution }: RoleDistributionChartProps) {
  const total = distribution.reduce((sum, item) => sum + item.count, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as RoleDistribution;
      return (
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl font-mono text-xs space-y-1">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <span>{data.label}</span>
          </div>
          <div className="text-[11px] text-slate-600 font-medium">
            Count: <span className="font-bold text-slate-900">{data.count}</span> ({data.percentage}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs font-mono flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3.5 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl border border-cyan-200 bg-cyan-50 text-cyan-700 shadow-2xs">
              <PieIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Role Distribution
              </h3>
              <span className="text-[10px] text-slate-500 font-semibold">
                PROPORTION OF DETECTED ROLES
              </span>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-slate-200 bg-slate-100 text-slate-700">
            {total} CLASSIFIED
          </span>
        </div>

        {/* Donut Chart with Center Stat */}
        <div className="h-48 w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={distribution}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={78}
                paddingAngle={4}
                dataKey="count"
              >
                {distribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Callout */}
          <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-xl font-black text-slate-900">{total}</span>
            <span className="text-[9px] text-slate-400 font-semibold uppercase">Nodes</span>
          </div>
        </div>

        {/* Legend Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
          {distribution.map((item) => (
            <div
              key={item.role}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-700 truncate font-semibold text-[10px]">{item.label}</span>
              </div>
              <span className="font-bold text-slate-900 text-[10px] ml-1">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 pt-3.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-medium">
        <span>TOPOLOGICAL DIVERSITY</span>
        <span className="text-cyan-800 font-bold">BALANCED SPECTRUM</span>
      </div>
    </div>
  );
}

