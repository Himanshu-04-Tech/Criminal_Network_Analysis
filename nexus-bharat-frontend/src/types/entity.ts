export type EntityType = 
  | "PERSON" 
  | "PHONE" 
  | "ACCOUNT"
  | "BANK_ACCOUNT" 
  | "VEHICLE" 
  | "LOCATION" 
  | "ORGANIZATION" 
  | "FIR_CASE" 
  | "EVENT";

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  cases: string[];
  attributes: Record<string, any>;
  riskScore?: number;
  role?: string;
  firstSeen?: string;
  lastSeen?: string;
}

export type EntityStatus = "ACTIVE" | "WATCHLIST" | "ARCHIVED" | "INACTIVE";

export interface EntityProfile {
  id: string;
  name: string;
  type: EntityType;
  status: EntityStatus;
  riskScore: number;
  role: string;
  influenceScore: number;
  communityReach: number;
  roleReasons: string[];
  connectionsCount: number;
  casesCount: number;
  communitiesCount: number;
  firstSeen: string;
  lastSeen: string;
  alias: string[];
  jurisdiction: string;
  phoneNumbers?: string[];
  bankAccounts?: string[];
  metrics: {
    degree: number;
    betweenness: number;
    eigenvector: number;
    closeness: number;
    clusteringCoeff: number;
  };
  notesSummary?: string;
  notes?: string;
  threatLevel?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  attributes: Record<string, any>;
}

export interface EntityRelationship {
  id: string;
  targetId: string;
  targetName: string;
  targetType: EntityType;
  relationshipType: string;
  direction: "incoming" | "outgoing";
  date: string;
  confidence: number;
  weight?: number;
  details?: string;
  caseId?: string;
}

export interface EntityCase {
  id: string;
  name: string;
  status: "ACTIVE" | "INVESTIGATION" | "FUSED" | "CLOSED";
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  station: string;
  filedDate: string;
  entityRoleInCase: string;
  evidenceCount: number;
}

export interface EntityTimelineEvent {
  id: string;
  title: string;
  type: string;
  date: string;
  relativeTime: string;
  description: string;
  target?: string;
  caseId?: string;
  location?: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}

export interface RelatedEntity {
  id: string;
  name: string;
  type: EntityType;
  role?: string;
  sharedCases: number;
  connectionStrength: number;
  relationship: string;
  riskScore: number;
}

export interface InvestigationNote {
  id: string;
  entityId: string;
  author: string;
  badge?: string;
  timestamp: string;
  createdAt?: string;
  updatedAt?: string;
  content: string;
  classification?: "ROUTINE" | "CONFIDENTIAL" | "CRITICAL";
}

