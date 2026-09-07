"""Validation and defensive boundary checking for graph connectivity queries."""

from __future__ import annotations
from typing import Optional, Tuple
import networkx as nx


class ConnectionValidator:
    """Validates query parameters before invoking graph traversal algorithms."""

    @staticmethod
    def validate_entity_pair(
        graph: nx.MultiDiGraph, source: str, target: str
    ) -> Tuple[bool, Optional[str]]:
        """
        Validate whether source and target are permissible for connection finding.
        Returns (is_valid, error_message).
        """
        if not source or not target:
            return False, "Source and target entity IDs must be non-empty strings."

        if source not in graph:
            return False, f"Source entity '{source}' does not exist in the knowledge graph."

        if target not in graph:
            return False, f"Target entity '{target}' does not exist in the knowledge graph."

        if source == target:
            return False, f"Source and target are the same entity ('{source}'). 0 hops required."

        return True, None

    @staticmethod
    def validate_case_pair(
        graph: nx.MultiDiGraph, case_1: str, case_2: str
    ) -> Tuple[bool, Optional[str]]:
        """
        Validate case connection search inputs.
        Returns (is_valid, error_message).
        """
        if not case_1 or not case_2:
            return False, "Both case IDs must be non-empty strings."

        if case_1 not in graph:
            return False, f"Case '{case_1}' does not exist in the knowledge graph."

        if case_2 not in graph:
            return False, f"Case '{case_2}' does not exist in the knowledge graph."

        # Verify both are indeed CASE nodes
        node_1_type = graph.nodes[case_1].get("type")
        node_2_type = graph.nodes[case_2].get("type")

        if node_1_type != "CASE":
            return False, f"Node '{case_1}' is of type '{node_1_type}', expected 'CASE'."

        if node_2_type != "CASE":
            return False, f"Node '{case_2}' is of type '{node_2_type}', expected 'CASE'."

        if case_1 == case_2:
            return False, f"Cannot search cross-case bridge between identical case '{case_1}'."

        return True, None
