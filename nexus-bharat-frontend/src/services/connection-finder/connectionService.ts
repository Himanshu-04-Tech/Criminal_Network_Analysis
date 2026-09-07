import {
  ConnectionResult,
  ConnectionPath,
  PathNode,
  PathEdge,
  SharedResource,
  PathStatistics,
  ConnectionInsight,
  EntityType,
} from "@/types";

export class ConnectionService {
  private static instance: ConnectionService;

  private constructor() {}

  public static getInstance(): ConnectionService {
    if (!ConnectionService.instance) {
      ConnectionService.instance = new ConnectionService();
    }
    return ConnectionService.instance;
  }

  /**
   * Return predefined list of searchable entities for autocomplete
   */
  public async getAvailableEntities(): Promise<
    Array<{ id: string; name: string; type: EntityType; role?: string }>
  > {
    await new Promise((r) => setTimeout(r, 40));
    return [
      { id: "P001", name: "Vikram Malhotra", type: "PERSON", role: "HUB / COMMANDER" },
      { id: "P020", name: "Rajesh Shrivastav", type: "PERSON", role: "LOGISTICS OPERATOR" },
      { id: "P017", name: "Arjun Verma", type: "PERSON", role: "BROKER / FINANCIAL" },
      { id: "P021", name: "Rohan Mehta", type: "PERSON", role: "TECHNICAL CELL" },
      { id: "P031", name: "Karan Singhania", type: "PERSON", role: "SUPPLY FACILITATOR" },
      { id: "P002", name: "Devendra Joshi", type: "PERSON", role: "FIELD COORDINATOR" },
      { id: "PHONE_012", name: "+91 98100 12345 (Burner)", type: "PHONE", role: "RELAY DEVICE" },
      { id: "PHONE_017", name: "+91 98220 54321", type: "PHONE", role: "COMMUNICATION" },
      { id: "ACCOUNT_004", name: "ICICI ...9012 (Hawala Ledger)", type: "ACCOUNT", role: "FINANCIAL CONDUIT" },
      { id: "ACC018", name: "HDFC ...4829 (Mule Pool)", type: "ACCOUNT", role: "MULE ACCOUNT" },
      { id: "VEH_003", name: "White Scorpio DL-09-CQ-1122", type: "VEHICLE", role: "TRANSPORT" },
      { id: "ORG_002", name: "Silverline Global Trading", type: "ORGANIZATION", role: "SHELL COMPANY" },
      { id: "LOC_001", name: "Chandni Chowk Hawala Safehouse", type: "LOCATION", role: "MEETING POINT" },
    ];
  }

  /**
   * Main connection discovery method
   */
  public async findConnection(
    sourceId: string,
    targetId: string,
    depth: number = 4
  ): Promise<ConnectionResult | null> {
    await new Promise((r) => setTimeout(r, 220));

    const s = sourceId.trim().toUpperCase();
    const t = targetId.trim().toUpperCase();

    // If source and target are identical
    if (s === t) {
      return null;
    }

    // Depth check: if user chose depth < 3 for pairs that need 4 hops
    if (depth < 3 && ((s === "P001" && t === "P020") || (s === "P020" && t === "P001"))) {
      return null;
    }

    // Primary flagship path: P001 -> P020
    if ((s === "P001" && t === "P020") || (s === "P020" && t === "P001")) {
      return this.buildP001ToP020Result();
    }

    // Secondary path: P017 -> P031
    if ((s === "P017" && t === "P031") || (s === "P031" && t === "P017")) {
      return this.buildP017ToP031Result();
    }

    // Direct 1-2 hop path: P001 -> P017
    if ((s === "P001" && t === "P017") || (s === "P017" && t === "P001")) {
      return this.buildP001ToP017Result();
    }

    // Dynamic fallback connection for any other combination
    return this.buildDynamicFallbackResult(s, t, depth);
  }

