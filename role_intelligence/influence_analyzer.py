"""Influence Analyzer calculating normalized 0-100 composite network influence scores."""

from typing import Dict, List, Any, Optional
import networkx as nx

from .role_models import InfluenceReport
from .centrality_engine import CentralityEngine
from .community_detector import CommunityDetector


class InfluenceAnalyzer:
    """
    Combines degree centrality, betweenness centrality, PageRank influence,
    and community boundary span into a single calibrated 0-100 investigative influence score.
    """

    DEFAULT_WEIGHTS = {
        "degree": 0.25,
        "betweenness": 0.35,
        "pagerank": 0.25,
        "community": 0.15,
    }

    def __init__(
        self,
        centrality_engine: CentralityEngine,
        community_detector: CommunityDetector,
        weights: Optional[Dict[str, float]] = None,
    ):
        self.centrality = centrality_engine
        self.communities = community_detector
        self.weights = weights or dict(self.DEFAULT_WEIGHTS)
        self._score_cache: Optional[Dict[str, float]] = None

    def calculate_influence_scores(self, force_refresh: bool = False) -> Dict[str, float]:
        """Calculates normalized 0-100 influence scores for all nodes in the graph."""
        if not force_refresh and self._score_cache is not None:
            return dict(self._score_cache)

        deg_dict = self.centrality.get_degree_centrality()
        bet_dict = self.centrality.get_betweenness_centrality(use_footprint=True)
        pr_dict = self.centrality.get_pagerank()

        max_deg = max(deg_dict.values()) if deg_dict else 1.0
        max_bet = max(bet_dict.values()) if bet_dict else 1.0
        max_pr = max(pr_dict.values()) if pr_dict else 1.0

        scores: Dict[str, float] = {}

        w_deg = self.weights.get("degree", 0.25)
        w_bet = self.weights.get("betweenness", 0.35)
        w_pr = self.weights.get("pagerank", 0.25)
        w_comm = self.weights.get("community", 0.15)

        for node_id in deg_dict.keys():
            # Normalized component scores [0, 100]
            s_deg = (deg_dict.get(node_id, 0.0) / max_deg) * 100.0 if max_deg > 0 else 0.0
            s_bet = (bet_dict.get(node_id, 0.0) / max_bet) * 100.0 if max_bet > 0 else 0.0
            s_pr = (pr_dict.get(node_id, 0.0) / max_pr) * 100.0 if max_pr > 0 else 0.0

            # Community boundary factor
            connected_comms = self.communities.get_node_connected_communities(node_id)
            connected_cases = self.communities.get_node_cases(node_id)
            comm_count = max(len(connected_comms), len(connected_cases))

            if comm_count >= 3:
                s_comm = 100.0
            elif comm_count == 2:
                s_comm = 65.0
            elif comm_count == 1:
                s_comm = 25.0
            else:
                s_comm = 0.0

            raw_score = (w_deg * s_deg) + (w_bet * s_bet) + (w_pr * s_pr) + (w_comm * s_comm)
            scores[node_id] = round(min(max(raw_score, 0.0), 100.0), 1)

        self._score_cache = scores
        return dict(scores)

    def get_node_influence_score(self, node_id: str) -> float:
        """Returns the 0-100 influence score for a specific entity."""
        if self._score_cache is None:
            self.calculate_influence_scores()
        return self._score_cache.get(node_id, 0.0)

    def calculate_broker_score(self, node_id: str) -> float:
        """
        Calculates an intelligence-calibrated Broker Score (0-100).
        Rewards cross-community and cross-case bridging, articulation point cut-vertex status,
        and covert proxy asset operation.
        """
        connected_comms = self.communities.get_node_connected_communities(node_id)
        connected_cases = self.communities.get_node_cases(node_id)
        comm_span = max(len(connected_comms), len(connected_cases))

        # 1. Base community bridging score
        if comm_span >= 3:
            base_score = 80.0
        elif comm_span == 2:
            base_score = 65.0
        else:
            base_score = 30.0

        # 2. Articulation point (cut-vertex) structural bottleneck bonus
        g = self.centrality.analysis_graph
        try:
            is_cut_vertex = node_id in nx.articulation_points(g)
        except Exception:
            is_cut_vertex = False
        cut_bonus = 10.0 if is_cut_vertex else 0.0

        # 3. Covert proxy infrastructure bonus (operates via burner phones and proxy accounts)
        proxy_types = set()
        for nbr in g.neighbors(node_id):
            nbr_type = self.centrality._multigraph.nodes.get(nbr, {}).get("type", "")
            if nbr_type in ("PHONE", "ACCOUNT"):
                proxy_types.add(nbr_type)

        # Dual-domain bridge bonus (controls both communication and financial channels)
        if len(proxy_types) >= 2:
            proxy_bonus = 4.0
        elif len(proxy_types) == 1:
            proxy_bonus = 2.0
        else:
            proxy_bonus = 0.0

        # 4. Total broker score
        total_score = base_score + cut_bonus + proxy_bonus
        if len(proxy_types) < 2 and total_score >= 94.0:
            total_score = 88.0  # Reserve 90+ tier for dual-domain communication+financial brokers

        return round(min(max(total_score, 0.0), 100.0), 1)
