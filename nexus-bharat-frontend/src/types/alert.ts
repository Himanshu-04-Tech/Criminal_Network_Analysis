export type AlertSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "MODERATE" | "LOW";

export type AlertType = 
  | "COMMUNICATION_BURST" 
  | "RAPID_FINANCIAL_DISPERSAL" 
  | "RAPID_FINANCIAL_AGGREGATION" 
  | "CIRCULAR_FINANCIAL_FLOW" 
  | "BROKER_ELEVATION" 
  | "COMMUNITY_MERGE" 
  | "NEW_SHARED_RESOURCE"
  | "NEW_BROKER_DETECTED"
  | "CROSS_CASE_CONNECTION"
  | "SHARED_VEHICLE_FOUND";

export interface Alert {
  id: string;
  type: AlertType | string;
  title: string;
  description: string;
  severity: AlertSeverity;
  timestamp: string;
  entitiesInvolved?: string[];
  entityTags?: string[];
  casesInvolved?: string[];
  caseId?: string;
  metrics?: Record<string, any>;
  reasons?: string[];
  status?: "NEW" | "ACKNOWLEDGED" | "RESOLVED";
}