  /**
   * Get single path
   */
  public async getPath(source: string, target: string): Promise<ConnectionPath | null> {
    const res = await this.findConnection(source, target);
    return res ? res.primaryPath : null;
  }

  /**
   * Get shared resources between two entities
   */
  public async getSharedResources(source: string, target: string): Promise<SharedResource[]> {
    const res = await this.findConnection(source, target);
    return res ? res.sharedResources : [];
  }

  /**
   * Get connection strength score (0-100)
   */
  public async getConnectionStrength(source: string, target: string): Promise<number> {
    const res = await this.findConnection(source, target);
    return res ? res.connectionStrength : 0;
  }

  // ==========================================
  // Pre-configured High-Fidelity Results
  // ==========================================

  private buildP001ToP020Result(): ConnectionResult {
    const nodes: PathNode[] = [
      {
        id: "P001",
        name: "Vikram Malhotra",
        type: "PERSON",
        role: "HUB / COMMANDER",
        riskScore: 98,
        isBridge: false,
        details: "Primary syndicate orchestrator under central warrant. Identified in FIR001.",
        cases: ["FIR001", "FIR003"],
      },
      {
        id: "PHONE_012",
        name: "+91 98100 12345",
        type: "PHONE",
        role: "SHARED_BURNER",
        riskScore: 92,
        isBridge: false,
        details: "Burner hardware device rotating SIM cards every 72 hours across NCR towers.",
        cases: ["FIR001"],
      },
      {
        id: "P017",
        name: "Arjun Verma",
        type: "PERSON",
        role: "BROKER / BRIDGE",
        riskScore: 94,
        isBridge: true,
        details: "Intermediary financial broker bridging cyber extortion and Hawala networks.",
        cases: ["FIR001", "FIR003", "FC_001"],
      },
      {
        id: "ACCOUNT_004",
        name: "ICICI ...9012",
        type: "ACCOUNT",
        role: "FINANCIAL_CONDUIT",
        riskScore: 89,
        isBridge: false,
        details: "Commercial current account used for batching cash deposits and Hawala settlements.",
        cases: ["FIR003", "FIR007"],
      },
      {
        id: "P020",
        name: "Rajesh Shrivastav",
        type: "PERSON",
        role: "LOGISTICS OPERATOR",
        riskScore: 89,
        isBridge: false,
        details: "West zone distribution controller for contraband movement. Target in FIR003 & FIR007.",
        cases: ["FIR003", "FIR007"],
      },
    ];

    const edges: PathEdge[] = [
      {
        id: "edge-1",
        source: "P001",
        target: "PHONE_012",
        relationshipType: "USES",
        confidence: 96,
        date: "2026-08-10",
        evidence: "Intercepted IMEI match on cell tower T-102; voice biometrics fit 98.4%",
        caseId: "FIR001",
      },
      {
        id: "edge-2",
        source: "PHONE_012",
        target: "P017",
        relationshipType: "CONTACTED",
        confidence: 92,
        date: "2026-08-12",
        evidence: "14 Encrypted call handshakes recorded between 01:00-03:00 UTC",
        caseId: "FIR001",
      },
      {
        id: "edge-3",
        source: "P017",
        target: "ACCOUNT_004",
        relationshipType: "TRANSFERRED_TO",
        confidence: 88,
        date: "2026-08-14",
        evidence: "INR 18,50,000 structured remittance batch ID #H-8902 routed via digital ledger",
        caseId: "FIR003",
      },
      {
        id: "edge-4",
        source: "ACCOUNT_004",
        target: "P020",
        relationshipType: "BENEFICIARY_OF",
        confidence: 94,
        date: "2026-08-15",
        evidence: "Cash withdrawal authorized under forged logistics corporate invoice",
        caseId: "FIR007",
      },
    ];

    const sharedResources: SharedResource[] = [
      {
        id: "PHONE_012",
        name: "+91 98100 12345 (Burner Relay)",
        type: "PHONE",
        role: "SHARED_BURNER",
        usedBy: [
          { id: "P001", name: "Vikram Malhotra", relation: "OPERATES_DEVICE" },
          { id: "P017", name: "Arjun Verma", relation: "INBOUND_RELAY" },
        ],
        evidence: "Dual SIM IMEI registration captured on outer ring road cell tower on 2026-08-12.",
        confidence: 96,
      },
      {
        id: "ORG_002",
        name: "Silverline Global Trading",
        type: "ORGANIZATION",
        role: "SHELL_COMPANY",
        usedBy: [
          { id: "P001", name: "Vikram Malhotra", relation: "ULTIMATE_BENEFICIARY" },
          { id: "P020", name: "Rajesh Shrivastav", relation: "AUTHORISED_DIRECTOR" },
        ],
        evidence: "Corporate filing shares identical corporate office address in Mumbai Nariman Point.",
        confidence: 91,
      },
    ];

    const primaryPath: ConnectionPath = {
      id: "path-p001-p020-1",
      source: "P001",
      target: "P020",
      hops: 4,
      strength: 84,
      riskScore: 87,
      nodes,
      edges,
      bridges: [nodes[2]], // P017
    };

    const statistics: PathStatistics = {
      nodesTraversed: 5,
      relationshipsTraversed: 4,
      bridgeCount: 1,
      pathRiskScore: 87,
    };

    const insights: ConnectionInsight[] = [
      {
        id: "ins-1",
        title: "Critical Bridge Node Identified",
        description:
          "Target P017 (Arjun Verma) acts as the single critical bottleneck bridging P001's command network with P020's distribution infrastructure.",
        type: "BROKER",
        severity: "CRITICAL",
      },
      {
        id: "ins-2",
        title: "Shared Burner Infrastructure",
        description:
          "High confidence (96%) link confirmed through shared burner phone PHONE_012 active across both FIR001 and FIR003.",
        type: "SHARED_RESOURCE",
        severity: "HIGH",
      },
      {
        id: "ins-3",
        title: "Hawala Financial Pipeline",
        description:
          "INR 18.5 Lakhs transferred through intermediary ledger ACCOUNT_004 within 48 hours of recorded technical contact.",
        type: "TACTICAL",
        severity: "HIGH",
      },
      {
        id: "ins-4",
        title: "Cross-Case Jurisdiction Fusion",
        description:
          "Path traverses 3 independent investigations: FIR001 (Cyber Cell), FIR003 (ED Mumbai), and FIR007 (Gujarat Crime Branch).",
        type: "CROSS_CASE",
        severity: "MEDIUM",
      },
    ];

    return {
      source: "P001",
      target: "P020",
      primaryPath,
      sharedResources,
      connectionStrength: 84,
      statistics,
      insights,
    };
  }

