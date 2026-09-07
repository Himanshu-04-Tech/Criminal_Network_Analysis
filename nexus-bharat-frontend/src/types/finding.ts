export type FindingCategory =
  | "BROKER"
  | "CROSS_CASE"
  | "SHARED_RESOURCE"
  | "FINANCIAL_CONDUIT"
  | "SYNDICATE_TOPOLOGY";

export interface IntelligenceFinding {
  id: string;
  title: string;
  description: string;
  category: FindingCategory;
  confidence: number;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  entities: string[];
  cases: string[];
  evidence: string[];
  suggestedAction?: string;
  timestamp: string;
}
