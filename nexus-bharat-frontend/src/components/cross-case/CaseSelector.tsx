"use client";

import React, { useState } from "react";
import { CaseProfile } from "@/types";
import {
  ArrowLeftRight,
  Search,
  ChevronDown,
  Building,
  FileText,
  Calendar,
  User,
  ShieldCheck,
  Flame,
  Check,
} from "lucide-react";

interface CaseSelectorProps {
  cases: CaseProfile[];
  selectedCaseAId: string;
  selectedCaseBId: string;
  onSelectCaseA: (id: string) => void;
  onSelectCaseB: (id: string) => void;
  onSwapCases: () => void;
  onSelectPreset: (caseAId: string, caseBId: string) => void;
}

const PRESETS = [
  {
    name: "Cyber Syndicate ↔ Contraband Supply",
    caseA: "FIR001",
    caseB: "FIR007",
    similarity: "82%",
    badge: "CRITICAL LINK",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  },
  {
    name: "Extortion Funnel ↔ Hawala Laundering",
    caseA: "FIR001",
    caseB: "FIR003",
    similarity: "86%",
    badge: "STRONG FUSION",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
  },
  {
    name: "Hawala Finance ↔ Inter-State Logistics",
    caseA: "FIR003",
    caseB: "FIR007",
    similarity: "79%",
    badge: "HIGH OVERLAP",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  },
  {
    name: "Cyber Syndicate ↔ Armed Courier Ring",
    caseA: "FIR001",
    caseB: "FIR010",
    similarity: "69%",
    badge: "MODERATE",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  },
];

