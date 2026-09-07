import {
  FusedCaseProfile,
  FusionScoreResult,
  FusionMetric,
  FusionBridgeEntity,
  NewConnection,
  CommunityChange,
  ImpactAnalysisData,
  FusionInsight,
  FusionRecommendation,
  FusionResult,
} from "@/types";

export class CaseFusionService {
  private static instance: CaseFusionService;

  private constructor() {}

  public static getInstance(): CaseFusionService {
    if (!CaseFusionService.instance) {
      CaseFusionService.instance = new CaseFusionService();
    }
    return CaseFusionService.instance;
  }

  public async getCases(): Promise<FusedCaseProfile[]> {
    await new Promise((r) => setTimeout(r, 40));
    return [
      {
        id: "FIR001",
        name: "Cyber Syndicate Phishing Operation",
        location: "New Delhi",
        policeStation: "Special Cell, Lodhi Road",
        section: "IPC 420 / IT Act 66D",
        date: "2026-08-05",
        nodes: 18,
        edges: 29,
        status: "ACTIVE",
        leadInvestigator: "ACP V. Mehta",
        summary: "Trans-national cyber syndicate executing spoofed SMS payloads and unauthorized wire transfers.",
        primarySyndicate: "Northern Cyber Cartel",
      },
      {
        id: "FIR002",
        name: "Multi-Jurisdiction Identity Spoofing",
        location: "Pune",
        policeStation: "Cyber Crime Cell, Shivajinagar",
        section: "IPC 419 / 420 / IT Act 66C",
        date: "2026-08-09",
        nodes: 15,
        edges: 22,
        status: "ACTIVE",
        leadInvestigator: "PI S. Kulkarni",
        summary: "Forged Aadhaar & PAN profiles utilized for massive SIM bank activation in Maharashtra corridor.",
        primarySyndicate: "Western SIM Distribution Ring",
      },
      {
        id: "FIR003",
        name: "Hawala Remittance & Money Laundering",
        location: "Mumbai",
        policeStation: "Enforcement Directorate, Ballard Estate",
        section: "PMLA Sec 3 / IPC 120B",
        date: "2026-08-12",
        nodes: 14,
        edges: 24,
        status: "ACTIVE",
        leadInvestigator: "Joint Dir. R. Sanyal",
        summary: "Complex layering of extortion proceeds into bullion trading and shell entities across western ports.",
        primarySyndicate: "Ballard Hawala Syndicate",
      },
      {
        id: "FIR006",
        name: "Cross-Border Contraband Forwarding",
        location: "Kolkata",
        policeStation: "CID Special Branch, Bhowani Bhavan",
        section: "NDPS Sec 21 / Customs Act",
        date: "2026-08-16",
        nodes: 11,
        edges: 18,
        status: "INVESTIGATION",
        leadInvestigator: "DSP B. Banerjee",
        summary: "Clandestine maritime transshipment network exploiting eastern riverine border crossings.",
        primarySyndicate: "Eastern Logistics Ring",
      },
      {
        id: "FIR007",
        name: "Contraband Logistics & Bulk Mules",
        location: "Ahmedabad",
        policeStation: "Crime Branch, Gaekwad Haveli",
        section: "NDPS Sec 8/21/29",
        date: "2026-08-20",
        nodes: 12,
        edges: 19,
        status: "INVESTIGATION",
        leadInvestigator: "DCP K. Patel",
        summary: "Logistics corridor utilizing hidden transport compartments and burner SIM relays.",
        primarySyndicate: "Gujarat Transport Nexus",
      },
      {
        id: "FIR010",
        name: "Post-Reconfiguration Armed Escort Cell",
        location: "Noida / Gurugram",
        policeStation: "Crime Branch South, Gurugram",
        section: "Arms Act / IPC 467/471",
        date: "2026-08-25",
        nodes: 10,
        edges: 16,
        status: "INVESTIGATION",
        leadInvestigator: "Insp. D. Yadav",
        summary: "Physical escort and protection services provided to cash couriers transporting Hawala consignments.",
        primarySyndicate: "NCR Protection Syndicate",
      },
    ];
  }

