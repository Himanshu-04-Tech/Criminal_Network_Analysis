"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { graphService } from "@/services/graph";
import {
  GraphCanvas,
  GraphFilters,
  EntityDrawer,
  GraphStatsPanel,
} from "@/components/graph";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EntityType } from "@/types/entity";
import { RefreshCw, Filter, Layers, Share2 } from "lucide-react";

export default function NetworkExplorerPage() {
  const [caseScope, setCaseScope] = useState<string>("ALL");
  const [selectedTypes, setSelectedTypes] = useState<EntityType[]>([
    "PERSON",
    "PHONE",
    "ACCOUNT",
    "VEHICLE",
    "LOCATION",
    "ORGANIZATION",
  ]);
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("P017");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 1. Fetch Graph Response
  const {
    data: graphData,
    isLoading: isGraphLoading,
    error: graphError,
    refetch: refetchGraph,
    isFetching: isGraphFetching,
  } = useQuery({
    queryKey: ["graph", caseScope],
    queryFn: () => graphService.getGraph(caseScope),
    staleTime: 1000 * 60 * 5,
  });

  // 2. Fetch Selected Node Entity Details
  const {
    data: selectedEntity,
    isLoading: isEntityLoading,
  } = useQuery({
    queryKey: ["graph-node", selectedNodeId],
    queryFn: () => (selectedNodeId ? graphService.getNode(selectedNodeId) : null),
    enabled: !!selectedNodeId,
  });

  // Handle Node Selection (Open Drawer)
  const handleSelectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setIsDrawerOpen(true);
  };

  // Filter Toggle Handlers
  const handleToggleType = (type: EntityType) => {
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter((t) => t !== type));
      }
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleSelectAllTypes = () => {
    setSelectedTypes(["PERSON", "PHONE", "ACCOUNT", "VEHICLE", "LOCATION", "ORGANIZATION"]);
  };

  const handleClearTypes = () => {
    setSelectedTypes(["PERSON"]); // keep at least one
  };

  // Compute node counts per type
  const typeCounts = (graphData?.nodes || []).reduce<Record<string, number>>((acc, node) => {
    acc[node.type] = (acc[node.type] || 0) + 1;
    return acc;
  }, {});

  if (graphError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Interactive Network Explorer"
          subtitle="Criminal intelligence graph visualizer and topological link analysis."
        />
        <ErrorState
          title="Graph Visualization Feed Failed"
          message="Could not load topology data from graph service. Please verify network connectivity."
          onRetry={() => refetchGraph()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Network Explorer Header */}
      <PageHeader
        title="Interactive Network Explorer"
        subtitle="Force-directed multi-hop entity graph visualization, topological clustering, and investigative filtering."
        badge="TOPOLOGY ENGINE: CYTOSCAPE.JS"
        badgeColor="bg-blue-500/10 text-blue-400 border-blue-500/30"
        actionButton={
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-gray-400 text-[11px] hidden sm:inline">SCOPE:</span>
            <select
              value={caseScope}
              onChange={(e) => setCaseScope(e.target.value)}
              className="rounded-lg border border-[#1F2937] bg-[#111827] px-3 py-1.5 text-xs text-gray-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">ALL CASES (FUSED // FC_001)</option>
              <option value="FIR001">FIR001 - Cyber Phishing</option>
              <option value="FIR002">FIR002 - Identity Theft Ring</option>
              <option value="FIR003">FIR003 - Hawala Laundering</option>
              <option value="FIR007">FIR007 - Contraband Logistics</option>
            </select>

            <button
              onClick={() => refetchGraph()}
              disabled={isGraphFetching}
              className="flex items-center gap-1.5 rounded-lg border border-[#1F2937] bg-[#111827] px-3 py-1.5 text-xs font-medium text-[#E5E7EB] hover:bg-[#1f2937] transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isGraphFetching ? "animate-spin text-blue-400" : "text-gray-400"}`} />
              <span className="hidden sm:inline">Reload</span>
            </button>
          </div>
        }
      />

      {/* Graph Statistics Telemetry Strip */}
      <GraphStatsPanel
        statistics={graphData?.statistics}
        isLoading={isGraphLoading}
      />

      {/* Main Workspace Layout */}
      {isGraphLoading ? (
        <LoadingState message="Computing force-directed graph layout..." cardsCount={3} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column (3 cols): Filter Controls */}
          <div className="lg:col-span-3">
            <GraphFilters
              selectedTypes={selectedTypes}
              onToggleType={handleToggleType}
              onSelectAll={handleSelectAllTypes}
              onClearAll={handleClearTypes}
              typeCounts={typeCounts}
              selectedRole={selectedRole}
              onSelectRole={setSelectedRole}
            />
          </div>

          {/* Right Column (9 cols): Cytoscape Graph Canvas */}
          <div className="lg:col-span-9">
            <GraphCanvas
              nodes={graphData?.nodes || []}
              edges={graphData?.edges || []}
              selectedTypes={selectedTypes}
              selectedRole={selectedRole}
              onSelectNode={handleSelectNode}
              onExpandNeighbors={(nodeId) => {
                handleSelectNode(nodeId);
              }}
              selectedNodeId={selectedNodeId}
            />
          </div>
        </div>
      )}

      {/* Slide-over Entity Intelligence Drawer */}
      <EntityDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        entity={selectedEntity || null}
        isLoading={isEntityLoading}
        onExpandNeighbors={(id) => {
          setSelectedNodeId(id);
        }}
        onSelectEntity={(id) => {
          setSelectedNodeId(id);
        }}
      />
    </div>
  );
}
