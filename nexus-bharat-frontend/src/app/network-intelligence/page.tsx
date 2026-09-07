"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldAlert,
  Network,
  Sparkles,
  AlertOctagon,
  Layers,
  Share2,
  Activity,
  Zap,
  TrendingUp,
  Cpu,
  Download,
} from "lucide-react";
import {
  getNetworkKPIs,
  getTopBrokers,
  getCommunityLeaders,
  getRiskEntities,
  getRoleDistribution,
  getInvestigationInsights,
  getRankedEntities,
  getNetworkHealth,
} from "@/services/network-intelligence";
import {
  IntelligenceHeader,
  BrokerLeaderboard,
  InfluenceChart,
  CommunityLeaders,
  HighRiskEntities,
  RoleDistributionChart,
  InvestigationInsights,
  IntelligenceRankingTable,
} from "@/components/network-intelligence";
import { StatCard } from "@/components/cards/StatCard";

export default function NetworkIntelligencePage() {
  const { data: kpis, isLoading: loadingKpis, refetch: refetchKpis } = useQuery({
    queryKey: ["network-kpis"],
    queryFn: () => getNetworkKPIs(),
  });

  const { data: brokers = [], isLoading: loadingBrokers, refetch: refetchBrokers } = useQuery({
    queryKey: ["top-brokers"],
    queryFn: () => getTopBrokers(),
  });

  const { data: leaders = [], isLoading: loadingLeaders } = useQuery({
    queryKey: ["community-leaders"],
    queryFn: () => getCommunityLeaders(),
  });

  const { data: riskEntities = [], isLoading: loadingRisk } = useQuery({
    queryKey: ["risk-entities"],
    queryFn: () => getRiskEntities(),
  });

  const { data: distribution = [], isLoading: loadingDist } = useQuery({
    queryKey: ["role-distribution"],
    queryFn: () => getRoleDistribution(),
  });

  const { data: insights = [], isLoading: loadingInsights } = useQuery({
    queryKey: ["investigation-insights"],
    queryFn: () => getInvestigationInsights(),
  });

  const { data: rankedEntities = [], isLoading: loadingRanked, refetch: refetchRanked } = useQuery({
    queryKey: ["ranked-entities"],
    queryFn: () => getRankedEntities(),
  });

  const { data: health, isLoading: loadingHealth } = useQuery({
    queryKey: ["network-health"],
    queryFn: () => getNetworkHealth(),
  });

  const handleRefresh = () => {
    refetchKpis();
    refetchBrokers();
    refetchRanked();
  };

  const handleExport = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      kpis,
      health,
      topBrokers: brokers,
      communityLeaders: leaders,
      riskEntities,
      distribution,
      rankedEntities,
      insights,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexus_network_role_intelligence_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#E5E7EB] pb-16 font-sans">
      {/* 1. Page Header */}
      <IntelligenceHeader onRefresh={handleRefresh} onExport={handleExport} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* 2. Intelligence KPI Cards Grid */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 font-mono">
          <StatCard
            title="Total Brokers"
            value={kpis?.totalBrokers ?? 3}
            icon={ShieldAlert}
            accent="amber"
            badge="Critical"
            subtitle="Inter-cluster bridges"
          />
          <StatCard
            title="Total Hubs"
            value={kpis?.totalHubs ?? 5}
            icon={Network}
            accent="blue"
            badge="Command"
            subtitle="High degree nodes"
          />
          <StatCard
            title="Influencers"
            value={kpis?.totalInfluencers ?? 8}
            icon={Sparkles}
            accent="cyan"
            badge="Prominent"
            subtitle="PageRank leaders"
          />
          <StatCard
            title="High Risk"
            value={kpis?.highRiskEntities ?? 12}
            icon={AlertOctagon}
            accent="red"
            badge="Threat"
            subtitle="Risk score ≥ 70"
          />
          <StatCard
            title="Communities"
            value={kpis?.communitiesCount ?? 7}
            icon={Layers}
            accent="blue"
            badge="Partitions"
            subtitle="Louvain clusters"
          />
          <StatCard
            title="Shared Resources"
            value={kpis?.sharedResources ?? 15}
            icon={Share2}
            accent="emerald"
            badge="Co-utilized"
            subtitle="Hardware / Accounts"
          />
        </section>

        {/* 3. Top Brokers Leaderboard + Influence Distribution Chart */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BrokerLeaderboard brokers={brokers} />
          <InfluenceChart entities={rankedEntities} />
        </section>

        {/* 4. Community Leaders + High Risk Entities + Role Distribution Donut */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CommunityLeaders leaders={leaders} />
          <HighRiskEntities entities={riskEntities} />
          <RoleDistributionChart distribution={distribution} />
        </section>

        {/* 5. Network Health & Topological Density Indicators */}
        {health && (
          <section className="rounded-xl border border-[#1F2937] bg-[#111827] p-4 font-mono shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                <span className="font-bold text-white uppercase tracking-wider">
                  Network Topological Health Indicators:
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[11px]">
                <div>
                  <span className="text-gray-400">Average Degree:</span>{" "}
                  <span className="font-bold text-emerald-400">
                    {health.averageDegree} links / node
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Network Density:</span>{" "}
                  <span className="font-bold text-cyan-400">{health.networkDensity}</span>
                </div>
                <div>
                  <span className="text-gray-400">Partitioned Communities:</span>{" "}
                  <span className="font-bold text-purple-400">{health.communityCount}</span>
                </div>
                <div>
                  <span className="text-gray-400">Broker Concentration:</span>{" "}
                  <span className="font-bold text-amber-400">
                    {health.brokerConcentration}%
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 6. Comprehensive Intelligence Ranking Matrix Table */}
        <section>
          <IntelligenceRankingTable entities={rankedEntities} />
        </section>

        {/* 7. Strategic AI Insights & Recommendations */}
        <section>
          <InvestigationInsights insights={insights} />
        </section>
      </main>
    </div>
  );
}
