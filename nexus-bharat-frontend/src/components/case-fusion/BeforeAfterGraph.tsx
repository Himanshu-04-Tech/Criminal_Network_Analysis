"use client";

import React, { useEffect, useRef, useState } from "react";
import cytoscape, { Core, EventObject } from "cytoscape";
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Split,
  Eye,
  Layers,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface BeforeAfterGraphProps {
  graphElementsBefore: any[];
  graphElementsAfter: any[];
  casesCount: number;
}

export const BeforeAfterGraph: React.FC<BeforeAfterGraphProps> = ({
  graphElementsBefore,
  graphElementsAfter,
  casesCount,
}) => {
  const containerBeforeRef = useRef<HTMLDivElement>(null);
  const containerAfterRef = useRef<HTMLDivElement>(null);
  const cyBeforeRef = useRef<Core | null>(null);
  const cyAfterRef = useRef<Core | null>(null);

  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [highlightNewLinks, setHighlightNewLinks] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<"both" | "before" | "after">("both");

  // Cytoscape style shared definition
  const getCytoscapeStyle = (isAfter: boolean, highlightLinks: boolean): any[] => [
    {
      selector: "node",
      style: {
        label: "data(label)",
        "text-valign": "bottom",
        "text-halign": "center",
        "text-margin-y": 5,
        "text-wrap": "wrap",
        "text-max-width": "90px",
        color: "#CBD5E1",
        "font-size": "9px",
        "font-family": "monospace",
        "background-color": "data(color)",
        width: "data(size)",
        height: "data(size)",
        "border-width": 2,
        "border-color": "#334155",
        "transition-property": "background-color, border-color, width, height",
        "transition-duration": 0.2,
      },
    },
    {
      selector: "node[?isCase]",
      style: {
        shape: "hexagon",
        "border-width": 3,
        "border-color": "#38BDF8",
        color: "#F8FAFC",
        "font-size": "10px",
      },
    },
    {
      selector: "node[?isBridge]",
      style: {
        "border-width": 3,
        "border-color": "#F59E0B",
        "underlay-color": "#F59E0B",
        "underlay-padding": 4,
        "underlay-opacity": 0.4,
        color: "#FEF08A",
      },
    },
    {
      selector: "edge",
      style: {
        width: "data(width)",
        "line-color": "#334155",
        "target-arrow-color": "#475569",
        "target-arrow-shape": "triangle",
        "curve-style": "bezier",
        opacity: 0.6,
        label: "data(label)",
        "font-size": "8px",
        color: "#94A3B8",
        "text-rotation": "autorotate",
        "text-margin-y": -5,
      },
    },
    {
      selector: "edge[?isNew]",
      style: {
        "line-color": highlightLinks ? "#06B6D4" : "#475569",
        "target-arrow-color": highlightLinks ? "#06B6D4" : "#475569",
        "line-style": "dashed",
        width: highlightLinks ? 3.0 : 1.8,
        opacity: highlightLinks ? 0.95 : 0.4,
        color: highlightLinks ? "#38BDF8" : "#64748B",
      },
    },
    {
      selector: "node:selected",
      style: {
        "border-color": "#06B6D4",
        "border-width": 4,
        "underlay-color": "#06B6D4",
        "underlay-padding": 5,
        "underlay-opacity": 0.5,
      },
    },
  ];

  // Initialize Before Graph
  useEffect(() => {
    if (!containerBeforeRef.current) return;
    if (cyBeforeRef.current) cyBeforeRef.current.destroy();

    const cy = cytoscape({
      container: containerBeforeRef.current,
      elements: graphElementsBefore,
      boxSelectionEnabled: false,
      style: getCytoscapeStyle(false, highlightNewLinks),
      layout: {
        name: "preset",
        fit: true,
        padding: 30,
      },
    });

    cy.on("tap", "node", (evt: EventObject) => {
      setSelectedNode(evt.target.data());
    });

    cy.on("tap", (evt: EventObject) => {
      if (evt.target === cy) setSelectedNode(null);
    });

    cyBeforeRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [graphElementsBefore]);

  // Initialize After Graph
  useEffect(() => {
    if (!containerAfterRef.current) return;
    if (cyAfterRef.current) cyAfterRef.current.destroy();

    const cy = cytoscape({
      container: containerAfterRef.current,
      elements: graphElementsAfter,
      boxSelectionEnabled: false,
      style: getCytoscapeStyle(true, highlightNewLinks),
      layout: {
        name: "preset",
        fit: true,
        padding: 30,
      },
    });

    cy.on("tap", "node", (evt: EventObject) => {
      setSelectedNode(evt.target.data());
    });

    cy.on("tap", (evt: EventObject) => {
      if (evt.target === cy) setSelectedNode(null);
    });

    cyAfterRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [graphElementsAfter, highlightNewLinks]);

  const handleZoomIn = () => {
    if (cyBeforeRef.current) cyBeforeRef.current.zoom(cyBeforeRef.current.zoom() * 1.25);
    if (cyAfterRef.current) cyAfterRef.current.zoom(cyAfterRef.current.zoom() * 1.25);
  };

  const handleZoomOut = () => {
    if (cyBeforeRef.current) cyBeforeRef.current.zoom(cyBeforeRef.current.zoom() * 0.8);
    if (cyAfterRef.current) cyAfterRef.current.zoom(cyAfterRef.current.zoom() * 0.8);
  };

  const handleFit = () => {
    if (cyBeforeRef.current) cyBeforeRef.current.fit(undefined, 30);
    if (cyAfterRef.current) cyAfterRef.current.fit(undefined, 30);
  };

  return (
    <div
      className={`bg-slate-900/90 border border-slate-800 rounded-xl shadow-lg relative flex flex-col transition-all overflow-hidden ${
        isFullscreen ? "fixed inset-4 z-50 bg-slate-950/95" : "min-h-[580px]"
      }`}
    >
      {/* Top Header & Global Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-950/70 gap-2">
        <div className="flex items-center gap-2">
          <Split className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Topological Fusion Synthesis (Before vs. After)
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-300">
            {casesCount} Cases Synthesized
          </span>
        </div>

        {/* View Mode & Controls */}
        <div className="flex items-center gap-2">
          {/* Highlight New Links Toggle */}
          <button
            type="button"
            onClick={() => setHighlightNewLinks(!highlightNewLinks)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
              highlightNewLinks
                ? "bg-cyan-950/80 border-cyan-500/70 text-cyan-200"
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}
            title="Highlight newly revealed cross-case links"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Highlight New Links</span>
          </button>

          {/* Zoom & Fit */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-cyan-300"
              title="Zoom In Both"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-cyan-300"
              title="Zoom Out Both"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFit}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-cyan-300"
              title="Fit to Screen"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-cyan-300 ml-1"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Dual Canvas Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800/80 flex-1 relative bg-slate-950/40">
        {/* Left Canvas: BEFORE FUSION */}
        <div className="relative flex flex-col min-h-[460px]">
          {/* Subheader Badge */}
          <div className="absolute top-3 left-3 z-10 bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] font-mono text-slate-300 flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="font-bold uppercase tracking-wider">Before Fusion:</span>
            <span className="text-slate-400">Isolated Case Silos</span>
          </div>

          <div ref={containerBeforeRef} className="w-full h-full flex-1 cursor-grab active:cursor-grabbing" />

          <div className="absolute bottom-3 left-3 bg-slate-900/80 border border-slate-800/80 rounded px-2 py-1 text-[10px] font-mono text-slate-400 pointer-events-none">
            3 Isolated Investigation Islands • No Direct Paths Discovered
          </div>
        </div>

        {/* Right Canvas: AFTER FUSION */}
        <div className="relative flex flex-col min-h-[460px]">
          {/* Subheader Badge */}
          <div className="absolute top-3 left-3 z-10 bg-cyan-950/80 border border-cyan-500/50 rounded-lg px-2.5 py-1 text-[11px] font-mono text-cyan-200 flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold uppercase tracking-wider">After Fusion:</span>
            <span className="text-cyan-300">Unified Syndicate Network</span>
          </div>

          <div ref={containerAfterRef} className="w-full h-full flex-1 cursor-grab active:cursor-grabbing" />

          <div className="absolute bottom-3 left-3 bg-slate-900/80 border border-cyan-500/30 rounded px-2 py-1 text-[10px] font-mono text-cyan-300 pointer-events-none flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>12 Emergent Edges Highlighted • P017 Center Broker Emergence</span>
          </div>
        </div>

        {/* Selected Node Details Popover */}
        {selectedNode && (
          <div className="absolute top-4 right-4 z-20 w-72 bg-slate-900/95 border border-cyan-500/50 rounded-xl p-4 shadow-2xl backdrop-blur-md animate-in fade-in duration-150">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                  {selectedNode.type}
                </span>
                <h4 className="text-xs font-bold text-slate-100 font-mono">
                  {selectedNode.id}
                </h4>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-slate-200 text-xs px-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 text-xs text-slate-300">
              <div className="whitespace-pre-line font-medium text-slate-200">
                {selectedNode.label}
              </div>
              {selectedNode.isBridge && (
                <div className="pt-2 text-[10px] font-mono text-amber-300">
                  ★ Emerged as High-Betweenness Cross-Case Bridge
                </div>
              )}
            </div>

            {selectedNode.id?.includes("P") && (
              <div className="mt-3 pt-2 border-t border-slate-800">
                <Link
                  href={`/entity/${selectedNode.id.replace(/fused-node-|node-|p-/, "")}`}
                  className="w-full py-1.5 rounded-md bg-cyan-950 border border-cyan-500/50 hover:bg-cyan-900/60 text-cyan-300 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Open Target Dossier</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
