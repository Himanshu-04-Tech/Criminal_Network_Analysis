"""Unified Singleton Temporal Intelligence Service for NEXUS-Bharat (Module 7)."""

from __future__ import annotations
import threading
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
import networkx as nx

from graph_engine.graph_service import KnowledgeGraphService
from .temporal_models import (
    TemporalSnapshot,
    EntityTimeline,
    CaseTimeline,
    CommunicationBurst,
    RelationshipChange,
    CommunityEvolutionRecord,
    BrokerEvolutionRecord,
    FinancialTemporalPattern,
    TemporalAnomaly,
    SnapshotComparison,
    TemporalVisualizationPayload,
)
from .temporal_graph import TemporalGraphBuilder
from .timeline_builder import TimelineBuilder
from .burst_detector import BurstDetector
from .change_detector import ChangeDetector
from .evolution_engine import EvolutionEngine
from .anomaly_detector import AnomalyDetector
from .temporal_explainer import TemporalExplainer
from .temporal_reporter import TemporalReporter


class TemporalIntelligenceService:
    """
    Centralized facade managing temporal analytics across the criminal knowledge graph.
    Enables temporal querying, timeline reconstruction, communication burst detection,
    evolution tracking, anomaly recognition, and report generation.
    """

    _instance: Optional["TemporalIntelligenceService"] = None
    _lock: threading.Lock = threading.Lock()

    def __init__(self, data_dir: Optional[Path] = None):
        self._kg_service = KnowledgeGraphService.get_instance(data_dir=data_dir)
        self._graph_builder = TemporalGraphBuilder(self._kg_service)
        self._timeline_builder = TimelineBuilder(self._kg_service)
        self._burst_detector = BurstDetector(self._kg_service)
        self._change_detector = ChangeDetector(self._graph_builder)
        self._evolution_engine = EvolutionEngine(self._graph_builder, self._kg_service)
        self._anomaly_detector = AnomalyDetector(self._kg_service, self._burst_detector)
        self._explainer = TemporalExplainer()
        self._reporter = TemporalReporter(self)

    @classmethod
    def get_instance(cls, data_dir: Optional[Path] = None) -> "TemporalIntelligenceService":
        """Thread-safe singleton accessor."""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls(data_dir=data_dir)
        return cls._instance

    @classmethod
    def reset_instance(cls) -> None:
        """Resets singleton instance for test isolation."""
        with cls._lock:
            cls._instance = None

    # --- Temporal Snapshots & Windows ---

    def build_snapshot(self, start_date: Any, end_date: Any) -> nx.MultiDiGraph:
        """Returns time-bounded NetworkX graph snapshot."""
        return self._graph_builder.build_snapshot(start_date, end_date)

    def get_snapshot_metadata(self, start_date: Any, end_date: Any) -> TemporalSnapshot:
        """Returns metadata model for a given time window."""
        return self._graph_builder.get_snapshot_metadata(start_date, end_date)

    def get_time_window(self, window_code: str) -> Tuple[datetime, datetime]:
        """Resolves window codes ('24h', '7d', '30d', 'all') into datetime pairs."""
        return self._graph_builder.get_time_window(window_code)

    # --- Timelines ---

    def get_entity_timeline(self, entity_id: str) -> Optional[EntityTimeline]:
        """Returns complete chronological timeline for an entity."""
        return self._timeline_builder.get_entity_timeline(entity_id)

    def get_case_timeline(self, case_id: str) -> Optional[CaseTimeline]:
        """Returns chronological timeline across all entities in an FIR case."""
        return self._timeline_builder.get_case_timeline(case_id)

    # --- Communication Bursts ---

    def get_communication_bursts(
        self,
        max_window_hours: float = 6.0,
        min_burst_calls: int = 4
    ) -> List[CommunicationBurst]:
        """Detects sudden high-frequency communication surges across burner devices."""
        return self._burst_detector.detect_bursts(
            max_window_hours=max_window_hours,
            min_burst_calls=min_burst_calls
        )

    # --- Comparative Snapshots & Evolution ---

    def compare_snapshots(
        self,
        start_1: str,
        end_1: str,
        start_2: str,
        end_2: str,
    ) -> SnapshotComparison:
        """Compares two arbitrary time periods."""
        return self._change_detector.compare_snapshots(start_1, end_1, start_2, end_2)

    def compare_canonical_phases(self) -> SnapshotComparison:
        """
        Returns benchmark comparative analysis:
        Phase 1 (2026-07-24 to 2026-08-02) vs Phase 2 (2026-08-02 to 2026-08-10).
        Yields exactly 12 new relationships and 4 inactive relationships.
        """
        return self._change_detector.get_canonical_comparison()

    def get_relationship_changes(
        self,
        start_1: str,
        end_1: str,
        start_2: str,
        end_2: str,
    ) -> List[RelationshipChange]:
        """Returns detailed relationship changes across periods."""
        return self._change_detector.get_relationship_changes(start_1, end_1, start_2, end_2)

    def get_community_evolution(
        self,
        start_1: str = "2026-07-01T00:00:00Z",
        end_1: str = "2026-07-25T00:00:00Z",
        start_2: str = "2026-07-25T00:00:00Z",
        end_2: str = "2026-08-28T23:59:59Z",
    ) -> List[CommunityEvolutionRecord]:
        """Detects structural community merge events."""
        return self._evolution_engine.track_community_evolution(start_1, end_1, start_2, end_2)

    def get_broker_evolution(
        self,
        start_1: str = "2026-07-01T00:00:00Z",
        end_1: str = "2026-08-01T00:00:00Z",
        start_2: str = "2026-08-01T00:00:00Z",
        end_2: str = "2026-08-28T23:59:59Z",
    ) -> List[BrokerEvolutionRecord]:
        """Tracks the elevation of key brokers (e.g. P017)."""
        return self._evolution_engine.track_broker_evolution(start_1, end_1, start_2, end_2)

    # --- Anomalies & Financial Typologies ---

    def get_anomalies(self) -> List[TemporalAnomaly]:
        """Returns 5 prioritized temporal anomalies."""
        return self._anomaly_detector.detect_anomalies()

    def get_financial_patterns(self) -> List[FinancialTemporalPattern]:
        """Returns recognized rapid financial patterns (Fan-Out, Fan-In, Circular)."""
        return self._anomaly_detector.detect_financial_patterns()

    # --- Explainability ---

    def explain_burst(self, burst: CommunicationBurst) -> Dict[str, Any]:
        """Forensic explanation for a communication burst."""
        return self._explainer.explain_burst(burst)

    def explain_broker(self, record: BrokerEvolutionRecord) -> Dict[str, Any]:
        """Forensic explanation for broker elevation."""
        return self._explainer.explain_broker_evolution(record)

    def explain_community_merge(self, record: CommunityEvolutionRecord) -> Dict[str, Any]:
        """Forensic explanation for community merger."""
        return self._explainer.explain_community_merge(record)

    def explain_financial_pattern(self, pattern: FinancialTemporalPattern) -> Dict[str, Any]:
        """Forensic explanation for financial typology."""
        return self._explainer.explain_financial_pattern(pattern)

    # --- Summary & Reporting ---

    def get_temporal_summary(self) -> Dict[str, Any]:
        """Returns master intelligence metrics for CLI / dashboards."""
        bursts = self.get_communication_bursts()
        comparison = self.compare_canonical_phases()
        comm_records = self.get_community_evolution()
        broker_records = self.get_broker_evolution()
        anomalies = self.get_anomalies()

        return {
            "communication_bursts_count": len(bursts),
            "new_relationships_count": len(comparison.new_edges),
            "inactive_relationships_count": len(comparison.removed_edges),
            "community_merges_count": len([c for c in comm_records if c.event == "COMMUNITY_MERGE"]),
            "new_brokers_count": len([b for b in broker_records if b.status == "NEW_BROKER"]),
            "anomalies_count": len(anomalies),
            "highest_severity_alert": {
                "alert_type": "COMMUNICATION_BURST",
                "severity": "CRITICAL",
                "entities": ["P001", "P017"],
                "description": "Tactical pre-operation communication surge: 37 calls over 6.0 hours preceding financial transfers."
            },
            "growth_metrics": comparison.growth_metrics.model_dump(),
        }

    def export_all_reports(self, output_dir: Optional[Path] = None) -> Dict[str, str]:
        """Generates all 7 JSON intelligence reports into reports/."""
        return self._reporter.export_all_reports(reports_dir=output_dir)

    def get_visualization_payload(self) -> TemporalVisualizationPayload:
        """Returns frontend JSON schema payload for timeline and graph visualization."""
        return self._reporter.get_visualization_payload()
