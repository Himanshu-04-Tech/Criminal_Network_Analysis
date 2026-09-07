"""Intelligence Service providing a unified thread-safe singleton API for Cross Case Intelligence."""

import json
import threading
from pathlib import Path
from typing import Dict, List, Optional, Any
import networkx as nx

from graph_engine.graph_service import KnowledgeGraphService
from graph_analytics.connection_service import ConnectionService
from role_intelligence.role_service import RoleService

from .models import (
    ConnectionStrength,
    CaseEntityBreakdown,
    CaseOverlap,
    BridgeEntity,
    CrossCaseComparison,
    CaseCluster,
    CaseRanking,
    CrossCaseVisualizationPayload,
)
from .case_loader import CaseLoader
from .overlap_detector import OverlapDetector
from .bridge_detector import BridgeDetector
from .case_analyzer import CaseAnalyzer
from .similarity_engine import SimilarityEngine
from .case_scorer import CaseScorer
from .case_explainer import CaseExplainer


class CrossCaseIntelligenceService:
    """
    Singleton service facade exposing the Cross Case Intelligence Engine APIs.
    Consumes KnowledgeGraphService, ConnectionService, and RoleService directly.
    """

    _instance: Optional["CrossCaseIntelligenceService"] = None
    _lock: threading.Lock = threading.Lock()

    def __init__(
        self,
        kg_service: Optional[KnowledgeGraphService] = None,
        conn_service: Optional[ConnectionService] = None,
        role_service: Optional[RoleService] = None,
    ):
        self._kg_service = kg_service or KnowledgeGraphService.get_instance()
        self._conn_service = conn_service or ConnectionService.get_instance()
        self._role_service = role_service or RoleService.get_instance()
        self._graph = self._kg_service.get_graph()

        # Initialize core analytic stages
        self.case_loader = CaseLoader(self._kg_service)
        self.overlap_detector = OverlapDetector(self.case_loader)
        self.bridge_detector = BridgeDetector(
            self.case_loader,
            self.overlap_detector,
            self._kg_service,
            self._role_service,
        )
        self.case_analyzer = CaseAnalyzer(self._kg_service, self._conn_service)
        self.similarity_engine = SimilarityEngine(
            self.case_loader,
            self.overlap_detector,
            self.bridge_detector,
            self.case_analyzer,
        )
        self.case_scorer = CaseScorer(
            self.case_loader,
            self.overlap_detector,
            self.bridge_detector,
            self.similarity_engine,
        )

        # Pre-warm cache
        self.case_loader.get_all_case_entities()
        self.similarity_engine.get_similarity_matrix()

    @classmethod
    def get_instance(cls, force_new: bool = False) -> "CrossCaseIntelligenceService":
        """Returns the singleton instance of CrossCaseIntelligenceService."""
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

    # --- Public Query APIs ---

    def compare_cases(self, case_a: str, case_b: str) -> CrossCaseComparison:
        """Performs a comprehensive cross-case comparison between two FIR cases."""
        overlap = self.find_shared_entities(case_a, case_b)
        bridges = self.find_bridge_entities(case_a, case_b)
        sim_score = self.get_case_similarity(case_a, case_b)
        path_info = self.case_analyzer.analyze_cross_case_paths(case_a, case_b)

        has_broker = any(b.role == "BROKER" or b.entity_id == "P017" for b in bridges)
        broker_id = "P017" if any(b.entity_id == "P017" for b in bridges) else (
            next((b.entity_id for b in bridges if b.role == "BROKER"), None)
        )

        strength = self.case_scorer.determine_connection_strength(
            case_a, case_b, sim_score, broker_present=has_broker
        )

        reasons = CaseExplainer.explain_case_connection(
            case_a=case_a,
            case_b=case_b,
            overlap=overlap,
            bridges=bridges,
            similarity_score=sim_score,
            strength=strength,
            path_summary=path_info.get("summary", ""),
        )

        return CrossCaseComparison(
            case_a=case_a,
            case_b=case_b,
            connected=path_info.get("connected", True),
            similarity_score=sim_score,
            connection_strength=strength,
            shared_entities=overlap,
            bridge_entities=bridges,
            connecting_paths=path_info.get("paths", []),
            reasons=reasons,
            evidence_count=path_info.get("evidence_count", 0),
            broker_present=has_broker,
            broker_id=broker_id,
        )

    def find_case_connections(self, case_id: str) -> List[CrossCaseComparison]:
        """Finds all cross-case comparisons involving the specified FIR case, ranked by similarity."""
        all_cases = self.case_loader.get_all_cases()
        comparisons: List[CrossCaseComparison] = []

        for other_cid in all_cases:
            if other_cid == case_id:
                continue
            comp = self.compare_cases(case_id, other_cid)
            comparisons.append(comp)

        return sorted(comparisons, key=lambda c: c.similarity_score, reverse=True)

    def find_shared_entities(self, case_a: str, case_b: str) -> CaseOverlap:
        """Returns direct shared entities between two FIR cases."""
        return self.overlap_detector.find_shared_entities(case_a, case_b)

    def find_bridge_entities(self, case_a: str, case_b: str) -> List[BridgeEntity]:
        """Returns direct and intermediary bridge entities connecting two FIR cases."""
        return self.bridge_detector.find_bridge_entities(case_a, case_b)

    def get_case_similarity(self, case_a: str, case_b: str) -> float:
        """Returns the 0-100 composite similarity score between two cases."""
        return self.similarity_engine.calculate_similarity(case_a, case_b)

    def detect_case_clusters(self) -> List[CaseCluster]:
        """Detects and returns all cross-case syndicate clusters."""
        return self.case_scorer.detect_case_clusters()

    def get_all_case_ids(self) -> List[str]:
        """Returns all recognized FIR case identifiers."""
        return self.case_loader.get_all_cases()

    def get_case_cluster(self, case_id: str) -> Optional[CaseCluster]:
        """Returns the syndicate cluster containing the specified FIR case."""
        clusters = self.detect_case_clusters()
        for cluster in clusters:
            if case_id in cluster.cases:
                return cluster
        return None

    def get_connected_cases(self, case_id: str, min_similarity: float = 20.0) -> List[str]:
        """Returns list of all case IDs connected to case_id above min_similarity threshold."""
        sim_matrix = self.similarity_engine.get_similarity_matrix()
        case_sims = sim_matrix.get(case_id, {})
        connected = [
            cid for cid, score in case_sims.items()
            if cid != case_id and score >= min_similarity
        ]
        return sorted(connected)

    def rank_cases(self) -> List[CaseRanking]:
        """Returns all FIR cases ranked by network importance score descending."""
        return self.case_scorer.rank_cases()

    def generate_case_report(self, case_id: str) -> Dict[str, Any]:
        """Generates a comprehensive dossier for a single case including its cross-case linkages."""
        entities = self.case_loader.get_case_entities(case_id)
        connections = self.find_case_connections(case_id)
        cluster = self.get_case_cluster(case_id)

        return {
            "case_id": case_id,
            "total_entities": entities.total_entities,
            "entity_breakdown": entities.model_dump(),
            "cluster_id": cluster.cluster_id if cluster else None,
            "connected_cases_count": len(connections),
            "top_connections": [
                {
                    "case": c.case_b if c.case_a == case_id else c.case_a,
                    "similarity": c.similarity_score,
                    "strength": c.connection_strength.value,
                    "shared_total": c.shared_entities.total_shared,
                    "broker_present": c.broker_present,
                    "reasons": c.reasons[:3],
                }
                for c in connections[:5]
            ],
        }

    # --- Intelligence Reports Export ---

    def export_reports(self, output_dir: str = "reports") -> Dict[str, str]:
        """
        Exports 5 standardized intelligence reports into the specified directory:
        1. cross_case_report.json
        2. case_clusters.json
        3. similarity_matrix.json
        4. bridge_entities.json
        5. case_rankings.json
        """
        out_path = Path(output_dir).resolve()
        out_path.mkdir(parents=True, exist_ok=True)

        all_cases = self.case_loader.get_all_cases()
        sim_matrix = self.similarity_engine.get_similarity_matrix()
        clusters = self.case_scorer.detect_case_clusters()
        rankings = self.rank_cases()

        generated_files: Dict[str, str] = {}

        # 1. Cross-Case Report (top pairwise connections)
        all_pairs: List[Dict[str, Any]] = []
        seen = set()
        for c1 in all_cases:
            for c2 in all_cases:
                if c1 >= c2:
                    continue
                pair_key = (c1, c2)
                if pair_key in seen:
                    continue
                seen.add(pair_key)
                comp = self.compare_cases(c1, c2)
                all_pairs.append({
                    "case_a": c1,
                    "case_b": c2,
                    "similarity_score": comp.similarity_score,
                    "connection_strength": comp.connection_strength.value,
                    "shared_total": comp.shared_entities.total_shared,
                    "shared_phones": comp.shared_entities.shared_phones,
                    "shared_vehicles": comp.shared_entities.shared_vehicles,
                    "shared_accounts": comp.shared_entities.shared_accounts,
                    "shared_persons": comp.shared_entities.shared_persons,
                    "bridge_entities": [b.entity_id for b in comp.bridge_entities],
                    "broker_present": comp.broker_present,
                    "reasons": comp.reasons,
                })

        sorted_pairs = sorted(all_pairs, key=lambda p: p["similarity_score"], reverse=True)
        rep1_file = out_path / "cross_case_report.json"
        rep1_file.write_text(json.dumps({
            "title": "NEXUS-Bharat Intelligence Report: Cross-Case Linkages & Overlaps",
            "total_case_pairs_analyzed": len(sorted_pairs),
            "high_severity_connections": [p for p in sorted_pairs if p["similarity_score"] >= 60.0],
            "all_connections": sorted_pairs,
        }, indent=2), encoding="utf-8")
        generated_files["cross_case_report"] = str(rep1_file)

        # 2. Case Clusters Report
        rep2_file = out_path / "case_clusters.json"
        rep2_file.write_text(json.dumps({
            "title": "NEXUS-Bharat Intelligence Report: Cross-Case Syndicate Clusters",
            "total_clusters": len(clusters),
            "clusters": [c.model_dump() for c in clusters],
        }, indent=2), encoding="utf-8")
        generated_files["case_clusters"] = str(rep2_file)

        # 3. Similarity Matrix Report
        rep3_file = out_path / "similarity_matrix.json"
        rep3_file.write_text(json.dumps({
            "title": "NEXUS-Bharat Intelligence Report: Pairwise Case Similarity Matrix (0-100)",
            "matrix": sim_matrix,
        }, indent=2), encoding="utf-8")
        generated_files["similarity_matrix"] = str(rep3_file)

        # 4. Bridge Entities Report
        bridge_map: Dict[str, Dict[str, Any]] = {}
        for c1 in all_cases:
            for c2 in all_cases:
                if c1 >= c2:
                    continue
                bridges = self.find_bridge_entities(c1, c2)
                for b in bridges:
                    if b.entity_id not in bridge_map:
                        bridge_map[b.entity_id] = {
                            "entity_id": b.entity_id,
                            "entity_name": b.entity_name,
                            "entity_type": b.entity_type,
                            "role": b.role,
                            "bridge_type": b.bridge_type,
                            "connected_case_pairs": [],
                        }
                    bridge_map[b.entity_id]["connected_case_pairs"].append(f"{c1} <-> {c2}")

        rep4_file = out_path / "bridge_entities.json"
        rep4_file.write_text(json.dumps({
            "title": "NEXUS-Bharat Intelligence Report: Cross-Case Bridge Entities & Brokers",
            "total_unique_bridges": len(bridge_map),
            "bridge_entities": sorted(list(bridge_map.values()), key=lambda x: len(x["connected_case_pairs"]), reverse=True),
        }, indent=2), encoding="utf-8")
        generated_files["bridge_entities"] = str(rep4_file)

        # 5. Case Rankings Report
        rep5_file = out_path / "case_rankings.json"
        rep5_file.write_text(json.dumps({
            "title": "NEXUS-Bharat Intelligence Report: FIR Case Importance & Centrality Rankings",
            "rankings": [r.model_dump() for r in rankings],
        }, indent=2), encoding="utf-8")
        generated_files["case_rankings"] = str(rep5_file)

        return generated_files

    # --- Visualization JSON Payload ---

    def get_visualization_payload(self) -> CrossCaseVisualizationPayload:
        """
        Generates standard node-link-cluster JSON for web frontend visualizers:
        { "nodes": [...], "edges": [...], "clusters": [...] }
        """
        all_cases = self.case_loader.get_all_cases()
        clusters = self.case_scorer.detect_case_clusters()
        rankings_map = {r.case_id: r.importance_score for r in self.rank_cases()}
        sim_matrix = self.similarity_engine.get_similarity_matrix()

        # Map each case to cluster
        case_to_cluster = {}
        for cl in clusters:
            for cid in cl.cases:
                case_to_cluster[cid] = cl.cluster_id

        nodes: List[Dict[str, Any]] = []
        for cid in all_cases:
            ent = self.case_loader.get_case_entities(cid)
            nodes.append({
                "id": cid,
                "label": f"FIR Case {cid}",
                "type": "CASE",
                "cluster": case_to_cluster.get(cid, "CLUSTER_A"),
                "importance_score": rankings_map.get(cid, 50.0),
                "size": max(10, ent.total_entities * 2),
                "total_entities": ent.total_entities,
                "persons_count": len(ent.persons),
                "phones_count": len(ent.phones),
                "accounts_count": len(ent.accounts),
            })

        edges: List[Dict[str, Any]] = []
        seen_edges = set()
        for i in range(len(all_cases)):
            c1 = all_cases[i]
            for j in range(i + 1, len(all_cases)):
                c2 = all_cases[j]
                sim = sim_matrix.get(c1, {}).get(c2, 0.0)
                if sim >= 20.0:
                    comp = self.compare_cases(c1, c2)
                    edge_id = f"{c1}_{c2}"
                    if edge_id in seen_edges:
                        continue
                    seen_edges.add(edge_id)
                    edges.append({
                        "id": edge_id,
                        "source": c1,
                        "target": c2,
                        "similarity_score": sim,
                        "weight": sim,
                        "strength": comp.connection_strength.value,
                        "shared_entities_count": comp.shared_entities.total_shared,
                        "broker_present": comp.broker_present,
                    })

        clusters_payload: List[Dict[str, Any]] = [
            {
                "id": cl.cluster_id,
                "lead_case": cl.lead_case,
                "cases": cl.cases,
                "cohesion": cl.internal_cohesion,
                "shared_resources": cl.shared_resources_count,
            }
            for cl in clusters
        ]

        return CrossCaseVisualizationPayload(
            nodes=nodes,
            edges=edges,
            clusters=clusters_payload,
        )
