"use client";

import React from "react";
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Camera,
  Layers,
  Sparkles,
} from "lucide-react";

export interface GraphToolbarProps {
  onFitView: () => void;
  onResetLayout: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onExportPng: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  currentLayout: string;
  onChangeLayout: (layout: string) => void;
}

export function GraphToolbar({
  onFitView,
  onResetLayout,
  onZoomIn,
  onZoomOut,
  onExportPng,
  isFullscreen,
  onToggleFullscreen,
  currentLayout,
  onChangeLayout,
}: GraphToolbarProps) {
  return (
    <div className="flex items-center gap-1.5 rounded-2xl border border-[#E2E8F0] bg-white/90 backdrop-blur-xl p-1.5 shadow-lg font-mono text-xs text-[#0F172A]">
      {/* Zoom Controls */}
      <button
        onClick={onZoomIn}
        title="Zoom In"
        className="rounded-xl p-1.5 text-[#64748B] hover:bg-slate-100 hover:text-[#2563EB] transition-colors"
      >
        <ZoomIn className="h-4 w-4" />
      </button>

      <button
        onClick={onZoomOut}
        title="Zoom Out"
        className="rounded-xl p-1.5 text-[#64748B] hover:bg-slate-100 hover:text-[#2563EB] transition-colors"
      >
        <ZoomOut className="h-4 w-4" />
      </button>

      <div className="h-4 w-[1px] bg-[#E2E8F0] mx-0.5" />

      {/* Fit & Reset */}
      <button
        onClick={onFitView}
        title="Fit All Nodes in View"
        className="rounded-xl px-2.5 py-1 text-xs text-[#0F172A] hover:bg-slate-100 hover:text-[#2563EB] transition-colors font-semibold"
      >
        Fit View
      </button>

      <button
        onClick={onResetLayout}
        title="Re-run Layout Algorithm"
        className="rounded-xl p-1.5 text-[#64748B] hover:bg-slate-100 hover:text-[#2563EB] transition-colors"
      >
        <RotateCcw className="h-4 w-4" />
      </button>

      <div className="h-4 w-[1px] bg-[#E2E8F0] mx-0.5" />

      {/* Layout Algorithm Switcher */}
      <div className="flex items-center gap-1.5 px-1">
        <span className="text-[10px] text-[#64748B] font-semibold hidden sm:inline uppercase">Layout:</span>
        <select
          value={currentLayout}
          onChange={(e) => onChangeLayout(e.target.value)}
          className="rounded-xl border border-[#E2E8F0] bg-white px-2.5 py-1 text-[11px] text-[#0F172A] focus:border-[#2563EB] focus:outline-none shadow-2xs font-medium cursor-pointer"
        >
          <option value="fcose">Force-Directed (fcose)</option>
          <option value="circle">Circular</option>
          <option value="grid">Grid</option>
          <option value="concentric">Concentric (Hubs)</option>
        </select>
      </div>

      <div className="h-4 w-[1px] bg-[#E2E8F0] mx-0.5" />

      {/* Export PNG */}
      <button
        onClick={onExportPng}
        title="Export High-Res Graph Snapshot (PNG)"
        className="flex items-center gap-1 rounded-xl px-2 py-1 text-xs text-[#0F172A] hover:bg-slate-100 hover:text-[#2563EB] transition-colors"
      >
        <Camera className="h-4 w-4 text-[#64748B]" />
        <span className="hidden md:inline text-[11px] font-medium">Snapshot</span>
      </button>

      {/* Fullscreen */}
      <button
        onClick={onToggleFullscreen}
        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Canvas"}
        className="rounded-xl p-1.5 text-[#64748B] hover:bg-slate-100 hover:text-[#2563EB] transition-colors"
      >
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
