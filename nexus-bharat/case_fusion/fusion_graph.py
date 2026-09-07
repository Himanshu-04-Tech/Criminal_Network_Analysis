"""FusionGraph representation wrapping NetworkX MultiDiGraph with case provenance."""

from typing import Dict, List, Any, Optional, Set
import networkx as nx
from .fusion_models import FusionCaseReference


class FusionGraph:
    """
    In-memory analytical graph combining multiple FIR cases.
    Preserves node and edge attributes, while tracking entity case occurrences.
    """

    def __init__(self, fusion_id: str, case_ids: List[str]):
        self.fusion_id = fusion_id
        self.case_ids = sorted(list(set(case_ids)))
        self.graph: nx.MultiDiGraph = nx.MultiDiGraph(
            fusion_id=fusion_id,
            case_ids=self.case_ids,
        )
        # Provenance mapping: entity_id -> FusionCaseReference
        self.entity_references: Dict[str, FusionCaseReference] = {}

    def add_entity_node(self, entity_id: str, attributes: Dict[str, Any], case_id: Optional[str] = None) -> None:
        """Adds or updates an entity node, appending case occurrence provenance."""
        if entity_id not in self.graph:
            self.graph.add_node(entity_id, **attributes)
        else:
            # Update attributes defensively
            self.graph.nodes[entity_id].update(attributes)

        if case_id:
            if entity_id not in self.entity_references:
                self.entity_references[entity_id] = FusionCaseReference(
                    entity_id=entity_id,
                    appears_in=[case_id],
                    case_count=1,
                )
            else:
                ref = self.entity_references[entity_id]
                if case_id not in ref.appears_in:
                    ref.appears_in.append(case_id)
                    ref.case_count = len(ref.appears_in)

            # Keep node attributes in sync
            self.graph.nodes[entity_id]["appears_in"] = self.entity_references[entity_id].appears_in
            self.graph.nodes[entity_id]["case_count"] = self.entity_references[entity_id].case_count

    def add_relationship_edge(self, source: str, target: str, key: str, attributes: Dict[str, Any]) -> None:
        """Adds a multi-edge between nodes in the fused graph."""
        self.graph.add_edge(source, target, key=key, **attributes)

    @property
    def number_of_entities(self) -> int:
        """Returns count of non-case entity nodes."""
        return sum(1 for n, d in self.graph.nodes(data=True) if d.get("type") != "CASE")

    @property
    def number_of_relationships(self) -> int:
        """Returns total edge count in the fused graph."""
        return self.graph.number_of_edges()

    @property
    def shared_entities(self) -> List[str]:
        """Returns entity IDs that appear in 2 or more fused FIR cases."""
        return [
            eid for eid, ref in self.entity_references.items()
            if ref.case_count > 1 and self.graph.nodes.get(eid, {}).get("type") != "CASE"
        ]

    def get_entity_cases(self, entity_id: str) -> List[str]:
        """Returns list of FIR cases an entity appears in."""
        if entity_id in self.entity_references:
            return list(self.entity_references[entity_id].appears_in)
        return []

    def get_undirected(self) -> nx.Graph:
        """Returns an undirected collapsed version for topological algorithms."""
        return self.graph.to_undirected()
