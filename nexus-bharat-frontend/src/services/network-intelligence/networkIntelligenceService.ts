import {
  BrokerEntity,
  CommunityLeader,
  RiskEntity,
  RoleDistribution,
  NetworkInsight,
  RankedEntity,
  NetworkHealth,
} from "@/types";

export class NetworkIntelligenceService {
  private static instance: NetworkIntelligenceService;

  private constructor() {}

  public static getInstance(): NetworkIntelligenceService {
    if (!NetworkIntelligenceService.instance) {
      NetworkIntelligenceService.instance = new NetworkIntelligenceService();
    }
    return NetworkIntelligenceService.instance;
  }

  public async getNetworkKPIs(): Promise<Record<string, number>> {
    await new Promise((r) => setTimeout(r, 40));
    return {
      totalBrokers: 3,
      totalHubs: 5,
      totalInfluencers: 8,
      highRiskEntities: 12,
      communitiesCount: 7,
      sharedResources: 15,
    };
  }

  public async getTopBrokers(): Promise<BrokerEntity[]> {
    await new Promise((r) => setTimeout(r, 50));
    return [
      {
        rank: 1,
        id: "P017",
        name: "Arjun Verma",
        type: "PERSON",
        brokerScore: 94,
        communitiesConnected: 3,
        betweenness: 0.43,
        bridgeCases: ["FIR001", "FIR003", "FIR007"],
        description: "Primary bottleneck bridging northern extortion cell with western Hawala funnels.",
        riskScore: 94,
      },
      {
        rank: 2,
        id: "P020",
        name: "Rajesh Shrivastav",
        type: "PERSON",
        brokerScore: 89,
        communitiesConnected: 2,
        betweenness: 0.35,
        bridgeCases: ["FIR003", "FIR007"],
        description: "Coordinates inter-state contraband movement through Gujarat-Maharashtra corridor.",
        riskScore: 89,
      },
      {
        rank: 3,
        id: "ACC018",
        name: "HDFC ...4829",
        type: "ACCOUNT",
        brokerScore: 86,
        communitiesConnected: 2,
        betweenness: 0.31,
        bridgeCases: ["FIR001", "FIR003"],
        description: "Mule aggregator account laundering cyber proceeds into commercial bullion.",
        riskScore: 88,
      },
      {
        rank: 4,
        id: "P002",
        name: "Devendra Joshi",
        type: "PERSON",
        brokerScore: 83,
        communitiesConnected: 2,
        betweenness: 0.28,
        bridgeCases: ["FIR001"],
        description: "Field coordinator liaising with corrupt freight forwarders at IGI Airport.",
        riskScore: 83,
      },
      {
        rank: 5,
        id: "PHONE_012",
        name: "+91 98100 12345",
        type: "PHONE",
        brokerScore: 81,
        communitiesConnected: 2,
        betweenness: 0.26,
        bridgeCases: ["FIR001", "FIR003"],
        description: "Shared satellite phone relay utilized by command layer before coordinated operations.",
        riskScore: 92,
      },
      {
        rank: 6,
        id: "ORG_002",
        name: "Silverline Global Trading",
        type: "ORGANIZATION",
        brokerScore: 78,
        communitiesConnected: 2,
        betweenness: 0.23,
        bridgeCases: ["FIR003", "FIR010"],
        description: "Corporate vehicle used for bogus billing and inter-firm logistics financing.",
        riskScore: 90,
      },
      {
        rank: 7,
        id: "P031",
        name: "Karan Singhania",
        type: "PERSON",
        brokerScore: 74,
        communitiesConnected: 2,
        betweenness: 0.21,
        bridgeCases: ["FIR003", "FIR010"],
        description: "NCR transport intermediary organizing covert warehousing facilities.",
        riskScore: 85,
      },
      {
        rank: 8,
        id: "VEH_003",
        name: "Scorpio DL-09-CQ-1122",
        type: "VEHICLE",
        brokerScore: 71,
        communitiesConnected: 2,
        betweenness: 0.18,
        bridgeCases: ["FIR003"],
        description: "Armored transport vehicle crossing toll checkpoints across 3 border jurisdictions.",
        riskScore: 82,
      },
    ];
  }

