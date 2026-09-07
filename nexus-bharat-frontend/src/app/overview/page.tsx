"use client";

import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard";
import {
  DashboardHeader,
  KpiGrid,
  NetworkHealthCard,
  CriticalAlertsPanel,
  IntelligenceFindingCard,
  ActivityTimeline,
} from "@/components/dashboard";
import { ErrorState } from "@/components/common/ErrorState";

export default function OverviewPage() {
  const queryClient = useQueryClient();

  // 1. Fetch KPI Metrics & Network Health
  const {
    data: metrics,
    isLoading: isMetricsLoading,
    error: metricsError,
    refetch: refetchMetrics,
    isFetching: isMetricsFetching,
  } = useQuery({
    queryKey: ["dashboard", "metrics"],
    queryFn: () => dashboardService.getMetrics(),
    staleTime: 1000 * 60 * 5,
  });

  // 2. Fetch Priority Critical Alerts
  const {
    data: alerts,
    isLoading: isAlertsLoading,
    error: alertsError,
    refetch: refetchAlerts,
    isFetching: isAlertsFetching,
  } = useQuery({
    queryKey: ["dashboard", "alerts"],
    queryFn: () => dashboardService.getAlerts(),
    staleTime: 1000 * 60 * 5,
  });

  // 3. Fetch Intelligence Findings
  const {
    data: findings,
    isLoading: isFindingsLoading,
    error: findingsError,
    refetch: refetchFindings,
    isFetching: isFindingsFetching,
  } = useQuery({
    queryKey: ["dashboard", "findings"],
    queryFn: () => dashboardService.getFindings(),
    staleTime: 1000 * 60 * 5,
  });

  // 4. Fetch Recent Investigation Activity Timeline
  const {
    data: activities,
    isLoading: isActivitiesLoading,
    error: activitiesError,
    refetch: refetchActivities,
    isFetching: isActivitiesFetching,
  } = useQuery({
    queryKey: ["dashboard", "activities"],
    queryFn: () => dashboardService.getRecentActivity(),
    staleTime: 1000 * 60 * 5,
  });

  const isSyncing =
    isMetricsFetching || isAlertsFetching || isFindingsFetching || isActivitiesFetching;

  const handleRefreshAll = () => {
    refetchMetrics();
    refetchAlerts();
    refetchFindings();
    refetchActivities();
  };

  // If critical fetch failure occurs, show error state with retry
  if (metricsError || alertsError) {
    return (
      <div className="space-y-6">
        <DashboardHeader onRefresh={handleRefreshAll} isRefreshing={isSyncing} />
        <ErrorState
          title="Intelligence Telemetry Link Failed"
          message="Failed to establish secure session with graph intelligence engine. Verify service health."
          onRetry={handleRefreshAll}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Section 1: Command Center Header */}
      <DashboardHeader onRefresh={handleRefreshAll} isRefreshing={isSyncing} />

      {/* Section 2: KPI Metrics Cards Row (6 Cards) */}
      <section aria-label="Key Intelligence Metrics">
        <KpiGrid metrics={metrics} isLoading={isMetricsLoading} />
      </section>

      {/* Sections 3 & 4: 2-Column Middle Grid (Network Health + Critical Alerts) */}
      <section
        aria-label="Network Health and Critical Alerts"
        className="grid grid-cols-1 gap-6 lg:grid-cols-12"
      >
        {/* Left Column (5 cols): Network Health & Topology Metrics */}
        <div className="lg:col-span-5 flex flex-col">
          <NetworkHealthCard metrics={metrics} isLoading={isMetricsLoading} />
        </div>

        {/* Right Column (7 cols): Tactical Critical Alerts Feed */}
        <div className="lg:col-span-7 flex flex-col">
          <CriticalAlertsPanel alerts={alerts} isLoading={isAlertsLoading} />
        </div>
      </section>

      {/* Section 5: Key Intelligence Findings */}
      <section aria-label="Key Intelligence Findings">
        <IntelligenceFindingCard
          findings={findings}
          isLoading={isFindingsLoading}
        />
      </section>

      {/* Section 6: Recent Investigation Activity Timeline */}
      <section aria-label="Recent Investigation Activity">
        <ActivityTimeline
          activities={activities}
          isLoading={isActivitiesLoading}
        />
      </section>
    </div>
  );
}
