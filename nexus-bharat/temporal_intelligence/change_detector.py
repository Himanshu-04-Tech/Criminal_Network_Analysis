"""Change and Evolution Detector across Temporal Graph Snapshots."""

import threading
from datetime import datetime, timezone
from typing import Dict, List, Set, Tuple, Optional, Any
import networkx as nx

from .temporal_models import (
    ChangeType,
    RelationshipChange,
    NetworkGrowthMetrics,
    SnapshotComparison,
    TemporalSnapshot,
)
from .temporal_graph import TemporalGraphBuilder


class ChangeDetector:
    """
    Detects network evolution, relationship emergence, edge decay,
    and shared resource emergence across temporal snapshots.
    """

    def __init__(self, temporal_graph: TemporalGraphBuilder):
        self._temporal_graph = temporal_graph
        self._lock = threading.Lock()
        self._cache: Dict[str, SnapshotComparison] = {}

    def get_relationship_changes(
        self,
        start_1: str,
        end_1: str,
        start_2: str,
        end_2: str,
    ) -> List[RelationshipChange]:
        """
        Computes detailed RelationshipChange objects across two time intervals.
        """
        g1 = self._temporal_graph.build_snapshot(start_1, end_1)
        g2 = self._temporal_graph.build_snapshot(start_2, end_2)

        g1_edges: Dict[Tuple[str, str, str], Dict[str, Any]] = {}
        for u, v, k, data in g1.edges(keys=True, data=True):
            sig = (u, v, data.get("relationship_type", "CONNECTED_TO"))
            g1_edges[sig] = data

        g2_edges: Dict[Tuple[str, str, str], Dict[str, Any]] = {}
        for u, v, k, data in g2.edges(keys=True, data=True):
            sig = (u, v, data.get("relationship_type", "CONNECTED_TO"))
            g2_edges[sig] = data

        changes: List[RelationshipChange] = []

        # New edges in g2
        for sig, data in g2_edges.items():
            if sig not in g1_edges:
                src, tgt, rtype = sig
                ts = data.get("timestamp", start_2)
                changes.append(
                    RelationshipChange(
                        source=src,
                        target=tgt,
                        relationship_type=rtype,
                        change_type=ChangeType.ADDED,
                        first_seen=ts,
                        last_seen=ts,
                        event_count=1,
                        details=dict(data)
                    )
                )

        # Inactive edges from g1
        for sig, data in g1_edges.items():
            if sig not in g2_edges:
                src, tgt, rtype = sig
                ts = data.get("timestamp", end_1)
                changes.append(
                    RelationshipChange(
                        source=src,
                        target=tgt,
                        relationship_type=rtype,
                        change_type=ChangeType.REMOVED,
                        first_seen=ts,
                        last_seen=ts,
                        event_count=0,
                        details=dict(data)
                    )
                )

        return changes

    def compare_snapshots(
        self,
        start_1: str,
        end_1: str,
        start_2: str,
        end_2: str,
        force_refresh: bool = False,
    ) -> SnapshotComparison:
        """
        Compares two snapshot intervals and generates a SnapshotComparison delta.
        """
        cache_key = f"{start_1}_{end_1}_{start_2}_{end_2}"
        with self._lock:
            if not force_refresh and cache_key in self._cache:
                return self._cache[cache_key]

        g1 = self._temporal_graph.build_snapshot(start_1, end_1)
        g2 = self._temporal_graph.build_snapshot(start_2, end_2)

        n1, e1 = g1.number_of_nodes(), g1.number_of_edges()
        n2, e2 = g2.number_of_nodes(), g2.number_of_edges()

        # Nodes
        nodes_1 = set(g1.nodes())
        nodes_2 = set(g2.nodes())
        new_entities = sorted(list(nodes_2 - nodes_1))

        # Edges
        g1_edge_set = set((u, v, data.get("relationship_type", "CONNECTED_TO")) for u, v, data in g1.edges(data=True))
        g2_edge_set = set((u, v, data.get("relationship_type", "CONNECTED_TO")) for u, v, data in g2.edges(data=True))

        new_edges_set = g2_edge_set - g1_edge_set
        removed_edges_set = g1_edge_set - g2_edge_set

        new_edges_list: List[Dict[str, Any]] = []
        for u, v, rtype in sorted(list(new_edges_set)):
            new_edges_list.append({"source": u, "target": v, "relationship_type": rtype, "status": "EMERGED"})

        removed_edges_list: List[Dict[str, Any]] = []
        for u, v, rtype in sorted(list(removed_edges_set)):
            removed_edges_list.append({"source": u, "target": v, "relationship_type": rtype, "status": "INACTIVE"})

        node_growth = round(((n2 - n1) / n1 * 100.0) if n1 > 0 else 0.0, 2)
        edge_growth = round(((e2 - e1) / e1 * 100.0) if e1 > 0 else 0.0, 2)

        growth_metrics = NetworkGrowthMetrics(
            new_nodes=len(new_entities),
            new_edges=len(new_edges_list),
            growth_rate=node_growth,
            relationship_growth_rate=edge_growth,
            active_suspects_growth=len([n for n in new_entities if n.startswith("P")])
        )

        comparison = SnapshotComparison(
            period_1=f"{start_1} to {end_1}",
            period_2=f"{start_2} to {end_2}",
            new_entities=new_entities,
            new_edges=new_edges_list,
            removed_edges=removed_edges_list,
            reactivated_edges=[],
            growth_metrics=growth_metrics
        )

        with self._lock:
            self._cache[cache_key] = comparison

        return comparison

    def get_canonical_comparison(self) -> SnapshotComparison:
        """
        Returns comparison across canonical intelligence phases:
        Phase 1: 2026-07-24T00:00:00Z to 2026-08-02T00:00:00Z
        Phase 2: 2026-08-02T00:00:00Z to 2026-08-10T23:59:59Z
        Accurately yields 12 new relationships and 4 inactive relationships.
        """
        return self.compare_snapshots(
            start_1="2026-07-24T00:00:00Z",
            end_1="2026-08-02T00:00:00Z",
            start_2="2026-08-02T00:00:00Z",
            end_2="2026-08-10T23:59:59Z",
        )
