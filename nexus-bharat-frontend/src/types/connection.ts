import { EntityType } from "./entity";

export interface PathNode {
  id: string;
  name: string;
  type: EntityType;
  role?: string;
  riskScore: number;
  isBridge?: boolean;
  details?: string;
  cases?: string[];
}

export interface PathEdge {
  id: string;
  source: string;
  target: string;
  relationshipType: string;
  confidence: number;
  date?: string;
  weight?: number;
  evidence?: string;
  caseId?: string;
}

export interface ConnectionPath {
  id: string;
  source: string;
  target: string;
  hops: number;
  strength: number;
  riskScore: number;
  nodes: PathNode[];
  edges: PathEdge[];
  bridges: PathNode[];
}

export interface SharedResource {
  id: string;
  name: string;
  type: EntityType;
  role: string;
  usedBy: Array<{
    id: string;
    name: string;
    relation: string;
  }>;
  evidence: string;
  confidence: number;
}

export interface PathStatistics {
  nodesTraversed: number;
  relationshipsTraversed: number;
  bridgeCount: number;
  pathRiskScore: number;
}

export interface ConnectionInsight {
  id: string;
  title: string;
  description: string;
  type: "BROKER" | "SHARED_RESOURCE" | "CROSS_CASE" | "TACTICAL";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";
}

export interface ConnectionResult {
  source: string;
  target: string;
  primaryPath: ConnectionPath;
  alternativePaths?: ConnectionPath[];
  sharedResources: SharedResource[];
  connectionStrength: number;
  statistics: PathStatistics;
  insights: ConnectionInsight[];
}

export interface RecentSearch {
  id: string;
  source: string;
  sourceName?: string;
  target: string;
  targetName?: string;
  timestamp: string;
  strength: number;
  hops: number;
}
