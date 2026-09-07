import { EntityType } from "./entity";

export interface FusedCaseProfile {
  id: string;
  name: string;
  location: string;
  policeStation: string;
  section: string;
  date: string;
  nodes: number;
  edges: number;
  status: "ACTIVE" | "INVESTIGATION" | "FUSED" | "CLOSED";
  leadInvestigator: string;
  summary: string;
  primarySyndicate: string;
}

export type FusionClassification = "Weak" | "Moderate" | "Strong" | "Extremely Strong";

export interface FusionScoreResult {
  fusionScore: number; // 0-100
  classification: FusionClassification;
  factors: {
    entityOverlap: number;
    resourceSharing: number;
    brokerEmergence: number;
    networkDensityGain: number;
    modusOperandiFit: number;
  };
}

export interface FusionMetric {
  casesMerged: number;
  newConnections: number;
  bridgeEntities: number;
  communitiesMerged: number;
  sharedResources: number;
  newBrokers: number;
  totalNodes: number;
  totalEdges: number;
  densityGainPercent: number;
}

export interface FusionBridgeEntity {
  id: string;
  name: string;
  type: EntityType;
  role: string;
  casesConnected: string[];
  influenceScore: number;
  brokerScore: number;
  betweennessCentrality: number;
  bridgeReason: string;
  riskScore: number;
}

export interface NewConnection {
  id: string;
  sourceId: string;
  sourceName: string;
  sourceCase: string;
  targetId: string;
  targetName: string;
  targetCase: string;
  type: "COMMUNICATION" | "FINANCIAL" | "LOGISTICS" | "ORGANIZATIONAL" | "ASSOCIATE";
  relationship: string;
  importance: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  significance: string;
  hops: number;
}

export interface CommunityMergeMapping {
  fromCommunities: string[];
  toCommunity: string;
  unifiedClusterName: string;
  casesInvolved: string[];
  memberCount: number;
  leaderId: string;
  leaderName: string;
  primaryCrimeType: string;
}

export interface CommunityChange {
  communitiesBefore: number;
  communitiesAfter: number;
  mergedCommunitiesCount: number;
  communityLeaders: {
    id: string;
    name: string;
    cluster: string;
    influence: number;
  }[];
  mappings: CommunityMergeMapping[];
  consolidationSummary: string;
}

export interface FusionInsight {
  id: string;
  title: string;
  description: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";
  category: "BRIDGE" | "FINANCIAL" | "COMMUNITY" | "INFRASTRUCTURE" | "ORGANIZATION";
}

export interface FusionRecommendation {
  decision: "Merge Recommended" | "Further Review Needed" | "Keep Separate";
  confidence: number;
  justification: string;
  regulatoryClause: string;
  suggestedFusionCaseId: string;
  prosecutionPriority: "IMMEDIATE_ACTION" | "HIGH" | "STANDARD";
  leadJurisdiction: string;
}

export interface ImpactAnalysisData {
  newIntelligenceCount: number;
  hiddenLinksRevealed: number;
  networkExpansionRate: string;
  investigationPriority: "CRITICAL" | "HIGH" | "ELEVATED" | "ROUTINE";
  prosecutionStrength: string;
  syndicateThreatLevel: number;
}

export interface FusionHistoryItem {
  id: string;
  caseIds: string[];
  fusionScore: number;
  timestamp: string;
  recommendation: string;
  casesSummary: string;
}

export interface FusionResult {
  fusionId: string;
  selectedCases: FusedCaseProfile[];
  score: FusionScoreResult;
  metrics: FusionMetric;
  newConnections: NewConnection[];
  bridgeEntities: FusionBridgeEntity[];
  communityChange: CommunityChange;
  impactAnalysis: ImpactAnalysisData;
  insights: FusionInsight[];
  recommendation: FusionRecommendation;
  graphElementsBefore: any[];
  graphElementsAfter: any[];
}

export interface FusionRequest {
  caseIds: string[];
  preserveOriginalIds?: boolean;
  detectImplicitEdges?: boolean;
}
