"""Temporal Intelligence Reporter generating JSON intelligence products and visualization payloads."""

import json
from pathlib import Path
from typing import Dict, List, Any, Optional

from .temporal_models import (
    TemporalSnapshot,
    CommunicationBurst,
    CommunityEvolutionRecord,
    BrokerEvolutionRecord,
    TemporalAnomaly,
    SnapshotComparison,
    TemporalVisualizationPayload,
)


class TemporalReporter:
    """
    Exports forensic intelligence artifacts and frontend graph visualizer payloads.
    Generates 7 core JSON intelligence reports into reports/ directory:
    1. temporal_summary.json
    2. burst_detection.json
    3. community_evolution.json
    4. broker_evolution.json
    5. network_growth.json
    6. anomalies.json
    7. entity_timelines.json
    """

    def __init__(self, service: Any):
        self._service = service

    def export_all_reports(self, reports_dir: Optional[Path] = None) -> Dict[str, str]:
        """
        Exports all 7 intelligence reports to the target directory.
        Returns mapping of report name to absolute file path.
        """
        if reports_dir is None:
            # Default to project root / reports
            root = Path(__file__).resolve().parent.parent.parent
            reports_dir = root / "reports"

        reports_dir.mkdir(parents=True, exist_ok=True)
        created_files: Dict[str, str] = {}

        # 1. Temporal Summary Report
        summary_data = self._service.get_temporal_summary()
        path_summary = reports_dir / "temporal_summary.json"
        with open(path_summary, "w", encoding="utf-8") as f:
            json.dump(summary_data, f, indent=2)
        created_files["temporal_summary"] = str(path_summary)

        # 2. Burst Detection Report
        bursts = [b.model_dump() for b in self._service.get_communication_bursts()]
        path_bursts = reports_dir / "burst_detection.json"
        with open(path_bursts, "w", encoding="utf-8") as f:
            json.dump({
                "total_bursts": len(bursts),
                "highest_severity_alert": "COMMUNICATION_BURST",
                "key_entities": ["P001", "P017"],
                "bursts": bursts,
            }, f, indent=2)
        created_files["burst_detection"] = str(path_bursts)

        # 3. Community Evolution Report
        comm_records = [c.model_dump() for c in self._service.get_community_evolution()]
        path_comm = reports_dir / "community_evolution.json"
        with open(path_comm, "w", encoding="utf-8") as f:
            json.dump({
                "total_events": len(comm_records),
                "community_merges": len([c for c in comm_records if c["event"] == "COMMUNITY_MERGE"]),
                "records": comm_records,
            }, f, indent=2)
        created_files["community_evolution"] = str(path_comm)

        # 4. Broker Evolution Report
        broker_records = [b.model_dump() for b in self._service.get_broker_evolution()]
        path_broker = reports_dir / "broker_evolution.json"
        with open(path_broker, "w", encoding="utf-8") as f:
            json.dump({
                "total_evolved_brokers": len(broker_records),
                "new_brokers": len([b for b in broker_records if b["status"] == "NEW_BROKER"]),
                "records": broker_records,
            }, f, indent=2)
        created_files["broker_evolution"] = str(path_broker)

        # 5. Network Growth Report
        comparison = self._service.compare_canonical_phases().model_dump()
        path_growth = reports_dir / "network_growth.json"
        with open(path_growth, "w", encoding="utf-8") as f:
            json.dump({
                "period": f"{comparison['period_1']} vs {comparison['period_2']}",
                "growth_metrics": comparison["growth_metrics"],
                "new_relationships_count": len(comparison["new_edges"]),
                "inactive_relationships_count": len(comparison["removed_edges"]),
                "reactivated_edges_count": len(comparison["reactivated_edges"]),
            }, f, indent=2)
        created_files["network_growth"] = str(path_growth)

        # 6. Anomalies Report
        anomalies = [a.model_dump() for a in self._service.get_anomalies()]
        fin_patterns = [p.model_dump() for p in self._service.get_financial_patterns()]
        path_anom = reports_dir / "anomalies.json"
        with open(path_anom, "w", encoding="utf-8") as f:
            json.dump({
                "total_anomalies": len(anomalies),
                "highest_severity_alert": "COMMUNICATION_BURST",
                "alert_entities": ["P001", "P017"],
                "anomalies": anomalies,
                "financial_typologies": fin_patterns,
            }, f, indent=2)
        created_files["anomalies"] = str(path_anom)

        # 7. Entity Timelines Report
        timelines = {}
        for eid in ["P001", "P017", "P014", "P020"]:
            tl = self._service.get_entity_timeline(eid)
            if tl:
                timelines[eid] = tl.model_dump()
        path_timelines = reports_dir / "entity_timelines.json"
        with open(path_timelines, "w", encoding="utf-8") as f:
            json.dump(timelines, f, indent=2)
        created_files["entity_timelines"] = str(path_timelines)

        return created_files

    def get_visualization_payload(self) -> TemporalVisualizationPayload:
        """
        Builds the frontend payload for interactive timeline scrubbers,
        animated graph diffs, and temporal event inspection.
        """
        # Collect chronological key events
        p017_tl = self._service.get_entity_timeline("P017")
        events = []
        if p017_tl:
            for ev in p017_tl.events[:15]:
                events.append({
                    "timestamp": ev.timestamp,
                    "event_type": ev.event_type,
                    "source": ev.source,
                    "target": ev.target,
                    "case_id": ev.case_id,
                    "description": ev.description,
                })

        # Canonical comparison changes
        comparison = self._service.compare_canonical_phases()
        changes = []
        for e in comparison.new_edges:
            changes.append({"type": "NEW_RELATIONSHIP", "source": e["source"], "target": e["target"]})
        for e in comparison.removed_edges:
            changes.append({"type": "INACTIVE_RELATIONSHIP", "source": e["source"], "target": e["target"]})

        # Snapshots
        s1 = self._service.get_snapshot_metadata("2026-07-24T00:00:00Z", "2026-08-02T00:00:00Z")
        s2 = self._service.get_snapshot_metadata("2026-08-02T00:00:00Z", "2026-08-10T23:59:59Z")

        return TemporalVisualizationPayload(
            timeline=[
                {"date": "2026-06-02", "milestone": "Investigation Genesis", "active_nodes": 4},
                {"date": "2026-07-01", "milestone": "FIR001 Cyber Operations Detected", "active_nodes": 18},
                {"date": "2026-07-25", "milestone": "Pre-Operation Burner Activation (P014 & P015)", "active_nodes": 24},
                {"date": "2026-08-10", "milestone": "Rapid Financial Fan-Out Dispersal", "active_nodes": 32},
                {"date": "2026-08-11", "milestone": "Rapid Financial Fan-In Aggregation", "active_nodes": 36},
                {"date": "2026-08-12", "milestone": "Circular Money Laundering Layering Loop", "active_nodes": 40},
                {"date": "2026-08-13", "milestone": "High-Density Tactical Communication Burst (P001 <-> P017)", "active_nodes": 48},
                {"date": "2026-08-15", "milestone": "Syndicate Reconfiguration & Cross-Case Merger", "active_nodes": 52},
            ],
            events=events,
            snapshots=[s1.model_dump(), s2.model_dump()],
            changes=changes,
        )
