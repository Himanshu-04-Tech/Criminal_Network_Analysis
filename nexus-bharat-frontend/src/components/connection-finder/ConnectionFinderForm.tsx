"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  ArrowRight,
  ArrowLeftRight,
  Shield,
  Phone,
  CreditCard,
  Building,
  Car,
  MapPin,
  Sliders,
  Sparkles,
  Loader2,
  X,
} from "lucide-react";
import { EntityType } from "@/types";

export interface EntityOption {
  id: string;
  name: string;
  type: EntityType;
  role?: string;
}

export interface ConnectionFinderFormProps {
  source: string;
  target: string;
  depth: number;
  availableEntities: EntityOption[];
  isLoading: boolean;
  onSearch: (source: string, target: string, depth: number) => void;
  onSourceChange: (source: string) => void;
  onTargetChange: (target: string) => void;
  onDepthChange: (depth: number) => void;
}

export function ConnectionFinderForm({
  source,
  target,
  depth,
  availableEntities,
  isLoading,
  onSearch,
  onSourceChange,
  onTargetChange,
  onDepthChange,
}: ConnectionFinderFormProps) {
  const [sourceQuery, setSourceQuery] = useState(source);
  const [targetQuery, setTargetQuery] = useState(target);
  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
  const [showTargetSuggestions, setShowTargetSuggestions] = useState(false);

  const sourceRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  // Sync with prop changes (e.g. when clicking recent search or URL param)
  useEffect(() => {
    setSourceQuery(source);
  }, [source]);

  useEffect(() => {
    setTargetQuery(target);
  }, [target]);

  // Click outside listener for suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sourceRef.current && !sourceRef.current.contains(e.target as Node)) {
        setShowSourceSuggestions(false);
      }
      if (targetRef.current && !targetRef.current.contains(e.target as Node)) {
        setShowTargetSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getEntityIcon = (type: EntityType) => {
    switch (type) {
      case "PERSON":
        return <Shield className="h-3.5 w-3.5 text-blue-400" />;
      case "PHONE":
        return <Phone className="h-3.5 w-3.5 text-cyan-400" />;
      case "ACCOUNT":
      case "BANK_ACCOUNT":
        return <CreditCard className="h-3.5 w-3.5 text-emerald-400" />;
      case "VEHICLE":
        return <Car className="h-3.5 w-3.5 text-amber-400" />;
      case "ORGANIZATION":
        return <Building className="h-3.5 w-3.5 text-red-400" />;
      case "LOCATION":
        return <MapPin className="h-3.5 w-3.5 text-purple-400" />;
      default:
        return <Shield className="h-3.5 w-3.5 text-blue-400" />;
    }
  };

  const filteredSourceEntities = availableEntities.filter(
    (e) =>
      e.id.toLowerCase().includes(sourceQuery.toLowerCase()) ||
      e.name.toLowerCase().includes(sourceQuery.toLowerCase())
  );

  const filteredTargetEntities = availableEntities.filter(
    (e) =>
      e.id.toLowerCase().includes(targetQuery.toLowerCase()) ||
      e.name.toLowerCase().includes(targetQuery.toLowerCase())
  );

  const handleSwap = () => {
    const tempSource = sourceQuery;
    setSourceQuery(targetQuery);
    setTargetQuery(tempSource);
    onSourceChange(targetQuery);
    onTargetChange(tempSource);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceQuery.trim() || !targetQuery.trim()) return;
    onSearch(sourceQuery.trim(), targetQuery.trim(), depth);
  };

  const setPreset = (s: string, t: string) => {
    setSourceQuery(s);
    setTargetQuery(t);
    onSourceChange(s);
    onTargetChange(t);
    onSearch(s, t, depth);
  };

  return (
    <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-5 shadow-2xl font-mono">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
          {/* Source Entity Input */}
          <div className="lg:col-span-4 relative" ref={sourceRef}>
            <label className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block mb-1.5 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              Source Target (Node A)
            </label>
            <div className="relative">
              <input
                type="text"
                value={sourceQuery}
                onChange={(e) => {
                  setSourceQuery(e.target.value);
                  onSourceChange(e.target.value);
                  setShowSourceSuggestions(true);
                }}
                onFocus={() => setShowSourceSuggestions(true)}
                placeholder="e.g. P001, Vikram Malhotra"
                className="w-full rounded-lg border border-[#1F2937] bg-[#0B1020] px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono transition-all"
              />
              {sourceQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSourceQuery("");
                    onSourceChange("");
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Source Autocomplete Dropdown */}
            {showSourceSuggestions && filteredSourceEntities.length > 0 && (
              <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-[#1F2937] bg-[#0B1020] py-1 shadow-2xl">
                {filteredSourceEntities.map((entity) => (
                  <div
                    key={entity.id}
                    onClick={() => {
                      setSourceQuery(entity.id);
                      onSourceChange(entity.id);
                      setShowSourceSuggestions(false);
                    }}
                    className="flex items-center justify-between px-3 py-2 text-xs hover:bg-[#1F2937] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {getEntityIcon(entity.type)}
                      <div>
                        <span className="font-bold text-white">{entity.id}</span>
                        <span className="text-gray-400 ml-1.5 text-[11px]">
                          {entity.name}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-500 font-semibold uppercase">
                      {entity.role || entity.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="lg:col-span-1 flex justify-center pb-1">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap Source and Target"
              className="p-2.5 rounded-lg border border-[#1F2937] bg-[#0B1020] text-gray-400 hover:text-blue-400 hover:border-blue-500/50 hover:bg-[#1F2937] transition-all"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>
          </div>

          {/* Target Entity Input */}
          <div className="lg:col-span-4 relative" ref={targetRef}>
            <label className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block mb-1.5 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
              Target Entity (Node B)
            </label>
            <div className="relative">
              <input
                type="text"
                value={targetQuery}
                onChange={(e) => {
                  setTargetQuery(e.target.value);
                  onTargetChange(e.target.value);
                  setShowTargetSuggestions(true);
                }}
                onFocus={() => setShowTargetSuggestions(true)}
                placeholder="e.g. P020, Rajesh Shrivastav"
                className="w-full rounded-lg border border-[#1F2937] bg-[#0B1020] px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono transition-all"
              />
              {targetQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setTargetQuery("");
                    onTargetChange("");
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Target Autocomplete Dropdown */}
            {showTargetSuggestions && filteredTargetEntities.length > 0 && (
              <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-[#1F2937] bg-[#0B1020] py-1 shadow-2xl">
                {filteredTargetEntities.map((entity) => (
                  <div
                    key={entity.id}
                    onClick={() => {
                      setTargetQuery(entity.id);
                      onTargetChange(entity.id);
                      setShowTargetSuggestions(false);
                    }}
                    className="flex items-center justify-between px-3 py-2 text-xs hover:bg-[#1F2937] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {getEntityIcon(entity.type)}
                      <div>
                        <span className="font-bold text-white">{entity.id}</span>
                        <span className="text-gray-400 ml-1.5 text-[11px]">
                          {entity.name}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-500 font-semibold uppercase">
                      {entity.role || entity.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search Depth Selector */}
          <div className="lg:col-span-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
              Max Hops
            </label>
            <select
              value={depth}
              onChange={(e) => onDepthChange(Number(e.target.value))}
              className="w-full rounded-lg border border-[#1F2937] bg-[#0B1020] px-2.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value={2}>2 Hops</option>
              <option value={3}>3 Hops</option>
              <option value={4}>4 Hops</option>
              <option value={5}>5 Hops</option>
              <option value={6}>6 Hops</option>
            </select>
          </div>

          {/* Submit Action Button */}
          <div className="lg:col-span-2">
            <button
              type="submit"
              disabled={isLoading || !sourceQuery.trim() || !targetQuery.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/40 disabled:cursor-not-allowed px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-900/40 transition-all font-mono"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Traversing...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Find Path</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Presets Strip */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1F2937]/70 text-[11px]">
          <span className="text-gray-500 text-[10px] flex items-center gap-1 uppercase">
            <Sparkles className="h-3 w-3 text-amber-400" />
            Quick Investigations:
          </span>
          <button
            type="button"
            onClick={() => setPreset("P001", "P020")}
            className="px-2 py-0.5 rounded bg-[#0B1020] hover:bg-[#1F2937] border border-[#1F2937] text-gray-300 hover:text-blue-400 transition-colors"
          >
            P001 → P020 <span className="text-gray-500">(Hawala Conduit)</span>
          </button>
          <button
            type="button"
            onClick={() => setPreset("P017", "P031")}
            className="px-2 py-0.5 rounded bg-[#0B1020] hover:bg-[#1F2937] border border-[#1F2937] text-gray-300 hover:text-cyan-400 transition-colors"
          >
            P017 → P031 <span className="text-gray-500">(Fleet Logistics)</span>
          </button>
          <button
            type="button"
            onClick={() => setPreset("P001", "P017")}
            className="px-2 py-0.5 rounded bg-[#0B1020] hover:bg-[#1F2937] border border-[#1F2937] text-gray-300 hover:text-emerald-400 transition-colors"
          >
            P001 → P017 <span className="text-gray-500">(Direct Liaison)</span>
          </button>
        </div>
      </form>
    </div>
  );
}
