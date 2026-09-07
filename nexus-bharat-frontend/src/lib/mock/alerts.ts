import { Alert } from "@/types/alert";

export const mockCriticalAlerts: Alert[] = [
  {
    id: "ALT-001",
    type: "COMMUNICATION_BURST",
    title: "Communication Burst",
    description: "High-frequency burst of 37 encrypted burner calls detected across 6 hours. Precedes scheduled money transfer window.",
    severity: "CRITICAL",
    timestamp: "12 mins ago",
    entityTags: ["P001 (Leader)", "P017 (Broker)", "PH001", "PH016"],
    caseId: "FIR001",
    status: "NEW",
    reasons: [
      "Call velocity spiked from 0.1 calls/hr to 6.2 calls/hr",
      "Correlates with Hawala settlement schedule in Mumbai cell"
    ],
  },
  {
    id: "ALT-002",
    type: "NEW_BROKER_DETECTED",
    title: "New Broker Detected",
    description: "Entity P020 betweenness centrality increased by 262%. Node now bridges Maharashtra hawala conduit and Gujarat logistics ring.",
    severity: "HIGH",
    timestamp: "45 mins ago",
    entityTags: ["P020 (Rajesh Shrivastav)", "ACC018", "ORG002"],
    caseId: "FIR003 / FIR007",
    status: "NEW",
    reasons: [
      "Betweenness centrality surged from 0.08 to 0.29",
      "Forms shortest traversal path between Cyber and Contraband cells"
    ],
  },
  {
    id: "ALT-003",
    type: "CROSS_CASE_CONNECTION",
    title: "Cross Case Connection",
    description: "Shared hardware identifier IMEI-8839 linked suspect P017 in FIR001 directly to courier cell P024 in FIR003.",
    severity: "HIGH",
    timestamp: "2 hours ago",
    entityTags: ["P017", "P024", "IMEI-8839"],
    caseId: "FIR001 ↔ FIR003",
    status: "ACKNOWLEDGED",
    reasons: [
      "Exact hardware device match confirmed by telecom tower logs",
      "Two independent FIRs consolidated into single syndicate"
    ],
  },
  {
    id: "ALT-004",
    type: "SHARED_VEHICLE_FOUND",
    title: "Shared Vehicle Found",
    description: "Vehicle MH-02-CD-4921 identified at 2 drop sites associated with FIR002 and FIR007 within 48 hours.",
    severity: "MEDIUM",
    timestamp: "4 hours ago",
    entityTags: ["VEH007 (MH-02-CD-4921)", "LOC007", "LOC009"],
    caseId: "FIR002 ↔ FIR007",
    status: "NEW",
    reasons: [
      "ANPR toll camera capture confirmed timestamps",
      "Registered under fraudulent address in Pune jurisdiction"
    ],
  },
];
