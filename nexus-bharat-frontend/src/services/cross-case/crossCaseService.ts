import {
  CaseProfile,
  SharedEntity,
  CrossCaseResource,
  BridgeEntity,
  MergeDecision,
  CaseFinding,
  CaseComparison,
  SimilarCase,
  EntityType,
} from "@/types";

export class CrossCaseService {
  private static instance: CrossCaseService;

  private constructor() {}

  public static getInstance(): CrossCaseService {
    if (!CrossCaseService.instance) {
      CrossCaseService.instance = new CrossCaseService();
    }
    return CrossCaseService.instance;
  }

  public async getCases(): Promise<CaseProfile[]> {
    await new Promise((r) => setTimeout(r, 40));
    return [
      {
        id: "FIR001",
        title: "Cyber Extortion & Bulk Phishing Funnel",
        section: "IPC 420 / IT Act 66D",
        station: "Special Cell, Lodhi Road, New Delhi",
        date: "2026-08-05",
        status: "ACTIVE",
        totalEntities: 14,
        totalEvidence: 32,
        leadInvestigator: "ACP V. Mehta",
        summary: "Trans-national cyber syndicate executing spoofed SMS payloads and unauthorized wire transfers.",
      },
      {
        id: "FIR003",
        title: "Hawala Laundering & Commercial Mule Networks",
        section: "PMLA Sec 3 / IPC 120B",
        station: "Enforcement Directorate, Ballard Estate, Mumbai",
        date: "2026-08-12",
        status: "ACTIVE",
        totalEntities: 18,
        totalEvidence: 45,
        leadInvestigator: "Joint Dir. R. Sanyal",
        summary: "Complex layering of extortion proceeds into bullion trading and shell entities across western ports.",
      },
      {
        id: "FIR007",
        title: "Inter-State Contraband & Logistics Supply Ring",
        section: "NDPS Sec 8/21/29",
        station: "Crime Branch, Gaekwad Haveli, Ahmedabad",
        date: "2026-08-20",
        status: "INVESTIGATION",
        totalEntities: 16,
        totalEvidence: 28,
        leadInvestigator: "DCP K. Patel",
        summary: "Logistics corridor utilizing hidden transport compartments and burner SIM relays.",
      },
      {
        id: "FIR010",
        title: "Counterfeit Billing & Armed Courier Protection",
        section: "IPC 467/471 / Arms Act",
        station: "Crime Branch South, Gurugram",
        date: "2026-08-25",
        status: "INVESTIGATION",
        totalEntities: 11,
        totalEvidence: 21,
        leadInvestigator: "Insp. D. Yadav",
        summary: "Physical escort services provided to cash couriers transporting Hawala consignments.",
      },
    ];
  }

  public async compareCases(caseAId: string, caseBId: string): Promise<CaseComparison> {
    await new Promise((r) => setTimeout(r, 160));

    const cases = await this.getCases();
    const cA = cases.find((c) => c.id.toUpperCase() === caseAId.toUpperCase()) || cases[0];
    const cB = cases.find((c) => c.id.toUpperCase() === caseBId.toUpperCase()) || cases[2];

    const pairKey = `${cA.id}_${cB.id}`;
    const reversePairKey = `${cB.id}_${cA.id}`;

    // Flagship: FIR001 <-> FIR007
    if (pairKey === "FIR001_FIR007" || reversePairKey === "FIR001_FIR007") {
      return this.buildFIR001ToFIR007Comparison(cA, cB);
    }

    // Secondary: FIR001 <-> FIR003
    if (pairKey === "FIR001_FIR003" || reversePairKey === "FIR001_FIR003") {
      return this.buildFIR001ToFIR003Comparison(cA, cB);
    }

    // Tertiary: FIR003 <-> FIR007
    if (pairKey === "FIR003_FIR007" || reversePairKey === "FIR003_FIR007") {
      return this.buildFIR003ToFIR007Comparison(cA, cB);
    }

    // Dynamic Fallback
    return this.buildDynamicComparison(cA, cB);
  }

