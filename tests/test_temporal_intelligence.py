"""Comprehensive unit and integration test suite for NEXUS-Bharat Temporal Intelligence Engine (Module 7)."""

import sys
import json
from pathlib import Path
import pytest
import networkx as nx

root_dir = Path(__file__).resolve().parent.parent
nexus_bharat = root_dir / "nexus-bharat"
if str(nexus_bharat) not in sys.path:
    sys.path.insert(0, str(nexus_bharat))

from graph_engine.graph_service import KnowledgeGraphService
from temporal_intelligence.temporal_models import (
    AnomalySeverity,
    ChangeType,
    TemporalSnapshot,
    CommunicationBurst,
    RelationshipChange,
    CommunityEvolutionRecord,
    BrokerEvolutionRecord,
    FinancialTemporalPattern,
    TemporalAnomaly,
    SnapshotComparison,
    TemporalVisualizationPayload,
)
from temporal_intelligence.temporal_graph import TemporalGraphBuilder
from temporal_intelligence.timeline_builder import TimelineBuilder
from temporal_intelligence.burst_detector import BurstDetector
from temporal_intelligence.change_detector import ChangeDetector
from temporal_intelligence.evolution_engine import EvolutionEngine
from temporal_intelligence.anomaly_detector import AnomalyDetector
from temporal_intelligence.temporal_explainer import TemporalExplainer
from temporal_intelligence.temporal_reporter import TemporalReporter
from temporal_intelligence.temporal_service import TemporalIntelligenceService


@pytest.fixture(scope="module")
def kg_service():
    """Initializes KnowledgeGraphService singleton."""
    return KnowledgeGraphService.get_instance()


@pytest.fixture(scope="module")
def temporal_builder(kg_service):
    """Initializes TemporalGraphBuilder."""
    return TemporalGraphBuilder(kg_service)


@pytest.fixture(scope="module")
def temporal_service():
    """Initializes TemporalIntelligenceService singleton."""
    return TemporalIntelligenceService.get_instance()


class TestTemporalGraphBuilder:
    """Tests temporal graph snapshot construction and relative time window parsing."""

    def test_earliest_and_latest_timestamps(self, temporal_builder):
        earliest = temporal_builder.earliest_timestamp
        latest = temporal_builder.latest_timestamp
        assert earliest is not None
        assert latest is not None
        assert earliest < latest
        assert earliest.year == 2026
        assert latest.year == 2026

    def test_get_time_window_presets(self, temporal_builder):
        for preset in ["24h", "7d", "30d", "90d", "all"]:
            start_dt, end_dt = temporal_builder.get_time_window(preset)
            assert start_dt <= end_dt
            assert end_dt == temporal_builder.latest_timestamp

    def test_build_snapshot_filtering(self, temporal_builder):
        # Full snapshot
        g_all = temporal_builder.build_snapshot("2026-06-01T00:00:00Z", "2026-08-30T23:59:59Z")
        assert g_all.number_of_nodes() > 0
        assert g_all.number_of_edges() > 0

        # Narrow snapshot
        g_narrow = temporal_builder.build_snapshot("2026-08-10T00:00:00Z", "2026-08-12T23:59:59Z")
        assert 0 < g_narrow.number_of_edges() < g_all.number_of_edges()

    def test_get_snapshot_metadata(self, temporal_builder):
        meta = temporal_builder.get_snapshot_metadata("2026-08-01T00:00:00Z", "2026-08-15T23:59:59Z")
        assert isinstance(meta, TemporalSnapshot)
        assert meta.nodes_count > 0
        assert meta.edges_count > 0
        assert len(meta.active_entities) == meta.nodes_count


