export type ActivityType =
  | "NEW_CASE_ADDED"
  | "BROKER_IDENTIFIED"
  | "COMMUNITY_MERGE"
  | "COMMUNICATION_BURST"
  | "FINANCIAL_CONDUIT_DETECTED"
  | "SHARED_RESOURCE_FLAGGED";

export interface ActivityEvent {
  id: string;
  type: ActivityType | string;
  title: string;
  description: string;
  timestamp: string;
  relativeTime: string;
  caseId?: string;
  target?: string;
  severity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  metadata?: Record<string, any>;
}
