"""Multi-factor path scoring engine prioritizing investigative relevance and structural significance."""

from __future__ import annotations
import math
from typing import Any, Dict, List, Set
import networkx as nx

from graph_analytics.path_models import PathStep


class PathScorer:
    """Computes normalized [0 - 100] investigative relevance scores for graph connection paths."""

    def __init__(self, graph: nx.MultiDiGraph, broker_ids: Optional[Set[str]] = None):
        self.graph = graph
        self.broker_ids = broker_ids or {"P017"}

    def compute_score(
        self, path: List[str], steps: List[PathStep]
    ) -> float:
        """
        Evaluate path using 4-factor composite formula:
          score = length_weight + evidence_weight + bridge_weight + broker_weight
        Returns score rounded to 1 decimal place [0.0 - 100.0].
        """
        if not path or len(path) < 2:
            return 0.0

        hops = len(path) - 1

        # 1. Path Length Score (Max 40 points: shorter paths = higher score)
        # 1 hop -> 40, 2 hops -> 35, 3 hops -> 30, 4 hops -> 25, 5 hops -> 20, 6 hops -> 15
        length_score = max(5.0, 40.0 - (hops - 1) * 5.0)

        # 2. Evidence Confidence Score (Max 30 points)
        if steps:
            avg_confidence = sum(s.confidence for s in steps) / len(steps)
        else:
            avg_confidence = 1.0
        evidence_score = round(avg_confidence * 30.0, 2)

        # 3. Cross-Case Bridge Score (Max 15 points)
        # Paths spanning multiple FIR cases provide high investigative fusion value
        cases_involved = {s.case_id for s in steps if s.case_id}
        num_cases = len(cases_involved)
        if num_cases >= 3:
            bridge_score = 15.0
        elif num_cases == 2:
            bridge_score = 10.0
        elif num_cases == 1:
            bridge_score = 5.0
        else:
            bridge_score = 0.0

        # 4. Broker / High-Value Node Score (Max 15 points)
        # Bonus if recognized hidden broker or high-degree hub participates as an intermediary
        intermediaries = set(path[1:-1])  # Exclude start and target endpoints
        has_primary_broker = bool(intermediaries.intersection(self.broker_ids))

        if has_primary_broker:
            broker_score = 15.0
        else:
            # Check if any intermediary is a major communication or transaction hub
            hub_score = 0.0
            for node_id in intermediaries:
                if node_id in self.graph:
                    deg = self.graph.degree(node_id)
                    if deg >= 6:
                        hub_score = 10.0
                        break
                    elif deg >= 3:
                        hub_score = 5.0
            broker_score = hub_score

        raw_score = length_score + evidence_score + bridge_score + broker_score
        normalized_score = min(100.0, max(0.0, raw_score))
        return round(normalized_score, 1)

    def extract_bridges_and_brokers(
        self, path: List[str], steps: List[PathStep]
    ) -> Tuple[List[str], List[str]]:
        """Identify distinct cases bridged and broker nodes active along the path."""
        cases = sorted(list({s.case_id for s in steps if s.case_id}))
        intermediaries = set(path[1:-1]) if len(path) > 2 else set()
        brokers = sorted(list(intermediaries.intersection(self.broker_ids)))
        return cases, brokers