  public async getSimilarCases(caseId: string): Promise<SimilarCase[]> {
    await new Promise((r) => setTimeout(r, 40));
    const cid = caseId.toUpperCase();
    if (cid === "FIR001") {
      return [
        { caseId: "FIR007", title: "Inter-State Contraband & Logistics", station: "Ahmedabad Crime Branch", similarityScore: 82, sharedCount: 8, keyBridge: "P017 (Arjun Verma)", date: "2026-08-20" },
        { caseId: "FIR003", title: "Hawala Laundering & Mule Networks", station: "ED Mumbai", similarityScore: 86, sharedCount: 9, keyBridge: "ACC018 (ICICI Mule)", date: "2026-08-12" },
        { caseId: "FIR010", title: "Counterfeit Billing & Couriers", station: "Gurugram Crime Branch", similarityScore: 69, sharedCount: 5, keyBridge: "P031 (Karan Singhania)", date: "2026-08-25" },
      ];
    }
    return [
      { caseId: "FIR001", title: "Cyber Extortion & Bulk Phishing", station: "Special Cell Delhi", similarityScore: 82, sharedCount: 8, keyBridge: "P017 (Arjun Verma)", date: "2026-08-05" },
      { caseId: "FIR003", title: "Hawala Laundering & Commercial Mules", station: "ED Mumbai", similarityScore: 79, sharedCount: 7, keyBridge: "P020 (Rajesh Shrivastav)", date: "2026-08-12" },
      { caseId: "FIR010", title: "Counterfeit Billing & Couriers", station: "Gurugram Crime Branch", similarityScore: 71, sharedCount: 6, keyBridge: "ORG_002 (Silverline Global)", date: "2026-08-25" },
    ];
  }

  // ==========================================
  // Pre-configured Comparisons
  // ==========================================