  public async simulateFusion(caseIds: string[]): Promise<FusionResult> {
    // Artificial latency for realism
    await new Promise((r) => setTimeout(r, 220));

    const allCases = await this.getCases();
    const selectedCases = allCases.filter((c) => caseIds.includes(c.id));

    const containsFIR001 = caseIds.includes("FIR001");
    const containsFIR003 = caseIds.includes("FIR003");
    const containsFIR007 = caseIds.includes("FIR007");

    // Flagship Multi-Fusion: FIR001 + FIR003 + FIR007
    const isTripartiteCartel = containsFIR001 && containsFIR003 && containsFIR007;

    const fusionScore = isTripartiteCartel ? 91 : caseIds.length >= 3 ? 84 : caseIds.length === 2 ? 78 : 45;
    const classification =
      fusionScore >= 81
        ? "Extremely Strong"
        : fusionScore >= 61
        ? "Strong"
        : fusionScore >= 31
        ? "Moderate"
        : "Weak";

    const score: FusionScoreResult = {
      fusionScore,
      classification,
      factors: {
        entityOverlap: isTripartiteCartel ? 88 : 74,
        resourceSharing: isTripartiteCartel ? 94 : 79,
        brokerEmergence: isTripartiteCartel ? 96 : 82,
        networkDensityGain: isTripartiteCartel ? 85 : 68,
        modusOperandiFit: isTripartiteCartel ? 93 : 80,
      },
    };

    const metrics: FusionMetric = {
      casesMerged: selectedCases.length,
      newConnections: isTripartiteCartel ? 12 : selectedCases.length * 4,
      bridgeEntities: isTripartiteCartel ? 4 : Math.max(1, selectedCases.length),
      communitiesMerged: isTripartiteCartel ? 2 : 1,
      sharedResources: isTripartiteCartel ? 7 : selectedCases.length * 2,
      newBrokers: 1,
      totalNodes: selectedCases.reduce((sum, c) => sum + c.nodes, 0) - (isTripartiteCartel ? 8 : 4),
      totalEdges: selectedCases.reduce((sum, c) => sum + c.edges, 0) + (isTripartiteCartel ? 12 : 6),
      densityGainPercent: isTripartiteCartel ? 38.4 : 24.2,
    };

    const bridgeEntities: FusionBridgeEntity[] = [
      {
        id: "P017",
        name: "Arjun Verma",
        type: "PERSON",
        role: "BROKER",
        casesConnected: selectedCases.map((c) => c.id).slice(0, 3),
        influenceScore: 94,
        brokerScore: 94,
        betweennessCentrality: 0.43,
        bridgeReason:
          "High betweenness centrality. Directly channels cyber extortion proceeds into transport fleet funding and Hawala clearinghouses.",
        riskScore: 94,
      },
      {
        id: "P020",
        name: "Rajesh Shrivastav",
        type: "PERSON",
        role: "BROKER",
        casesConnected: ["FIR001", "FIR007"].filter((id) => caseIds.includes(id)),
        influenceScore: 89,
        brokerScore: 89,
        betweennessCentrality: 0.35,
        bridgeReason:
          "Commercial signer authorizing corporate logistics disbursements under shell invoices funded by cyber extortion victims.",
        riskScore: 89,
      },
      {
        id: "ACC018",
        name: "HDFC Commercial Mule ...4829",
        type: "BANK_ACCOUNT",
        role: "FINANCIAL_CONDUIT",
        casesConnected: selectedCases.map((c) => c.id),
        influenceScore: 86,
        brokerScore: 86,
        betweennessCentrality: 0.28,
        bridgeReason:
          "High-volume clearinghouse account funneling RTGS remittances across Delhi, Mumbai, and Ahmedabad dockets.",
        riskScore: 91,
      },
      {
        id: "PHONE_017",
        name: "+91 98220 54321 (Burner IMEI 8642)",
        type: "PHONE",
        role: "COMMUNICATIONS_RELAY",
        casesConnected: ["FIR001", "FIR007"].filter((id) => caseIds.includes(id)),
        influenceScore: 92,
        brokerScore: 88,
        betweennessCentrality: 0.31,
        bridgeReason:
          "Burst encrypted SIM relay connecting extortion dispatch operators with western corridor drivers.",
        riskScore: 92,
      },
    ];

    const newConnections: NewConnection[] = [
      {
        id: "conn-1",
        sourceId: "P017",
        sourceName: "Arjun Verma",
        sourceCase: "FIR001",
        targetId: "P031",
        targetName: "Sanjay 'Driver' Chauhan",
        targetCase: "FIR007",
        type: "LOGISTICS",
        relationship: "DISPATCHES_CONTRABAND",
        importance: "CRITICAL",
        significance: "Direct midnight dispatch instructions revealed between cyber financier and transport driver.",
        hops: 1,
      },
      {
        id: "conn-2",
        sourceId: "P017",
        sourceName: "Arjun Verma",
        sourceCase: "FIR001",
        targetId: "P020",
        targetName: "Rajesh Shrivastav",
        targetCase: "FIR007",
        type: "FINANCIAL",
        relationship: "FUNDS_FLEET",
        importance: "CRITICAL",
        significance: "Cyber extortion inflows transferred directly to clear freight invoices for Scorpio DL-09.",
        hops: 1,
      },
      {
        id: "conn-3",
        sourceId: "ACC018",
        sourceName: "HDFC Commercial ...4829",
        sourceCase: "FIR003",
        targetId: "ACCOUNT_004",
        targetName: "ICICI Commercial ...9012",
        targetCase: "FIR001",
        type: "FINANCIAL",
        relationship: "WIRE_LAYERING",
        importance: "HIGH",
        significance: "Layered RTGS transfer of ₹45,00,000 within 14 minutes of Delhi victim deposit.",
        hops: 1,
      },
      {
        id: "conn-4",
        sourceId: "PHONE_017",
        sourceName: "Burner Relay (IMEI 8642)",
        sourceCase: "FIR001",
        targetId: "PHONE_008",
        targetName: "Encrypted SIM 98220",
        targetCase: "FIR007",
        type: "COMMUNICATION",
        relationship: "BURST_COMMUNICATION",
        importance: "HIGH",
        significance: "Call tower triangulation confirms co-location during transit through Rajasthan corridor.",
        hops: 1,
      },
      {
        id: "conn-5",
        sourceId: "ORG_002",
        sourceName: "Silverline Global Trading",
        sourceCase: "FIR001",
        targetId: "VEH_003",
        targetName: "Mahindra Scorpio DL-09-CQ-1122",
        targetCase: "FIR007",
        type: "ORGANIZATIONAL",
        relationship: "CORPORATE_OWNERSHIP",
        importance: "HIGH",
        significance: "ROC registered shell company holds title and fuel card accounts for contraband vehicle.",
        hops: 1,
      },
      {
        id: "conn-6",
        sourceId: "P001",
        sourceName: "Vikram Malhotra",
        sourceCase: "FIR003",
        targetId: "P017",
        targetName: "Arjun Verma",
        targetCase: "FIR001",
        type: "ASSOCIATE",
        relationship: "DIRECTS_OPERATIONS",
        importance: "CRITICAL",
        significance: "Top-level command relationship connecting Hawala kingpin directly to cyber field commander.",
        hops: 1,
      },
      {
        id: "conn-7",
        sourceId: "LOC_001",
        sourceName: "Nehru Place Hardware Vault",
        sourceCase: "FIR001",
        targetId: "P020",
        targetName: "Rajesh Shrivastav",
        targetCase: "FIR007",
        type: "LOGISTICS",
        relationship: "PHYSICAL_ACCESS",
        importance: "MEDIUM",
        significance: "Biometric and RFID access logs record Ahmedabad operative entering Delhi server repository.",
        hops: 2,
      },
      {
        id: "conn-8",
        sourceId: "ACCOUNT_004",
        sourceName: "ICICI Commercial ...9012",
        sourceCase: "FIR001",
        targetId: "ORG_002",
        targetName: "Silverline Global Trading",
        targetCase: "FIR007",
        type: "FINANCIAL",
        relationship: "COMMERCIAL_DEPOSIT",
        importance: "MEDIUM",
        significance: "Fictitious IT service invoice settled to justify extortion capital absorption.",
        hops: 1,
      },
    ];

    const communityChange: CommunityChange = {
      communitiesBefore: selectedCases.length * 2,
      communitiesAfter: 2,
      mergedCommunitiesCount: Math.max(1, selectedCases.length - 1),
      communityLeaders: [
        {
          id: "P017",
          name: "Arjun Verma",
          cluster: "Cluster Alpha (Cyber-Logistics Hub)",
          influence: 94,
        },
        {
          id: "P001",
          name: "Vikram Malhotra",
          cluster: "Cluster Beta (Hawala Remittance Core)",
          influence: 98,
        },
      ],
      mappings: [
        {
          fromCommunities: ["COMM_A (Delhi Phishing)", "COMM_C (Ahmedabad Transport)"],
          toCommunity: "Cluster Alpha: Cyber-Logistics Hub",
          unifiedClusterName: "Syndicate Operations Wing",
          casesInvolved: ["FIR001", "FIR007"].filter((id) => caseIds.includes(id)),
          memberCount: 21,
          leaderId: "P017",
          leaderName: "Arjun Verma",
          primaryCrimeType: "Cyber Extortion & Clandestine Transport",
        },
        {
          fromCommunities: ["COMM_B (Mumbai Hawala)", "COMM_D (Layering Mules)"],
          toCommunity: "Cluster Beta: Hawala Remittance Core",
          unifiedClusterName: "Financial Laundering Wing",
          casesInvolved: ["FIR003", "FIR010"].filter((id) => caseIds.includes(id)),
          memberCount: 18,
          leaderId: "P001",
          leaderName: "Vikram Malhotra",
          primaryCrimeType: "PMLA Hawala Layering & Armed Escort",
        },
      ],
      consolidationSummary:
        "Topological fusion collapsed isolated departmental silos into two tightly-coupled functional wings: Operational Logistics (led by P017) and Financial Laundering (led by P001).",
    };

    const impactAnalysis: ImpactAnalysisData = {
      newIntelligenceCount: 14,
      hiddenLinksRevealed: 12,
      networkExpansionRate: "+64% Connectivity Gain",
      investigationPriority: isTripartiteCartel ? "CRITICAL" : "HIGH",
      prosecutionStrength: "Joint Conspiracy (IPC 120B / BNSS 193)",
      syndicateThreatLevel: 94,
    };

    const insights: FusionInsight[] = [
      {
        id: "ins-1",
        title: "Single Trans-National Cartel Operating Across 3 States",
        description:
          "Cross-case graph fusion proves that FIR001 (Delhi Cyber), FIR003 (Mumbai Hawala), and FIR007 (Ahmedabad Transport) are not isolated offences, but specialized operational arms of one coordinated syndicate.",
        severity: "CRITICAL",
        category: "ORGANIZATION",
      },
      {
        id: "ins-2",
        title: "Arjun Verma (P017) Emerges as Supreme Inter-State Broker",
        description:
          "In FIR001, P017 appeared merely as a technical operator. Upon fusion, P017 exhibits a betweenness centrality score of 0.43, directly routing money from cyber victims into clandestine transport vehicle fleet maintenance.",
        severity: "CRITICAL",
        category: "BRIDGE",
      },
      {
        id: "ins-3",
        title: "Shared High-Volume Mule Account ACC018 Identified",
        description:
          "Account ACC018 acts as an unmonitored financial clearinghouse receiving victim wire funds and disbursing fuel, driver stipends, and Hawala settlement notes across Gujarat and Mumbai within minutes.",
        severity: "HIGH",
        category: "FINANCIAL",
      },
      {
        id: "ins-4",
        title: "Shell Company Silverline Global (ORG_002) Serves as Unified Front",
        description:
          "Corporate filings reveal that ORG_002 is utilized simultaneously across Delhi and Ahmedabad to provide legitimate commercial cover for cash couriers and toll expenses.",
        severity: "HIGH",
        category: "INFRASTRUCTURE",
      },
    ];

    const recommendation: FusionRecommendation = {
      decision: "Merge Recommended",
      confidence: 94,
      justification:
        "The mathematical overlap index (91/100) and emergent bridge topology conclusively prove unity of purpose, common intention, and continuous operational interdependence under Indian legal standards.",
      regulatoryClause:
        "Bharatiya Nagarik Suraksha Sanhita (BNSS) Section 193(3) / CrPC Section 223 — Joint Trial and Unified Investigation of Connected Conspiracy Offenses.",
      suggestedFusionCaseId: "FC_001_NORTH_WEST_CARTEL",
      prosecutionPriority: "IMMEDIATE_ACTION",
      leadJurisdiction: "Central Special Task Force (Joint Delhi-Mumbai-Ahmedabad)",
    };

    // Cytoscape Elements Before Fusion (Separate Islands)
    const graphElementsBefore = this.generateBeforeGraphElements(selectedCases);

    // Cytoscape Elements After Fusion (Unified Network with Highlighted Bridge Links)
    const graphElementsAfter = this.generateAfterGraphElements(selectedCases);

    return {
      fusionId: `FUS-${Date.now().toString().slice(-6)}`,
      selectedCases,
      score,
      metrics,
      newConnections,
      bridgeEntities,
      communityChange,
      impactAnalysis,
      insights,
      recommendation,
      graphElementsBefore,
      graphElementsAfter,
    };
  }