  public async getCommunityLeaders(): Promise<CommunityLeader[]> {
    await new Promise((r) => setTimeout(r, 40));
    return [
      {
        communityId: "COMM_A",
        communityName: "Cyber Extortion Cell",
        leaderId: "P017",
        leaderName: "Arjun Verma",
        leaderRole: "BROKER",
        influenceScore: 94,
        memberCount: 9,
        jurisdiction: "Delhi Special Cell",
        color: "#F59E0B",
      },
      {
        communityId: "COMM_B",
        communityName: "Command & Financing Core",
        leaderId: "P001",
        leaderName: "Vikram Malhotra",
        leaderRole: "HUB",
        influenceScore: 98,
        memberCount: 14,
        jurisdiction: "Central Warrant / NIA",
        color: "#3B82F6",
      },
      {
        communityId: "COMM_C",
        communityName: "Western Logistics & Fleet",
        leaderId: "P020",
        leaderName: "Rajesh Shrivastav",
        leaderRole: "BROKER",
        influenceScore: 89,
        memberCount: 8,
        jurisdiction: "Mumbai Crime Branch",
        color: "#10B981",
      },
      {
        communityId: "COMM_D",
        communityName: "Transit & Supply Facilitation",
        leaderId: "P031",
        leaderName: "Karan Singhania",
        leaderRole: "RESOURCE_CONTROLLER",
        influenceScore: 85,
        memberCount: 6,
        jurisdiction: "Gujarat State Police",
        color: "#8B5CF6",
      },
    ];
  }

  public async getRiskEntities(): Promise<RiskEntity[]> {
    await new Promise((r) => setTimeout(r, 40));
    return [
      {
        id: "P001",
        name: "Vikram Malhotra",
        type: "PERSON",
        role: "HUB",
        riskScore: 98,
        riskLevel: "CRITICAL",
        casesCount: 4,
        connectionsCount: 14,
        primaryThreat: "Mastermind syndicate director; weapons & Hawala command.",
      },
      {
        id: "P017",
        name: "Arjun Verma",
        type: "PERSON",
        role: "BROKER",
        riskScore: 94,
        riskLevel: "CRITICAL",
        casesCount: 4,
        connectionsCount: 18,
        primaryThreat: "Cross-community bottleneck; controls financial conduit networks.",
      },
      {
        id: "PHONE_017",
        name: "+91 98220 54321",
        type: "PHONE",
        role: "RESOURCE_CONTROLLER",
        riskScore: 92,
        riskLevel: "CRITICAL",
        casesCount: 4,
        connectionsCount: 9,
        primaryThreat: "Burner device linked to encrypted command communications.",
      },
      {
        id: "ORG_002",
        name: "Silverline Global Trading",
        type: "ORGANIZATION",
        role: "FINANCIAL_CONDUIT",
        riskScore: 90,
        riskLevel: "CRITICAL",
        casesCount: 2,
        connectionsCount: 8,
        primaryThreat: "Shell corporation laundering illicit contraband proceeds.",
      },
      {
        id: "P020",
        name: "Rajesh Shrivastav",
        type: "PERSON",
        role: "BROKER",
        riskScore: 89,
        riskLevel: "HIGH",
        casesCount: 3,
        connectionsCount: 11,
        primaryThreat: "West zone distribution controller; customs evasion coordinator.",
      },
      {
        id: "ACCOUNT_004",
        name: "ICICI ...9012",
        type: "ACCOUNT",
        role: "FINANCIAL_CONDUIT",
        riskScore: 89,
        riskLevel: "HIGH",
        casesCount: 2,
        connectionsCount: 6,
        primaryThreat: "Hawala cash deposit ledger for batch transaction settlements.",
      },
      {
        id: "P031",
        name: "Karan Singhania",
        type: "PERSON",
        role: "RESOURCE_CONTROLLER",
        riskScore: 85,
        riskLevel: "HIGH",
        casesCount: 2,
        connectionsCount: 7,
        primaryThreat: "Fleet controller providing false registration transports.",
      },
      {
        id: "P002",
        name: "Devendra Joshi",
        type: "PERSON",
        role: "COORDINATOR",
        riskScore: 83,
        riskLevel: "HIGH",
        casesCount: 2,
        connectionsCount: 8,
        primaryThreat: "Field coordinator managing courier handoffs.",
      },
      {
        id: "P021",
        name: "Rohan Mehta",
        type: "PERSON",
        role: "CONNECTOR",
        riskScore: 68,
        riskLevel: "MEDIUM",
        casesCount: 1,
        connectionsCount: 5,
        primaryThreat: "Technical cell technician managing burner spoofing.",
      },
      {
        id: "VEH_003",
        name: "Scorpio DL-09-CQ-1122",
        type: "VEHICLE",
        role: "RESOURCE_CONTROLLER",
        riskScore: 64,
        riskLevel: "MEDIUM",
        casesCount: 1,
        connectionsCount: 4,
        primaryThreat: "Concealed compartment transport vehicle.",
      },
    ];
  }

