import {
  EntityProfile,
  EntityRelationship,
  EntityCase,
  EntityTimelineEvent,
  RelatedEntity,
} from "@/types/entity";

export class EntityService {
  private static instance: EntityService;

  private constructor() {}

  public static getInstance(): EntityService {
    if (!EntityService.instance) {
      EntityService.instance = new EntityService();
    }
    return EntityService.instance;
  }

  /**
   * Fetch core entity profile
   */
  public async getEntity(id: string): Promise<EntityProfile | null> {
    await new Promise((resolve) => setTimeout(resolve, 80));

    if (id.toUpperCase() === "P017") {
      return {
        id: "P017",
        name: "Arjun Verma",
        type: "PERSON",
        status: "ACTIVE",
        riskScore: 94,
        role: "BROKER",
        influenceScore: 94,
        communityReach: 3,
        roleReasons: [
          "Connects 3 separate criminal communities (C1, C3, C5)",
          "Appears across 4 independent FIR investigations",
          "High betweenness centrality (0.43) — central bottleneck for Hawala settlements",
          "Rotates 2 verified burner hardware devices with syndicate commanders",
        ],
        connectionsCount: 18,
        casesCount: 4,
        communitiesCount: 3,
        firstSeen: "2026-07-15 08:30 UTC",
        lastSeen: "2026-08-31 11:45 UTC",
        alias: ["Agent Shadow", "A.V. Shroff", "Deshmukh"],
        jurisdiction: "Delhi Special Cell / Mumbai ED / Gujarat Crime Branch",
        phoneNumbers: ["+91 98220 54321 (PHONE_017)", "+91 98100 99882"],
        bankAccounts: ["HDFC Bank (...4829)", "ICICI Bank (...9012)"],
        metrics: {
          degree: 11,
          betweenness: 0.43,
          eigenvector: 0.88,
          closeness: 0.72,
          clusteringCoeff: 0.18,
        },
        notesSummary:
          "Key suspect bridging northern cyber phishing rings with western Hawala money laundering funnels. Critical target for communications interception.",
        attributes: {
          passportNo: "Z9810241 (Impounded)",
          residence: "Vasant Kunj, New Delhi",
          associatedBusiness: "Silverline Global Trading LLP",
        },
      };
    }

    if (id.toUpperCase() === "P001") {
      return {
        id: "P001",
        name: "Vikram Malhotra",
        type: "PERSON",
        status: "ACTIVE",
        riskScore: 98,
        role: "HUB",
        influenceScore: 98,
        communityReach: 4,
        roleReasons: [
          "Dominant network degree centrality (14 direct incident edges)",
          "Issues direct commands to lieutenants and field coordinators",
          "Financially seeds primary mule aggregator funnels",
        ],
        connectionsCount: 22,
        casesCount: 2,
        communitiesCount: 2,
        firstSeen: "2026-06-01 10:00 UTC",
        lastSeen: "2026-08-31 11:45 UTC",
        alias: ["The Architect", "V.M."],
        jurisdiction: "Special Cell, New Delhi",
        phoneNumbers: ["+91 98100 12345 (PHONE_012)"],
        bankAccounts: ["HDFC Bank (...4829)"],
        metrics: {
          degree: 14,
          betweenness: 0.28,
          eigenvector: 0.95,
          closeness: 0.81,
          clusteringCoeff: 0.22,
        },
        notesSummary:
          "Syndicate kingpin masterminding multi-crore national cyber extortion infrastructure.",
        attributes: {
          passportNo: "K4410928",
          residence: "Greater Kailash, New Delhi",
        },
      };
    }

    if (id.toUpperCase() === "P020") {
      return {
        id: "P020",
        name: "Rajesh Shrivastav",
        type: "PERSON",
        status: "WATCHLIST",
        riskScore: 89,
        role: "BROKER",
        influenceScore: 89,
        communityReach: 2,
        roleReasons: [
          "Surged betweenness (+262%) during August timeline window",
          "Coordinates contraband transport and cross-border delivery cells",
          "Director in shell entity Silverline Global Trading LLP",
        ],
        connectionsCount: 15,
        casesCount: 3,
        communitiesCount: 2,
        firstSeen: "2026-08-05 14:15 UTC",
        lastSeen: "2026-08-31 09:15 UTC",
        alias: ["Munimji", "Shrivastav Cargo"],
        jurisdiction: "Crime Branch, Ahmedabad / Mumbai Police",
        phoneNumbers: ["+91 98330 99881"],
        bankAccounts: ["ICICI Bank (...9012)"],
        metrics: {
          degree: 9,
          betweenness: 0.35,
          eigenvector: 0.74,
          closeness: 0.65,
          clusteringCoeff: 0.24,
        },
        notesSummary:
          "Logistics broker managing transport assets and corporate shell registrations.",
        attributes: {
          residence: "Satellite, Ahmedabad",
        },
      };
    }

    // Dynamic fallback for any other ID
    return {
      id: id.toUpperCase(),
      name: `Entity ${id.toUpperCase()}`,
      type: id.startsWith("PH") ? "PHONE" : id.startsWith("ACC") ? "ACCOUNT" : "PERSON",
      status: "ACTIVE",
      riskScore: 78,
      role: "CONNECTOR",
      influenceScore: 78,
      communityReach: 2,
      roleReasons: [
        "Associated with multi-jurisdiction criminal syndicate telemetry",
        "Active node in monitored FIR investigations",
      ],
      connectionsCount: 8,
      casesCount: 2,
      communitiesCount: 1,
      firstSeen: "2026-08-10 09:00 UTC",
      lastSeen: "2026-08-31 10:00 UTC",
      alias: [],
      jurisdiction: "Joint Investigation Cell",
      metrics: {
        degree: 6,
        betweenness: 0.18,
        eigenvector: 0.62,
        closeness: 0.58,
        clusteringCoeff: 0.31,
      },
      attributes: {},
    };
  }

