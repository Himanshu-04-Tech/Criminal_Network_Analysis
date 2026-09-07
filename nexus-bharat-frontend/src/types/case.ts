export type CaseStatus = "ACTIVE" | "UNDER_INVESTIGATION" | "CHARGESHEETED" | "CLOSED";

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  policeStation: string;
  state: string;
  registeredDate: string;
  sections: string[];
  status: CaseStatus;
  primarySuspects: string[];
  totalEntities: number;
  totalEvidence: number;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  summary: string;
}