  public async getRoleDistribution(): Promise<RoleDistribution[]> {
    await new Promise((r) => setTimeout(r, 30));
    return [
      { role: "CONNECTOR", label: "Connectors", count: 12, percentage: 35, color: "#06B6D4" },
      { role: "INFLUENCER", label: "Influencers", count: 8, percentage: 24, color: "#8B5CF6" },
      { role: "RESOURCE_CONTROLLER", label: "Resource Controllers", count: 6, percentage: 18, color: "#10B981" },
      { role: "HUB", label: "Hubs", count: 5, percentage: 15, color: "#3B82F6" },
      { role: "BROKER", label: "Brokers", count: 3, percentage: 8, color: "#F59E0B" },
    ];
  }

  public async getInvestigationInsights(): Promise<NetworkInsight[]> {
    await new Promise((r) => setTimeout(r, 40));
    return [
      {
        id: "ins-1",
        title: "P017 Bridges Three Independent Communities",
        description:
          "Target P017 possesses the highest betweenness centrality (0.43) across the fused graph. Neutralization will isolate Community A from Western financing.",
        type: "BROKER",
        priority: "CRITICAL",
        timestamp: "2026-08-31 11:30",
      },
      {
        id: "ins-2",
        title: "P021 Exhibiting Rapidly Increasing Influence",
        description:
          "Telephony CDR link growth indicates P021 added 4 new technical connections within the last 14 days, transitioning from technical support to sub-hub.",
        type: "INFLUENCE",
        priority: "HIGH",
        timestamp: "2026-08-30 18:15",
      },
      {
        id: "ins-3",
        title: "Shared Resource Cluster Detected",
        description:
          "Burner PHONE_012 and account ACC018 co-utilized by both P001 and P017 confirm coordination between Delhi and Mumbai syndicate factions.",
        type: "RESOURCE",
        priority: "HIGH",
        timestamp: "2026-08-29 14:00",
      },
      {
        id: "ins-4",
        title: "Broker Concentration Unusually High",
        description:
          "Top 2 brokers control 64% of inter-community information flow. Intercepting these nodes provides maximum investigative leverage.",
        type: "COMMUNITY",
        priority: "MEDIUM",
        timestamp: "2026-08-28 09:45",
      },
    ];
  }

