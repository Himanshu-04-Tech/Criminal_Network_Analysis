"""Pre-construction validation layer and graph integrity verification."""

from __future__ import annotations
from typing import Any, Dict, List, Set
import networkx as nx

from graph_engine.models import (
    NodeModel,
    EdgeModel,
    CaseModel,
    EvidenceModel,
    EdgeType,
    NodeType,
    IntegrityReport,
    KnowledgeGraphValidationError,
)


class GraphValidator:
    """Validates raw dataset models before graph construction and performs graph integrity audits."""

    @staticmethod
    def validate_pre_construction(
        nodes: List[NodeModel],
        edges: List[EdgeModel],
        evidence: List[EvidenceModel],
        cases: List[CaseModel],
    ) -> None:
        """
        Comprehensive pre-construction validation:
        Checks for duplicate IDs, missing nodes, missing evidence, missing cases,
        invalid relationship types, and broken references.
        Raises KnowledgeGraphValidationError if any validation failure is found.
        """
        errors: List[str] = []

        # 1. Validate Node ID Uniqueness
        seen_node_ids: Set[str] = set()
        for node in nodes:
            if node.id in seen_node_ids:
                errors.append(f"Duplicate Node ID detected: '{node.id}' (Type: {node.type})")
            seen_node_ids.add(node.id)

        # 2. Validate Case ID Uniqueness & Existence
        seen_case_ids: Set[str] = set()
        for c in cases:
            if c.id in seen_case_ids:
                errors.append(f"Duplicate Case ID detected: '{c.id}'")
            seen_case_ids.add(c.id)

        # 3. Validate Evidence ID Uniqueness & Valid Case Association
        seen_evidence_ids: Set[str] = set()
        for ev in evidence:
            if ev.id in seen_evidence_ids:
                errors.append(f"Duplicate Evidence ID detected: '{ev.id}'")
            seen_evidence_ids.add(ev.id)
            if ev.case_id not in seen_case_ids:
                errors.append(
                    f"Evidence '{ev.id}' references non-existent Case ID '{ev.case_id}'"
                )

        # 4. Validate Edge Relationship Types & Referential Integrity
        seen_edge_ids: Set[str] = set()
        valid_rel_types = {e.value for e in EdgeType}

        for edge in edges:
            # Duplicate Edge ID check
            if edge.relationship_id in seen_edge_ids:
                errors.append(f"Duplicate Relationship ID detected: '{edge.relationship_id}'")
            seen_edge_ids.add(edge.relationship_id)

            # Valid Relationship Type
            if edge.relationship_type not in valid_rel_types:
                errors.append(
                    f"Relationship '{edge.relationship_id}' has invalid type '{edge.relationship_type}'. Allowed: {valid_rel_types}"
                )

            # Source Node Existence
            if edge.source not in seen_node_ids:
                errors.append(
                    f"Relationship '{edge.relationship_id}' references missing source Node '{edge.source}'"
                )

            # Target Node Existence
            if edge.target not in seen_node_ids:
                errors.append(
                    f"Relationship '{edge.relationship_id}' references missing target Node '{edge.target}'"
                )

            # Case Reference Existence
            if edge.case_id not in seen_case_ids:
                errors.append(
                    f"Relationship '{edge.relationship_id}' references missing Case ID '{edge.case_id}'"
                )

            # Evidence Reference Existence
            if edge.evidence_id not in seen_evidence_ids:
                errors.append(
                    f"Relationship '{edge.relationship_id}' references missing Evidence ID '{edge.evidence_id}'"
                )

        if errors:
            summary_msg = f"Knowledge Graph Pre-Construction Validation Failed with {len(errors)} error(s)."
            raise KnowledgeGraphValidationError(message=summary_msg, errors=errors)

    @staticmethod
    def find_orphan_nodes(graph: nx.MultiDiGraph) -> List[str]:
        """Identify nodes with degree 0 (no incoming or outgoing relationships)."""
        return [node for node in graph.nodes if graph.degree(node) == 0]

    @staticmethod
    def find_disconnected_components(graph: nx.MultiDiGraph) -> List[List[str]]:
        """Find weakly connected components in the graph."""
        undirected_view = graph.to_undirected(as_view=True)
        components = [list(comp) for comp in nx.connected_components(undirected_view)]
        return components

    @staticmethod
    def find_duplicate_entities(nodes: List[NodeModel]) -> List[str]:
        """Detect duplicate entity IDs in a node list."""
        seen = set()
        duplicates = []
        for n in nodes:
            if n.id in seen:
                duplicates.append(n.id)
            seen.add(n.id)
        return duplicates

    @staticmethod
    def find_invalid_edges(graph: nx.MultiDiGraph) -> List[Dict[str, Any]]:
        """Scan graph edges for missing critical attributes."""
        invalid_edges = []
        for u, v, key, data in graph.edges(keys=True, data=True):
            missing = []
            for req in ("relationship_id", "relationship_type", "case_id", "timestamp", "evidence_id"):
                if req not in data or not data[req]:
                    missing.append(req)
            if missing:
                invalid_edges.append({
                    "source": u,
                    "target": v,
                    "edge_key": key,
                    "missing_attributes": missing
                })
        return invalid_edges

    @classmethod
    def audit_graph(cls, graph: nx.MultiDiGraph) -> IntegrityReport:
        """Execute full post-construction structural audit and return IntegrityReport."""
        orphans = cls.find_orphan_nodes(graph)
        components = cls.find_disconnected_components(graph)
        invalid_edges = cls.find_invalid_edges(graph)

        is_valid = len(invalid_edges) == 0

        summary = (
            f"Graph Integrity Audit: Nodes={graph.number_of_nodes()}, "
            f"Edges={graph.number_of_edges()}, Components={len(components)}, "
            f"Orphans={len(orphans)}, Invalid Edges={len(invalid_edges)}"
        )

        return IntegrityReport(
            is_valid=is_valid,
            orphan_nodes=orphans,
            disconnected_components=components,
            invalid_edges=invalid_edges,
            summary=summary
        )
