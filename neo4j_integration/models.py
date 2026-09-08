"""Domain data models, label enums, and mapping schemas for Neo4j graph storage."""

from __future__ import annotations
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class Neo4jLabel(str, Enum):
    """Supported Neo4j node labels representing investigation domain entities."""
    PERSON = "Person"
    PHONE = "Phone"
    ACCOUNT = "Account"
    VEHICLE = "Vehicle"
    LOCATION = "Location"
    ORGANIZATION = "Organization"
    CASE = "Case"
    EVENT = "Event"
    EVIDENCE = "Evidence"


class Neo4jRelationshipType(str, Enum):
    """Semantic directed relationship types stored in Neo4j."""
    USES = "USES"
    CONTACTED = "CONTACTED"
    OWNS = "OWNS"
    TRANSFERRED_TO = "TRANSFERRED_TO"
    OBSERVED_AT = "OBSERVED_AT"
    MENTIONED_IN = "MENTIONED_IN"
    MEMBER_OF = "MEMBER_OF"
    VISITED = "VISITED"


ENTITY_TYPE_TO_LABEL: Dict[str, Neo4jLabel] = {
    "PERSON": Neo4jLabel.PERSON,
    "PHONE": Neo4jLabel.PHONE,
    "ACCOUNT": Neo4jLabel.ACCOUNT,
    "VEHICLE": Neo4jLabel.VEHICLE,
    "LOCATION": Neo4jLabel.LOCATION,
    "ORGANIZATION": Neo4jLabel.ORGANIZATION,
    "CASE": Neo4jLabel.CASE,
    "EVENT": Neo4jLabel.EVENT,
    "EVIDENCE": Neo4jLabel.EVIDENCE,
}

LABEL_TO_ENTITY_TYPE: Dict[str, str] = {
    v.value: k for k, v in ENTITY_TYPE_TO_LABEL.items()
}


class Neo4jNodeRecord(BaseModel):
    """Typed schema representing a node stored or fetched from Neo4j."""
    id: str = Field(..., description="Canonical entity ID (P001, PH001, FIR001, etc.)")
    label: str = Field(..., description="Primary Neo4j node label (Person, Phone, Case, etc.)")
    name: str = Field(..., description="Human-readable title or entity name")
    type: str = Field(..., description="Canonical entity type (PERSON, PHONE, CASE, etc.)")
    created_at: str = Field(..., description="ISO-8601 created/first-seen timestamp")
    attributes: Dict[str, Any] = Field(default_factory=dict, description="Preserved domain attributes")

    def to_properties(self) -> Dict[str, Any]:
        """Flatten attributes for top-level Neo4j node property storage."""
        props: Dict[str, Any] = {
            "id": self.id,
            "type": self.type,
            "name": self.name,
            "created_at": self.created_at,
        }
        for k, v in self.attributes.items():
            if k not in props and v is not None:
                props[k] = v
        return props


class Neo4jRelationshipRecord(BaseModel):
    """Typed schema representing a directed relationship stored or fetched from Neo4j."""
    relationship_id: str = Field(..., description="Unique relationship identifier / UUID")
    source: str = Field(..., description="Origin node entity ID")
    target: str = Field(..., description="Destination node entity ID")
    relationship_type: str = Field(..., description="Semantic type (USES, CONTACTED, etc.)")
    case_id: str = Field(..., description="Associated FIR case ID")
    timestamp: str = Field(..., description="ISO-8601 timestamp")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="Evidentiary confidence")
    status: str = Field(default="SOURCE_SUPPORTED", description="Relationship verification status")
    evidence_id: str = Field(..., description="Foreign key referencing supporting Evidence record")
    attributes: Dict[str, Any] = Field(default_factory=dict, description="Additional relationship attributes")

    def to_properties(self) -> Dict[str, Any]:
        """Convert to flat dictionary for relationship properties."""
        props: Dict[str, Any] = {
            "relationship_id": self.relationship_id,
            "case_id": self.case_id,
            "timestamp": self.timestamp,
            "confidence": self.confidence,
            "status": self.status,
            "evidence_id": self.evidence_id,
        }
        for k, v in self.attributes.items():
            if k not in props and v is not None:
                props[k] = v
        return props


class Neo4jCaseRecord(BaseModel):
    """Case node representation in Neo4j."""
    id: str = Field(..., description="Unique FIR case ID (e.g., FIR001)")
    title: str = Field(..., description="Case title/description")
    status: str = Field(..., description="Investigation status (OPEN, CLOSED, etc.)")
    created_at: str = Field(..., description="ISO-8601 creation timestamp")

    def to_properties(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "name": self.title,
            "status": self.status,
            "created_at": self.created_at,
            "type": "CASE",
        }


class Neo4jEvidenceRecord(BaseModel):
    """Evidence node representation in Neo4j."""
    id: str = Field(..., description="Unique evidence ID (e.g., E001)")
    case_id: str = Field(..., description="FIR case this evidence belongs to")
    source_file: str = Field(..., description="Forensic source file")
    timestamp: str = Field(..., description="ISO-8601 extraction timestamp")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="Evidentiary confidence")
    description: Optional[str] = Field(default=None, description="Forensic artifact description")

    def to_properties(self) -> Dict[str, Any]:
        props: Dict[str, Any] = {
            "id": self.id,
            "case_id": self.case_id,
            "source_file": self.source_file,
            "timestamp": self.timestamp,
            "confidence": self.confidence,
            "type": "EVIDENCE",
            "name": f"Evidence {self.id} ({self.source_file})",
        }
        if self.description:
            props["description"] = self.description
        return props