  public async getRankedEntities(): Promise<RankedEntity[]> {
    await new Promise((r) => setTimeout(r, 60));
    return [
      {
        rank: 1,
        id: "P001",
        name: "Vikram Malhotra",
        type: "PERSON",
        role: "HUB",
        influenceScore: 98,
        brokerScore: 72,
        riskScore: 98,
        cases: ["FIR001", "FIR003", "FIR007"],
        connections: 14,
        jurisdiction: "Central NIA / Delhi",
        metrics: { degree: 14, betweenness: 0.28, pagerank: 0.115, eigenvector: 0.94, clusteringCoeff: 0.12, reachScore: 98 },
      },
      {
        rank: 2,
        id: "P017",
        name: "Arjun Verma",
        type: "PERSON",
        role: "BROKER",
        influenceScore: 94,
        brokerScore: 94,
        riskScore: 94,
        cases: ["FIR001", "FIR003", "FIR007", "FIR010"],
        connections: 18,
        jurisdiction: "Delhi Special Cell / Mumbai ED",
        metrics: { degree: 11, betweenness: 0.43, pagerank: 0.088, eigenvector: 0.88, clusteringCoeff: 0.18, reachScore: 94 },
      },
      {
        rank: 3,
        id: "P020",
        name: "Rajesh Shrivastav",
        type: "PERSON",
        role: "BROKER",
        influenceScore: 89,
        brokerScore: 89,
        riskScore: 89,
        cases: ["FIR003", "FIR007"],
        connections: 11,
        jurisdiction: "Mumbai Crime Branch",
        metrics: { degree: 9, betweenness: 0.35, pagerank: 0.065, eigenvector: 0.78, clusteringCoeff: 0.21, reachScore: 89 },
      },
      {
        rank: 4,
        id: "ORG_002",
        name: "Silverline Global Trading",
        type: "ORGANIZATION",
        role: "RESOURCE_CONTROLLER",
        influenceScore: 87,
        brokerScore: 78,
        riskScore: 90,
        cases: ["FIR003", "FIR010"],
        connections: 8,
        jurisdiction: "Mumbai ROC / ED",
        metrics: { degree: 8, betweenness: 0.23, pagerank: 0.058, eigenvector: 0.72, clusteringCoeff: 0.34, reachScore: 87 },
      },
      {
        rank: 5,
        id: "P031",
        name: "Karan Singhania",
        type: "PERSON",
        role: "RESOURCE_CONTROLLER",
        influenceScore: 85,
        brokerScore: 74,
        riskScore: 85,
        cases: ["FIR003", "FIR010"],
        connections: 7,
        jurisdiction: "Gujarat Police",
        metrics: { degree: 7, betweenness: 0.21, pagerank: 0.052, eigenvector: 0.69, clusteringCoeff: 0.28, reachScore: 85 },
      },
      {
        rank: 6,
        id: "P002",
        name: "Devendra Joshi",
        type: "PERSON",
        role: "COORDINATOR",
        influenceScore: 83,
        brokerScore: 83,
        riskScore: 83,
        cases: ["FIR001"],
        connections: 8,
        jurisdiction: "Delhi Airport P.S.",
        metrics: { degree: 8, betweenness: 0.28, pagerank: 0.048, eigenvector: 0.65, clusteringCoeff: 0.24, reachScore: 83 },
      },
      {
        rank: 7,
        id: "PHONE_017",
        name: "+91 98220 54321",
        type: "PHONE",
        role: "CONNECTOR",
        influenceScore: 82,
        brokerScore: 68,
        riskScore: 92,
        cases: ["FIR001", "FIR003"],
        connections: 9,
        jurisdiction: "Telecom Circle West",
        metrics: { degree: 9, betweenness: 0.19, pagerank: 0.062, eigenvector: 0.68, clusteringCoeff: 0.15, reachScore: 82 },
      },
      {
        rank: 8,
        id: "ACCOUNT_004",
        name: "ICICI ...9012",
        type: "ACCOUNT",
        role: "FINANCIAL_CONDUIT",
        influenceScore: 79,
        brokerScore: 71,
        riskScore: 89,
        cases: ["FIR003", "FIR007"],
        connections: 6,
        jurisdiction: "Banking Intelligence",
        metrics: { degree: 6, betweenness: 0.24, pagerank: 0.045, eigenvector: 0.58, clusteringCoeff: 0.31, reachScore: 79 },
      },
      {
        rank: 9,
        id: "P021",
        name: "Rohan Mehta",
        type: "PERSON",
        role: "CONNECTOR",
        influenceScore: 74,
        brokerScore: 62,
        riskScore: 68,
        cases: ["FIR001"],
        connections: 6,
        jurisdiction: "Cyber Cell NCR",
        metrics: { degree: 6, betweenness: 0.15, pagerank: 0.038, eigenvector: 0.52, clusteringCoeff: 0.35, reachScore: 74 },
      },
      {
        rank: 10,
        id: "VEH_003",
        name: "Scorpio DL-09-CQ-1122",
        type: "VEHICLE",
        role: "RESOURCE_CONTROLLER",
        influenceScore: 69,
        brokerScore: 54,
        riskScore: 64,
        cases: ["FIR003"],
        connections: 4,
        jurisdiction: "RTO Delhi South",
        metrics: { degree: 4, betweenness: 0.12, pagerank: 0.029, eigenvector: 0.44, clusteringCoeff: 0.40, reachScore: 69 },
      },
      {
        rank: 11,
        id: "LOC_001",
        name: "Chandni Chowk Hawala Safehouse",
        type: "LOCATION",
        role: "CONNECTOR",
        influenceScore: 65,
        brokerScore: 48,
        riskScore: 55,
        cases: ["FIR001"],
        connections: 5,
        jurisdiction: "North Delhi Police",
        metrics: { degree: 5, betweenness: 0.11, pagerank: 0.031, eigenvector: 0.41, clusteringCoeff: 0.45, reachScore: 65 },
      },
      {
        rank: 12,
        id: "ACC018",
        name: "HDFC ...4829",
        type: "ACCOUNT",
        role: "FINANCIAL_CONDUIT",
        influenceScore: 62,
        brokerScore: 52,
        riskScore: 58,
        cases: ["FIR001", "FIR003"],
        connections: 5,
        jurisdiction: "Banking Intelligence",
        metrics: { degree: 5, betweenness: 0.14, pagerank: 0.033, eigenvector: 0.39, clusteringCoeff: 0.38, reachScore: 62 },
      },
    ];
  }

  public async getNetworkHealth(): Promise<NetworkHealth> {
    await new Promise((r) => setTimeout(r, 30));
    return {
      averageDegree: 4.8,
      networkDensity: 0.24,
      communityCount: 7,
      brokerConcentration: 14.2,
      totalEntities: 34,
      totalRelationships: 58,
    };
  }
}

export const networkIntelligenceService = NetworkIntelligenceService.getInstance();

export const getNetworkKPIs = () => networkIntelligenceService.getNetworkKPIs();
export const getTopBrokers = () => networkIntelligenceService.getTopBrokers();
export const getCommunityLeaders = () => networkIntelligenceService.getCommunityLeaders();
export const getRiskEntities = () => networkIntelligenceService.getRiskEntities();
export const getRoleDistribution = () => networkIntelligenceService.getRoleDistribution();
export const getInvestigationInsights = () => networkIntelligenceService.getInvestigationInsights();
export const getRankedEntities = () => networkIntelligenceService.getRankedEntities();
export const getNetworkHealth = () => networkIntelligenceService.getNetworkHealth();
