import { IntelligenceFinding } from "@/types/finding";

export const mockIntelligenceFindings: IntelligenceFinding[] = [
  {
    id: "FND-001",
    title: "Broker P017 connects 3 communities",
    description: "Suspect Arjun Verma (P017) identified as master inter-cluster bridge between Cyber Extortion Cell (C1), Hawala Clearing Ring (C3), and Gujarat Border Logistics (C5).",
    category: "BROKER",
    confidence: 0.94,
    severity: "CRITICAL",
    entities: ["P017", "P001", "P020"],
    cases: ["FIR001", "FIR003", "FIR007"],
    evidence: [
      "Betweenness centrality 0.412 exceeds 99th percentile across entire graph",
      "Bridge cut would split criminal network into 3 disconnected components"
    ],
    suggestedAction: "Prioritize P017 for surveillance interception to sever cross-cell coordination.",
    timestamp: "2026-08-31T09:30:00Z",
  },
  {
    id: "FND-002",
    title: "FIR001 linked to FIR007",
    description: "Investigative graph correlation confirmed direct associative link between Special Cell Delhi phishing probe (FIR001) and Ahmedabad contraband smuggling (FIR007).",
    category: "CROSS_CASE",
    confidence: 0.88,
    severity: "HIGH",
    entities: ["ACC001", "ACC018", "P017"],
    cases: ["FIR001", "FIR007"],
    evidence: [
      "Layering path ACC001 -> ACC018 identified across banking ledgers",
      "Consignment proceeds routed through common shell company ORG002"
    ],
    suggestedAction: "Initiate joint inter-agency case fusion docket (FC_001).",
    timestamp: "2026-08-30T14:15:00Z",
  },
  {
    id: "FND-003",
    title: "PHONE_017 shared across 4 entities",
    description: "Single burner hardware device (IMEI-98441) shared concurrently by 4 distinct criminal personas across Delhi and Mumbai operational territories.",
    category: "SHARED_RESOURCE",
    confidence: 0.96,
    severity: "HIGH",
    entities: ["PHONE_017", "P001", "P017", "P019", "P020"],
    cases: ["FIR001", "FIR003"],
    evidence: [
      "CDR records establish rotational device usage across safehouse LOC003",
      "SIM hot-swapping detected on cell tower ID DL-CENTRAL-44"
    ],
    suggestedAction: "Issue immediate IMEI warrant tracker request to telecom service provider.",
    timestamp: "2026-08-29T18:40:00Z",
  },
  {
    id: "FND-004",
    title: "New financial conduit detected",
    description: "Account ACC018 (ICICI Bank) activated as high-velocity layering funnel, receiving rapid fan-in credits followed by offshore dissipation wire transfers.",
    category: "FINANCIAL_CONDUIT",
    confidence: 0.91,
    severity: "CRITICAL",
    entities: ["ACC018", "ORG002", "P020"],
    cases: ["FIR003", "FIR007"],
    evidence: [
      "INR 42.8 Lakhs aggregated from 6 mule accounts within 35 minutes",
      "Immediate outbound wire transfer initiated to shell entity Silverline Global"
    ],
    suggestedAction: "Submit emergency Section 102 CrPC debit freeze notice to nodal banking officer.",
    timestamp: "2026-08-29T11:05:00Z",
  },
];