export const CaseSelector: React.FC<CaseSelectorProps> = ({
  cases,
  selectedCaseAId,
  selectedCaseBId,
  onSelectCaseA,
  onSelectCaseB,
  onSwapCases,
  onSelectPreset,
}) => {
  const [openDropdownA, setOpenDropdownA] = useState(false);
  const [openDropdownB, setOpenDropdownB] = useState(false);
  const [searchA, setSearchA] = useState("");
  const [searchB, setSearchB] = useState("");

  const caseA = cases.find((c) => c.id === selectedCaseAId) || cases[0];
  const caseB = cases.find((c) => c.id === selectedCaseBId) || cases[1] || cases[0];

  const filteredCasesA = cases.filter(
    (c) =>
      c.id.toLowerCase().includes(searchA.toLowerCase()) ||
      c.title.toLowerCase().includes(searchA.toLowerCase()) ||
      c.station.toLowerCase().includes(searchA.toLowerCase()) ||
      c.section.toLowerCase().includes(searchA.toLowerCase())
  );

  const filteredCasesB = cases.filter(
    (c) =>
      c.id.toLowerCase().includes(searchB.toLowerCase()) ||
      c.title.toLowerCase().includes(searchB.toLowerCase()) ||
      c.station.toLowerCase().includes(searchB.toLowerCase()) ||
      c.section.toLowerCase().includes(searchB.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Preset Quick-Compare Strip */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mr-1">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          Intelligence Presets:
        </span>
        {PRESETS.map((preset) => {
          const isActive =
            (selectedCaseAId === preset.caseA && selectedCaseBId === preset.caseB) ||
            (selectedCaseAId === preset.caseB && selectedCaseBId === preset.caseA);

          return (
            <button
              key={`${preset.caseA}_${preset.caseB}`}
              onClick={() => onSelectPreset(preset.caseA, preset.caseB)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 ${
                isActive
                  ? "bg-cyan-950/60 border-cyan-500/80 text-cyan-200 shadow-sm shadow-cyan-500/20"
                  : "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
              }`}
            >
              <span className="font-mono font-bold text-slate-100">
                {preset.caseA} ↔ {preset.caseB}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${preset.badgeColor}`}>
                {preset.similarity}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dual Selector Main Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto,1fr] gap-4 items-center">
        {/* Case A Box */}
        <div className="relative">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 transition-all hover:border-slate-700 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Primary Case (Origin A)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-cyan-950/60 border border-cyan-800/40 text-cyan-300">
                {caseA?.status || "ACTIVE"}
              </span>
            </div>

            {/* Selector Trigger Button */}
            <button
              type="button"
              onClick={() => {
                setOpenDropdownA(!openDropdownA);
                setOpenDropdownB(false);
              }}
              className="w-full text-left bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 rounded-lg p-3 flex items-center justify-between group transition-all"
            >
              <div className="space-y-1 overflow-hidden pr-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-cyan-300 group-hover:text-cyan-200">
                    {caseA?.id}
                  </span>
                  <span className="text-xs text-slate-400 truncate max-w-[280px]">
                    {caseA?.title}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Building className="w-3 h-3 text-slate-400" />
                    <span className="truncate max-w-[200px]">{caseA?.station}</span>
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="font-mono text-slate-400">{caseA?.section}</span>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  openDropdownA ? "rotate-180 text-cyan-400" : ""
                }`}
              />
            </button>

            {/* Quick Metadata Pill Strip */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                Lead: <span className="text-slate-300 font-medium">{caseA?.leadInvestigator}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {caseA?.date}
              </span>
            </div>
          </div>

          {/* Dropdown A Menu */}
          {openDropdownA && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 space-y-2 backdrop-blur-md">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search FIR, IPC section, police station..."
                  value={searchA}
                  onChange={(e) => setSearchA(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                {filteredCasesA.map((c) => {
                  const isSelected = c.id === selectedCaseAId;
                  const isOpposite = c.id === selectedCaseBId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        onSelectCaseA(c.id);
                        setOpenDropdownA(false);
                      }}
                      disabled={isOpposite}
                      className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-all ${
                        isSelected
                          ? "bg-cyan-950/60 border border-cyan-500/50 text-cyan-200"
                          : isOpposite
                          ? "opacity-40 cursor-not-allowed bg-slate-950/40 text-slate-400"
                          : "hover:bg-slate-800/80 text-slate-300"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-cyan-300">{c.id}</span>
                          <span className="font-medium text-slate-200">{c.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">{c.station} • {c.section}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                      {isOpposite && <span className="text-[10px] text-slate-400 italic">Target B</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Swap Button In-Between */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onSwapCases}
            title="Swap Primary & Target Cases"
            className="p-3 rounded-full bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-cyan-300 hover:border-cyan-500 hover:bg-slate-800 transition-all shadow-md active:scale-95 group"
          >
            <ArrowLeftRight className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
          </button>
        </div>

        {/* Case B Box */}
        <div className="relative">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 transition-all hover:border-slate-700 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Target Case (Comparison B)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-purple-950/60 border border-purple-800/40 text-purple-300">
                {caseB?.status || "INVESTIGATION"}
              </span>
            </div>

            {/* Selector Trigger Button */}
            <button
              type="button"
              onClick={() => {
                setOpenDropdownB(!openDropdownB);
                setOpenDropdownA(false);
              }}
              className="w-full text-left bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 rounded-lg p-3 flex items-center justify-between group transition-all"
            >
              <div className="space-y-1 overflow-hidden pr-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-purple-300 group-hover:text-purple-200">
                    {caseB?.id}
                  </span>
                  <span className="text-xs text-slate-400 truncate max-w-[280px]">
                    {caseB?.title}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Building className="w-3 h-3 text-slate-400" />
                    <span className="truncate max-w-[200px]">{caseB?.station}</span>
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="font-mono text-slate-400">{caseB?.section}</span>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  openDropdownB ? "rotate-180 text-purple-400" : ""
                }`}
              />
            </button>

            {/* Quick Metadata Pill Strip */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                Lead: <span className="text-slate-300 font-medium">{caseB?.leadInvestigator}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {caseB?.date}
              </span>
            </div>
          </div>

          {/* Dropdown B Menu */}
          {openDropdownB && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 space-y-2 backdrop-blur-md">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search FIR, IPC section, police station..."
                  value={searchB}
                  onChange={(e) => setSearchB(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  autoFocus
                />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                {filteredCasesB.map((c) => {
                  const isSelected = c.id === selectedCaseBId;
                  const isOpposite = c.id === selectedCaseAId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        onSelectCaseB(c.id);
                        setOpenDropdownB(false);
                      }}
                      disabled={isOpposite}
                      className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-all ${
                        isSelected
                          ? "bg-purple-950/60 border border-purple-500/50 text-purple-200"
                          : isOpposite
                          ? "opacity-40 cursor-not-allowed bg-slate-950/40 text-slate-400"
                          : "hover:bg-slate-800/80 text-slate-300"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-purple-300">{c.id}</span>
                          <span className="font-medium text-slate-200">{c.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">{c.station} • {c.section}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                      {isOpposite && <span className="text-[10px] text-slate-400 italic">Origin A</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