  /**
   * Fetch entity relationships
   */
  public async getEntityRelationships(id: string): Promise<EntityRelationship[]> {
    await new Promise((resolve) => setTimeout(resolve, 90));

    return [
      {
        id: "rel-01",
        targetId: "P001",
        targetName: "Vikram Malhotra",
        targetType: "PERSON",
        relationshipType: "CONTACTED",
        direction: "incoming",
        date: "2026-08-31 11:45 UTC",
        confidence: 0.98,
        weight: 37,
        details: "37 calls exchanged over burner lines during pre-settlement phase",
        caseId: "FIR001",
      },
      {
        id: "rel-02",
        targetId: "P020",
        targetName: "Rajesh Shrivastav",
        targetType: "PERSON",
        relationshipType: "COORDINATES_WITH",
        direction: "outgoing",
        date: "2026-08-30 14:20 UTC",
        confidence: 0.94,
        details: "Cross-border logistics dispatch authorization",
        caseId: "FIR003",
      },
      {
        id: "rel-03",
        targetId: "PHONE_017",
        targetName: "+91 98220 54321",
        targetType: "PHONE",
        relationshipType: "USES",
        direction: "outgoing",
        date: "2026-08-31 12:00 UTC",
        confidence: 0.96,
        details: "Primary burner IMEI 359940182910441 registered in Pune",
        caseId: "FIR001",
      },
      {
        id: "rel-04",
        targetId: "ORG_002",
        targetName: "Silverline Global Trading LLP",
        targetType: "ORGANIZATION",
        relationshipType: "OWNS",
        direction: "outgoing",
        date: "2026-07-20 00:00 UTC",
        confidence: 0.99,
        details: "90% partnership shareholding in shell corporate ledger",
        caseId: "FIR003",
      },
      {
        id: "rel-05",
        targetId: "ACCOUNT_018",
        targetName: "ICICI - ...9012",
        targetType: "ACCOUNT",
        relationshipType: "TRANSFERRED_TO",
        direction: "outgoing",
        date: "2026-08-28 16:15 UTC",
        confidence: 0.95,
        weight: 1450000,
        details: "Wire transfer INR 14.5 Lakhs Hawala clearing remittance",
        caseId: "FIR003",
      },
      {
        id: "rel-06",
        targetId: "LOCATION_003",
        targetName: "Karol Bagh Safehouse",
        targetType: "LOCATION",
        relationshipType: "VISITED",
        direction: "outgoing",
        date: "2026-08-25 21:30 UTC",
        confidence: 0.89,
        details: "Tower CDR lock confirmed physical presence during coordination meet",
        caseId: "FIR001",
      },
    ];
  }