class TestTimelineBuilder:
    """Tests entity and FIR case chronological event history reconstruction."""

    def test_entity_timeline_chronological_order(self, kg_service):
        tb = TimelineBuilder(kg_service)
        timeline = tb.get_entity_timeline("P017")
        assert timeline is not None
        assert timeline.entity_id == "P017"
        assert timeline.total_events > 0

        # Verify strict ascending timestamp order
        timestamps = [ev.timestamp for ev in timeline.events]
        assert timestamps == sorted(timestamps)

    def test_entity_timeline_non_existent(self, kg_service):
        tb = TimelineBuilder(kg_service)
        timeline = tb.get_entity_timeline("NON_EXISTENT_ID")
        assert timeline.total_events == 0
        assert timeline.events == []

    def test_case_timeline(self, kg_service):
        tb = TimelineBuilder(kg_service)
        case_tl = tb.get_case_timeline("FIR001")
        assert case_tl is not None
        assert case_tl.case_id == "FIR001"
        assert case_tl.total_events > 0
        timestamps = [ev.timestamp for ev in case_tl.events]
        assert timestamps == sorted(timestamps)


class TestBurstDetector:
    """Tests sliding window communication burst detection."""

    def test_detect_bursts_count_and_severity(self, kg_service):
        bd = BurstDetector(kg_service)
        bursts = bd.detect_bursts(max_window_hours=6.0, min_burst_calls=4)
        assert len(bursts) == 3

        # First burst must be CRITICAL between P001 and P017
        top_burst = bursts[0]
        assert top_burst.severity == AnomalySeverity.CRITICAL
        assert "P001" in top_burst.entities
        assert "P017" in top_burst.entities
        assert top_burst.call_count >= 30
        assert top_burst.calls_per_hour > 0

    def test_phone_owner_resolution(self, kg_service):
        bd = BurstDetector(kg_service)
        owner = bd._resolve_phone_owner("PH020")
        assert owner in ("P020", "P021", None) or str(owner).startswith("P")


class TestChangeDetector:
    """Tests comparative snapshot diffing, new/inactive edge detection, and canonical benchmark."""

    def test_canonical_comparison(self, temporal_builder):
        cd = ChangeDetector(temporal_builder)
        comp = cd.get_canonical_comparison()
        assert isinstance(comp, SnapshotComparison)
        # Verify prompt benchmark metrics
        assert len(comp.new_edges) == 12
        assert len(comp.removed_edges) == 4
        assert comp.growth_metrics.new_edges == 12
        assert comp.growth_metrics.growth_rate > 0

    def test_arbitrary_window_comparison(self, temporal_builder):
        cd = ChangeDetector(temporal_builder)
        comp = cd.compare_snapshots(
            start_1="2026-07-01T00:00:00Z",
            end_1="2026-07-15T00:00:00Z",
            start_2="2026-07-15T00:00:00Z",
            end_2="2026-07-31T23:59:59Z",
        )
        assert isinstance(comp, SnapshotComparison)
        assert comp.growth_metrics is not None


class TestEvolutionEngine:
    """Tests community merges and broker elevation tracking."""

    def test_track_community_evolution(self, temporal_builder, kg_service):
        ee = EvolutionEngine(temporal_builder, kg_service)
        records = ee.track_community_evolution()
        assert len(records) >= 1
        merge_records = [r for r in records if r.event == "COMMUNITY_MERGE"]
        assert len(merge_records) == 1
        assert "Syndicate consolidation" in merge_records[0].summary or "merg" in merge_records[0].summary.lower()

    def test_track_broker_evolution(self, temporal_builder, kg_service):
        ee = EvolutionEngine(temporal_builder, kg_service)
        brokers = ee.track_broker_evolution()
        assert len(brokers) >= 1
        p017_broker = next((b for b in brokers if b.entity_id == "P017"), None)
        assert p017_broker is not None
        assert p017_broker.old_score == 61.0
        assert p017_broker.new_score == 92.0
        assert p017_broker.score_delta == 31.0
        assert p017_broker.status == "NEW_BROKER"


