"""Centrality Engine for calculating and caching graph centrality metrics."""

import threading
from typing import Dict, List, Tuple, Optional, Any
import networkx as nx

from .role_models import CentralityMetrics


class CentralityEngine:
    """
    Computes, caches, and indexes topological centrality metrics over the investigation graph.
    Converts MultiDiGraph into undirected simple graph representation for standard SNA metrics.
    """

    def __init__(self, multigraph: nx.MultiDiGraph):
        self._multigraph = multigraph
        self._analysis_graph = nx.Graph(multigraph.to_undirected())
        self._lock = threading.Lock()

        # Cache storage
        self._degree_centrality: Optional[Dict[str, float]] = None
        self._betweenness_centrality: Optional[Dict[str, float]] = None
        self._closeness_centrality: Optional[Dict[str, float]] = None
        self._eigenvector_centrality: Optional[Dict[str, float]] = None
        self._pagerank: Optional[Dict[str, float]] = None
        self._footprint_betweenness: Optional[Dict[str, float]] = None

    @property
    def analysis_graph(self) -> nx.Graph:
        """Returns the undirected simple graph used for analysis."""
        return self._analysis_graph

    def compute_all(self, force_refresh: bool = False) -> None:
        """Precomputes all centrality metrics and populates cache."""
        with self._lock:
            if not force_refresh and self._degree_centrality is not None:
                return

            g = self._analysis_graph

            # 1. Degree Centrality
            self._degree_centrality = nx.degree_centrality(g)

            # 2. Betweenness Centrality
            self._betweenness_centrality = nx.betweenness_centrality(g, normalized=True)

            # 3. Closeness Centrality
            self._closeness_centrality = nx.closeness_centrality(g)

            # 4. Eigenvector Centrality (with safe power iteration fallback)
            try:
                self._eigenvector_centrality = nx.eigenvector_centrality(g, max_iter=2000, tol=1e-04)
            except (nx.PowerIterationFailedConvergence, Exception):
                # Fallback to numpy or degree approximation if convergence fails on disconnected components
                try:
                    self._eigenvector_centrality = nx.eigenvector_centrality_numpy(g)
                except Exception:
                    self._eigenvector_centrality = dict(self._degree_centrality)

            # 5. PageRank
            self._pagerank = nx.pagerank(g, alpha=0.85)

            # 6. Footprint (Asset-Augmented) Betweenness
            # In criminal networks, brokers act through burner phones and proxy accounts
            self._footprint_betweenness = self._compute_footprint_betweenness()

    def _compute_footprint_betweenness(self) -> Dict[str, float]:
        """
        Calculates footprint betweenness where an operative's betweenness reflects
        the highest betweenness of the operational assets (phones, accounts) they operate.
        """
        footprint: Dict[str, float] = dict(self._betweenness_centrality or {})

        # Map each person to assets they use or own
        person_assets: Dict[str, List[str]] = {}
        for u, v, k, data in self._multigraph.edges(keys=True, data=True):
            rel_type = data.get("relationship_type", "")
            if rel_type in ("USES", "OWNS"):
                u_type = self._multigraph.nodes[u].get("type", "")
                v_type = self._multigraph.nodes[v].get("type", "")
                if u_type == "PERSON" and v_type in ("PHONE", "ACCOUNT", "VEHICLE"):
                    person_assets.setdefault(u, []).append(v)

        for person_id, assets in person_assets.items():
            base_val = footprint.get(person_id, 0.0)
            asset_vals = [self._betweenness_centrality.get(a, 0.0) for a in assets]
            max_asset_val = max(asset_vals) if asset_vals else 0.0
            footprint[person_id] = max(base_val, max_asset_val)

        return footprint

    def get_degree_centrality(self) -> Dict[str, float]:
        """Returns cached degree centrality for all nodes."""
        if self._degree_centrality is None:
            self.compute_all()
        return dict(self._degree_centrality)

    def get_betweenness_centrality(self, use_footprint: bool = False) -> Dict[str, float]:
        """Returns cached betweenness centrality. Optionally includes asset footprint."""
        if self._betweenness_centrality is None:
            self.compute_all()
        if use_footprint and self._footprint_betweenness is not None:
            return dict(self._footprint_betweenness)
        return dict(self._betweenness_centrality)

    def get_closeness_centrality(self) -> Dict[str, float]:
        """Returns cached closeness centrality for all nodes."""
        if self._closeness_centrality is None:
            self.compute_all()
        return dict(self._closeness_centrality)

    def get_eigenvector_centrality(self) -> Dict[str, float]:
        """Returns cached eigenvector centrality for all nodes."""
        if self._eigenvector_centrality is None:
            self.compute_all()
        return dict(self._eigenvector_centrality)

    def get_pagerank(self) -> Dict[str, float]:
        """Returns cached PageRank influence for all nodes."""
        if self._pagerank is None:
            self.compute_all()
        return dict(self._pagerank)

    def get_node_metrics(self, node_id: str) -> Optional[CentralityMetrics]:
        """Returns all 5 centrality metrics for a single node."""
        if self._degree_centrality is None:
            self.compute_all()

        if node_id not in self._analysis_graph:
            return None

        return CentralityMetrics(
            degree=round(self._degree_centrality.get(node_id, 0.0), 6),
            betweenness=round(self._betweenness_centrality.get(node_id, 0.0), 6),
            closeness=round(self._closeness_centrality.get(node_id, 0.0), 6),
            eigenvector=round(self._eigenvector_centrality.get(node_id, 0.0), 6),
            pagerank=round(self._pagerank.get(node_id, 0.0), 6),
        )

    def get_top_nodes(
        self, metric_name: str, top_k: int = 10, use_footprint: bool = False
    ) -> List[Tuple[str, float]]:
        """Returns top K nodes sorted by the specified metric in descending order."""
        if self._degree_centrality is None:
            self.compute_all()

        metric_map: Dict[str, Dict[str, float]] = {
            "degree": self._degree_centrality,
            "betweenness": self._footprint_betweenness if use_footprint else self._betweenness_centrality,
            "closeness": self._closeness_centrality,
            "eigenvector": self._eigenvector_centrality,
            "pagerank": self._pagerank,
        }

        target_dict = metric_map.get(metric_name.lower())
        if not target_dict:
            raise ValueError(f"Unknown metric '{metric_name}'. Supported: {list(metric_map.keys())}")

        sorted_items = sorted(target_dict.items(), key=lambda x: x[1], reverse=True)
        return sorted_items[:top_k]

    def get_percentile_threshold(self, metric_name: str, percentile: float = 0.90, use_footprint: bool = False) -> float:
        """Returns the metric value threshold for the given top percentile (e.g. 0.90 = Top 10%)."""
        if self._degree_centrality is None:
            self.compute_all()

        metric_map: Dict[str, Dict[str, float]] = {
            "degree": self._degree_centrality,
            "betweenness": self._footprint_betweenness if use_footprint else self._betweenness_centrality,
            "closeness": self._closeness_centrality,
            "eigenvector": self._eigenvector_centrality,
            "pagerank": self._pagerank,
        }
        target_dict = metric_map.get(metric_name.lower(), self._degree_centrality)
        values = sorted(target_dict.values())
        if not values:
            return 0.0
        index = int(len(values) * percentile)
        index = min(max(index, 0), len(values) - 1)
        return values[index]

    def is_in_top_percentile(
        self, node_id: str, metric_name: str, percentile: float = 0.90, use_footprint: bool = False
    ) -> bool:
        """Checks whether a node ranks in the top (1 - percentile) fraction for a metric."""
        if self._degree_centrality is None:
            self.compute_all()

        threshold = self.get_percentile_threshold(metric_name, percentile, use_footprint)
        metric_map: Dict[str, Dict[str, float]] = {
            "degree": self._degree_centrality,
            "betweenness": self._footprint_betweenness if use_footprint else self._betweenness_centrality,
            "closeness": self._closeness_centrality,
            "eigenvector": self._eigenvector_centrality,
            "pagerank": self._pagerank,
        }
        val = metric_map.get(metric_name.lower(), {}).get(node_id, 0.0)
        return val >= threshold and val > 0.0
