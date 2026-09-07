"""Comprehensive unit and integration test suite for NEXUS-Bharat Graph Diff Engine (Module 8)."""

import sys
import json
from pathlib import Path
import pytest
import networkx as nx

root_dir = Path(__file__).resolve().parent.parent
nexus_bharat = root_dir / "nexus-bharat"
if str(nexus_bharat) not in sys.path:
    sys.path.insert(0, str(nexus_bharat))

from graph_diff.diff_models import (
    ChangeSeverity,
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
from graph_diff.snapshot_loader import SnapshotLoader
from graph_diff.entity_diff import EntityDiffEngine
from graph_diff.relationship_diff import RelationshipDiffEngine
from graph_diff.community_diff import CommunityDiffEngine
from graph_diff.broker_diff import BrokerDiffEngine
from graph_diff.path_diff import PathEvolutionEngine
from graph_diff.graph_comparator import GraphComparator
from graph_diff.diff_explainer import DiffExplainer
from graph_diff.diff_service import GraphDiffService


@pytest.fixture(scope="module")
def diff_service():
    """Initializes GraphDiffService singleton."""
    return GraphDiffService.get_instance()


@pytest.fixture(scope="module")
def snapshot_loader():
    """Initializes SnapshotLoader."""
    return SnapshotLoader()


class TestSnapshotLoader:
    """Tests loading MultiDiGraph snapshots directly from Module 7."""

    def test_load_snapshot_valid(self, snapshot_loader):
        g = snapshot_loader.load_snapshot("2026-08-01T00:00:00Z", "2026-08-15T00:00:00Z")
        assert isinstance(g, nx.MultiDiGraph)
        assert g.number_of_nodes() > 0
        assert g.number_of_edges() > 0

    def test_load_canonical_snapshots(self, snapshot_loader):
        sa, sb = snapshot_loader.load_canonical_snapshots()
        assert isinstance(sa, nx.MultiDiGraph)
        assert isinstance(sb, nx.MultiDiGraph)
        assert sa.number_of_nodes() > 0
        assert sb.number_of_nodes() > 0


class TestEntityDiff:
    """Tests entity emergence, removal, and reactivation."""

    def test_canonical_entity_diff(self, snapshot_loader):
        engine = EntityDiffEngine()
        sa, sb = snapshot_loader.load_canonical_snapshots()
        diff = engine.diff_entities(sa, sb, is_canonical=True)

        assert isinstance(diff, EntityDiff)
        assert diff.total_new == 12
        assert diff.total_removed == 2
        assert len(diff.new_entities) == 12
        assert len(diff.removed_entities) == 2
        assert len(diff.entity_details) >= 14

    def test_dynamic_entity_diff(self):
        engine = EntityDiffEngine()
        g1 = nx.MultiDiGraph()
        g1.add_node("A", type="PERSON")
        g1.add_node("B", type="PHONE")

        g2 = nx.MultiDiGraph()
        g2.add_node("B", type="PHONE")
        g2.add_node("C", type="ACCOUNT")

        diff = engine.diff_entities(g1, g2, is_canonical=False)
        assert diff.total_new == 1
        assert diff.new_entities == ["C"]
        assert diff.total_removed == 1
        assert diff.removed_entities == ["A"]


class TestRelationshipDiff:
    """Tests edge topology diffing and shared resource discovery."""

    def test_canonical_relationship_diff(self, snapshot_loader):
        engine = RelationshipDiffEngine()
        sa, sb = snapshot_loader.load_canonical_snapshots()
        diff = engine.diff_relationships(sa, sb, is_canonical=True)

        assert isinstance(diff, RelationshipDiff)
        assert diff.new_count == 31
        assert diff.removed_count == 4
        assert len(diff.new_relationships) == 31
        assert len(diff.removed_relationships) == 4
        assert diff.inactive_count == 4

    def test_canonical_shared_resources(self, snapshot_loader):
        engine = RelationshipDiffEngine()
        sa, sb = snapshot_loader.load_canonical_snapshots()
        shared = engine.diff_shared_resources(sa, sb, is_canonical=True)

        assert len(shared) >= 2
        phone_17 = next((s for s in shared if s.resource_id == "PHONE_017"), None)
        assert phone_17 is not None
        assert phone_17.new_shared_entities == 3


class TestCommunityDiff:
    """Tests community modularity shifts and syndicate consolidation."""

    def test_canonical_community_diff(self, snapshot_loader):
        engine = CommunityDiffEngine()
        sa, sb = snapshot_loader.load_canonical_snapshots()
        record = engine.diff_communities(sa, sb, is_canonical=True)

        assert isinstance(record, CommunityDiffRecord)
        assert record.event == "COMMUNITY_MERGE"
        assert record.before_count == 5
        assert record.after_count == 2
        assert len(record.affected_communities) >= 2


class TestBrokerDiff:
    """Tests betweenness centrality progression and broker elevation."""

    def test_canonical_broker_diff(self, snapshot_loader):
        engine = BrokerDiffEngine()
        sa, sb = snapshot_loader.load_canonical_snapshots()
        brokers = engine.diff_brokers(sa, sb, is_canonical=True)

        assert len(brokers) == 2
        p017 = next((b for b in brokers if b.entity_id == "P017"), None)
        assert p017 is not None
        assert p017.old_betweenness == 0.21
        assert p017.new_betweenness == 0.43
        assert p017.delta == 0.22
        assert p017.status == "NEW_BROKER"

        p020 = next((b for b in brokers if b.entity_id == "P020"), None)
        assert p020 is not None
        assert p020.old_betweenness == 0.08
        assert p020.new_betweenness == 0.29
        assert p020.status == "NEW_BROKER"


class TestPathEvolution:
    """Tests associative path transformation across snapshots."""

    def test_canonical_path_diff(self, snapshot_loader):
        engine = PathEvolutionEngine()
        sa, sb = snapshot_loader.load_canonical_snapshots()
        paths = engine.diff_paths(sa, sb, is_canonical=True)

        assert len(paths) >= 3
        # Direct P001 -> P017 -> P020 command path
        p001_p020 = next((p for p in paths if p.source == "P001" and p.target == "P020"), None)
        assert p001_p020 is not None
        assert p001_p020.status == "NEW"
        assert p001_p020.path_str == "P001 -> P017 -> P020"

        # Shortened pathway P001 -> P017
        p001_p017 = next((p for p in paths if p.source == "P001" and p.target == "P017"), None)
        assert p001_p017 is not None
        assert p001_p017.status == "SHORTENED"


class TestImpactScoringAndSeverity:
    """Tests 6-factor impact score calibration and severity classification."""

    def test_canonical_impact_score(self):
        comparator = GraphComparator()
        res = comparator.calculate_impact_score(
            new_connections=31,
            new_brokers=2,
            community_merges=1,
            new_bridges=3,
            growth_rate=118.2,
            shared_resource_count=2,
            is_canonical=True,
        )
        assert isinstance(res, ImpactScoreResult)
        assert res.impact_score == 88.0
        assert res.severity == ChangeSeverity.CRITICAL
        assert len(res.factor_breakdown) == 6
        assert len(res.reasons) >= 3


class TestDiffExplainer:
    """Tests forensic explainability engine narratives."""

    def test_explain_broker_change(self):
        record = BrokerDiffRecord(
            entity_id="P017",
            entity_name="Anand Deshmukh",
            old_betweenness=0.21,
            new_betweenness=0.43,
            delta=0.22,
            status="NEW_BROKER",
        )
        expl = DiffExplainer.explain_broker_change(record)
        assert expl["entity"] == "P017"
        assert len(expl["why_important"]) >= 3
        assert "actionable_intel" in expl

    def test_explain_community_merge(self):
        record = CommunityDiffRecord(
            before_count=5,
            after_count=2,
            event="COMMUNITY_MERGE",
            affected_communities=["C1", "C2"],
        )
        expl = DiffExplainer.explain_community_merge(record)
        assert expl["change"] == "COMMUNITY_MERGE"
        assert "actionable_intel" in expl


class TestGraphDiffServiceAndExports:
    """Tests GraphDiffService facade, canonical analysis, and JSON reports."""

    def test_get_canonical_diff_benchmark(self, diff_service):
        analysis = diff_service.get_canonical_diff()
        assert isinstance(analysis, GraphDiffAnalysis)
        assert analysis.entity_diff.total_new == 12
        assert analysis.entity_diff.total_removed == 2
        assert analysis.relationship_diff.new_count == 31
        assert analysis.relationship_diff.removed_count == 4
        assert analysis.community_diff.event == "COMMUNITY_MERGE"
        assert len([b for b in analysis.broker_diffs if b.status == "NEW_BROKER"]) == 2
        assert analysis.impact_score.impact_score == 88.0
        assert analysis.impact_score.severity == ChangeSeverity.CRITICAL

    def test_export_diff_results(self, diff_service, tmp_path):
        analysis = diff_service.get_canonical_diff()
        exported = diff_service.export_diff_results(analysis=analysis, output_dir=tmp_path)
        assert len(exported) == 7

        expected_files = [
            "graph_diff_summary.json",
            "entity_changes.json",
            "relationship_changes.json",
            "community_changes.json",
            "broker_changes.json",
            "path_changes.json",
            "impact_analysis.json",
        ]
        for filename in expected_files:
            target_file = tmp_path / filename
            assert target_file.exists()
            assert target_file.stat().st_size > 0
            with open(target_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                assert data is not None

    def test_visualization_payload(self, diff_service):
        payload = diff_service.get_visualization_payload()
        assert isinstance(payload, GraphDiffVisualizationPayload)
        assert "snapshot_id" in payload.before
        assert "snapshot_id" in payload.after
        assert len(payload.changes) > 0
        assert len(payload.communities) > 0
        assert len(payload.brokers) > 0
