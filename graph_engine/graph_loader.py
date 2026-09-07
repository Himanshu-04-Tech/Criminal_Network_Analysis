"""Dataset file loader with automatic directory discovery and caching."""

from __future__ import annotations
import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from graph_engine.models import (
    NodeModel,
    EdgeModel,
    CaseModel,
    EvidenceModel,
    NodeType,
)


class DatasetLoader:
    """Discovers and loads Module 1 generated JSON investigation files."""

    def __init__(self, data_dir: Optional[Path] = None):
        self.data_dir = self._resolve_data_dir(data_dir)
        self._cache: Optional[Dict[str, Any]] = None

    def _resolve_data_dir(self, explicit_path: Optional[Path]) -> Path:
        """Locate dataset output directory across common project layouts."""
        if explicit_path and explicit_path.exists():
            return explicit_path

        current_file = Path(__file__).resolve()
        candidates = [
            current_file.parent.parent / "output",          # nexus-bharat/output
            current_file.parent.parent.parent / "output",   # workspace_root/output
            Path("output"),
            Path("nexus-bharat/output"),
        ]

        for cand in candidates:
            if cand.exists() and (cand / "entities.json").exists():
                return cand.resolve()

        raise FileNotFoundError(
            f"Could not locate Module 1 dataset files. Checked candidates: {[str(c) for c in candidates]}"
        )

    def load_raw_data(self, force_reload: bool = False) -> Dict[str, List[Dict[str, Any]]]:
        """Read all JSON files from disk with memory caching."""
        if self._cache is not None and not force_reload:
            return self._cache

        files = {
            "entities": self.data_dir / "entities.json",
            "cases": self.data_dir / "cases.json",
            "evidence": self.data_dir / "evidence.json",
            "relationships": self.data_dir / "relationships.json",
        }

        raw_data: Dict[str, List[Dict[str, Any]]] = {}
        for key, filepath in files.items():
            if not filepath.exists():
                raise FileNotFoundError(f"Required dataset file missing: {filepath}")
            with open(filepath, "r", encoding="utf-8") as f:
                raw_data[key] = json.load(f)

        self._cache = raw_data
        return raw_data

    def load_models(
        self, force_reload: bool = False
    ) -> Tuple[List[NodeModel], List[EdgeModel], List[EvidenceModel], List[CaseModel]]:
        """Parse raw JSON data into typed domain models, unifying entities and cases into nodes."""
        raw = self.load_raw_data(force_reload=force_reload)

        # 1. Parse Entities as Nodes
        nodes: List[NodeModel] = []
        for ent in raw["entities"]:
            nodes.append(NodeModel(
                id=ent["id"],
                type=ent["type"],
                name=ent["name"],
                created_at=ent["created_at"],
                attributes=ent.get("attributes", {})
            ))

        # 2. Parse Cases and also represent them as first-class CASE nodes
        cases: List[CaseModel] = []
        for c in raw["cases"]:
            case_model = CaseModel(
                id=c["id"],
                title=c["title"],
                status=c["status"],
                created_at=c["created_at"]
            )
            cases.append(case_model)
            # Add as CASE node
            nodes.append(NodeModel(
                id=c["id"],
                type=NodeType.CASE.value,
                name=c["title"],
                created_at=c["created_at"],
                attributes={"status": c["status"]}
            ))

        # 3. Parse Evidence
        evidence: List[EvidenceModel] = []
        for ev in raw["evidence"]:
            evidence.append(EvidenceModel(
                id=ev["id"],
                case_id=ev["case_id"],
                source_file=ev["source_file"],
                timestamp=ev["timestamp"],
                confidence=ev.get("confidence", 1.0)
            ))

        # 4. Parse Relationships as Edges
        edges: List[EdgeModel] = []
        for r in raw["relationships"]:
            edge_id = r.get("id") or r.get("relationship_id")
            edges.append(EdgeModel(
                relationship_id=edge_id,
                source=r["source"],
                target=r["target"],
                relationship_type=r["relationship_type"],
                case_id=r["case_id"],
                timestamp=r["timestamp"],
                confidence=r.get("confidence", 1.0),
                evidence_id=r["evidence_id"],
                attributes=r.get("attributes", {})
            ))

        return nodes, edges, evidence, cases