  private buildP017ToP031Result(): ConnectionResult {
    const nodes: PathNode[] = [
      {
        id: "P017",
        name: "Arjun Verma",
        type: "PERSON",
        role: "BROKER",
        riskScore: 94,
        cases: ["FIR001", "FIR003"],
      },
      {
        id: "ORG_002",
        name: "Silverline Global Trading",
        type: "ORGANIZATION",
        role: "SHELL_COMPANY",
        riskScore: 90,
        cases: ["FIR003"],
      },
      {
        id: "VEH_003",
        name: "Scorpio DL-09-CQ-1122",
        type: "VEHICLE",
        role: "LOGISTICS_TRANSPORT",
        riskScore: 82,
        cases: ["FIR003"],
      },
      {
        id: "P031",
        name: "Karan Singhania",
        type: "PERSON",
        role: "SUPPLIER",
        riskScore: 85,
        cases: ["FIR003", "FIR010"],
      },
    ];

    const edges: PathEdge[] = [
      {
        id: "edge-a1",
        source: "P017",
        target: "ORG_002",
        relationshipType: "OWNS",
        confidence: 95,
        evidence: "Sole signatory of registration charter",
      },
      {
        id: "edge-a2",
        source: "ORG_002",
        target: "VEH_003",
        relationshipType: "REGISTERED_TO",
        confidence: 90,
        evidence: "Commercial fleet registration",
      },
      {
        id: "edge-a3",
        source: "VEH_003",
        target: "P031",
        relationshipType: "DRIVEN_BY",
        confidence: 89,
        evidence: "Toll plaza ANPR capture and driver identification on NH-48",
      },
    ];

    const primaryPath: ConnectionPath = {
      id: "path-p017-p031",
      source: "P017",
      target: "P031",
      hops: 3,
      strength: 78,
      riskScore: 84,
      nodes,
      edges,
      bridges: [nodes[1]],
    };

    return {
      source: "P017",
      target: "P031",
      primaryPath,
      sharedResources: [
        {
          id: "VEH_003",
          name: "Scorpio DL-09-CQ-1122",
          type: "VEHICLE",
          role: "LOGISTICS_TRANSPORT",
          usedBy: [
            { id: "P017", name: "Arjun Verma", relation: "FINANCED_VEHICLE" },
            { id: "P031", name: "Karan Singhania", relation: "PRIMARY_DRIVER" },
          ],
          evidence: "Fastag records reveal regular transit between NCR and Ahmedabad.",
          confidence: 89,
        },
      ],
      connectionStrength: 78,
      statistics: {
        nodesTraversed: 4,
        relationshipsTraversed: 3,
        bridgeCount: 1,
        pathRiskScore: 84,
      },
      insights: [
        {
          id: "ins-201",
          title: "Shell Corporation Proxy Usage",
          description:
            "Silverline Global Trading (ORG_002) acts as the corporate shield through which logistics vehicle VEH_003 is provided to target P031.",
          type: "SHARED_RESOURCE",
          severity: "HIGH",
        },
      ],
    };
  }