  private buildFIR001ToFIR007Comparison(caseA: CaseProfile, caseB: CaseProfile): CaseComparison {
    const sharedEntities: SharedEntity[] = [
      {
        id: "P017",
        name: "Arjun Verma",
        type: "PERSON",
        role: "BROKER",
        appearsIn: ["FIR001", "FIR007"],
        casesCount: 2,
        riskScore: 94,
        connectionDetails: "Primary financial intermediary; bridges Delhi extortion calls with Gujarat fleet operations.",
      },
      {
        id: "PHONE_017",
        name: "+91 98220 54321",
        type: "PHONE",
        role: "RESOURCE_CONTROLLER",
        appearsIn: ["FIR001", "FIR007"],
        casesCount: 2,
        riskScore: 92,
        connectionDetails: "Burner handset IMEI active on both Delhi NCR and Ahmedabad cellular towers.",
      },
      {
        id: "ACCOUNT_004",
        name: "ICICI Current ...9012",
        type: "ACCOUNT",
        role: "FINANCIAL_CONDUIT",
        appearsIn: ["FIR001", "FIR007"],
        casesCount: 2,
        riskScore: 89,
        connectionDetails: "Structured deposit pooling account routing INR 18.5L in suspicious remittances.",
      },
      {
        id: "ORG_002",
        name: "Silverline Global Trading",
        type: "ORGANIZATION",
        role: "RESOURCE_CONTROLLER",
        appearsIn: ["FIR001", "FIR007"],
        casesCount: 2,
        riskScore: 90,
        connectionDetails: "Corporate entity leasing transport vehicles and generating forged freight invoices.",
      },
      {
        id: "P001",
        name: "Vikram Malhotra",
        type: "PERSON",
        role: "HUB",
        appearsIn: ["FIR001", "FIR007"],
        casesCount: 2,
        riskScore: 98,
        connectionDetails: "Ultimate syndicate commander referenced in intercepted wire communications.",
      },
      {
        id: "P020",
        name: "Rajesh Shrivastav",
        type: "PERSON",
        role: "BROKER",
        appearsIn: ["FIR001", "FIR007"],
        casesCount: 2,
        riskScore: 89,
        connectionDetails: "Field logistics coordinator managing cross-border contraband couriers.",
      },
      {
        id: "PHONE_012",
        name: "+91 98100 12345",
        type: "PHONE",
        role: "CONNECTOR",
        appearsIn: ["FIR001", "FIR007"],
        casesCount: 2,
        riskScore: 88,
        connectionDetails: "Secondary relay device shared between P001 and P017.",
      },
      {
        id: "LOC_001",
        name: "Chandni Chowk Hawala Safehouse",
        type: "LOCATION",
        role: "CONNECTOR",
        appearsIn: ["FIR001", "FIR007"],
        casesCount: 2,
        riskScore: 65,
        connectionDetails: "Physical cash handover location identified in technical surveillance logs.",
      },
    ];

    const sharedResources: CrossCaseResource[] = [
      {
        id: "PHONE_017",
        name: "+91 98220 54321 (Encrypted Burner)",
        type: "PHONE",
        role: "COMMUNICATIONS_RELAY",
        usedInCases: ["FIR001", "FIR007"],
        evidence: "Matching IMEI 86420188901234 recorded during midnight operational call bursts.",
        confidence: 96,
      },
      {
        id: "ACCOUNT_004",
        name: "ICICI Commercial ...9012",
        type: "ACCOUNT",
        role: "HAWALA_SETTLEMENT_LEDGER",
        usedInCases: ["FIR001", "FIR007"],
        evidence: "Multiple RTGS inflows from Delhi cyber victims withdrawn via Ahmedabad ATM terminals.",
        confidence: 92,
      },
      {
        id: "ORG_002",
        name: "Silverline Global Trading Pvt Ltd",
        type: "ORGANIZATION",
        role: "SHELL_CORPORATE_SHIELD",
        usedInCases: ["FIR001", "FIR007"],
        evidence: "ROC corporate filing shares identical director PAN cards across both investigation dockets.",
        confidence: 94,
      },
      {
        id: "VEH_003",
        name: "Mahindra Scorpio DL-09-CQ-1122",
        type: "VEHICLE",
        role: "CONTRABAND_TRANSPORT",
        usedInCases: ["FIR001", "FIR007"],
        evidence: "Fastag electronic toll records capture regular transit between Delhi and Ahmedabad corridors.",
        confidence: 89,
      },
    ];

    const bridgeEntities: BridgeEntity[] = [
      {
        id: "P017",
        name: "Arjun Verma",
        type: "PERSON",
        role: "BROKER",
        casesConnected: ["FIR001", "FIR007", "FIR003"],
        influenceScore: 94,
        brokerScore: 94,
        bridgeReason: "High betweenness centrality (0.43). Bridges cyber extortion proceeds into transport fleet funding.",
        riskScore: 94,
      },
      {
        id: "P020",
        name: "Rajesh Shrivastav",
        type: "PERSON",
        role: "BROKER",
        casesConnected: ["FIR001", "FIR007"],
        influenceScore: 89,
        brokerScore: 89,
        bridgeReason: "Authorizes corporate logistics payments funded directly by cyber extortion remittances.",
        riskScore: 89,
      },
    ];

    const mergeRecommendation: MergeDecision = {
      decision: "RECOMMENDED",
      confidence: 88,
      justification:
        "Multiple shared high-risk entities and broker overlap detected. Target P017 and burner PHONE_017 establish direct operational connectivity between Delhi Special Cell FIR001 and Ahmedabad Crime Branch FIR007.",
      regulatoryClause: "Section 218 / 223 BNSS (Simultaneous Trial of Joint Conspiracies Across State Boundaries)",
      suggestedFusionCaseId: "FC_001",
    };

    const findings: CaseFinding[] = [
      {
        id: "fnd-1",
        title: "P017 Acts as the Primary Bridge Between Investigations",
        description:
          "Target Arjun Verma (P017) maintains operational contacts in both investigation dockets, serving as the sole broker authorizing cash handovers.",
        severity: "CRITICAL",
        type: "BRIDGE",
      },
      {
        id: "fnd-2",
        title: "PHONE_017 Appears in Both FIRs with Identical Hardware Signature",
        description:
          "Telephony CDR correlation confirmed identical IMEI usage on both Lodhi Road (Delhi) and Gaekwad Haveli (Ahmedabad) cellular towers.",
        severity: "HIGH",
        type: "RESOURCE",
      },
      {
        id: "fnd-3",
        title: "Financial Account Overlap Detected via ICICI Ledger",
        description:
          "INR 18.5 Lakhs in cyber extortion proceeds from FIR001 were routed into ICICI account #9012 and dispersed to logistics couriers in FIR007.",
        severity: "HIGH",
        type: "FINANCIAL",
      },
      {
        id: "fnd-4",
        title: "Cases Belong to a Unified Multi-State Criminal Syndicate",
        description:
          "Structural overlap index exceeds 80%. Joint operational task force and analytical case fusion are strongly recommended.",
        severity: "CRITICAL",
        type: "NETWORK",
      },
    ];

    // Cytoscape bipartite / cross-case elements
    const graphElements = [
      // Case Nodes
      {
        data: {
          id: "case-FIR001",
          label: "FIR001\nCyber Extortion",
          type: "FIR_CASE",
          color: "#1E40AF",
          size: 70,
          shape: "hexagon",
          isCase: true,
        },
        position: { x: 100, y: 220 },
      },
      {
        data: {
          id: "case-FIR007",
          label: "FIR007\nContraband Logistics",
          type: "FIR_CASE",
          color: "#6D28D9",
          size: 70,
          shape: "hexagon",
          isCase: true,
        },
        position: { x: 700, y: 220 },
      },
      // Bridge & Shared Nodes (Center Column)
      {
        data: {
          id: "node-P017",
          label: "P017\nArjun Verma\n[BROKER]",
          type: "PERSON",
          color: "#F59E0B",
          size: 55,
          isBridge: true,
        },
        position: { x: 400, y: 120 },
      },
      {
        data: {
          id: "node-PHONE_017",
          label: "PHONE_017\nBurner Satellite",
          type: "PHONE",
          color: "#06B6D4",
          size: 45,
        },
        position: { x: 400, y: 220 },
      },
      {
        data: {
          id: "node-ACCOUNT_004",
          label: "ACCOUNT_004\nICICI Ledger",
          type: "ACCOUNT",
          color: "#10B981",
          size: 45,
        },
        position: { x: 400, y: 320 },
      },
      {
        data: {
          id: "node-ORG_002",
          label: "ORG_002\nSilverline Shell",
          type: "ORGANIZATION",
          color: "#EF4444",
          size: 45,
        },
        position: { x: 400, y: 410 },
      },
      // Edges Case A -> Shared Nodes
      {
        data: {
          id: "e-caseA-P017",
          source: "case-FIR001",
          target: "node-P017",
          label: "PRIMARY_SUSPECT",
          color: "#3B82F6",
        },
      },
      {
        data: {
          id: "e-caseA-PHONE",
          source: "case-FIR001",
          target: "node-PHONE_017",
          label: "CDR_INTERCEPT",
          color: "#06B6D4",
        },
      },
      {
        data: {
          id: "e-caseA-ACC",
          source: "case-FIR001",
          target: "node-ACCOUNT_004",
          label: "REMITTANCE_OUT",
          color: "#10B981",
        },
      },
      {
        data: {
          id: "e-caseA-ORG",
          source: "case-FIR001",
          target: "node-ORG_002",
          label: "BOGUS_INVOICE",
          color: "#EF4444",
        },
      },
      // Edges Shared Nodes -> Case B
      {
        data: {
          id: "e-P017-caseB",
          source: "node-P017",
          target: "case-FIR007",
          label: "COORDINATES_TRANSPORT",
          color: "#F59E0B",
        },
      },
      {
        data: {
          id: "e-PHONE-caseB",
          source: "node-PHONE_017",
          target: "case-FIR007",
          label: "TOWER_CAPTURE",
          color: "#06B6D4",
        },
      },
      {
        data: {
          id: "e-ACC-caseB",
          source: "node-ACCOUNT_004",
          target: "case-FIR007",
          label: "CASH_WITHDRAWAL",
          color: "#10B981",
        },
      },
      {
        data: {
          id: "e-ORG-caseB",
          source: "node-ORG_002",
          target: "case-FIR007",
          label: "LEASES_VEHICLES",
          color: "#EF4444",
        },
      },
    ];

    return {
      caseA,
      caseB,
      similarityScore: 82,
      classification: "Very Strong",
      metrics: {
        sharedEntities: 8,
        sharedResources: 4,
        bridgeCount: 1,
        riskScore: 91,
        crossCaseEdges: 14,
      },
      sharedEntities,
      sharedResources,
      bridgeEntities,
      mergeRecommendation,
      findings,
      graphElements,
    };
  }

