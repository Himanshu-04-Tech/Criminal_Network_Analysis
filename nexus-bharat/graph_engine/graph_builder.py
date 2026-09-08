"""Graph Builder constructing NetworkX MultiDiGraph with in-memory indexing and export support."""

from __future__ import annotations
import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple
import networkx as nx

from graph_engine.models import (
    NodeModel,
    EdgeModel,
    EvidenceModel,
    CaseModel,
    IntegrityReport,
)
from graph_engine.graph_loader import DatasetLoader
from graph_engine.graph_validator import GraphValidator


class KnowledgeGraphBuilder:
    """Builds and indexes a NetworkX MultiDiGraph from investigation dataset models."""

    def __init__(self, data_dir: Optional[Path] = None):
        self.loader = DatasetLoader(data_dir)
        self.graph = nx.MultiDiGraph()

        # High-performance secondary memory indexes for O(1) queries
        self.node_index: Dict[str, NodeModel] = {}
        self.type_index: Dict[str, Set[str]] = {}
        self.case_entities_index: Dict[str, Set[str]] = {}
        self.case_relationships_index: Dict[str, List[EdgeModel]] = {}
        self.edge_id_index: Dict[str, Tuple[str, str, str]] = {}
        self.edge_type_index: Dict[str, List[EdgeModel]] = {}

        self.evidence_index: Dict[str, EvidenceModel] = {}
        self.case_index: Dict[str, CaseModel] = {}

    def build_graph(self) -> Tuple[nx.MultiDiGraph, IntegrityReport]:
        """
        Execute 6-step build pipeline:
        Step 1: Load entities, cases, evidence, and relationships.
        Step 2: Validate dataset integrity before graph insertion.
        Step 3: Create nodes and attach domain attributes.
        Step 4: Create directed edges with evidence foreign keys.
        Step 5: Build secondary in-memory query indexes.
        Step 6: Verify graph integrity and produce audit report.
        """
        # Step 1: Load
        nodes, edges, evidence, cases = self.loader.load_models()

        # Step 2: Validate
        GraphValidator.validate_pre_construction(nodes, edges, evidence, cases)

        # Clear existing graph and indexes
        self.graph.clear()
        self.node_index.clear()
        self.type_index.clear()
        self.case_entities_index.clear()
        self.case_relationships_index.clear()
        self.edge_id_index.clear()
        self.edge_type_index.clear()
        self.evidence_index.clear()
        self.case_index.clear()

        # Index Evidence & Cases
        for ev in evidence:
            self.evidence_index[ev.id] = ev
        for c in cases:
            self.case_index[c.id] = c
            self.case_entities_index.setdefault(c.id, set())
            self.case_relationships_index.setdefault(c.id, [])

        # Step 3: Create Nodes with all attributes preserved
        for node in nodes:
            node_attrs = {
                "id": node.id,
                "type": node.type,
                "name": node.name,
                "created_at": node.created_at,
                "attributes": node.attributes,
                **node.attributes  # Flatten top-level for convenience while preserving nested
            }
            self.graph.add_node(node.id, **node_attrs)

            # Secondary indexing
            self.node_index[node.id] = node
            self.type_index.setdefault(node.type, set()).add(node.id)

        # Step 4 & 5: Create Directed Edges and build indexes
        for edge in edges:
            edge_attrs = {
                "relationship_id": edge.relationship_id,
                "relationship_type": edge.relationship_type,
                "case_id": edge.case_id,
                "timestamp": edge.timestamp,
                "confidence": edge.confidence,
                "evidence_id": edge.evidence_id,
                "attributes": edge.attributes,
                **edge.attributes
            }
            # Key edge by its unique relationship_id for MultiDiGraph
            self.graph.add_edge(
                edge.source,
                edge.target,
                key=edge.relationship_id,
                **edge_attrs
            )

            # Secondary indexing
            self.edge_id_index[edge.relationship_id] = (edge.source, edge.target, edge.relationship_id)
            self.edge_type_index.setdefault(edge.relationship_type, []).append(edge)

            # Case indexing
            self.case_relationships_index.setdefault(edge.case_id, []).append(edge)
            self.case_entities_index.setdefault(edge.case_id, set()).add(edge.source)
            self.case_entities_index.setdefault(edge.case_id, set()).add(edge.target)

        # Step 6: Audit Integrity
        report = GraphValidator.audit_graph(self.graph)
        return self.graph, report

    def populate_from_graph(self, graph: nx.MultiDiGraph) -> Tuple[nx.MultiDiGraph, IntegrityReport]:
        """Index an externally supplied MultiDiGraph (e.g., from Neo4j GraphAdapter)."""
        self.graph = graph
        self.node_index.clear()
        self.type_index.clear()
        self.case_entities_index.clear()
        self.case_relationships_index.clear()
        self.edge_id_index.clear()
        self.edge_type_index.clear()

        for node_id, data in graph.nodes(data=True):
            node_type = data.get("type", "UNKNOWN")
            node_name = data.get("name", node_id)
            created_at = data.get("created_at", "")
            attrs = data.get("attributes", {})
            node = NodeModel(
                id=node_id,
                type=node_type,
                name=node_name,
                created_at=created_at,
                attributes=attrs,
            )
            self.node_index[node_id] = node
            self.type_index.setdefault(node_type, set()).add(node_id)
            if node_type == "CASE":
                self.case_index[node_id] = CaseModel(
                    id=node_id,
                    title=node_name,
                    status=attrs.get("status", "OPEN"),
                    created_at=created_at,
                )
                self.case_entities_index.setdefault(node_id, set())
                self.case_relationships_index.setdefault(node_id, [])

        for u, v, key, data in graph.edges(keys=True, data=True):
            rel_id = data.get("relationship_id", key)
            rel_type = data.get("relationship_type", "RELATED_TO")
            case_id = data.get("case_id", "")
            timestamp = data.get("timestamp", "")
            confidence = float(data.get("confidence", 1.0))
            evidence_id = data.get("evidence_id", "")
            attrs = data.get("attributes", {})

            edge = EdgeModel(
                relationship_id=rel_id,
                source=u,
                target=v,
                relationship_type=rel_type,
                case_id=case_id,
                timestamp=timestamp,
                confidence=confidence,
                evidence_id=evidence_id,
                attributes=attrs,
            )
            self.edge_id_index[rel_id] = (u, v, key)
            self.edge_type_index.setdefault(rel_type, []).append(edge)
            if case_id:
                self.case_relationships_index.setdefault(case_id, []).append(edge)
                self.case_entities_index.setdefault(case_id, set()).add(u)
                self.case_entities_index.setdefault(case_id, set()).add(v)

        report = GraphValidator.audit_graph(self.graph)
        return self.graph, report

    # --- Export Capabilities ---

    def _prepare_export_graph(self) -> nx.MultiDiGraph:
        """Create a sanitized copy of the graph with flattened scalar attributes for GraphML/GEXF."""
        export_graph = nx.MultiDiGraph()
        for n, d in self.graph.nodes(data=True):
            clean_d = {}
            for k, v in d.items():
                if isinstance(v, (dict, list)):
                    clean_d[k] = json.dumps(v, ensure_ascii=False)
                elif v is None:
                    clean_d[k] = ""
                else:
                    clean_d[k] = v
            export_graph.add_node(n, **clean_d)

        for u, v, key, d in self.graph.edges(keys=True, data=True):
            clean_d = {}
            for k, val in d.items():
                if isinstance(val, (dict, list)):
                    clean_d[k] = json.dumps(val, ensure_ascii=False)
                elif val is None:
                    clean_d[k] = ""
                else:
                    clean_d[k] = val
            export_graph.add_edge(u, v, key=str(key), **clean_d)

        return export_graph

    def export_graphml(self, filepath: Path) -> Path:
        """Export graph to GraphML format for Gephi and cytoscape visualization."""
        filepath.parent.mkdir(parents=True, exist_ok=True)
        export_g = self._prepare_export_graph()
        nx.write_graphml(export_g, str(filepath))
        return filepath

    def export_gexf(self, filepath: Path) -> Path:
        """Export graph to GEXF format (Gephi standard)."""
        filepath.parent.mkdir(parents=True, exist_ok=True)
        export_g = self._prepare_export_graph()
        nx.write_gexf(export_g, str(filepath))
        return filepath

    def export_json(self, filepath: Path) -> Path:
        """Export graph to clean node-link JSON format."""
        filepath.parent.mkdir(parents=True, exist_ok=True)
        data = nx.node_link_data(self.graph, edges="links")
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return filepath
