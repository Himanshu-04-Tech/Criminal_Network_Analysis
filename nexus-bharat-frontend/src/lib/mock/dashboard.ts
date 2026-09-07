import { DashboardMetrics } from "@/types/dashboard";

export const mockDashboardMetrics: DashboardMetrics = {
  activeCases: 10,
  entities: 136,
  relationships: 225,
  brokers: 3,
  communities: 7,
  criticalAlerts: 4,
  networkDensity: 0.24,
  connectedComponents: 7,
  sharedResources: 15,
  avgConnections: 4.2,
  trends: {
    casesTrend: { value: "+2", isPositive: true, label: "this month" },
    entitiesTrend: { value: "+12", isPositive: true, label: "emerged" },
    relationshipsTrend: { value: "+31", isPositive: true, label: "new links" },
    brokersTrend: { value: "+1", isPositive: true, label: "detected" },
    communitiesTrend: { value: "1 merge", isPositive: true, label: "consolidated" },
    alertsTrend: { value: "4 active", isPositive: false, label: "urgent review" },
  },
};
