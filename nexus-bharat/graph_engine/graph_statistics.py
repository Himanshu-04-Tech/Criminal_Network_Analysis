"""Graph statistics and topological metric calculator."""

from __future__ import annotations
from typing import Any, Dict
import networkx as nx

from graph_engine.models import (
    GraphStatistics,
    NodeType,
)
from graph_engine.graph_builder import KnowledgeGraphBuilder


class GraphStatisticsCalculator:
    """Computes comprehensive topological and domain statistics from the Knowledge Graph."""

    def __init__(self, builder: KnowledgeGraphBuilder):
        self.builder = builder
        self.graph: nx.MultiDiGraph = builder.graph

    def compute_statistics(self) -> GraphStatistics:
        """Calculate complete statistics bundle matching the required schema."""
        num_nodes = self.graph.number_of_nodes()
        num_edges = self.graph.number_of_edges()

        # Count nodes by type
        type_counts: Dict[str, int] = {}
        for _, data in self.graph.nodes(data=True):
            ntype = data.get("type", "UNKNOWN")
            type_counts[ntype] = type_counts.get(ntype, 0) + 1

        # Count edges by relationship type
        rel_counts: Dict[str, int] = {}
        for _, _, _, data in self.graph.edges(keys=True, data=True):
            rtype = data.get("relationship_type", "UNKNOWN")
            rel_counts[rtype] = rel_counts.get(rtype, 0) + 1

        # Graph theoretical metrics
        density = nx.density(self.graph) if num_nodes > 1 else 0.0

        in_degrees = [d for _, d in self.graph.in_degree()]
        out_degrees = [d for _, d in self.graph.out_degree()]

        avg_in = sum(in_degrees) / num_nodes if num_nodes > 0 else 0.0
        avg_out = sum(out_degrees) / num_nodes if num_nodes > 0 else 0.0

        # Weakly connected components
        undirected = self.graph.to_undirected(as_view=True)
        components = nx.number_connected_components(undirected) if num_nodes > 0 else 0

        return GraphStatistics(
            total_nodes=num_nodes,
            total_edges=num_edges,
            persons=type_counts.get(NodeType.PERSON.value, 0),
            phones=type_counts.get(NodeType.PHONE.value, 0),
            accounts=type_counts.get(NodeType.ACCOUNT.value, 0),
            vehicles=type_counts.get(NodeType.VEHICLE.value, 0),
            locations=type_counts.get(NodeType.LOCATION.value, 0),
            organizations=type_counts.get(NodeType.ORGANIZATION.value, 0),
            cases=type_counts.get(NodeType.CASE.value, 0),
            relationship_counts=rel_counts,
            density=round(density, 6),
            avg_in_degree=round(avg_in, 2),
            avg_out_degree=round(avg_out, 2),
            connected_components=components,
        )

    def to_dict(self) -> Dict[str, Any]:
        """Return statistics as clean JSON-serializable dictionary."""
        return self.compute_statistics().model_dump()
