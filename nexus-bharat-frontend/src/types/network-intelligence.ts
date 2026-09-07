import { EntityType } from "./entity";

export type RoleType =
  | "BROKER"
  | "HUB"
  | "INFLUENCER"
  | "CONNECTOR"
  | "RESOURCE_CONTROLLER"
  | "COORDINATOR"
  | "FINANCIAL_CONDUIT"
  | "ISOLATED_ENTITY";

export interface BrokerEntity {
  rank: number;
  id: string;
  name: string;
  type: EntityType;
  brokerScore: number;
  communitiesConnected: number;
  betweenness: number;
  bridgeCases: string[];
  description: string;
  riskScore: number;
}

export interface InfluenceMetrics {
  degree: number;
  betweenness: number;
  pagerank: number;
  eigenvector: number;
  clusteringCoeff: number;
  reachScore: number;
}

export interface CommunityLeader {
  communityId: string;
  communityName: string;
  leaderId: string;
  leaderName: string;
  leaderRole: RoleType;
  influenceScore: number;
  memberCount: number;
  jurisdiction: string;
  color: string;
}

export interface RiskEntity {
  id: string;
  name: string;
  type: EntityType;
  role: RoleType;
  riskScore: number;
  riskLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  casesCount: number;
  connectionsCount: number;
  primaryThreat: string;
}

export interface RoleDistribution {
  role: RoleType;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface NetworkInsight {
  id: string;
  title: string;
  description: string;
  type: "BROKER" | "INFLUENCE" | "COMMUNITY" | "RESOURCE" | "RISK";
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  timestamp: string;
}

export interface RankedEntity {
  rank: number;
  id: string;
  name: string;
  type: EntityType;
  role: RoleType;
  influenceScore: number;
  brokerScore: number;
  riskScore: number;
  cases: string[];
  connections: number;
  jurisdiction: string;
  metrics: InfluenceMetrics;
}

export interface NetworkHealth {
  averageDegree: number;
  networkDensity: number;
  communityCount: number;
  brokerConcentration: number;
  totalEntities: number;
  totalRelationships: number;
}