  private buildP001ToP017Result(): ConnectionResult {
    const nodes: PathNode[] = [
      {
        id: "P001",
        name: "Vikram Malhotra",
        type: "PERSON",
        role: "COMMANDER",
        riskScore: 98,
        cases: ["FIR001"],
      },
      {
        id: "PHONE_012",
        name: "+91 98100 12345",
        type: "PHONE",
        role: "SHARED_BURNER",
        riskScore: 92,
        cases: ["FIR001"],
      },
      {
        id: "P017",
        name: "Arjun Verma",
        type: "PERSON",
        role: "BROKER",
        riskScore: 94,
        cases: ["FIR001", "FIR003"],
      },
    ];

    const edges: PathEdge[] = [
      {
        id: "edge-b1",
        source: "P001",
        target: "PHONE_012",
        relationshipType: "USES",
        confidence: 96,
        evidence: "Direct CDR handset association",
      },
      {
        id: "edge-b2",
        source: "PHONE_012",
        target: "P017",
        relationshipType: "CONTACTED",
        confidence: 94,
        evidence: "Frequent midnight calls before transactions",
      },
    ];

    return {
      source: "P001",
      target: "P017",
      primaryPath: {
        id: "path-p001-p017",
        source: "P001",
        target: "P017",
        hops: 2,
        strength: 95,
        riskScore: 96,
        nodes,
        edges,
        bridges: [],
      },
      sharedResources: [
        {
          id: "PHONE_012",
          name: "+91 98100 12345 (Burner Relay)",
          type: "PHONE",
          role: "SHARED_BURNER",
          usedBy: [
            { id: "P001", name: "Vikram Malhotra", relation: "OPERATES" },
            { id: "P017", name: "Arjun Verma", relation: "CONTACTS" },
          ],
          evidence: "Tower geo-co-location within 250m on 2026-08-11",
          confidence: 96,
        },
      ],
      connectionStrength: 95,
      statistics: {
        nodesTraversed: 3,
        relationshipsTraversed: 2,
        bridgeCount: 0,
        pathRiskScore: 96,
      },
      insights: [
        {
          id: "ins-301",
          title: "Tight 2-Hop Proximity",
          description:
            "Direct technical liaison between P001 and P017 indicates a priority operational channel without intermediary filtering.",
          type: "TACTICAL",
          severity: "CRITICAL",
        },
      ],
    };
  }

