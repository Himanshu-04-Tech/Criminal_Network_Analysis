"""Role Service providing a unified thread-safe singleton API for role intelligence."""

import json
import threading
from pathlib import Path
from typing import Dict, List, Optional, Any
import networkx as nx

from graph_engine.graph_service import KnowledgeGraphService
from .role_models import (
    InvestigationRole,
    CentralityMetrics,
    RoleClassification,
    CommunityStructure,
    BrokerReport,
    HubReport,
    InfluenceReport,
    SharedResourceReport,
    FinancialConduitReport,
    CommunityReport,
    CommunityVisualizationPayload,
)
from .centrality_engine import CentralityEngine
from .community_detector import CommunityDetector
from .influence_analyzer import InfluenceAnalyzer
from .role_classifier import RoleClassifier
from .role_explainer import RoleExplainer


class RoleService:
    """
    Singleton service facade exposing the Network Role Intelligence Engine APIs.
    Consumes KnowledgeGraphService and computes roles, centralities, and community structures.
    """

    _instance: Optional["RoleService"] = None
    _lock: threading.Lock = threading.Lock()

    def __init__(self, graph: Optional[nx.MultiDiGraph] = None):
        if graph is None:
            kg_service = KnowledgeGraphService.get_instance()
            self._graph = kg_service.get_graph()
        else:
            self._graph = graph

        # Initialize sub-engines
        self.centrality_engine = CentralityEngine(self._graph)
        self.community_detector = CommunityDetector(self._graph)
        self.influence_analyzer = InfluenceAnalyzer(self.centrality_engine, self.community_detector)
        self.role_classifier = RoleClassifier(
            self._graph,
            self.centrality_engine,
            self.community_detector,
            self.influence_analyzer,
        )

        # Precompute initial classification cache
        self.role_classifier.classify_all()

    @classmethod
    def get_instance(cls, force_new: bool = False) -> "RoleService":
        """Returns the singleton instance of RoleService."""
        with cls._lock:
            if cls._instance is None or force_new:
                cls._instance = cls()
            return cls._instance

    @classmethod
    def reset_instance(cls) -> None:
        """Resets the singleton instance (useful for unit testing)."""
        with cls._lock:
            cls._instance = None

    @property
    def graph(self) -> nx.MultiDiGraph:
        """Returns the underlying knowledge graph."""
        return self._graph

    # --- Public Role Query APIs ---

    def get_entity_role(self, entity_id: str) -> Optional[RoleClassification]:
        """Returns the classification record for an entity, or None if not found."""
        return self.role_classifier.get_classification(entity_id)

    def get_top_brokers(self, limit: int = 5) -> List[RoleClassification]:
        """Returns top covert brokers ranked by broker score descending."""
        return self.role_classifier.get_top_brokers(limit=limit)

    def get_top_hubs(self, limit: int = 5) -> List[RoleClassification]:
        """Returns top degree hubs."""
        return self.role_classifier.get_top_hubs(limit=limit)

    def get_top_influencers(self, limit: int = 5) -> List[RoleClassification]:
        """Returns top overall influencers ranked by 0-100 composite score."""
        return self.role_classifier.get_top_influencers(limit=limit)

    def get_shared_resources(self) -> List[RoleClassification]:
        """Returns all shared phones, accounts, and vehicles."""
        return self.role_classifier.get_entities_by_role(InvestigationRole.SHARED_RESOURCE)

    def get_financial_conduits(self) -> List[RoleClassification]:
        """Returns all financial conduits (Fan-In, Fan-Out, Routing accounts)."""
        return self.role_classifier.get_entities_by_role(InvestigationRole.FINANCIAL_CONDUIT)

    def get_community_structure(self) -> CommunityStructure:
        """Returns the Louvain community partitioning and component statistics."""
        return self.community_detector.get_community_structure()

    def get_role_explanation(self, entity_id: str) -> Dict[str, Any]:
        """Returns detailed explainability data for an entity's role assignment."""
        classification = self.get_entity_role(entity_id)
        if not classification:
            return {
                "entity_id": entity_id,
                "found": False,
                "message": f"Entity '{entity_id}' not found in knowledge graph.",
            }

        return {
            "entity_id": classification.entity_id,
            "entity_name": classification.entity_name,
            "entity_type": classification.entity_type,
            "role": classification.role.value,
            "influence_score": classification.influence_score,
            "confidence": classification.confidence,
            "reasons": classification.reasons,
            "metrics": classification.metrics,
            "communities_connected": classification.communities_connected,
            "cases_involved": classification.cases_involved,
            "details": classification.details,
        }

    # --- Intelligence Reports Generator ---

    def export_reports(self, output_dir: str = "reports") -> Dict[str, str]:
        """
        Generates 5 intelligence reports in the specified output directory:
        1. broker_report.json
        2. hub_report.json
        3. community_report.json
        4. influence_report.json
        5. shared_resource_report.json
        """
        out_path = Path(output_dir).resolve()
        out_path.mkdir(parents=True, exist_ok=True)

        all_classifications = list(self.role_classifier.classify_all().values())
        top_brokers = self.get_top_brokers(limit=10)
        top_hubs = self.get_top_hubs(limit=10)
        top_influencers = self.get_top_influencers(limit=10)
        shared_resources = self.get_shared_resources()
        comm_struct = self.get_community_structure()

        generated_files: Dict[str, str] = {}

        # 1. Broker Report
        broker_report = {
            "title": "NEXUS-Bharat Intelligence Report: Clandestine Network Brokers",
            "total_brokers_detected": len(self.role_classifier.get_entities_by_role(InvestigationRole.BROKER)),
            "top_brokers": [b.model_dump() for b in top_brokers],
        }
        broker_file = out_path / "broker_report.json"
        broker_file.write_text(json.dumps(broker_report, indent=2), encoding="utf-8")
        generated_files["broker_report"] = str(broker_file)

        # 2. Hub Report
        hub_report = {
            "title": "NEXUS-Bharat Intelligence Report: High-Degree Connectivity Hubs",
            "total_hubs_detected": len(self.role_classifier.get_entities_by_role(InvestigationRole.HUB)),
            "top_hubs": [h.model_dump() for h in top_hubs],
        }
        hub_file = out_path / "hub_report.json"
        hub_file.write_text(json.dumps(hub_report, indent=2), encoding="utf-8")
        generated_files["hub_report"] = str(hub_file)

        # 3. Community Report
        community_report = {
            "title": "NEXUS-Bharat Intelligence Report: Louvain Community Partitioning & Clusters",
            "modularity_score": comm_struct.modularity,
            "community_count": comm_struct.num_communities,
            "connected_components_count": comm_struct.connected_components_count,
            "communities": comm_struct.communities,
        }
        comm_file = out_path / "community_report.json"
        comm_file.write_text(json.dumps(community_report, indent=2), encoding="utf-8")
        generated_files["community_report"] = str(comm_file)

        # 4. Influence Report
        influence_report = {
            "title": "NEXUS-Bharat Intelligence Report: Entity Influence Ranking",
            "total_entities_evaluated": len(all_classifications),
            "scoring_weights": self.influence_analyzer.weights,
            "top_influencers": [inf.model_dump() for inf in top_influencers],
        }
        inf_file = out_path / "influence_report.json"
        inf_file.write_text(json.dumps(influence_report, indent=2), encoding="utf-8")
        generated_files["influence_report"] = str(inf_file)

        # 5. Shared Resource Report
        resource_types: Dict[str, int] = {}
        for r in shared_resources:
            resource_types[r.entity_type] = resource_types.get(r.entity_type, 0) + 1

        shared_report = {
            "title": "NEXUS-Bharat Intelligence Report: Multi-Operative Shared Infrastructure",
            "total_shared_resources": len(shared_resources),
            "breakdown_by_type": resource_types,
            "resources": [sr.model_dump() for sr in shared_resources],
        }
        shared_file = out_path / "shared_resource_report.json"
        shared_file.write_text(json.dumps(shared_report, indent=2), encoding="utf-8")
        generated_files["shared_resource_report"] = str(shared_file)

        return generated_files

    # --- Community Visualization Output ---

    def get_community_visualization_graph(self) -> Dict[str, Any]:
        """
        Generates a standardized JSON payload for web frontend visualizers:
        { "nodes": [...], "edges": [...], "communities": [...] }
        """
        comm_struct = self.get_community_structure()
        classifications = self.role_classifier.classify_all()

        vis_nodes: List[Dict[str, Any]] = []
        vis_edges: List[Dict[str, Any]] = []
        vis_comms: List[Dict[str, Any]] = []

        # 1. Build Nodes
        for node_id in self._graph.nodes():
            node_data = self._graph.nodes[node_id]
            node_type = node_data.get("type", "UNKNOWN")
            node_name = node_data.get("name", node_id)
            classification = classifications.get(node_id)
            comm_name = self.community_detector.get_node_community(node_id) or "unassigned"

            vis_nodes.append({
                "id": node_id,
                "label": node_name,
                "type": node_type,
                "role": classification.role.value if classification else "CASE",
                "community": comm_name,
                "influence_score": classification.influence_score if classification else 0.0,
                "degree": self._graph.degree(node_id),
                "attributes": node_data.get("attributes", {}),
            })

        # 2. Build Edges
        seen_edges = set()
        for u, v, k, d in self._graph.edges(keys=True, data=True):
            edge_id = d.get("id", f"{u}_{v}_{k}")
            if edge_id in seen_edges:
                continue
            seen_edges.add(edge_id)

            vis_edges.append({
                "id": edge_id,
                "source": u,
                "target": v,
                "type": d.get("relationship_type", "RELATED_TO"),
                "case_id": d.get("case_id"),
                "confidence": d.get("confidence", 1.0),
            })

        # 3. Build Communities
        for comm_name, members in comm_struct.communities.items():
            vis_comms.append({
                "id": comm_name,
                "label": comm_name.replace("_", " ").title(),
                "member_count": len(members),
                "members": members,
            })

        return {
            "nodes": vis_nodes,
            "edges": vis_edges,
            "communities": vis_comms,
        }
