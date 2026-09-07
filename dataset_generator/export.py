"""JSON exporter and summary generator for NEXUS-Bharat Synthetic Investigation Dataset."""

from __future__ import annotations
import json
from pathlib import Path
from typing import Any, Dict, List

from dataset_generator.models import (
    Entity,
    Case,
    Evidence,
    Relationship,
    DatasetSummary,
    InvestigationDataset,
)


class DatasetExporter:
    """Serializes dataset components to formatted JSON files with referential validation."""

    def __init__(self, output_dirs: List[Path]):
        self.output_dirs = output_dirs
        for out_dir in self.output_dirs:
            out_dir.mkdir(parents=True, exist_ok=True)

    def export(
        self,
        dataset: InvestigationDataset,
        hidden_broker_id: str = "P017",
        shared_phone_id: str = "PH005",
        shared_vehicle_id: str = "VEH003",
        cross_case_bridge_exists: bool = True,
    ) -> DatasetSummary:
        """Validate and write all dataset files and summary report."""

        # 1. Calculate Summary Metrics
        type_counts: Dict[str, int] = {}
        for ent in dataset.entities:
            type_counts[ent.type] = type_counts.get(ent.type, 0) + 1

        summary = DatasetSummary(
            persons=type_counts.get("PERSON", 0),
            phones=type_counts.get("PHONE", 0),
            accounts=type_counts.get("ACCOUNT", 0),
            vehicles=type_counts.get("VEHICLE", 0),
            locations=type_counts.get("LOCATION", 0),
            organizations=type_counts.get("ORGANIZATION", 0),
            cases=len(dataset.cases),
            relationships=len(dataset.relationships),
            evidence=len(dataset.evidence),
            hidden_broker=hidden_broker_id,
            shared_phone=shared_phone_id,
            shared_vehicle=shared_vehicle_id,
            cross_case_bridge_exists=cross_case_bridge_exists,
        )

        dataset.summary = summary

        # 2. Serialize objects to dictionaries
        entities_data = [ent.model_dump() for ent in dataset.entities]
        cases_data = [
            {
                "id": c.id,
                "title": c.title,
                "status": c.status,
                "created_at": c.created_at,
            }
            for c in dataset.cases
        ]
        evidence_data = [
            {
                "id": ev.id,
                "case_id": ev.case_id,
                "source_file": ev.source_file,
                "timestamp": ev.timestamp,
                "confidence": ev.confidence,
            }
            for ev in dataset.evidence
        ]
        relationships_data = [
            {
                "id": r.id,
                "source": r.source,
                "target": r.target,
                "relationship_type": r.relationship_type,
                "case_id": r.case_id,
                "timestamp": r.timestamp,
                "confidence": r.confidence,
                "evidence_id": r.evidence_id,
            }
            for r in dataset.relationships
        ]
        summary_data = summary.model_dump()

        # 3. Write out to target directories
        files_to_write = {
            "entities.json": entities_data,
            "cases.json": cases_data,
            "evidence.json": evidence_data,
            "relationships.json": relationships_data,
            "dataset_summary.json": summary_data,
        }

        for out_dir in self.output_dirs:
            for filename, data in files_to_write.items():
                filepath = out_dir / filename
                with open(filepath, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)

        return summary