  private buildFIR001ToFIR003Comparison(caseA: CaseProfile, caseB: CaseProfile): CaseComparison {
    return {
      caseA,
      caseB,
      similarityScore: 86,
      classification: "Very Strong",
      metrics: {
        sharedEntities: 9,
        sharedResources: 5,
        bridgeCount: 2,
        riskScore: 94,
        crossCaseEdges: 16,
      },
      sharedEntities: [
        {
          id: "P017",
          name: "Arjun Verma",
          type: "PERSON",
          role: "BROKER",
          appearsIn: ["FIR001", "FIR003"],
          casesCount: 2,
          riskScore: 94,
          connectionDetails: "Direct Hawala conduit bridging Delhi cyber proceeds into Mumbai illicit accounts.",
        },
        {
          id: "ACC018",
          name: "HDFC Mule Pool ...4829",
          type: "ACCOUNT",
          role: "FINANCIAL_CONDUIT",
          appearsIn: ["FIR001", "FIR003"],
          casesCount: 2,
          riskScore: 88,
          connectionDetails: "Shared mule account laundering extortion deposits into commercial accounts.",
        },
      ],
      sharedResources: [
        {
          id: "PHONE_012",
          name: "+91 98100 12345 (Burner)",
          type: "PHONE",
          role: "RELAY",
          usedInCases: ["FIR001", "FIR003"],
          evidence: "Tower geo-co-location logged across investigation records.",
          confidence: 95,
        },
      ],
      bridgeEntities: [
        {
          id: "P017",
          name: "Arjun Verma",
          type: "PERSON",
          role: "BROKER",
          casesConnected: ["FIR001", "FIR003"],
          influenceScore: 94,
          brokerScore: 94,
          bridgeReason: "Primary Hawala intermediary.",
          riskScore: 94,
        },
      ],
      mergeRecommendation: {
        decision: "RECOMMENDED",
        confidence: 91,
        justification: "Critical financial flow overlap with direct broker coordination.",
        regulatoryClause: "Section 223 BNSS (Joint Conspiracies)",
        suggestedFusionCaseId: "FC_001",
      },
      findings: [
        {
          id: "fnd-101",
          title: "Direct Syndicate Financial Pipeline",
          description: "Proceeds from cyber extortion directly funded Mumbai shell corporate acquisitions.",
          severity: "CRITICAL",
          type: "FINANCIAL",
        },
      ],
      graphElements: [],
    };
  }

