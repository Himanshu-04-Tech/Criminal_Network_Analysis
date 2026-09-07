"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { GraphNode } from "@/types/graph";
import { NODE_TYPE_COLORS } from "./GraphLegend";

export interface GraphSearchProps {
  nodes: GraphNode[];
  onSelectNode: (nodeId: string) => void;
  className?: string;
}

export function GraphSearch({ nodes, onSelectNode, className = "" }: GraphSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredNodes = query.trim()
    ? nodes
        .filter(
          (n) =>
            n.id.toLowerCase().includes(query.toLowerCase().trim()) ||
            n.name.toLowerCase().includes(query.toLowerCase().trim())
        )
        .slice(0, 6)
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (nodeId: string) => {
    onSelectNode(nodeId);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative font-mono text-xs ${className}`}>
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 h-3.5 w-3.5 text-[#94A3B8]" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search target ID or Name (e.g. P017, Vikram)..."
          className="w-64 sm:w-80 rounded-2xl border border-[#E2E8F0] bg-white/90 backdrop-blur-md pl-9 pr-8 py-2 text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-blue-50 shadow-md"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-2.5 text-[#94A3B8] hover:text-[#0F172A]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Auto-suggest dropdown */}
      {isOpen && filteredNodes.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-[#E2E8F0] bg-white p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1 text-[10px] text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0] mb-1 font-bold">
            Matching Intelligence Entities
          </div>
          {filteredNodes.map((node) => {
            const colorInfo = NODE_TYPE_COLORS[node.type] || { color: "#2563EB" };
            return (
              <button
                key={node.id}
                onClick={() => handleSelect(node.id)}
                className="w-full flex items-center justify-between rounded-xl px-2.5 py-1.5 text-left hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: colorInfo.color }}
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                        {node.id}
                      </span>
                      <span className="text-[11px] text-[#64748B] truncate max-w-[140px]">
                        {node.name}
                      </span>
                    </div>
                  </div>
                </div>

                {node.role && node.role !== "UNKNOWN" && (
                  <span className="rounded-full border border-purple-200 bg-purple-50 px-2 py-0.2 text-[9px] font-bold text-purple-700">
                    {node.role}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
