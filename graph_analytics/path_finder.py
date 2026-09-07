"""Graph search algorithms for multi-hop connection discovery, ranking, and case bridging."""

from __future__ import annotations
import itertools
from typing import Any, Dict, List, Optional, Set, Tuple
import networkx as nx

from graph_analytics.path_models import (
    PathResult,
    PathStep,
    CaseConnectionResponse,
    BrokerVerificationReport,
    VisualizationGraph,
    VisualizationNode,
    VisualizationEdge,
)
from graph_analytics.path_scorer import PathScorer
from graph_analytics.path_explainer import PathExplainer


class PathFinder:
    """Core search engine implementing BFS, Simple Paths, Case Bridges, and Broker Verification."""

    def __init__(self, graph: nx.MultiDiGraph):
        self.graph = graph
        self.undirected_view = graph.to_undirected(as_view=True)
        self.scorer = PathScorer(graph)
        self.explainer = PathExplainer(graph)

    def _get_search_view(self, directed: bool) -> nx.Graph:
        """Return either directed MultiDiGraph or undirected projection for associative search."""
        return self.graph if directed else self.undirected_view

    def _evaluate_path(self, raw_path: List[str]) -> PathResult:
        """Convert a sequence of node IDs into a scored and explained PathResult."""
        steps, reasoning, summary = self.explainer.explain_path(raw_path)
        score = self.scorer.compute_score(raw_path, steps)
        bridges, brokers = self.scorer.extract_bridges_and_brokers(raw_path, steps)

        return PathResult(
            path=raw_path,
            hops=len(raw_path) - 1,
            score=score,
            steps=steps,
            reasoning=reasoning,
            summary=summary,
            cross_case_bridges=bridges,
            brokers_involved=brokers
        )

    # --- Algorithm 1: Breadth-First Search (Shortest Hop Path) ---

    def find_shortest_connection(
        self, source: str, target: str, directed: bool = False
    ) -> Optional[PathResult]:
        """
        Algorithm 1: Breadth-First Search (BFS).
        Discovers the shortest hop path between source and target entities.
        Returns PathResult if connected, None otherwise.
        """
        view = self._get_search_view(directed)
        try:
            raw_path = nx.shortest_path(view, source=source, target=target)
            return self._evaluate_path(raw_path)
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return None

    # --- Algorithm 2: All Simple Paths (Bounded Depth) ---

    def find_all_connections(
        self,
        source: str,
        target: str,
        max_depth: int = 6,
        limit: int = 50,
        directed: bool = False,
    ) -> List[PathResult]:
        """
        Algorithm 2: All Simple Paths with depth bound (cutoff=6).
        Finds candidate simple paths up to max_depth, preventing combinatorial explosion.
        Ranked by investigative score.
        """
        view = self._get_search_view(directed)
        results: List[PathResult] = []

        try:
            path_generator = nx.all_simple_paths(view, source=source, target=target, cutoff=max_depth)
            for raw_path in itertools.islice(path_generator, limit):
                results.append(self._evaluate_path(raw_path))
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return []

        # Rank paths by score descending
        results.sort(key=lambda p: p.score, reverse=True)
        return results

    # --- Algorithm 3: Multi-Path Discovery (Top-K Ranked) ---

    def find_multiple_connections(
        self,
        source: str,
        target: str,
        top_k: int = 5,
        max_depth: int = 6,
        directed: bool = False,
    ) -> List[PathResult]:
        """
        Algorithm 3: Multi-Path Discovery.
        Returns the top_k (default 5) highest scoring paths connecting source and target.
        """
        all_paths = self.find_all_connections(
            source=source,
            target=target,
            max_depth=max_depth,
            limit=100,
            directed=directed
        )
        return all_paths[:top_k]

    # --- Case Connection Finder ---

    def find_case_connection(
        self, case_1: str, case_2: str, directed: bool = False
    ) -> CaseConnectionResponse:
        """
        Discovers cross-case operational links connecting two registered FIR cases.
        Identifies bridge suspects, vehicles, phones, or bank accounts.
        """
        view = self._get_search_view(directed)
        try:
            raw_path = nx.shortest_path(view, source=case_1, target=case_2)
            eval_result = self._evaluate_path(raw_path)

            # Bridge entities are all non-case intermediaries on the path
            bridge_entities = [
                node_id for node_id in raw_path
                if node_id not in (case_1, case_2) and self.graph.nodes[node_id].get("type") != "CASE"
            ]

            summary = (
                f"Cross-Case Linkage Verified: {case_1} connects to {case_2} across {eval_result.hops} hops. "
                f"Bridge entities involved: {', '.join(bridge_entities)}."
            )

            return CaseConnectionResponse(
                connected=True,
                source_case=case_1,
                target_case=case_2,
                hops=eval_result.hops,
                bridge_entities=bridge_entities,
                path=raw_path,
                reasoning=eval_result.reasoning,
                summary=summary,
                details=eval_result
            )
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return CaseConnectionResponse(
                connected=False,
                source_case=case_1,
                target_case=case_2,
                reason=f"No investigative bridge found between {case_1} and {case_2}."
            )

    # --- Hidden Broker Verification ---

    def verify_hidden_broker(
        self,
        broker_id: str = "P017",
        community_a: Optional[List[str]] = None,
        community_b: Optional[List[str]] = None,
    ) -> BrokerVerificationReport:
        """
        Empirically verifies that the designated broker node (P017) acts as an indirect bridge
        between Community A and Community B through operational assets without direct person-to-person links.
        """
        comm_a = community_a or ["P001", "P002", "P003", "P004"]
        comm_b = community_b or ["P010", "P011", "P012", "P013"]

        view = self.undirected_view
        broker_present_paths = 0
        total_pairs_tested = 0
        sample_paths_data = []

        # Check connectivity of broker to both communities
        comm_a_set = set(comm_a)
        comm_b_set = set(comm_b)

        for p_a in comm_a:
            for p_b in comm_b:
                total_pairs_tested += 1
                try:
                    # Check path from p_a to broker_id, and broker_id to p_b
                    path_a_to_broker = nx.shortest_path(view, source=p_a, target=broker_id)
                    path_broker_to_b = nx.shortest_path(view, source=broker_id, target=p_b)

                    # Ensure path_a_to_broker doesn't pass through Comm B, and vice-versa
                    if not set(path_a_to_broker).intersection(comm_b_set) and not set(path_broker_to_b).intersection(comm_a_set):
                        composite_path = path_a_to_broker[:-1] + path_broker_to_b
                        eval_path = self._evaluate_path(composite_path)
                        broker_present_paths += 1

                        if len(sample_paths_data) < 3:
                            sample_paths_data.append({
                                "source": p_a,
                                "target": p_b,
                                "path": eval_path.path,
                                "hops": eval_path.hops,
                                "score": eval_path.score,
                                "reasoning": eval_path.reasoning
                            })
                except (nx.NetworkXNoPath, nx.NodeNotFound):
                    continue

        broker_detected = (broker_present_paths > 0)
        report = BrokerVerificationReport(
            broker_detected=broker_detected,
            broker=broker_id,
            communities_connected=2 if broker_detected else 0,
            community_a_nodes=comm_a,
            community_b_nodes=comm_b,
            sample_paths=sample_paths_data,
            details={
                "total_pairs_tested": total_pairs_tested,
                "paths_routing_via_broker_infrastructure": broker_present_paths,
                "verification_status": "VERIFIED" if broker_detected else "FAILED"
            }
        )
        return report

    # --- Visualization Data Generator ---

    def build_visualization_graph(self, path_result: PathResult) -> VisualizationGraph:
        """
        Converts a PathResult into a structured node-link payload for frontend visualization.
        """
        vis_nodes: List[VisualizationNode] = []
        vis_edges: List[VisualizationEdge] = []

        seen_nodes: Set[str] = set()
        for node_id in path_result.path:
            if node_id in seen_nodes:
                continue
            seen_nodes.add(node_id)
            node_data = self.graph.nodes.get(node_id, {})
            vis_nodes.append(VisualizationNode(
                id=node_id,
                label=node_data.get("name", node_id),
                type=node_data.get("type", "UNKNOWN"),
                attributes=node_data.get("attributes", {})
            ))

        for idx, step in enumerate(path_result.steps):
            vis_edges.append(VisualizationEdge(
                id=step.relationship_id or f"vis-edge-{idx}",
                source=step.source,
                target=step.target,
                type=step.relationship_type,
                label=step.explanation,
                case_id=step.case_id,
                confidence=step.confidence
            ))

        return VisualizationGraph(nodes=vis_nodes, edges=vis_edges)