  /**
   * Fetch linked FIR cases
   */
  public async getEntityCases(id: string): Promise<EntityCase[]> {
    await new Promise((resolve) => setTimeout(resolve, 70));

    return [
      {
        id: "FIR001",
        name: "Cyber Syndicate Phishing Operation",
        status: "ACTIVE",
        priority: "CRITICAL",
        station: "Special Cell, New Delhi",
        filedDate: "2026-08-01",
        entityRoleInCase: "Hawala Intermediary & Communication Relay",
        evidenceCount: 14,
      },
      {
        id: "FIR003",
        name: "Hawala Remittance & Wire Layering",
        status: "INVESTIGATION",
        priority: "CRITICAL",
        station: "Enforcement Directorate, Mumbai",
        filedDate: "2026-08-12",
        entityRoleInCase: "Corporate Shell Owner (Silverline Global)",
        evidenceCount: 19,
      },
      {
        id: "FIR007",
        name: "Contraband Logistics & Bulk Mules",
        status: "ACTIVE",
        priority: "HIGH",
        station: "Crime Branch, Ahmedabad",
        filedDate: "2026-08-18",
        entityRoleInCase: "Gujarat Cell Financing Coordinator",
        evidenceCount: 12,
      },
      {
        id: "FIR010",
        name: "Post-Reconfiguration Syndicate Cell",
        status: "FUSED",
        priority: "HIGH",
        station: "Cyber Crime PS, Noida",
        filedDate: "2026-08-29",
        entityRoleInCase: "Emergent Bridge Intermediary",
        evidenceCount: 8,
      },
    ];
  }

  /**
   * Fetch chronological timeline events
   */
  public async getEntityTimeline(id: string): Promise<EntityTimelineEvent[]> {
    await new Promise((resolve) => setTimeout(resolve, 80));

    return [
      {
        id: "evt-01",
        title: "CONTACTED P021 (Rohan Verma)",
        type: "COMMUNICATION",
        date: "2026-08-31 11:45 UTC",
        relativeTime: "12 mins ago",
        description: "Exchanged 4 encrypted burner calls over cell tower DL-SOUTH-12.",
        target: "P021 (Courier Lieutenant)",
        caseId: "FIR001",
        severity: "CRITICAL",
      },
      {
        id: "evt-02",
        title: "TRANSFERRED_TO ACC004 (HDFC Mule)",
        type: "FINANCIAL",
        date: "2026-08-30 14:15 UTC",
        relativeTime: "Yesterday",
        description: "Settled INR 8,50,000 Hawala clearing commission into structuring account.",
        target: "ACC004",
        caseId: "FIR003",
        severity: "HIGH",
      },
      {
        id: "evt-03",
        title: "JOINED ORG_002 (Silverline Global)",
        type: "CORPORATE",
        date: "2026-08-22 10:00 UTC",
        relativeTime: "9 days ago",
        description: "Registered as designated partner with 90% profit sharing.",
        target: "ORG_002",
        caseId: "FIR003",
        severity: "HIGH",
      },
      {
        id: "evt-04",
        title: "VISITED LOC_001 (Bhiwandi Godown Hub)",
        type: "MOVEMENT",
        date: "2026-08-18 19:40 UTC",
        relativeTime: "13 days ago",
        description: "ANPR camera logged vehicle MH-02-CD-4921 entering warehouse perimeter.",
        location: "Bhiwandi, Maharashtra",
        caseId: "FIR007",
        severity: "MEDIUM",
      },
    ];
  }

  /**
   * Fetch top related entities
   */
  public async getRelatedEntities(id: string): Promise<RelatedEntity[]> {
    await new Promise((resolve) => setTimeout(resolve, 70));

    return [
      {
        id: "P001",
        name: "Vikram Malhotra",
        type: "PERSON",
        role: "HUB / KINGPIN",
        sharedCases: 3,
        connectionStrength: 96,
        relationship: "CONTACTED // COMMANDS",
        riskScore: 98,
      },
      {
        id: "P020",
        name: "Rajesh Shrivastav",
        type: "PERSON",
        role: "BROKER",
        sharedCases: 3,
        connectionStrength: 91,
        relationship: "COORDINATES_WITH",
        riskScore: 89,
      },
      {
        id: "PHONE_017",
        name: "+91 98220 54321",
        type: "PHONE",
        role: "SHARED_BURNER",
        sharedCases: 4,
        connectionStrength: 99,
        relationship: "USES",
        riskScore: 92,
      },
      {
        id: "ORG_002",
        name: "Silverline Global Trading",
        type: "ORGANIZATION",
        role: "SHELL_COMPANY",
        sharedCases: 2,
        connectionStrength: 95,
        relationship: "OWNS",
        riskScore: 90,
      },
    ];
  }
}

export const entityService = EntityService.getInstance();

export const getEntity = (id: string) => entityService.getEntity(id);
export const getEntityRelationships = (id: string) => entityService.getEntityRelationships(id);
export const getEntityCases = (id: string) => entityService.getEntityCases(id);
export const getEntityTimeline = (id: string) => entityService.getEntityTimeline(id);
export const getRelatedEntities = (id: string) => entityService.getRelatedEntities(id);
