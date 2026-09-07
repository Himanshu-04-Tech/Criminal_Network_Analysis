"""Data models and validation schemas for NEXUS-Bharat Synthetic Investigation Dataset."""

from __future__ import annotations
from enum import Enum
import uuid
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator, model_validator


class EntityType(str, Enum):
    """Supported entity categories in the NEXUS-Bharat Knowledge Graph."""
    PERSON = "PERSON"
    PHONE = "PHONE"
    ACCOUNT = "ACCOUNT"
    VEHICLE = "VEHICLE"
    LOCATION = "LOCATION"
    ORGANIZATION = "ORGANIZATION"


class CaseStatus(str, Enum):
    """Lifecycle statuses for FIR criminal cases."""
    OPEN = "OPEN"
    UNDER_INVESTIGATION = "UNDER_INVESTIGATION"
    CLOSED = "CLOSED"


class RelationshipType(str, Enum):
    """Semantic relationship types connecting graph entities."""
    USES = "USES"
    CONTACTED = "CONTACTED"
    OWNS = "OWNS"
    TRANSFERRED_TO = "TRANSFERRED_TO"
    VISITED = "VISITED"
    OBSERVED_AT = "OBSERVED_AT"
    MEMBER_OF = "MEMBER_OF"
    MENTIONED_IN = "MENTIONED_IN"


class Entity(BaseModel):
    """Core entity node representation in the investigation knowledge graph."""
    id: str = Field(..., description="Unique entity identifier (e.g., P001, PH001, ACC001)")
    type: str = Field(..., description="Entity category")
    name: str = Field(..., description="Descriptive or real-world name of the entity")
    created_at: str = Field(..., description="ISO-8601 formatted creation/first observed timestamp")
    attributes: Dict[str, Any] = Field(
        default_factory=dict,
        description="Domain-specific attributes (IMEI, IFSC, vehicle reg, coordinates, etc.)"
    )

    @field_validator("type")
    @classmethod
    def validate_type(cls, value: str) -> str:
        valid_types = {e.value for e in EntityType}
        if value not in valid_types:
            raise ValueError(f"Invalid entity type '{value}'. Allowed: {valid_types}")
        return value


class Case(BaseModel):
    """First Information Report (FIR) criminal investigation case."""
    id: str = Field(..., description="Unique FIR identifier (e.g., FIR001)")
    title: str = Field(..., description="Case title/summary of registered crime")
    status: str = Field(..., description="Investigation status (OPEN, UNDER_INVESTIGATION, CLOSED)")
    created_at: str = Field(..., description="ISO-8601 registration timestamp")

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        valid_statuses = {s.value for s in CaseStatus}
        if value not in valid_statuses:
            raise ValueError(f"Invalid case status '{value}'. Allowed: {valid_statuses}")
        return value


class Evidence(BaseModel):
    """Evidentiary record establishing factual basis for graph relationships."""
    id: str = Field(..., description="Unique evidence record ID (e.g., E001)")
    case_id: str = Field(..., description="FIR case this evidence belongs to")
    source_file: str = Field(..., description="Forensic source file (e.g., cdr_001.csv, bank_stmt.pdf)")
    timestamp: str = Field(..., description="ISO-8601 timestamp when evidence was logged/extracted")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="Evidentiary confidence score [0.0 - 1.0]")
    description: Optional[str] = Field(default=None, description="Brief description of forensic artifact")


