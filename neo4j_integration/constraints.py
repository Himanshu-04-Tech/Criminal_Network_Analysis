"""Schema management defining and ensuring Neo4j uniqueness constraints and indexes."""

from __future__ import annotations
from typing import Dict, List, Any, Tuple
from neo4j import Session

from neo4j_integration.models import Neo4jLabel

# Node labels requiring uniqueness constraints on property 'id'
CONSTRAINT_LABELS: List[str] = [
    Neo4jLabel.PERSON.value,
    Neo4jLabel.PHONE.value,
    Neo4jLabel.ACCOUNT.value,
    Neo4jLabel.VEHICLE.value,
    Neo4jLabel.LOCATION.value,
    Neo4jLabel.ORGANIZATION.value,
    Neo4jLabel.CASE.value,
    Neo4jLabel.EVENT.value,
    Neo4jLabel.EVIDENCE.value,
]


def create_uniqueness_constraints(session: Session) -> List[str]:
    """
    Create uniqueness constraints for all primary domain labels if they do not exist.
    Compatible with Neo4j 5.x+ Cypher syntax.
    """
    applied: List[str] = []
    for label in CONSTRAINT_LABELS:
        constraint_name = f"constraint_{label.lower()}_id_unique"
        cypher = (
            f"CREATE CONSTRAINT {constraint_name} IF NOT EXISTS "
            f"FOR (n:{label}) REQUIRE n.id IS UNIQUE"
        )
        session.run(cypher)
        applied.append(constraint_name)
    return applied


def create_indexes(session: Session) -> List[str]:
    """
    Create lookup indexes for frequently queried properties (case_id, timestamp).
    """
    indexes: List[Tuple[str, str, str]] = [
        ("index_evidence_case_id", Neo4jLabel.EVIDENCE.value, "case_id"),
        ("index_case_status", Neo4jLabel.CASE.value, "status"),
        ("index_person_city", Neo4jLabel.PERSON.value, "city"),
        ("index_phone_number", Neo4jLabel.PHONE.value, "phone_number"),
    ]
    applied: List[str] = []
    for idx_name, label, prop in indexes:
        cypher = (
            f"CREATE INDEX {idx_name} IF NOT EXISTS "
            f"FOR (n:{label}) ON (n.{prop})"
        )
        try:
            session.run(cypher)
            applied.append(idx_name)
        except Exception:
            # Fallback if specific index type syntax differs
            pass
    return applied


def setup_schema(session: Session) -> Dict[str, List[str]]:
    """Execute all constraint and index creation pipelines."""
    constraints = create_uniqueness_constraints(session)
    indexes = create_indexes(session)
    return {
        "constraints": constraints,
        "indexes": indexes,
    }


def verify_schema(session: Session) -> Dict[str, Any]:
    """Query Neo4j schema catalogs to verify existing constraints and indexes."""
    constraints_result = session.run("SHOW CONSTRAINTS").data()
    indexes_result = session.run("SHOW INDEXES").data()

    existing_constraints = [c.get("name") for c in constraints_result if "name" in c]
    existing_indexes = [i.get("name") for i in indexes_result if "name" in i]

    return {
        "constraints_count": len(constraints_result),
        "indexes_count": len(indexes_result),
        "constraints": existing_constraints,
        "indexes": existing_indexes,
    }
