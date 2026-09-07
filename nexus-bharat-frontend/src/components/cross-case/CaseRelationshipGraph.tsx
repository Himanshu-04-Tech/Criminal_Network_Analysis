"use client";

import React, { useEffect, useRef, useState } from "react";
import cytoscape, { Core, EventObject } from "cytoscape";
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Share2,
  Network,
  Info,
  ExternalLink,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { CaseProfile } from "@/types";

interface CaseRelationshipGraphProps {
  graphElements: any[];
  caseA: CaseProfile;
  caseB: CaseProfile;
}

export const CaseRelationshipGraph: React.FC<CaseRelationshipGraphProps> = ({
  graphElements,
  caseA,
  caseB,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Destroy existing instance if any
    if (cyRef.current) {
      cyRef.current.destroy();
    }

    // Initialize Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements: graphElements,
      boxSelectionEnabled: false,
      autounselectify: false,
      style: [
        // Base Node Style
        {
          selector: "node",
          style: {
            label: "data(label)",
            "text-valign": "bottom",
            "text-halign": "center",
            "text-margin-y": 6,
            "text-wrap": "wrap",
            "text-max-width": "110px",
            color: "#CBD5E1",
            "font-size": "10px",
            "font-family": "monospace",
            "font-weight": "bold",
            "background-color": "data(color)",
            width: "data(size)",
            height: "data(size)",
            "border-width": 2,
            "border-color": "#334155",
            "transition-property": "background-color, border-color, width, height",
            "transition-duration": 0.2,
          },
        },
        // Case Anchor Nodes (Hexagon)
        {
          selector: "node[?isCase]",
          style: {
            shape: "hexagon",
            "border-width": 4,
            "border-color": "#38BDF8",
            "font-size": "11px",
            color: "#F8FAFC",
            "text-margin-y": 8,
          },
        },
        // Key Bridge Nodes (Gold glow)
        {
          selector: "node[?isBridge]",
          style: {
            "border-width": 4,
            "border-color": "#F59E0B",
            "background-color": "#D97706",
            "font-size": "11px",
            color: "#FEF08A",
          },
        },
        // Base Edge Style
        {
          selector: "edge",
          style: {
            width: "data(width)",
            "line-color": "#334155",
            "target-arrow-color": "#475569",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            opacity: 0.7,
            label: "data(label)",
            "font-size": "8px",
            color: "#94A3B8",
            "text-rotation": "autorotate",
            "text-margin-y": -6,
          },
        },
        // Cross-Case Intersecting Edges
        {
          selector: "edge[?isCrossCase]",
          style: {
            "line-color": "#06B6D4",
            "target-arrow-color": "#06B6D4",
            "line-style": "dashed",
            width: 2.5,
            opacity: 0.9,
          },
        },
        // Highlighted / Selected Node
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
      ],
      layout: {
        name: "preset",
        fit: true,
        padding: 50,
      },
    });

    // Node click handler
    cy.on("tap", "node", (evt: EventObject) => {
      const node = evt.target;
      setSelectedNode(node.data());
    });

    // Background click handler to deselect
    cy.on("tap", (evt: EventObject) => {
      if (evt.target === cy) {
        setSelectedNode(null);
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [graphElements]);

  const handleZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.25);
    }
  };

  const handleZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8);
    }
  };

  const handleFit = () => {
    if (cyRef.current) {
      cyRef.current.fit(undefined, 40);
    }
  };

  const handleResetLayout = () => {
    if (cyRef.current) {
      const layout = cyRef.current.layout({
        name: "preset",
        fit: true,
        padding: 50,
      });
      layout.run();
    }
  };

  return (
    <div
      className={`bg-slate-900/90 border border-slate-800 rounded-xl shadow-lg relative flex flex-col transition-all overflow-hidden ${
        isFullscreen ? "fixed inset-4 z-50 bg-slate-950/95" : "h-[540px]"
      }`}
    >
      {/* Top Controls & Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Cross-Case Correlation Graph
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-300">
            {caseA.id} ↔ {caseB.id}
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-cyan-300 transition-all"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-cyan-300 transition-all"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleFit}
            title="Fit to Screen"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-cyan-300 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-cyan-300 transition-all ml-1"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex-1 bg-slate-950/40">
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Side Legend Overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800/90 rounded-lg p-2.5 shadow-lg backdrop-blur-md text-[10px] space-y-1.5 pointer-events-none">
          <div className="font-mono uppercase font-bold text-slate-400 tracking-wider mb-1">
            Graph Legend
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 border border-cyan-400" />
            <span className="text-slate-300">Case Investigation Nodes</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-amber-300" />
            <span className="text-slate-300">Topological Bridge Broker</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            <span className="text-slate-300">Shared Phone / SIM Relay</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Shared Bank Account / Ledger</span>
          </div>
        </div>

        {/* Selected Node Details Popover */}
        {selectedNode && (
          <div className="absolute top-3 right-3 w-64 bg-slate-900/95 border border-cyan-500/50 rounded-xl p-3.5 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
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

            <div className="space-y-1 text-[11px] text-slate-300">
              <div className="whitespace-pre-line text-xs font-medium text-slate-200">
                {selectedNode.label}
              </div>
              {selectedNode.isBridge && (
                <div className="pt-2 text-[10px] font-mono text-amber-300 flex items-center gap-1">
                  <span>★ Identified as Critical Cross-Case Broker</span>
                </div>
              )}
            </div>

            {/* Quick Link to Entity page if it's an entity node */}
            {selectedNode.id?.startsWith("node-P") && (
              <div className="mt-3 pt-2 border-t border-slate-800">
                <Link
                  href={`/entity/${selectedNode.id.replace("node-", "")}`}
                  className="w-full py-1 rounded-md bg-cyan-950 border border-cyan-500/50 hover:bg-cyan-900/60 text-cyan-300 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Open Dossier</span>
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
