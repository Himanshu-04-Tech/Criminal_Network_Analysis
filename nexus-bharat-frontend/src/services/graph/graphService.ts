import { GraphResponse, GraphEntity, GraphNode, GraphEdge } from "@/types/graph";
import {
  mockGraphNodes,
  mockGraphEdges,
  mockDetailedEntities,
  mockGraphResponse,
} from "@/lib/mock/graph";

/**
 * GraphService
 * 
 * Provides graph network data, node details, neighbor queries, and entity search.
 * Ready for future FastAPI endpoint integration.
 */
export class GraphService {
  private static instance: GraphService;

  private constructor() {}

  public static getInstance(): GraphService {
    if (!GraphService.instance) {
      GraphService.instance = new GraphService();
    }
    return GraphService.instance;
  }

  /**
   * Fetch full graph topology or filtered by case scope
   */
  public async getGraph(caseFilter?: string): Promise<GraphResponse> {
    await new Promise((resolve) => setTimeout(resolve, 80));

    if (!caseFilter || caseFilter === "ALL") {
      return { ...mockGraphResponse };
    }

    const filteredNodes = mockGraphNodes.filter((node) =>
      node.cases.some((c) => c.includes(caseFilter))
    );

    const nodeIds = new Set(filteredNodes.map((n) => n.id));

    const filteredEdges = mockGraphEdges.filter(
      (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)
    );

    return {
      nodes: filteredNodes,
      edges: filteredEdges,
      statistics: {
        totalNodes: filteredNodes.length,
        totalEdges: filteredEdges.length,
        communitiesCount: Math.min(filteredNodes.length, 3),
        brokersCount: filteredNodes.filter((n) => n.role === "BROKER").length,
        density: filteredNodes.length > 1
          ? Number((filteredEdges.length / (filteredNodes.length * (filteredNodes.length - 1))).toFixed(2))
          : 0,
        avgDegree: filteredNodes.length > 0
          ? Number(((filteredEdges.length * 2) / filteredNodes.length).toFixed(1))
          : 0,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Fetch detailed entity dossier for the drawer
   */
  public async getNode(id: string): Promise<GraphEntity | null> {
    await new Promise((resolve) => setTimeout(resolve, 60));

    // Return custom detailed mock if present
    if (mockDetailedEntities[id]) {
      return { ...mockDetailedEntities[id] };
    }

    // Otherwise generate dynamic fallback entity from graph node
    const node = mockGraphNodes.find((n) => n.id === id);
    if (!node) return null;

    const incidentEdges = mockGraphEdges.filter(
      (e) => e.source === id || e.target === id
    );

    const neighbors = incidentEdges.map((e) => {
      const isOutgoing = e.source === id;
      const targetId = isOutgoing ? e.target : e.source;
      const neighborNode = mockGraphNodes.find((n) => n.id === targetId);

      return {
        id: targetId,
        name: neighborNode ? neighborNode.name : targetId,
        type: neighborNode ? neighborNode.type : "PERSON",
        relationship: e.relationshipType,
        direction: (isOutgoing ? "outgoing" : "incoming") as "incoming" | "outgoing",
      };
    });

    return {
      ...node,
      riskScore: node.role === "HUB" ? 95 : node.role === "BROKER" ? 90 : 65,
      connectionsCount: incidentEdges.length,
      degree: incidentEdges.length,
      neighbors,
      firstSeen: "2026-08-01T00:00:00Z",
      lastSeen: "2026-08-31T12:00:00Z",
      notes: `Monitored intelligence entity tracked under ${node.cases.join(", ")}.`,
    };
  }

  /**
   * Get 1-hop neighbor subgraph
   */
  public async getNeighbors(
    id: string
  ): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
    await new Promise((resolve) => setTimeout(resolve, 60));

    const directEdges = mockGraphEdges.filter(
      (e) => e.source === id || e.target === id
    );

    const neighborIds = new Set<string>([id]);
    directEdges.forEach((e) => {
      neighborIds.add(e.source);
      neighborIds.add(e.target);
    });

    const neighborNodes = mockGraphNodes.filter((n) => neighborIds.has(n.id));

    return {
      nodes: neighborNodes,
      edges: directEdges,
    };
  }

  /**
   * Search entities by ID or name
   */
  public async searchEntity(query: string): Promise<GraphNode[]> {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();

    return mockGraphNodes.filter(
      (n) => n.id.toLowerCase().includes(q) || n.name.toLowerCase().includes(q)
    );
  }
}

export const graphService = GraphService.getInstance();
