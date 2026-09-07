"""Indexed query interface providing fast O(1) query capabilities over the Knowledge Graph."""

from __future__ import annotations
from typing import Any, Dict, List, Optional, Set
import networkx as nx

from graph_engine.models import (
    NodeModel,
    EdgeModel,
)
from graph_engine.graph_builder import KnowledgeGraphBuilder


class GraphQueryEngine:
    """High-performance query engine backed by in-memory secondary indexes and NetworkX."""

    def __init__(self, builder: KnowledgeGraphBuilder):
        self.builder = builder
        self.graph: nx.MultiDiGraph = builder.graph

    def node_exists(self, node_id: str) -> bool:
        """Check if a node ID exists in the knowledge graph."""
        return node_id in self.builder.node_index

    def edge_exists(self, edge_id: str) -> bool:
        """Check if a relationship UUID exists in the knowledge graph."""
        return edge_id in self.builder.edge_id_index

    def get_node(self, node_id: str) -> Optional[NodeModel]:
        """Retrieve node details by ID in O(1) time."""
        return self.builder.node_index.get(node_id)

    def get_neighbors(
        self, node_id: str, direction: str = "both"
    ) -> List[NodeModel]:
        """
        Retrieve neighbor nodes connected to node_id.
        direction options: 'out' (outgoing), 'in' (incoming), 'both' (undirected).
        """
        if not self.node_exists(node_id):
            return []

        neighbor_ids: Set[str] = set()
        dir_lower = direction.lower()

        if dir_lower in ("out", "outgoing", "both"):
            neighbor_ids.update(self.graph.successors(node_id))
        if dir_lower in ("in", "incoming", "both"):
            neighbor_ids.update(self.graph.predecessors(node_id))

        return [
            self.builder.node_index[nid]
            for nid in neighbor_ids
            if nid in self.builder.node_index
        ]

    def get_relationships(
        self, node_id: str, direction: str = "both"
    ) -> List[EdgeModel]:
        """
        Retrieve all relationship edges connected to node_id.
        direction options: 'out' (outgoing), 'in' (incoming), 'both' (all).
        """
        if not self.node_exists(node_id):
            return []

        edges: List[EdgeModel] = []
        dir_lower = direction.lower()

        raw_edges = []
        if dir_lower in ("out", "outgoing", "both"):
            raw_edges.extend(self.graph.out_edges(node_id, keys=True, data=True))
        if dir_lower in ("in", "incoming", "both"):
            raw_edges.extend(self.graph.in_edges(node_id, keys=True, data=True))

        for u, v, key, data in raw_edges:
            edges.append(EdgeModel(
                relationship_id=str(key),
                source=u,
                target=v,
                relationship_type=data.get("relationship_type", ""),
                case_id=data.get("case_id", ""),
                timestamp=data.get("timestamp", ""),
                confidence=data.get("confidence", 1.0),
                evidence_id=data.get("evidence_id", ""),
                attributes=data.get("attributes", {})
            ))

        return edges

    def get_case_entities(self, case_id: str) -> List[NodeModel]:
        """Retrieve all entity nodes associated with a specific FIR case ID in O(1) lookup."""
        entity_ids = self.builder.case_entities_index.get(case_id, set())
        return [
            self.builder.node_index[eid]
            for eid in entity_ids
            if eid in self.builder.node_index
        ]

    def get_case_relationships(self, case_id: str) -> List[EdgeModel]:
        """Retrieve all relationships associated with a specific FIR case ID in O(1) lookup."""
        return self.builder.case_relationships_index.get(case_id, [])

    def get_entities_by_type(self, entity_type: str) -> List[NodeModel]:
        """Retrieve all nodes belonging to an entity type (case-insensitive) in O(1) lookup."""
        normalized_type = entity_type.upper().strip()
        node_ids = self.builder.type_index.get(normalized_type, set())
        return [
            self.builder.node_index[nid]
            for nid in node_ids
            if nid in self.builder.node_index
        ]

    def get_edges_by_type(self, edge_type: str) -> List[EdgeModel]:
        """Retrieve all edges belonging to a relationship type (case-insensitive) in O(1) lookup."""
        normalized_type = edge_type.upper().strip()
        return self.builder.edge_type_index.get(normalized_type, [])
