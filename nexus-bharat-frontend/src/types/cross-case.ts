import { EntityType } from "./entity";

export interface CaseProfile {
  id: string;
  title: string;
  section: string;
  station: string;
  date: string;
  status: "ACTIVE" | "INVESTIGATION" | "FUSED" | "CLOSED";
  totalEntities: number;
  totalEvidence: number;
  leadInvestigator: string;
  summary: string;
}

export interface SharedEntity {
  id: string;
  name: string;
  type: EntityType;
  role: string;
  appearsIn: string[];
  casesCount: number;
  riskScore: number;
  connectionDetails: string;
}

export interface CrossCaseResource {
  id: string;
  name: string;
  type: EntityType;
  role: string;
  usedInCases: string[];
  evidence: string;
  confidence: number;
}

export interface BridgeEntity {
  id: string;
  name: string;
  type: EntityType;
  role: string;
  casesConnected: string[];
  influenceScore: number;
  brokerScore: number;
  bridgeReason: string;
  riskScore: number;
}

export interface MergeDecision {
  decision: "RECOMMENDED" | "NOT_RECOMMENDED" | "REQUIRES_REVIEW";
  confidence: number;
  justification: string;
  regulatoryClause: string;
  suggestedFusionCaseId?: string;
}

export interface CaseFinding {
  id: string;
  title: string;
  description: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";
  type: "BRIDGE" | "RESOURCE" | "FINANCIAL" | "NETWORK";
}

export interface CaseComparisonMetrics {
  sharedEntities: number;
  sharedResources: number;
  bridgeCount: number;
  riskScore: number;
  crossCaseEdges: number;
}

export interface CaseComparison {
  caseA: CaseProfile;
  caseB: CaseProfile;
  similarityScore: number;
  classification: "Weak" | "Moderate" | "Strong" | "Very Strong";
  metrics: CaseComparisonMetrics;
  sharedEntities: SharedEntity[];
  sharedResources: CrossCaseResource[];
  bridgeEntities: BridgeEntity[];
  mergeRecommendation: MergeDecision;
  findings: CaseFinding[];
  graphElements: any[];
}

export interface SimilarCase {
  caseId: string;
  title: string;
  station: string;
  similarityScore: number;
  sharedCount: number;
  keyBridge: string;
  date: string;
}

export interface CaseComparisonHistoryItem {
  id: string;
  caseA: string;
  caseB: string;
  similarityScore: number;
  timestamp: string;
  recommendation: string;
}
