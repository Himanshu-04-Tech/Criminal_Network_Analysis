"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { RankedEntity } from "@/types";

export interface InfluenceChartProps {
  entities: RankedEntity[];
}

export function InfluenceChart({ entities }: InfluenceChartProps) {
  const [chartType, setChartType] = useState<"bar" | "area">("bar");

  const data = entities.slice(0, 8).map((e) => ({
    name: e.id,
    fullName: e.name,
    influence: e.influenceScore,
    broker: e.brokerScore,
    risk: e.riskScore,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const entity = entities.find((e) => e.id === label);
      return (
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xl font-mono text-xs space-y-1.5">
          <div className="font-bold text-slate-900 flex items-center justify-between gap-4">
            <span>{label}</span>
            <span className="text-[10px] text-slate-500 font-semibold">{entity?.name}</span>
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="text-blue-700 flex justify-between gap-4 font-semibold">
              <span>Influence Score:</span>
              <span className="font-bold">{payload[0]?.value} / 100</span>
            </div>
            <div className="text-amber-800 flex justify-between gap-4 font-semibold">
              <span>Broker Score:</span>
              <span className="font-bold">{payload[1]?.value} / 100</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs font-mono flex flex-col justify-between h-full">
      <div>
        {/* Header with Switcher */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3.5 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-600 shadow-2xs">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Influence Distribution
              </h3>
              <span className="text-[10px] text-slate-500 font-semibold">
                CENTRALITY POWER VS BROKERAGE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setChartType("bar")}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                chartType === "bar"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Bar View
            </button>
            <button
              onClick={() => setChartType("area")}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                chartType === "area"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Area View
            </button>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bar" ? (
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  fontFamily="monospace"
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={10}
                  domain={[0, 100]}
                  tickLine={false}
                  fontFamily="monospace"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px", fontFamily: "monospace" }}
                />
                <Bar
                  dataKey="influence"
                  name="Influence Score"
                  fill="#2563EB"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="broker"
                  name="Broker Score"
                  fill="#F59E0B"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            ) : (
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="influenceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="brokerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  fontFamily="monospace"
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={10}
                  domain={[0, 100]}
                  tickLine={false}
                  fontFamily="monospace"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px", fontFamily: "monospace" }}
                />
                <Area
                  type="monotone"
                  dataKey="influence"
                  name="Influence Score"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#influenceGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="broker"
                  name="Broker Score"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#brokerGrad)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-5 pt-3.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-medium">
        <span>DEGREE + EIGENVECTOR SYNTHESIS</span>
        <span className="text-blue-700 font-bold">RECHARTS RENDERED</span>
      </div>
    </div>
  );
}

