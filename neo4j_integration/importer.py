"""Idempotent dataset importer populating Neo4j from Module 1 canonical JSON files."""

from __future__ import annotations
import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from neo4j import Session
from rich.console import Console
from rich.table import Table

from neo4j_integration.config import Neo4jConfig, get_neo4j_config
from neo4j_integration.driver import get_driver, verify_connectivity
from neo4j_integration.constraints import setup_schema
from neo4j_integration.models import (
    Neo4jLabel,
    ENTITY_TYPE_TO_LABEL,
    Neo4jCaseRecord,
    Neo4jEvidenceRecord,
    Neo4jNodeRecord,
    Neo4jRelationshipRecord,
)

console = Console()

# Expected benchmark counts from Module 1
EXPECTED_COUNTS = {
    "persons": 35,
    "phones": 45,
    "accounts": 20,
    "vehicles": 10,
    "locations": 10,
    "organizations": 6,
    "cases": 10,
    "total_graph_nodes": 136,  # 126 entities + 10 cases
    "relationships": 225,
    "evidence": 225,
}


class Neo4jDatasetImporter:
    """
    Orchestrates the 11-step safe, idempotent import pipeline from JSON files into Neo4j.
    Ensures complete preservation of provenance, attributes, and relationships.
    """

    def __init__(
        self,
        data_dir: Optional[Path] = None,
        config: Optional[Neo4jConfig] = None,
    ):
        self.config = config or get_neo4j_config()
        self.data_dir = self._resolve_data_dir(data_dir)

    def _resolve_data_dir(self, explicit_path: Optional[Path]) -> Path:
        """Locate directory containing canonical JSON files."""
        if explicit_path and explicit_path.is_dir():
            return explicit_path

        current_file = Path(__file__).resolve()
        candidates = [
            Path("output"),
            Path("nexus-bharat/output"),
            current_file.parent.parent / "output",
            current_file.parent.parent / "nexus-bharat" / "output",
        ]
        for cand in candidates:
            if cand.is_dir() and (cand / "entities.json").is_file():
                return cand.resolve()

        raise FileNotFoundError(
            f"Could not locate Module 1 dataset files. Checked: {[str(c) for c in candidates]}"
        )

    def load_json_files(self) -> Dict[str, List[Dict[str, Any]]]:
        """Read cases, evidence, entities, and relationships JSON files."""
        files = {
            "cases": self.data_dir / "cases.json",
            "evidence": self.data_dir / "evidence.json",
            "entities": self.data_dir / "entities.json",
            "relationships": self.data_dir / "relationships.json",
        }
        data: Dict[str, List[Dict[str, Any]]] = {}
        for key, filepath in files.items():
            if not filepath.exists():
                raise FileNotFoundError(f"Required dataset file missing: {filepath}")
            with open(filepath, "r", encoding="utf-8") as f:
                data[key] = json.load(f)
        return data

    def import_cases(self, session: Session, cases: List[Dict[str, Any]]) -> int:
        """Import Case nodes idempotently."""
        query = """
        UNWIND $batch AS item
        MERGE (c:Case {id: item.id})
        SET c.title = item.title,
            c.name = item.title,
            c.status = item.status,
            c.created_at = item.created_at,
            c.type = 'CASE'
        RETURN count(c) AS cnt
        """
        batch = [
            Neo4jCaseRecord(
                id=c["id"],
                title=c["title"],
                status=c["status"],
                created_at=c["created_at"],
            ).to_properties()
            for c in cases
        ]
        session.run(query, batch=batch)
        return len(batch)

    def import_evidence(self, session: Session, evidence_list: List[Dict[str, Any]]) -> int:
        """Import Evidence provenance nodes idempotently."""
        query = """
        UNWIND $batch AS item
        MERGE (e:Evidence {id: item.id})
        SET e.case_id = item.case_id,
            e.source_file = item.source_file,
            e.timestamp = item.timestamp,
            e.confidence = item.confidence,
            e.type = 'EVIDENCE',
            e.name = item.name
        RETURN count(e) AS cnt
        """
        batch = [
            Neo4jEvidenceRecord(
                id=ev["id"],
                case_id=ev["case_id"],
                source_file=ev["source_file"],
                timestamp=ev["timestamp"],
                confidence=ev.get("confidence", 1.0),
                description=ev.get("description"),
            ).to_properties()
            for ev in evidence_list
        ]
        session.run(query, batch=batch)
        return len(batch)

    def import_entities(self, session: Session, entities: List[Dict[str, Any]]) -> int:
        """Import Entity nodes with specific labels and preserved attributes."""
        # Group entities by label for batch UNWIND queries
        by_label: Dict[str, List[Dict[str, Any]]] = {}
        for ent in entities:
            ent_type = ent["type"].upper()
            label = ENTITY_TYPE_TO_LABEL.get(ent_type, Neo4jLabel.PERSON).value
            props = {
                "id": ent["id"],
                "name": ent["name"],
                "type": ent["type"],
                "created_at": ent["created_at"],
                "props": ent.get("attributes", {}),
            }
            by_label.setdefault(label, []).append(props)

        total_imported = 0
        for label, batch in by_label.items():
            query = f"""
            UNWIND $batch AS item
            MERGE (n:{label} {{id: item.id}})
            SET n:Entity,
                n.name = item.name,
                n.type = item.type,
                n.created_at = item.created_at,
                n += item.props
            RETURN count(n) AS cnt
            """
            session.run(query, batch=batch)
            total_imported += len(batch)

        return total_imported

    def import_relationships(self, session: Session, relationships: List[Dict[str, Any]]) -> int:
        """Import directed relationships connecting nodes idempotently."""
        by_type: Dict[str, List[Dict[str, Any]]] = {}
        for rel in relationships:
            rel_type = rel["relationship_type"].upper()
            rel_rec = Neo4jRelationshipRecord(
                relationship_id=rel["id"],
                source=rel["source"],
                target=rel["target"],
                relationship_type=rel_type,
                case_id=rel["case_id"],
                timestamp=rel["timestamp"],
                confidence=rel.get("confidence", 1.0),
                status=rel.get("status", "SOURCE_SUPPORTED"),
                evidence_id=rel["evidence_id"],
            )
            item = rel_rec.to_properties()
            item["source"] = rel["source"]
            item["target"] = rel["target"]
            item["relationship_type"] = rel_type
            by_type.setdefault(rel_type, []).append(item)

        total_imported = 0
        for rel_type, batch in by_type.items():
            query = f"""
            UNWIND $batch AS item
            MATCH (s {{id: item.source}})
            MATCH (t {{id: item.target}})
            MERGE (s)-[r:{rel_type} {{relationship_id: item.relationship_id}}]->(t)
            SET r.case_id = item.case_id,
                r.timestamp = item.timestamp,
                r.confidence = item.confidence,
                r.status = item.status,
                r.evidence_id = item.evidence_id,
                r.relationship_type = item.relationship_type
            RETURN count(r) AS cnt
            """
            session.run(query, batch=batch)
            total_imported += len(batch)

        return total_imported

    def run_integrity_checks(self, session: Session) -> Dict[str, Any]:
        """Perform graph validation and audit database counts."""
        label_counts_query = """
        CALL () {
            MATCH (n:Person) RETURN 'persons' AS label, count(n) AS count
            UNION ALL
            MATCH (n:Phone) RETURN 'phones' AS label, count(n) AS count
            UNION ALL
            MATCH (n:Account) RETURN 'accounts' AS label, count(n) AS count
            UNION ALL
            MATCH (n:Vehicle) RETURN 'vehicles' AS label, count(n) AS count
            UNION ALL
            MATCH (n:Location) RETURN 'locations' AS label, count(n) AS count
            UNION ALL
            MATCH (n:Organization) RETURN 'organizations' AS label, count(n) AS count
            UNION ALL
            MATCH (n:Case) RETURN 'cases' AS label, count(n) AS count
            UNION ALL
            MATCH (n:Evidence) RETURN 'evidence' AS label, count(n) AS count
        }
        RETURN label, count
        """
        counts = {r["label"]: r["count"] for r in session.run(label_counts_query).data()}

        # Total relationships
        rel_cnt = session.run("MATCH ()-[r]->() RETURN count(r) AS count").single()["count"]
        counts["relationships"] = rel_cnt

        # Calculate total investigation graph nodes (excluding Evidence)
        counts["total_graph_nodes"] = (
            counts.get("persons", 0)
            + counts.get("phones", 0)
            + counts.get("accounts", 0)
            + counts.get("vehicles", 0)
            + counts.get("locations", 0)
            + counts.get("organizations", 0)
            + counts.get("cases", 0)
        )

        # Integrity checks
        dangling_rels = session.run("""
            MATCH (s)-[r]->(t)
            WHERE s.id IS NULL OR t.id IS NULL
            RETURN count(r) AS cnt
        """).single()["cnt"]

        unlinked_evidence = session.run("""
            MATCH ()-[r]->()
            WHERE r.evidence_id IS NOT NULL
            AND NOT EXISTS { MATCH (e:Evidence {id: r.evidence_id}) }
            RETURN count(r) AS cnt
        """).single()["cnt"]

        passed = (
            counts["persons"] == EXPECTED_COUNTS["persons"]
            and counts["phones"] == EXPECTED_COUNTS["phones"]
            and counts["accounts"] == EXPECTED_COUNTS["accounts"]
            and counts["vehicles"] == EXPECTED_COUNTS["vehicles"]
            and counts["locations"] == EXPECTED_COUNTS["locations"]
            and counts["organizations"] == EXPECTED_COUNTS["organizations"]
            and counts["cases"] == EXPECTED_COUNTS["cases"]
            and counts["total_graph_nodes"] == EXPECTED_COUNTS["total_graph_nodes"]
            and counts["relationships"] == EXPECTED_COUNTS["relationships"]
            and dangling_rels == 0
            and unlinked_evidence == 0
        )

        return {
            "counts": counts,
            "dangling_relationships": dangling_rels,
            "unlinked_evidence": unlinked_evidence,
            "passed": passed,
        }

    def run_import(self) -> Dict[str, Any]:
        """Execute full 11-step import workflow."""
        # 1. Connect
        driver = get_driver(self.config)

        # 2. Verify connectivity
        ok, msg = verify_connectivity(self.config)
        if not ok:
            raise ConnectionError(f"Cannot connect to Neo4j: {msg}")

        raw_data = self.load_json_files()

        with driver.session(database=self.config.database) as session:
            # 3 & 4. Schema setup (constraints & indexes)
            schema_info = setup_schema(session)

            # 5. Cases
            cases_imported = self.import_cases(session, raw_data["cases"])

            # 6. Evidence
            evidence_imported = self.import_evidence(session, raw_data["evidence"])

            # 7. Entities
            entities_imported = self.import_entities(session, raw_data["entities"])

            # 8. Relationships
            rels_imported = self.import_relationships(session, raw_data["relationships"])

            # 9 & 10. Integrity check
            audit = self.run_integrity_checks(session)

        # 11. Summary
        audit["schema"] = schema_info
        audit["cases_imported"] = cases_imported
        audit["evidence_imported"] = evidence_imported
        audit["entities_imported"] = entities_imported
        audit["relationships_imported"] = rels_imported
        return audit

    def print_summary(self, audit: Dict[str, Any]) -> None:
        """Render a clean summary report."""
        counts = audit["counts"]
        table = Table(title="NEXUS-Bharat Neo4j Database State", show_header=True)
        table.add_column("Category", style="cyan", width=20)
        table.add_column("Expected", style="dim", justify="right", width=12)
        table.add_column("Actual", style="green", justify="right", width=12)
        table.add_column("Status", justify="center", width=10)

        metrics = [
            ("Persons", EXPECTED_COUNTS["persons"], counts.get("persons", 0)),
            ("Phones", EXPECTED_COUNTS["phones"], counts.get("phones", 0)),
            ("Accounts", EXPECTED_COUNTS["accounts"], counts.get("accounts", 0)),
            ("Vehicles", EXPECTED_COUNTS["vehicles"], counts.get("vehicles", 0)),
            ("Locations", EXPECTED_COUNTS["locations"], counts.get("locations", 0)),
            ("Organizations", EXPECTED_COUNTS["organizations"], counts.get("organizations", 0)),
            ("Cases", EXPECTED_COUNTS["cases"], counts.get("cases", 0)),
            ("Total Graph Nodes", EXPECTED_COUNTS["total_graph_nodes"], counts.get("total_graph_nodes", 0)),
            ("Relationships", EXPECTED_COUNTS["relationships"], counts.get("relationships", 0)),
            ("Evidence Records", EXPECTED_COUNTS["evidence"], counts.get("evidence", 0)),
        ]

        for label, exp, act in metrics:
            match = "PASS" if exp == act else "FAIL"
            color = "green" if exp == act else "red"
            table.add_row(label, str(exp), str(act), f"[{color}]{match}[/{color}]")

        console.print(table)
