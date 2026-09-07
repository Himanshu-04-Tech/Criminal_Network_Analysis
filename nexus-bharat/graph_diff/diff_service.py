"""Singleton Graph Diff Service for NEXUS-Bharat (Module 8)."""

from __future__ import annotations
import json
import threading
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
import networkx as nx

from .diff_models import (
    EntityDiff,
    RelationshipDiff,
    SharedResourceDiff,
    CommunityDiffRecord,
    BrokerDiffRecord,
    PathDiffRecord,
    ImpactScoreResult,
    GraphDiffAnalysis,
    GraphDiffVisualizationPayload,
)
from .snapshot_loader import SnapshotLoader
from .entity_diff import EntityDiffEngine
from .relationship_diff import RelationshipDiffEngine
from .community_diff import CommunityDiffEngine
from .broker_diff import BrokerDiffEngine
from .path_diff import PathEvolutionEngine
from .graph_comparator import GraphComparator
from .diff_explainer import DiffExplainer


class GraphDiffService:
    """
    Centralized service facade managing structural graph differencing,
    temporal evolution analysis, and impact scoring.
    """

    _instance: Optional["GraphDiffService"] = None
    _lock: threading.Lock = threading.Lock()

    def __init__(self):
        self._loader = SnapshotLoader()
        self._entity_engine = EntityDiffEngine()
        self._rel_engine = RelationshipDiffEngine()
        self._comm_engine = CommunityDiffEngine()
        self._broker_engine = BrokerDiffEngine()
        self._path_engine = PathEvolutionEngine()
        self._comparator = GraphComparator(
            entity_engine=self._entity_engine,
            relationship_engine=self._rel_engine,
            community_engine=self._comm_engine,
            broker_engine=self._broker_engine,
            path_engine=self._path_engine,
        )
        self._explainer = DiffExplainer()

    @classmethod
    def get_instance(cls) -> "GraphDiffService":
        """Thread-safe singleton accessor."""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    @classmethod
    def reset_instance(cls) -> None:
        """Resets singleton instance for test isolation."""
        with cls._lock:
            cls._instance = None

    # --- Core Comparison APIs ---

    def compare_snapshots(
        self,
        snapshot_a: nx.MultiDiGraph,
        snapshot_b: nx.MultiDiGraph,
        label_a: str = "Snapshot A",
        label_b: str = "Snapshot B",
        is_canonical: bool = False,
    ) -> GraphDiffAnalysis:
        """Compares two arbitrary MultiDiGraph snapshots."""
        return self._comparator.compare_snapshots(
            snapshot_a=snapshot_a,
            snapshot_b=snapshot_b,
            snapshot_a_label=label_a,
            snapshot_b_label=label_b,
            is_canonical=is_canonical,
        )

    def get_canonical_diff(self) -> GraphDiffAnalysis:
        """
        Executes the canonical benchmark comparison:
        August 1-15 (Baseline) vs August 16-28 (Post-Reconfiguration).
        Yields:
        - New Entities: 12
        - Removed Entities: 2
        - New Relationships: 31
        - Removed Relationships: 4
        - Community Merges: 1
        - New Brokers: 2
        - Impact Score: 88
        - Severity: CRITICAL
        """
        snap_a, snap_b = self._loader.load_canonical_snapshots()
        return self.compare_snapshots(
            snapshot_a=snap_a,
            snapshot_b=snap_b,
            label_a="2026-08-01 -> 2026-08-15",
            label_b="2026-08-16 -> 2026-08-28",
            is_canonical=True,
        )

    # --- Fine-Grained Diff APIs ---

    def diff_entities(self, snapshot_a: nx.MultiDiGraph, snapshot_b: nx.MultiDiGraph) -> EntityDiff:
        """Computes set difference on nodes."""
        return self._entity_engine.diff_entities(snapshot_a, snapshot_b)

    def diff_relationships(self, snapshot_a: nx.MultiDiGraph, snapshot_b: nx.MultiDiGraph) -> RelationshipDiff:
        """Computes edge topology difference."""
        return self._rel_engine.diff_relationships(snapshot_a, snapshot_b)

    def diff_communities(self, snapshot_a: nx.MultiDiGraph, snapshot_b: nx.MultiDiGraph) -> CommunityDiffRecord:
        """Computes community shifts."""
        return self._comm_engine.diff_communities(snapshot_a, snapshot_b)

    def diff_brokers(self, snapshot_a: nx.MultiDiGraph, snapshot_b: nx.MultiDiGraph) -> List[BrokerDiffRecord]:
        """Detects broker elevations."""
        return self._broker_engine.diff_brokers(snapshot_a, snapshot_b)

    def diff_paths(
        self,
        snapshot_a: nx.MultiDiGraph,
        snapshot_b: nx.MultiDiGraph,
        pairs: Optional[List[Tuple[str, str]]] = None,
    ) -> List[PathDiffRecord]:
        """Calculates path evolution across suspect pairs."""
        return self._path_engine.diff_paths(snapshot_a, snapshot_b, pairs=pairs)

    def calculate_impact_score(
        self,
        new_connections: int,
        new_brokers: int,
        community_merges: int,
        new_bridges: int,
        growth_rate: float,
        shared_resource_count: int,
    ) -> ImpactScoreResult:
        """Computes 6-factor composite impact score."""
        return self._comparator.calculate_impact_score(
            new_connections=new_connections,
            new_brokers=new_brokers,
            community_merges=community_merges,
            new_bridges=new_bridges,
            growth_rate=growth_rate,
            shared_resource_count=shared_resource_count,
        )

    # --- Reporting & Visualization ---

    def generate_diff_report(self, analysis: Optional[GraphDiffAnalysis] = None) -> Dict[str, Any]:
        """Generates comprehensive report dictionary."""
        active_analysis = analysis or self.get_canonical_diff()
        return active_analysis.model_dump()

    def export_diff_results(
        self,
        analysis: Optional[GraphDiffAnalysis] = None,
        output_dir: Optional[Path] = None,
    ) -> Dict[str, str]:
        """
        Exports all 7 intelligence reports into reports/:
        1. graph_diff_summary.json
        2. entity_changes.json
        3. relationship_changes.json
        4. community_changes.json
        5. broker_changes.json
        6. path_changes.json
        7. impact_analysis.json
        """
        active_analysis = analysis or self.get_canonical_diff()

        if output_dir is None:
            root = Path(__file__).resolve().parent.parent.parent
            output_dir = root / "reports"

        output_dir.mkdir(parents=True, exist_ok=True)
        created_files: Dict[str, str] = {}

        # 1. Summary
        p_summary = output_dir / "graph_diff_summary.json"
        with open(p_summary, "w", encoding="utf-8") as f:
            json.dump(active_analysis.summary, f, indent=2)
        created_files["graph_diff_summary"] = str(p_summary)

        # 2. Entity Changes
        p_entities = output_dir / "entity_changes.json"
        with open(p_entities, "w", encoding="utf-8") as f:
            json.dump(active_analysis.entity_diff.model_dump(), f, indent=2)
        created_files["entity_changes"] = str(p_entities)

        # 3. Relationship Changes
        p_rels = output_dir / "relationship_changes.json"
        with open(p_rels, "w", encoding="utf-8") as f:
            json.dump(active_analysis.relationship_diff.model_dump(), f, indent=2)
        created_files["relationship_changes"] = str(p_rels)

        # 4. Community Changes
        p_comms = output_dir / "community_changes.json"
        with open(p_comms, "w", encoding="utf-8") as f:
            json.dump(active_analysis.community_diff.model_dump(), f, indent=2)
        created_files["community_changes"] = str(p_comms)

        # 5. Broker Changes
        p_brokers = output_dir / "broker_changes.json"
        with open(p_brokers, "w", encoding="utf-8") as f:
            json.dump([b.model_dump() for b in active_analysis.broker_diffs], f, indent=2)
        created_files["broker_changes"] = str(p_brokers)

        # 6. Path Changes
        p_paths = output_dir / "path_changes.json"
        with open(p_paths, "w", encoding="utf-8") as f:
            json.dump([p.model_dump() for p in active_analysis.path_diffs], f, indent=2)
        created_files["path_changes"] = str(p_paths)

        # 7. Impact Analysis
        p_impact = output_dir / "impact_analysis.json"
        with open(p_impact, "w", encoding="utf-8") as f:
            json.dump({
                "impact_score": active_analysis.impact_score.model_dump(),
                "density_analysis": active_analysis.density_analysis.model_dump(),
                "connectivity_analysis": active_analysis.connectivity_analysis.model_dump(),
                "network_health": active_analysis.network_health.model_dump(),
                "hidden_intelligence": active_analysis.hidden_intelligence.model_dump(),
            }, f, indent=2)
        created_files["impact_analysis"] = str(p_impact)

        return created_files

    def get_visualization_payload(
        self,
        analysis: Optional[GraphDiffAnalysis] = None,
    ) -> GraphDiffVisualizationPayload:
        """
        Generates frontend-ready graph diff payload matching:
        {
          "before": {},
          "after": {},
          "changes": [],
          "communities": [],
          "brokers": []
        }
        """
        active_analysis = analysis or self.get_canonical_diff()

        changes = []
        for r in active_analysis.relationship_diff.new_relationships:
            changes.append({
                "type": "NEW_RELATIONSHIP",
                "source": r.source,
                "target": r.target,
                "relationship": r.relationship_type,
            })
        for r in active_analysis.relationship_diff.removed_relationships:
            changes.append({
                "type": "REMOVED_RELATIONSHIP",
                "source": r.source,
                "target": r.target,
                "relationship": r.relationship_type,
            })
        for e in active_analysis.entity_diff.new_entities:
            changes.append({"type": "NEW_ENTITY", "entity_id": e})
        for e in active_analysis.entity_diff.removed_entities:
            changes.append({"type": "REMOVED_ENTITY", "entity_id": e})

        return GraphDiffVisualizationPayload(
            before={
                "snapshot_id": active_analysis.snapshot_a,
                "density": active_analysis.density_analysis.density_before,
                "components": active_analysis.connectivity_analysis.components_before,
            },
            after={
                "snapshot_id": active_analysis.snapshot_b,
                "density": active_analysis.density_analysis.density_after,
                "components": active_analysis.connectivity_analysis.components_after,
            },
            changes=changes,
            communities=[active_analysis.community_diff.model_dump()],
            brokers=[b.model_dump() for b in active_analysis.broker_diffs],
        )
