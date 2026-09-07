"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import cytoscape, { Core, EventObject } from "cytoscape";
import fcose from "cytoscape-fcose";
import coseBilkent from "cytoscape-cose-bilkent";
import { GraphNode, GraphEdge } from "@/types/graph";
import { EntityType } from "@/types/entity";
import { GraphToolbar } from "./GraphToolbar";
import { GraphLegend, NODE_TYPE_COLORS } from "./GraphLegend";
import { GraphSearch } from "./GraphSearch";

// Register Cytoscape layout extensions safely once
if (typeof window !== "undefined") {
  try {
    cytoscape.use(fcose);
  } catch (e) {}
  try {
    cytoscape.use(coseBilkent);
  } catch (e) {}
}

export interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedTypes: EntityType[];
  selectedRole?: string;
  onSelectNode: (nodeId: string) => void;
  onExpandNeighbors?: (nodeId: string) => void;
  selectedNodeId?: string | null;
  className?: string;
}

export function GraphCanvas({
  nodes,
  edges,
  selectedTypes,
  selectedRole,
  onSelectNode,
  onExpandNeighbors,
  selectedNodeId,
  className = "",
}: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentLayout, setCurrentLayout] = useState("fcose");

  // Filter nodes & edges based on active filters
  const filteredNodes = nodes.filter((n) => {
    const typeMatch = selectedTypes.includes(n.type);
    const roleMatch = !selectedRole || selectedRole === "ALL" || n.role === selectedRole;
    return typeMatch && roleMatch;
  });

  const visibleNodeIds = new Set(filteredNodes.map((n) => n.id));
  const filteredEdges = edges.filter(
    (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
  );

  // Initialize Cytoscape instance
  useEffect(() => {
    if (!containerRef.current) return;

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const elements: cytoscape.ElementDefinition[] = [
      ...filteredNodes.map((node) => {
        const colorInfo = NODE_TYPE_COLORS[node.type] || { color: "#2563EB" };
        return {
          group: "nodes" as const,
          data: {
            id: node.id,
            label: `${node.id}\n${node.name.length > 16 ? node.name.substring(0, 14) + "..." : node.name}`,
            type: node.type,
            role: node.role || "ASSOCIATE",
            color: colorInfo.color,
            isBroker: node.role === "BROKER",
            isHub: node.role === "HUB",
          },
        };
      }),
      ...filteredEdges.map((edge) => ({
        group: "edges" as const,
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.relationshipType,
          confidence: edge.confidence,
        },
      })),
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      boxSelectionEnabled: false,
      autounselectify: false,
      style: [
        // --- General Node Style (Light Theme High Contrast) ---
        {
          selector: "node",
          style: {
            "background-color": "data(color)",
            label: "data(label)",
            color: "#0F172A",
            "font-family": "monospace",
            "font-size": "10px",
            "font-weight": 600,
            "text-valign": "bottom",
            "text-margin-y": 6,
            "text-wrap": "wrap",
            width: 38,
            height: 38,
            "border-width": 2.5,
            "border-color": "#FFFFFF",
            "underlay-color": "#E2E8F0",
            "underlay-padding": 2,
            "underlay-opacity": 0.8,
            "transition-property": "background-color, border-color, width, height",
            "transition-duration": 200,
          },
        },
        // --- Special Role Highlights (Broker / Hub) ---
        {
          selector: "node[?isBroker]",
          style: {
            width: 46,
            height: 46,
            "border-width": 3,
            "border-color": "#F59E0B",
            "underlay-color": "#FDE68A",
            "underlay-padding": 4,
            "underlay-opacity": 0.6,
          },
        },
        {
          selector: "node[?isHub]",
          style: {
            width: 50,
            height: 50,
            "border-width": 3.5,
            "border-color": "#2563EB",
            "underlay-color": "#BFDBFE",
            "underlay-padding": 5,
            "underlay-opacity": 0.6,
          },
        },
        // --- Selected / Highlighted Node ---
        {
          selector: "node:selected, node.highlighted",
          style: {
            "border-color": "#2563EB",
            "border-width": 4,
            "underlay-color": "#3B82F6",
            "underlay-padding": 6,
            "underlay-opacity": 0.35,
          },
        },
        // --- Dimmed Nodes ---
        {
          selector: "node.dimmed",
          style: {
            opacity: 0.25,
          },
        },
        // --- General Edge Style (Clean Light Theme) ---
        {
          selector: "edge",
          style: {
            width: 1.8,
            "line-color": "#94A3B8",
            "target-arrow-color": "#64748B",
            "target-arrow-shape": "triangle",
            "arrow-scale": 1.1,
            "curve-style": "bezier",
            label: "data(label)",
            color: "#64748B",
            "font-family": "monospace",
            "font-size": "8px",
            "text-rotation": "autorotate",
            "text-margin-y": -6,
            opacity: 0.85,
          },
        },
        {
          selector: "edge.highlighted",
          style: {
            width: 3.5,
            "line-color": "#2563EB",
            "target-arrow-color": "#2563EB",
            color: "#1D4ED8",
            "font-weight": 700,
            opacity: 1,
          },
        },
        {
          selector: "edge.dimmed",
          style: {
            opacity: 0.15,
          },
        },
      ],
      layout: {
        name: currentLayout,
        animate: true,
        animationDuration: 600,
        fit: true,
        padding: 50,
      } as any,
    });

    // Node click handlers
    cy.on("tap", "node", (event: EventObject) => {
      const node = event.target;
      const nodeId = node.id();

      cy.batch(() => {
        cy.elements().removeClass("highlighted dimmed");
        const neighborhood = node.neighborhood().add(node);
        neighborhood.addClass("highlighted");
        cy.elements().not(neighborhood).addClass("dimmed");
      });

      onSelectNode(nodeId);
    });

    // Background click to reset focus
    cy.on("tap", (event: EventObject) => {
      if (event.target === cy) {
        cy.elements().removeClass("highlighted dimmed");
      }
    });

    // Double tap to expand neighbors
    cy.on("dbltap", "node", (event: EventObject) => {
      const node = event.target;
      const nodeId = node.id();
      if (onExpandNeighbors) {
        onExpandNeighbors(nodeId);
      }
      cy.animate({
        center: { eles: node },
        zoom: 1.5,
        duration: 400,
      });
    });

    // Context menu placeholder
    cy.on("cxttap", "node", (event: EventObject) => {
      event.preventDefault();
      const node = event.target;
      onSelectNode(node.id());
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [filteredNodes.length, filteredEdges.length, currentLayout]);

  // Handle programmatic selectedNodeId changes
  useEffect(() => {
    if (!cyRef.current || !selectedNodeId) return;
    const cy = cyRef.current;
    const targetNode = cy.getElementById(selectedNodeId);

    if (targetNode && targetNode.length > 0) {
      cy.batch(() => {
        cy.elements().removeClass("highlighted dimmed");
        const neighborhood = targetNode.neighborhood().add(targetNode);
        neighborhood.addClass("highlighted");
        cy.elements().not(neighborhood).addClass("dimmed");
      });

      cy.animate({
        center: { eles: targetNode },
        zoom: 1.3,
        duration: 500,
      });
    }
  }, [selectedNodeId]);

  // Toolbar Actions
  const handleFitView = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.fit(undefined, 40);
    }
  }, []);

  const handleResetLayout = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.elements().removeClass("highlighted dimmed");
      const layout = cyRef.current.layout({
        name: currentLayout,
        animate: true,
        animationDuration: 500,
        fit: true,
        padding: 45,
      } as any);
      layout.run();
    }
  }, [currentLayout]);

  const handleZoomIn = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.25);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8);
    }
  }, []);

  const handleExportPng = useCallback(() => {
    if (cyRef.current) {
      const pngUri = cyRef.current.png({
        full: true,
        bg: "#FFFFFF",
        scale: 2,
      });
      const link = document.createElement("a");
      link.href = pngUri;
      link.download = `nexus_bharat_graph_${Date.now()}.png`;
      link.click();
    }
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-[20px] border border-[#E2E8F0] bg-white shadow-sm ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-none h-screen bg-white" : "h-[620px]"
      } ${className}`}
    >
      {/* Top Floating HUD: Search & Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto">
          <GraphSearch nodes={nodes} onSelectNode={onSelectNode} />
        </div>

        <div className="pointer-events-auto">
          <GraphToolbar
            onFitView={handleFitView}
            onResetLayout={handleResetLayout}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onExportPng={handleExportPng}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
            currentLayout={currentLayout}
            onChangeLayout={setCurrentLayout}
          />
        </div>
      </div>

      {/* Main Cytoscape Canvas Container */}
      <div ref={containerRef} className="h-full w-full cursor-grab active:cursor-grabbing bg-white" />

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-auto max-w-xs">
        <GraphLegend />
      </div>

      {/* Bottom Right Telemetry */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-none rounded-xl border border-[#E2E8F0] bg-white/90 backdrop-blur px-3 py-1.5 text-[10px] font-mono text-[#64748B] shadow-sm">
        <span>CYTOSCAPE.JS CORE // ENGINE: </span>
        <span className="text-[#2563EB] uppercase font-bold">{currentLayout}</span>
      </div>
    </div>
  );
}