class TestAnomalyDetector:
    """Tests financial pattern typologies and prioritized anomaly generation."""

    def test_detect_financial_patterns(self, kg_service):
        ad = AnomalyDetector(kg_service)
        patterns = ad.detect_financial_patterns()
        assert len(patterns) == 3

        types = [p.pattern_type for p in patterns]
        assert "FINANCIAL_FAN_OUT" in types
        assert "FINANCIAL_FAN_IN" in types
        assert "CIRCULAR_TRANSACTIONS" in types

        # Validate Fan-Out timing
        fan_out = next(p for p in patterns if p.pattern_type == "FINANCIAL_FAN_OUT")
        assert fan_out.source_account == "ACC001"
        assert len(fan_out.target_accounts) >= 4
        assert fan_out.duration_minutes <= 60.0

        # Validate Fan-In timing
        fan_in = next(p for p in patterns if p.pattern_type == "FINANCIAL_FAN_IN")
        assert fan_in.target_accounts == ["ACC009"]
        assert len(fan_in.involved_accounts) >= 4
        assert fan_in.duration_minutes <= 30.0

        # Validate Circular Loop
        circular = next(p for p in patterns if p.pattern_type == "CIRCULAR_TRANSACTIONS")
        assert len(circular.involved_accounts) == 3
        assert "ACC012" in circular.involved_accounts

    def test_detect_anomalies_total_and_prioritization(self, kg_service):
        ad = AnomalyDetector(kg_service)
        anomalies = ad.detect_anomalies()
        assert len(anomalies) == 5

        # First alert must be CRITICAL COMMUNICATION_BURST with P001 and P017
        top_alert = anomalies[0]
        assert top_alert.anomaly_type == "COMMUNICATION_BURST"
        assert top_alert.severity == AnomalySeverity.CRITICAL
        assert "P001" in top_alert.entities
        assert "P017" in top_alert.entities


class TestTemporalExplainer:
    """Tests forensic explainability engine narratives."""

    def test_explain_burst(self):
        burst = CommunicationBurst(
            burst_id="BURST_001",
            entities=["P001", "P017"],
            phone_entities=["PH001", "PH016"],
            call_count=37,
            start_time="2026-08-13T10:00:00Z",
            end_time="2026-08-13T16:00:00Z",
            duration_hours=6.0,
            calls_per_hour=6.2,
            severity=AnomalySeverity.CRITICAL,
        )
        explanation = TemporalExplainer.explain_burst(burst)
        assert "forensic_narrative" in explanation
        assert "investigative_recommendations" in explanation
        assert len(explanation["investigative_recommendations"]) >= 3

    def test_explain_broker(self):
        record = BrokerEvolutionRecord(
            entity_id="P017",
            entity_name="Anand Deshmukh",
            old_score=61.0,
            new_score=92.0,
            score_delta=31.0,
            status="NEW_BROKER",
        )
        explanation = TemporalExplainer.explain_broker_evolution(record)
        assert "forensic_narrative" in explanation
        assert "P017" in explanation["title"]


class TestTemporalServiceAndReports:
    """Tests TemporalIntelligenceService facade and JSON reporting."""

    def test_service_master_summary(self, temporal_service):
        summary = temporal_service.get_temporal_summary()
        assert summary["communication_bursts_count"] == 3
        assert summary["new_relationships_count"] == 12
        assert summary["inactive_relationships_count"] == 4
        assert summary["community_merges_count"] == 1
        assert summary["new_brokers_count"] == 1
        assert summary["anomalies_count"] == 5
        assert summary["highest_severity_alert"]["alert_type"] == "COMMUNICATION_BURST"
        assert summary["highest_severity_alert"]["entities"] == ["P001", "P017"]

    def test_export_all_reports(self, temporal_service, tmp_path):
        reports = temporal_service.export_all_reports(output_dir=tmp_path)
        assert len(reports) == 7

        expected_files = [
            "temporal_summary.json",
            "burst_detection.json",
            "community_evolution.json",
            "broker_evolution.json",
            "network_growth.json",
            "anomalies.json",
            "entity_timelines.json",
        ]
        for filename in expected_files:
            target_path = tmp_path / filename
            assert target_path.exists()
            assert target_path.stat().st_size > 0
            with open(target_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                assert data is not None

    def test_visualization_payload(self, temporal_service):
        payload = temporal_service.get_visualization_payload()
        assert isinstance(payload, TemporalVisualizationPayload)
        assert len(payload.timeline) > 0
        assert len(payload.events) > 0
        assert len(payload.snapshots) == 2
        assert len(payload.changes) > 0
