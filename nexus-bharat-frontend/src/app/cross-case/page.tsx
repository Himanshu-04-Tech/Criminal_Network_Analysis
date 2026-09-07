"use client";

import React, { useState, useEffect } from "react";
import { Download, RefreshCw, Layers, ShieldCheck, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import {
  CaseProfile,
  CaseComparison,
  SimilarCase,
} from "@/types";
import { CrossCaseService } from "@/services/cross-case";
import {
  CaseSelector,
  SimilarityScoreCard,
  MergeRecommendation,
  ComparisonMetrics,
  SharedEntitiesPanel,
  SharedResourcesPanel,
  BridgeEntitiesPanel,
  CaseRelationshipGraph,
  IntelligenceFindings,
  CrossCaseHistory,
  RelatedCases,
} from "@/components/cross-case";

export default function CrossCasePage() {
  const [cases, setCases] = useState<CaseProfile[]>([]);
  const [selectedCaseAId, setSelectedCaseAId] = useState<string>("FIR001");
  const [selectedCaseBId, setSelectedCaseBId] = useState<string>("FIR007");
  const [comparison, setComparison] = useState<CaseComparison | null>(null);
  const [similarCases, setSimilarCases] = useState<SimilarCase[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Initialize service
  const crossCaseService = CrossCaseService.getInstance();

  // Load initial cases list
  useEffect(() => {
    let isMounted = true;
    crossCaseService.getCases().then((caseList) => {
      if (isMounted) {
        setCases(caseList);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch comparison data whenever selected cases change
  useEffect(() => {
    if (!selectedCaseAId || !selectedCaseBId) return;

    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      crossCaseService.compareCases(selectedCaseAId, selectedCaseBId),
      crossCaseService.getSimilarCases(selectedCaseAId),
    ])
      .then(([compData, simData]) => {
        if (isMounted) {
          setComparison(compData);
          setSimilarCases(simData);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error loading cross-case correlation:", err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCaseAId, selectedCaseBId]);

  const handleSwapCases = () => {
    const tempA = selectedCaseAId;
    setSelectedCaseAId(selectedCaseBId);
    setSelectedCaseBId(tempA);
  };

  const handleSelectPreset = (caseAId: string, caseBId: string) => {
    setSelectedCaseAId(caseAId);
    setSelectedCaseBId(caseBId);
  };

  const handleSelectHistory = (caseAId: string, caseBId: string) => {
    setSelectedCaseAId(caseAId);
    setSelectedCaseBId(caseBId);
  };

  const handleExportDossier = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Cross-Case Intelligence Workspace"
        subtitle="Automated correlation between independent FIR dossiers, shared clandestine infrastructure, and syndicate bridging topology."
        badge="MODULE 5 // CROSS CASE ENGINE"
        badgeColor="bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
        actionButton={
          <button
            onClick={handleExportDossier}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/20 px-3.5 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/30 transition-all shadow-sm active:scale-95"
          >
            {isExporting ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                <span>Synthesizing PDF...</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                <span>Export Fusion Dossier</span>
              </>
            )}
          </button>
        }
      />

      {/* Case Selector Deck */}
      {cases.length > 0 && (
        <CaseSelector
          cases={cases}
          selectedCaseAId={selectedCaseAId}
          selectedCaseBId={selectedCaseBId}
          onSelectCaseA={(id) => setSelectedCaseAId(id)}
          onSelectCaseB={(id) => setSelectedCaseBId(id)}
          onSwapCases={handleSwapCases}
          onSelectPreset={handleSelectPreset}
        />
      )}

      {/* Cross-Case History Strip */}
      {comparison && (
        <CrossCaseHistory
          currentCaseA={selectedCaseAId}
          currentCaseB={selectedCaseBId}
          similarityScore={comparison.similarityScore}
          recommendation={comparison.mergeRecommendation.decision}
          onSelectHistory={handleSelectHistory}
        />
      )}

      {/* Loading Skeleton or Main Content */}
      {isLoading || !comparison ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
              Synthesizing Cross-Case Topological Graph
            </h3>
            <p className="text-xs text-slate-400">
              Running Jaccard entity overlap, cosine resource vector analysis, and betweenness bridge calculations...
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Row 1: Similarity Gauge & LEA Merge Recommendation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-5">
              <SimilarityScoreCard
                similarityScore={comparison.similarityScore}
                classification={comparison.classification}
              />
            </div>
            <div className="lg:col-span-7">
              <MergeRecommendation
                mergeRecommendation={comparison.mergeRecommendation}
                caseAId={comparison.caseA.id}
                caseBId={comparison.caseB.id}
              />
            </div>
          </div>

          {/* Row 2: Comparison Metrics Bar */}
          <ComparisonMetrics metrics={comparison.metrics} />

          {/* Row 3: Interactive Cytoscape Relationship Topology */}
          <CaseRelationshipGraph
            graphElements={comparison.graphElements}
            caseA={comparison.caseA}
            caseB={comparison.caseB}
          />

          {/* Row 4: Shared Entities & Shared Resources Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SharedEntitiesPanel sharedEntities={comparison.sharedEntities} />
            <SharedResourcesPanel sharedResources={comparison.sharedResources} />
          </div>

          {/* Row 5: Bridge Entities & Similar Cases Explorer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7">
              <BridgeEntitiesPanel bridgeEntities={comparison.bridgeEntities} />
            </div>
            <div className="lg:col-span-5">
              <RelatedCases
                primaryCaseId={comparison.caseA.id}
                similarCases={similarCases}
                onCompareWith={(targetId) => setSelectedCaseBId(targetId)}
              />
            </div>
          </div>

          {/* Row 6: AI Synthesized Intelligence Findings */}
          <IntelligenceFindings findings={comparison.findings} />
        </div>
      )}
    </div>
  );
}