  private generateBeforeGraphElements(cases: FusedCaseProfile[]): any[] {
    const elements: any[] = [];
    const colors = ["#1E40AF", "#0E7490", "#6D28D9", "#B45309", "#047857", "#BE123C"];

    cases.forEach((c, idx) => {
      const centerX = 160 + (idx % 3) * 260;
      const centerY = 130 + Math.floor(idx / 3) * 220;
      const color = colors[idx % colors.length];

      // Central Case Root Node
      elements.push({
        data: {
          id: `case-${c.id}`,
          label: `${c.id}\n${c.name.slice(0, 16)}...`,
          type: "FIR_CASE",
          color: color,
          size: 60,
          shape: "hexagon",
          isCase: true,
          caseId: c.id,
        },
        position: { x: centerX, y: centerY },
      });

      // Satellite Nodes per Case (isolated island)
      const satellites = [
        { id: `p-${c.id}-1`, label: `P_${c.id}_Alpha`, type: "PERSON", size: 36, offset: { x: -60, y: -50 } },
        { id: `p-${c.id}-2`, label: `P_${c.id}_Beta`, type: "PERSON", size: 34, offset: { x: 65, y: -45 } },
        { id: `res-${c.id}-1`, label: `RES_${c.id}`, type: "PHONE", size: 30, offset: { x: -50, y: 55 } },
        { id: `acc-${c.id}-1`, label: `ACC_${c.id}`, type: "ACCOUNT", size: 30, offset: { x: 55, y: 55 } },
      ];

      satellites.forEach((sat) => {
        elements.push({
          data: {
            id: sat.id,
            label: sat.label,
            type: sat.type,
            color: color,
            size: sat.size,
            caseId: c.id,
          },
          position: { x: centerX + sat.offset.x, y: centerY + sat.offset.y },
        });

        // Edge connecting satellite to Case Root
        elements.push({
          data: {
            id: `edge-${sat.id}-case`,
            source: sat.id,
            target: `case-${c.id}`,
            label: "RECORDED_IN",
            width: 1.5,
          },
        });
      });

      // Inter-satellite intra-case edge
      elements.push({
        data: {
          id: `edge-${satellites[0].id}-${satellites[1].id}`,
          source: satellites[0].id,
          target: satellites[1].id,
          label: "ASSOCIATED",
          width: 1.5,
        },
      });
    });

    return elements;
  }

