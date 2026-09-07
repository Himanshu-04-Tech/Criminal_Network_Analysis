"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  GitBranch,
  Search,
  ArrowRight,
  Shield,
  Download,
  Share2,
  RefreshCw,
  Compass,
  FileCheck2,
  Sliders,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  findConnection,
  getAvailableEntities,
} from "@/services/connection-finder";
import {
  ConnectionFinderForm,
  ConnectionSummary,
  ConnectionStrengthCard,
  PathStatistics,
  PathVisualization,
  PathStepCard,
  SharedResourcesPanel,
  ConnectionInsights,
  RecentSearches,
  NoConnectionState,
} from "@/components/connection-finder";
import { ConnectionResult, RecentSearch } from "@/types";

function ConnectionFinderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL query params or defaults
  const initialSource = searchParams.get("source") || "P001";
  const initialTarget = searchParams.get("target") || "P020";

  const [source, setSource] = useState(initialSource);
  const [target, setTarget] = useState(initialTarget);
  const [depth, setDepth] = useState(4);
  const [activeSource, setActiveSource] = useState(initialSource);
  const [activeTarget, setActiveTarget] = useState(initialTarget);
  const [activeDepth, setActiveDepth] = useState(4);

  // Sync if URL searchParams change
  useEffect(() => {
    const s = searchParams.get("source");
    const t = searchParams.get("target");
    if (s && s !== source) {
      setSource(s);
      setActiveSource(s);
    }
    if (t && t !== target) {
      setTarget(t);
      setActiveTarget(t);
    }
  }, [searchParams]);

  // Fetch available entities for autocomplete
  const { data: availableEntities = [] } = useQuery({
    queryKey: ["available-entities"],
    queryFn: () => getAvailableEntities(),
  });

  // Query connection path
  const {
    data: result,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["find-connection", activeSource, activeTarget, activeDepth],
    queryFn: () => findConnection(activeSource, activeTarget, activeDepth),
    enabled: Boolean(activeSource && activeTarget),
  });

  // Handle Search Submission
  const handleSearch = (newSource: string, newTarget: string, newDepth: number) => {
    setActiveSource(newSource);
    setActiveTarget(newTarget);
    setActiveDepth(newDepth);

    // Save to localStorage recent searches
    try {
      const storageKey = "nexus_recent_searches";
      const stored = localStorage.getItem(storageKey);
      const existing: RecentSearch[] = stored ? JSON.parse(stored) : [];

      const newEntry: RecentSearch = {
        id: `rec-${Date.now()}`,
        source: newSource,
        target: newTarget,
        timestamp: new Date().toISOString().substring(0, 16).replace("T", " "),
        strength: result?.connectionStrength || 80,
        hops: result?.primaryPath.hops || newDepth,
      };

      // Deduplicate
      const filtered = existing.filter(
        (e) =>
          !(
            e.source.toUpperCase() === newSource.toUpperCase() &&
            e.target.toUpperCase() === newTarget.toUpperCase()
          )
      );

      const updated = [newEntry, ...filtered].slice(0, 6);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  const handleSelectRecent = (s: string, t: string) => {
    setSource(s);
    setTarget(t);
    handleSearch(s, t, depth);
  };

  const handleIncreaseDepth = () => {
    const nextDepth = Math.min(activeDepth + 2, 8);
    setDepth(nextDepth);
    setActiveDepth(nextDepth);
  };

  const handleExportPath = () => {
    if (!result) return;
    const jsonStr = JSON.stringify(result, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexus_connection_${activeSource}_to_${activeTarget}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#E5E7EB] pb-16 font-sans">
      {/* Top Header */}
      <div className="border-b border-[#1F2937] bg-[#0B1020]/90 backdrop-blur sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono">
                <GitBranch className="h-5 w-5" />
              </div>
              <h1 className="text-lg font-bold text-white font-mono tracking-wider">
                HIDDEN CONNECTION FINDER
              </h1>
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-mono font-bold text-cyan-400">
                PATH ENGINE // MODULE 3
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 font-mono">
              Uncover indirect relationships, intermediary brokers, and co-utilized operational infrastructure
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono">
            {result && (
              <button
                onClick={handleExportPath}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1F2937] bg-[#111827] hover:bg-[#1F2937] text-xs text-gray-300 hover:text-white transition-colors"
                title="Export Path Intelligence JSON"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Dossier</span>
              </button>
            )}

            <Link
              href="/network-explorer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-colors shadow-md shadow-blue-900/30"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Full Graph View</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Workspace Body */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* 1. Connection Finder Search Form */}
        <section>
          <ConnectionFinderForm
            source={source}
            target={target}
            depth={depth}
            availableEntities={availableEntities}
            isLoading={isLoading}
            onSearch={handleSearch}
            onSourceChange={setSource}
            onTargetChange={setTarget}
            onDepthChange={setDepth}
          />
        </section>

        {/* 2. Search History Strip */}
        <section>
          <RecentSearches
            onSelectSearch={handleSelectRecent}
            currentSource={activeSource}
            currentTarget={activeTarget}
          />
        </section>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-6 animate-pulse font-mono">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 rounded-xl bg-[#111827] border border-[#1F2937]" />
              ))}
            </div>
            <div className="h-64 rounded-xl bg-[#111827] border border-[#1F2937]" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80 rounded-xl bg-[#111827] border border-[#1F2937]" />
              <div className="h-80 rounded-xl bg-[#111827] border border-[#1F2937]" />
            </div>
          </div>
        ) : !result ? (
          /* No Connection Found State */
          <section>
            <NoConnectionState
              source={activeSource}
              target={activeTarget}
              depth={activeDepth}
              onIncreaseDepth={handleIncreaseDepth}
            />
          </section>
        ) : (
          /* Discovered Connection Results */
          <>
            {/* 3. Connection Summary 4-Metrics Row */}
            <section>
              <ConnectionSummary
                hops={result.primaryPath.hops}
                strength={result.connectionStrength}
                bridgeCount={result.statistics.bridgeCount}
                sharedResourceCount={result.sharedResources.length}
              />
            </section>

            {/* 4. Connection Strength & Topology Metrics Row */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ConnectionStrengthCard
                strength={result.connectionStrength}
                confidenceLabel="CROSS-CASE CORROBORATION"
              />
              <PathStatistics statistics={result.statistics} />
            </section>

            {/* 5. Core Interactive Path Visualization */}
            <section>
              <PathVisualization path={result.primaryPath} />
            </section>

            {/* 6. Analytical Breakdown: Step Breakdown + Shared Resources */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Step-by-Step Hop List */}
              <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-5 shadow-xl font-mono space-y-4">
                <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md border border-blue-500/30 bg-blue-500/10 text-blue-400">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                        Step-by-Step Hop Breakdown
                      </h3>
                      <span className="text-[10px] text-gray-400">
                        {result.primaryPath.edges.length} DIRECTED GRAPH EDGES
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] text-emerald-400 font-bold">
                    FULLY REVERSIBLE
                  </span>
                </div>

                <div className="space-y-3">
                  {result.primaryPath.edges.map((edge, i) => {
                    const sourceNode = result.primaryPath.nodes.find(
                      (n) => n.id === edge.source
                    );
                    const targetNode = result.primaryPath.nodes.find(
                      (n) => n.id === edge.target
                    );

                    return (
                      <PathStepCard
                        key={edge.id || i}
                        stepNumber={i + 1}
                        edge={edge}
                        sourceNode={sourceNode}
                        targetNode={targetNode}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Shared Operational Resources */}
              <SharedResourcesPanel resources={result.sharedResources} />
            </section>

            {/* 7. Strategic AI Insights Panel */}
            <section>
              <ConnectionInsights insights={result.insights} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default function ConnectionFinderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B1020] text-[#E5E7EB] p-8 font-mono flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="h-8 w-8 mx-auto border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-xs text-gray-400">INITIALIZING PATHWAY FINDER ENGINE...</div>
          </div>
        </div>
      }
    >
      <ConnectionFinderContent />
    </Suspense>
  );
}