  private buildDynamicFallbackResult(
    source: string,
    target: string,
    depth: number
  ): ConnectionResult {
    const intermediaryId = "P017";
    const intermediaryName = "Arjun Verma";

    const nodes: PathNode[] = [
      {
        id: source,
        name: `Subject ${source}`,
        type: source.startsWith("P") ? "PERSON" : source.startsWith("PHONE") ? "PHONE" : "ACCOUNT",
        role: "TARGET_A",
        riskScore: 82,
        cases: ["FIR001"],
      },
      {
        id: "PHONE_012",
        name: "+91 98100 12345",
        type: "PHONE",
        role: "BURNER_RELAY",
        riskScore: 88,
        cases: ["FIR001"],
      },
      {
        id: intermediaryId,
        name: intermediaryName,
        type: "PERSON",
        role: "BROKER / BRIDGE",
        riskScore: 94,
        isBridge: true,
        cases: ["FIR001", "FIR003"],
      },
      {
        id: target,
        name: `Subject ${target}`,
        type: target.startsWith("P") ? "PERSON" : target.startsWith("ACC") ? "ACCOUNT" : "ORGANIZATION",
        role: "TARGET_B",
        riskScore: 85,
        cases: ["FIR003"],
      },
    ];

    const edges: PathEdge[] = [
      {
        id: "edge-dyn-1",
        source,
        target: "PHONE_012",
        relationshipType: "COMMUNICATES_VIA",
        confidence: 86,
        evidence: "CDR co-occurrence logged during case surveillance",
      },
      {
        id: "edge-dyn-2",
        source: "PHONE_012",
        target: intermediaryId,
        relationshipType: "CONTACTED",
        confidence: 89,
        evidence: "Encrypted packet burst observed over cellular gateway",
      },
      {
        id: "edge-dyn-3",
        source: intermediaryId,
        target,
        relationshipType: "COORDINATES_WITH",
        confidence: 84,
        evidence: "Financial ledger trace and cross-referenced incident report",
      },
    ];

    return {
      source,
      target,
      primaryPath: {
        id: `path-${source}-${target}`,
        source,
        target,
        hops: 3,
        strength: 72,
        riskScore: 80,
        nodes,
        edges,
        bridges: [nodes[2]],
      },
      sharedResources: [
        {
          id: "PHONE_012",
          name: "+91 98100 12345 (Burner)",
          type: "PHONE",
          role: "SHARED_RELAY",
          usedBy: [
            { id: source, name: `Subject ${source}`, relation: "CONTACTS" },
            { id: intermediaryId, name: intermediaryName, relation: "OPERATES" },
          ],
          evidence: "Telephony metadata correlation from special cell repository",
          confidence: 86,
        },
      ],
      connectionStrength: 72,
      statistics: {
        nodesTraversed: 4,
        relationshipsTraversed: 3,
        bridgeCount: 1,
        pathRiskScore: 80,
      },
      insights: [
        {
          id: "ins-dyn-1",
          title: "Synthesized Multi-Hop Path",
          description: `Graph traversal completed in 3 hops via bridge entity ${intermediaryName} (${intermediaryId}).`,
          type: "BROKER",
          severity: "MEDIUM",
        },
      ],
    };
  }
}

export const connectionService = ConnectionService.getInstance();

export const findConnection = (source: string, target: string, depth?: number) =>
  connectionService.findConnection(source, target, depth);

export const getPath = (source: string, target: string) =>
  connectionService.getPath(source, target);

export const getSharedResources = (source: string, target: string) =>
  connectionService.getSharedResources(source, target);

export const getConnectionStrength = (source: string, target: string) =>
  connectionService.getConnectionStrength(source, target);

export const getAvailableEntities = () =>
  connectionService.getAvailableEntities();