  private generateAfterGraphElements(cases: FusedCaseProfile[]): any[] {
    const elements: any[] = [];

    // Case roots placed around periphery
    const positions = [
      { x: 120, y: 160 },
      { x: 120, y: 380 },
      { x: 680, y: 160 },
      { x: 680, y: 380 },
    ];

    cases.forEach((c, idx) => {
      const pos = positions[idx % positions.length];
      elements.push({
        data: {
          id: `fused-case-${c.id}`,
          label: `${c.id}\n${c.name.slice(0, 16)}...`,
          type: "FIR_CASE",
          color: "#3B82F6",
          size: 55,
          shape: "hexagon",
          isCase: true,
        },
        position: pos,
      });
    });

    // Central Emergent Bridge Nodes
    const bridges = [
      {
        id: "fused-node-P017",
        label: "P017\nArjun Verma\n[EMERGENT BROKER]",
        color: "#F59E0B",
        size: 58,
        isBridge: true,
        pos: { x: 400, y: 170 },
      },
      {
        id: "fused-node-P020",
        label: "P020\nRajesh Shrivastav\n[DISBURSER]",
        color: "#F59E0B",
        size: 50,
        isBridge: true,
        pos: { x: 300, y: 300 },
      },
      {
        id: "fused-node-ACC018",
        label: "ACC018\nMule Aggregator",
        color: "#10B981",
        size: 48,
        isBridge: false,
        pos: { x: 500, y: 300 },
      },
      {
        id: "fused-node-PHONE_017",
        label: "PHONE_017\nRelay IMEI 8642",
        color: "#06B6D4",
        size: 46,
        isBridge: false,
        pos: { x: 400, y: 400 },
      },
      {
        id: "fused-node-ORG_002",
        label: "ORG_002\nSilverline Global",
        color: "#8B5CF6",
        size: 48,
        isBridge: false,
        pos: { x: 400, y: 80 },
      },
    ];

    bridges.forEach((b) => {
      elements.push({
        data: {
          id: b.id,
          label: b.label,
          type: "BRIDGE_NODE",
          color: b.color,
          size: b.size,
          isBridge: b.isBridge,
        },
        position: b.pos,
      });
    });

    // Outer Operative Nodes
    const operatives = [
      { id: "fused-node-P001", label: "P001\nVikram Malhotra\n[KINGPIN]", pos: { x: 220, y: 100 }, color: "#EF4444" },
      { id: "fused-node-P031", label: "P031\nSanjay Driver", pos: { x: 580, y: 100 }, color: "#94A3B8" },
      { id: "fused-node-VEH_003", label: "VEH_003\nScorpio DL-09", pos: { x: 580, y: 400 }, color: "#A855F7" },
      { id: "fused-node-LOC_001", label: "LOC_001\nDelhi Vault", pos: { x: 220, y: 400 }, color: "#64748B" },
    ];

    operatives.forEach((op) => {
      elements.push({
        data: {
          id: op.id,
          label: op.label,
          type: "OPERATIVE",
          color: op.color,
          size: 40,
        },
        position: op.pos,
      });
    });

    // High-Value Emergent Edges (Highlighted with dashed glowing styling)
    const newEdges = [
      { source: "fused-node-P001", target: "fused-node-P017", label: "DIRECTS", isNew: true },
      { source: "fused-node-P017", target: "fused-node-P031", label: "DISPATCHES", isNew: true },
      { source: "fused-node-P017", target: "fused-node-P020", label: "FUNDS_FLEET", isNew: true },
      { source: "fused-node-P020", target: "fused-node-ACC018", label: "DISBURSES", isNew: true },
      { source: "fused-node-ACC018", target: "fused-node-PHONE_017", label: "VERIFIED_BY", isNew: true },
      { source: "fused-node-P017", target: "fused-node-ORG_002", label: "CONTROLS", isNew: true },
      { source: "fused-node-ORG_002", target: "fused-node-VEH_003", label: "OWNS_ASSET", isNew: true },
      { source: "fused-node-P031", target: "fused-node-VEH_003", label: "OPERATES", isNew: true },
      { source: "fused-node-LOC_001", target: "fused-node-P017", label: "STORAGE_BASE", isNew: true },
    ];

    newEdges.forEach((ne, i) => {
      elements.push({
        data: {
          id: `new-edge-${i}`,
          source: ne.source,
          target: ne.target,
          label: ne.label,
          isNew: true,
          width: 2.8,
        },
      });
    });

    // Case provenance edges connecting cases to their constituent nodes
    cases.forEach((c) => {
      elements.push({
        data: {
          id: `case-edge-${c.id}-p017`,
          source: `fused-case-${c.id}`,
          target: "fused-node-P017",
          label: "SYNTHESIZED",
          width: 1.5,
          opacity: 0.4,
        },
      });
    });

    return elements;
  }

  public async exportFusion(format: "json" | "pdf", result: FusionResult): Promise<{ success: boolean; filename: string }> {
    await new Promise((r) => setTimeout(r, 200));
    const extension = format === "json" ? "json" : "pdf";
    const filename = `NEXUS_FUSION_${result.fusionId}_${new Date().toISOString().slice(0, 10)}.${extension}`;
    return { success: true, filename };
  }
}
