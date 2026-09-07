"""Singleton KnowledgeGraphService providing centralized graph access for downstream intelligence modules."""

from __future__ import annotations
import threading
from pathlib import Path
from typing import Any, Dict, List, Optional
import networkx as nx

from graph_engine.models import (
    NodeModel,
    EdgeModel,
    GraphStatistics,
    IntegrityReport,
)
from graph_engine.graph_builder import KnowledgeGraphBuilder
from graph_engine.graph_queries import GraphQueryEngine
from graph_engine.graph_statistics import GraphStatisticsCalculator


class KnowledgeGraphService:
    """
    Singleton service managing in-memory Knowledge Graph lifecycle.
    Designed for seamless integration with downstream modules:
    Module 3 (Hidden Connection Finder), Module 4 (Role Intelligence),
    Module 5 (Cross-Case Intelligence), Module 6 (Case Fusion),
    Module 7 (Temporal Analysis), Module 8 (Graph Diff), Module 9 (Pattern Detection).
    """

    _instance: Optional["KnowledgeGraphService"] = None
    _lock: threading.Lock = threading.Lock()

    def __init__(self, data_dir: Optional[Path] = None):
        self.data_dir = data_dir
        self.builder = KnowledgeGraphBuilder(data_dir)
        self.query_engine: Optional[GraphQueryEngine] = None
        self.stats_calculator: Optional[GraphStatisticsCalculator] = None
        self.last_integrity_report: Optional[IntegrityReport] = None
        self._is_loaded: bool = False

    @classmethod
    def get_instance(cls, data_dir: Optional[Path] = None) -> "KnowledgeGraphService":
        """Thread-safe singleton accessor."""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls(data_dir=data_dir)
        return cls._instance

    @classmethod
    def reset_instance(cls) -> None:
        """Reset the singleton instance (primarily for isolated test fixtures)."""
        with cls._lock:
            cls._instance = None

    def load_graph(self, force_reload: bool = False) -> nx.MultiDiGraph:
        """Load and index the Knowledge Graph if not already loaded, or when forced."""
        if not self._is_loaded or force_reload:
            graph, report = self.builder.build_graph()
            self.query_engine = GraphQueryEngine(self.builder)
            self.stats_calculator = GraphStatisticsCalculator(self.builder)
            self.last_integrity_report = report
            self._is_loaded = True

        return self.builder.graph

    def reload_graph(self) -> nx.MultiDiGraph:
        """Force re-reading dataset files and rebuilding the graph."""
        return self.load_graph(force_reload=True)

    def get_graph(self) -> nx.MultiDiGraph:
        """Get the underlying NetworkX MultiDiGraph instance."""
        if not self._is_loaded:
            self.load_graph()
        return self.builder.graph

    def get_queries(self) -> GraphQueryEngine:
        """Access the indexed query engine."""
        if not self._is_loaded or self.query_engine is None:
            self.load_graph()
        assert self.query_engine is not None
        return self.query_engine

    def get_statistics(self) -> GraphStatistics:
        """Compute and return graph summary statistics."""
        if not self._is_loaded or self.stats_calculator is None:
            self.load_graph()
        assert self.stats_calculator is not None
        return self.stats_calculator.compute_statistics()

    def get_integrity_report(self) -> IntegrityReport:
        """Return the latest graph integrity audit report."""
        if not self._is_loaded or self.last_integrity_report is None:
            self.load_graph()
        assert self.last_integrity_report is not None
        return self.last_integrity_report

    def export_all(self, export_dir: Optional[Path] = None) -> Dict[str, Path]:
        """Export graph to GraphML, GEXF, and JSON into target directory."""
        if not self._is_loaded:
            self.load_graph()

        if export_dir is None:
            current_file = Path(__file__).resolve()
            export_dir = current_file.parent.parent / "exports"

        export_dir.mkdir(parents=True, exist_ok=True)

        return {
            "graphml": self.builder.export_graphml(export_dir / "graph.graphml"),
            "gexf": self.builder.export_gexf(export_dir / "graph.gexf"),
            "json": self.builder.export_json(export_dir / "graph.json"),
        }

    # --- Convenience Proxy Query Methods ---

    def get_node(self, node_id: str) -> Optional[NodeModel]:
        return self.get_queries().get_node(node_id)

    def get_neighbors(self, node_id: str, direction: str = "both") -> List[NodeModel]:
        return self.get_queries().get_neighbors(node_id, direction=direction)

    def get_relationships(self, node_id: str, direction: str = "both") -> List[EdgeModel]:
        return self.get_queries().get_relationships(node_id, direction=direction)

    def get_case_entities(self, case_id: str) -> List[NodeModel]:
        return self.get_queries().get_case_entities(case_id)

    def get_case_relationships(self, case_id: str) -> List[EdgeModel]:
        return self.get_queries().get_case_relationships(case_id)

    def get_entities_by_type(self, entity_type: str) -> List[NodeModel]:
        return self.get_queries().get_entities_by_type(entity_type)

    def get_edges_by_type(self, edge_type: str) -> List[EdgeModel]:
        return self.get_queries().get_edges_by_type(edge_type)

    def node_exists(self, node_id: str) -> bool:
        return self.get_queries().node_exists(node_id)

    def edge_exists(self, edge_id: str) -> bool:
        return self.get_queries().edge_exists(edge_id)