  private buildFIR003ToFIR007Comparison(caseA: CaseProfile, caseB: CaseProfile): CaseComparison {
    return {
      caseA,
      caseB,
      similarityScore: 79,
      classification: "Strong",
      metrics: {
        sharedEntities: 7,
        sharedResources: 3,
        bridgeCount: 1,
        riskScore: 86,
        crossCaseEdges: 11,
      },
      sharedEntities: [
        {
          id: "P020",
          name: "Rajesh Shrivastav",
          type: "PERSON",
          role: "LOGISTICS_OPERATOR",
          appearsIn: ["FIR003", "FIR007"],
          casesCount: 2,
          riskScore: 89,
          connectionDetails: "Authorizes transport fleet payments through laundered Mumbai funds.",
        },
      ],
      sharedResources: [],
      bridgeEntities: [],
      mergeRecommendation: {
        decision: "RECOMMENDED",
        confidence: 84,
        justification: "Strong logistics financing and common fleet deployment across western corridor.",
        regulatoryClause: "Section 218 BNSS",
        suggestedFusionCaseId: "FC_002",
      },
      findings: [],
      graphElements: [],
    };
  }

  private buildDynamicComparison(caseA: CaseProfile, caseB: CaseProfile): CaseComparison {
    return {
      caseA,
      caseB,
      similarityScore: 68,
      classification: "Moderate",
      metrics: {
        sharedEntities: 5,
        sharedResources: 2,
        bridgeCount: 1,
        riskScore: 74,
        crossCaseEdges: 8,
      },
      sharedEntities: [
        {
          id: "P017",
          name: "Arjun Verma",
          type: "PERSON",
          role: "BROKER",
          appearsIn: [caseA.id, caseB.id],
          casesCount: 2,
          riskScore: 94,
          connectionDetails: "Intermediary communication recorded between suspect parties.",
        },
      ],
      sharedResources: [],
      bridgeEntities: [
        {
          id: "P017",
          name: "Arjun Verma",
          type: "PERSON",
          role: "BROKER",
          casesConnected: [caseA.id, caseB.id],
          influenceScore: 94,
          brokerScore: 94,
          bridgeReason: "Multi-jurisdictional broker.",
          riskScore: 94,
        },
      ],
      mergeRecommendation: {
        decision: "REQUIRES_REVIEW",
        confidence: 65,
        justification: "Moderate entity overlap observed; recommend joint intelligence briefing before formal case fusion.",
        regulatoryClause: "Section 218 BNSS",
      },
      findings: [
        {
          id: "fnd-dyn-1",
          title: "Preliminary Cross-Case Linkage Identified",
          description: "Indirect communication and shared intermediary detected between jurisdictions.",
          severity: "MEDIUM",
          type: "BRIDGE",
        },
      ],
      graphElements: [],
    };
  }
}

export const crossCaseService = CrossCaseService.getInstance();

export const getCases = () => crossCaseService.getCases();
export const compareCases = (caseA: string, caseB: string) =>
  crossCaseService.compareCases(caseA, caseB);
export const getSimilarCases = (caseId: string) =>
  crossCaseService.getSimilarCases(caseId);
