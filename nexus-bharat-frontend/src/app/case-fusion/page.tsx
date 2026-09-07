"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, Layers } from "lucide-react";
import {
  FusedCaseProfile,
  FusionResult,
} from "@/types";
import { CaseFusionService } from "@/services/case-fusion";
import {
  FusionHeader,
  CaseSelectionPanel,
  FusionScoreCard,
  FusionMetrics,
  BeforeAfterGraph,
  NewConnectionsPanel,
  BridgeEntitiesPanel,
  CommunityMergePanel,
  ImpactAnalysis,
  FusionInsights,
  FusionRecommendationCard,
  FusionHistory,
} from "@/components/case-fusion";

export default function CaseFusionPage() {
  const [cases, setCases] = useState<FusedCaseProfile[]>([]);
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([
    "FIR001",
    "FIR003",
    "FIR007",
  ]);
  const [fusionResult, setFusionResult] = useState<FusionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fusionService = CaseFusionService.getInstance();

  // Load available cases
  useEffect(() => {
    let isMounted = true;
    fusionService.getCases().then((caseList) => {
      if (isMounted) {
        setCases(caseList);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Initial simulation
  useEffect(() => {
    if (selectedCaseIds.length >= 2) {
      let isMounted = true;
      setIsLoading(true);
      fusionService
        .simulateFusion(selectedCaseIds)
        .then((res) => {
          if (isMounted) {
            setFusionResult(res);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.error("Error running analytical fusion:", err);
          if (isMounted) setIsLoading(false);
        });
      return () => {
        isMounted = false;
      };
    }
  }, []);

  const handleToggleCase = (id: string) => {
    setSelectedCaseIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedCaseIds(cases.map((c) => c.id));
  };

  const handleClearSelection = () => {
    setSelectedCaseIds([]);
  };

  const handleRunFusion = () => {
    if (selectedCaseIds.length < 2) return;
    setIsLoading(true);
    fusionService
      .simulateFusion(selectedCaseIds)
      .then((res) => {
        setFusionResult(res);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error executing fusion:", err);
        setIsLoading(false);
      });
  };

  const handleSelectHistory = (caseIds: string[]) => {
    setSelectedCaseIds(caseIds);
    setIsLoading(true);
    fusionService
      .simulateFusion(caseIds)
      .then((res) => {
        setFusionResult(res);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  const handleReset = () => {
    const defaults = ["FIR001", "FIR003", "FIR007"];
    setSelectedCaseIds(defaults);
    setIsLoading(true);
    fusionService.simulateFusion(defaults).then((res) => {
      setFusionResult(res);
      setIsLoading(false);
    });
  };

  const handleExportJSON = () => {
    if (!fusionResult) return;
    fusionService.exportFusion("json", fusionResult);
  };

  const handleExportPDF = () => {
    if (!fusionResult) return;
    fusionService.exportFusion("pdf", fusionResult);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <FusionHeader
        fusionResult={fusionResult}
        onExportJSON={handleExportJSON}
        onExportPDF={handleExportPDF}
        onReset={handleReset}
      />

      {/* FIR Selection Workspace */}
      <CaseSelectionPanel
        cases={cases}
        selectedCaseIds={selectedCaseIds}
        onToggleCase={handleToggleCase}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        onFuse={handleRunFusion}
        isLoading={isLoading}
      />

      {/* Fusion History Strip */}
      {fusionResult && (
        <FusionHistory
          currentCaseIds={selectedCaseIds}
          fusionScore={fusionResult.score.fusionScore}
          recommendation={fusionResult.recommendation.decision}
          onSelectHistory={handleSelectHistory}
        />
      )}

      {/* Main Analysis Display */}
      {isLoading || !fusionResult ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
              Synthesizing Multi-FIR Network Topology
            </h3>
            <p className="text-xs text-slate-400">
              Merging disparate adjacency matrices, calculating betweenness bridge shifts, and collapsing Louvain modularity clusters...
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Row 1: Score Card + Recommendation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-5">
              <FusionScoreCard score={fusionResult.score} />
            </div>
            <div className="lg:col-span-7">
              <FusionRecommendationCard recommendation={fusionResult.recommendation} />
            </div>
          </div>

          {/* Row 2: Fusion Metrics Bar */}
          <FusionMetrics metrics={fusionResult.metrics} />

          {/* Row 3: Dual Before/After Graph Visualizer */}
          <BeforeAfterGraph
            graphElementsBefore={fusionResult.graphElementsBefore}
            graphElementsAfter={fusionResult.graphElementsAfter}
            casesCount={fusionResult.selectedCases.length}
          />

          {/* Row 4: New Connections + Bridge Entities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <NewConnectionsPanel newConnections={fusionResult.newConnections} />
            <BridgeEntitiesPanel bridgeEntities={fusionResult.bridgeEntities} />
          </div>

          {/* Row 5: Community Merge Flow + Investigation Impact */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7">
              <CommunityMergePanel communityChange={fusionResult.communityChange} />
            </div>
            <div className="lg:col-span-5">
              <ImpactAnalysis impactAnalysis={fusionResult.impactAnalysis} />
            </div>
          </div>

          {/* Row 6: AI Synthesized Discoveries */}
          <FusionInsights insights={fusionResult.insights} />
        </div>
      )}
    </div>
  );
}
