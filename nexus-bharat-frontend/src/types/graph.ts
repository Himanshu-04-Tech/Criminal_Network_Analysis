import { EntityType } from "./entity";

export type InvestigationRole = 
  | "BROKER" 
  | "HUB" 
  | "HIGH_INFLUENCE" 
  | "CONNECTOR" 
  | "COORDINATOR" 
  | "FINANCIAL_CONDUIT" 
  | "SHARED_RESOURCE" 
  | "ISOLATED_ENTITY" 
  | "UNKNOWN";

export interface GraphNode {
  id: string;
  name: string;
  type: EntityType;
  role?: InvestigationRole;
  influenceScore?: number;
  betweenness?: number;
  communityId?: string;
  cases: string[];
  attributes?: Record<string, any>;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationshipType: string;
  caseId?: string;
  confidence: number;
  timestamp?: string;
  evidenceId?: string;
  weight?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata?: {
    nodeCount: number;
    edgeCount: number;
    density: number;
    timestamp?: string;
  };
}

export interface GraphEntity extends GraphNode {
  riskScore: number;
  connectionsCount: number;
  degree?: number;
  neighbors?: Array<{
    id: string;
    name: string;
    type: EntityType;
    relationship: string;
    direction: "incoming" | "outgoing";
  }>;
  firstSeen?: string;
  lastSeen?: string;
  alias?: string[];
  notes?: string;
}

export interface GraphStatistics {
  totalNodes: number;
  totalEdges: number;
  communitiesCount: number;
  brokersCount: number;
  density: number;
  avgDegree: number;
}

export interface GraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
  statistics: GraphStatistics;
  timestamp: string;
}