class Relationship(BaseModel):
    """Directed edge connecting two entities, corroborated by an evidence record."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique relationship UUID")
    source: str = Field(..., description="Entity ID of origin node")
    target: str = Field(..., description="Entity ID of destination node")
    relationship_type: str = Field(..., description="Semantic edge type")
    case_id: str = Field(..., description="Associated FIR case ID")
    timestamp: str = Field(..., description="ISO-8601 occurrence timestamp")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="Confidence score [0.0 - 1.0]")
    evidence_id: str = Field(..., description="Foreign key referencing supporting Evidence record")

    @field_validator("relationship_type")
    @classmethod
    def validate_rel_type(cls, value: str) -> str:
        valid_rels = {r.value for r in RelationshipType}
        if value not in valid_rels:
            raise ValueError(f"Invalid relationship type '{value}'. Allowed: {valid_rels}")
        return value


class DatasetSummary(BaseModel):
    """Audit summary report verifying dataset metrics and intelligence patterns."""
    persons: int
    phones: int
    accounts: int
    vehicles: int
    locations: int
    organizations: int
    cases: int
    relationships: int
    evidence: int
    hidden_broker: str
    shared_phone: str
    shared_vehicle: str
    cross_case_bridge_exists: bool


class InvestigationDataset(BaseModel):
    """Comprehensive container model enforcing total referential integrity across the graph."""
    entities: List[Entity]
    cases: List[Case]
    evidence: List[Evidence]
    relationships: List[Relationship]
    summary: Optional[DatasetSummary] = None

    @model_validator(mode="after")
    def validate_integrity(self) -> "InvestigationDataset":
        # 1. Uniqueness of entity IDs
        entity_ids = set()
        type_counts: Dict[str, int] = {}
        for ent in self.entities:
            if ent.id in entity_ids:
                raise ValueError(f"Duplicate entity ID detected: '{ent.id}'")
            entity_ids.add(ent.id)
            type_counts[ent.type] = type_counts.get(ent.type, 0) + 1

        # Check required entity counts
        expected_counts = {
            EntityType.PERSON.value: 35,
            EntityType.PHONE.value: 45,
            EntityType.ACCOUNT.value: 20,
            EntityType.VEHICLE.value: 10,
            EntityType.LOCATION.value: 10,
            EntityType.ORGANIZATION.value: 6,
        }
        for etype, expected in expected_counts.items():
            actual = type_counts.get(etype, 0)
            if actual != expected:
                raise ValueError(f"Entity count mismatch for {etype}: expected {expected}, got {actual}")

        # 2. Uniqueness of case IDs
        case_ids = set()
        for c in self.cases:
            if c.id in case_ids:
                raise ValueError(f"Duplicate case ID detected: '{c.id}'")
            case_ids.add(c.id)

        if len(self.cases) != 10:
            raise ValueError(f"Expected exactly 10 FIR cases, got {len(self.cases)}")

        # 3. Uniqueness of evidence IDs and valid case references
        evidence_ids = set()
        for ev in self.evidence:
            if ev.id in evidence_ids:
                raise ValueError(f"Duplicate evidence ID detected: '{ev.id}'")
            evidence_ids.add(ev.id)
            if ev.case_id not in case_ids:
                raise ValueError(f"Evidence '{ev.id}' references non-existent case '{ev.case_id}'")

        if len(self.evidence) < 150:
            raise ValueError(f"Evidence count must be at least 150, got {len(self.evidence)}")

        # 4. Uniqueness of relationship IDs and referential integrity
        rel_ids = set()
        for rel in self.relationships:
            if rel.id in rel_ids:
                raise ValueError(f"Duplicate relationship ID detected: '{rel.id}'")
            rel_ids.add(rel.id)

            if rel.source not in entity_ids and rel.source not in case_ids:
                raise ValueError(f"Relationship '{rel.id}' source '{rel.source}' not found in entities or cases")

            if rel.target not in entity_ids and rel.target not in case_ids:
                raise ValueError(f"Relationship '{rel.id}' target '{rel.target}' not found in entities or cases")

            if rel.case_id not in case_ids:
                raise ValueError(f"Relationship '{rel.id}' case_id '{rel.case_id}' not found in cases")

            if rel.evidence_id not in evidence_ids:
                raise ValueError(f"Relationship '{rel.id}' evidence_id '{rel.evidence_id}' not found in evidence")

        # Check relationship count range: 180 to 250
        if not (180 <= len(self.relationships) <= 250):
            raise ValueError(f"Relationships count must be between 180 and 250, got {len(self.relationships)}")

        return self
