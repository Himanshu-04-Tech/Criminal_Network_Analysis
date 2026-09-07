export interface DashboardMetrics {
  activeCases: number;
  entities: number;
  relationships: number;
  brokers: number;
  communities: number;
  criticalAlerts: number;
  networkDensity: number;
  connectedComponents: number;
  sharedResources: number;
  avgConnections: number;
  trends?: {
    casesTrend?: { value: string; isPositive: boolean; label: string };
    entitiesTrend?: { value: string; isPositive: boolean; label: string };
    relationshipsTrend?: { value: string; isPositive: boolean; label: string };
    brokersTrend?: { value: string; isPositive: boolean; label: string };
    communitiesTrend?: { value: string; isPositive: boolean; label: string };
    alertsTrend?: { value: string; isPositive: boolean; label: string };
  };
}
