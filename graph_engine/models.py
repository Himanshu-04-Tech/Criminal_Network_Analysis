"""Domain models, enums, and data schemas for NEXUS-Bharat Knowledge Graph Engine."""

from __future__ import annotations
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


class NodeType(str, Enum):
    """Supported entity and case node categories in the Knowledge Graph."""
    PERSON = "PERSON"
    PHONE = "PHONE"
    ACCOUNT = "ACCOUNT"
    VEHICLE = "VEHICLE"
    LOCATION = "LOCATION"
    ORGANIZATION = "ORGANIZATION"
    CASE = "CASE"
    EVENT = "EVENT"


class EdgeType(str, Enum):
    """Semantic relationship types connecting graph nodes."""
    USES = "USES"
    CONTACTED = "CONTACTED"
    OWNS = "OWNS"
    TRANSFERRED_TO = "TRANSFERRED_TO"
    VISITED = "VISITED"
    OBSERVED_AT = "OBSERVED_AT"
    MEMBER_OF = "MEMBER_OF"
    MENTIONED_IN = "MENTIONED_IN"


class NodeModel(BaseModel):
    """Unified graph node representation for entities and cases."""
    id: str = Field(..., description="Unique node identifier")
    type: str = Field(..., description="Node category (PERSON, PHONE, CASE, etc.)")
    name: str = Field(..., description="Descriptive label or person/company name")
    created_at: str = Field(..., description="ISO-8601 creation or first-seen timestamp")
    attributes: Dict[str, Any] = Field(
        default_factory=dict,
        description="Preserved domain-specific attributes (IMEI, IFSC, vehicle reg, etc.)"
    )

    @field_validator("type")
    @classmethod
    def validate_type(cls, value: str) -> str:
        valid_types = {t.value for t in NodeType}
        if value not in valid_types:
            raise ValueError(f"Invalid node type '{value}'. Supported: {valid_types}")
        return value

    def get_attr(self, key: str, default: Any = None) -> Any:
        """Helper to get a domain attribute with fallback."""
        return self.attributes.get(key, default)


class EdgeModel(BaseModel):
    """Directed edge representation linking two nodes in the MultiDiGraph."""
    relationship_id: str = Field(..., description="Unique edge identifier / UUID")
    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    relationship_type: str = Field(..., description="Semantic edge type (USES, CONTACTED, etc.)")
    case_id: str = Field(..., description="Associated FIR case ID")
    timestamp: str = Field(..., description="ISO-8601 occurrence timestamp")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="Evidentiary confidence [0.0 - 1.0]")
    evidence_id: str = Field(..., description="Forensic evidence foreign key")
    attributes: Dict[str, Any] = Field(default_factory=dict, description="Arbitrary edge metadata")

    @field_validator("relationship_type")
    @classmethod
    def validate_rel_type(cls, value: str) -> str:
        valid_types = {t.value for t in EdgeType}
        if value not in valid_types:
            raise ValueError(f"Invalid edge relationship type '{value}'. Supported: {valid_types}")
        return value


class CaseModel(BaseModel):
    """Case record representation from cases.json."""
    id: str
    title: str
    status: str
    created_at: str


class EvidenceModel(BaseModel):
    """Evidence record representation from evidence.json."""
    id: str
    case_id: str
    source_file: str
    timestamp: str
    confidence: float = 1.0


class GraphStatistics(BaseModel):
    """Summary metrics of the compiled knowledge graph."""
    total_nodes: int
    total_edges: int
    persons: int
    phones: int
    accounts: int
    vehicles: int
    locations: int
    organizations: int
    cases: int
    relationship_counts: Dict[str, int] = Field(default_factory=dict)
    density: float = 0.0
    avg_in_degree: float = 0.0
    avg_out_degree: float = 0.0
    connected_components: int = 1


class IntegrityReport(BaseModel):
    """Audit report produced by graph validation and integrity verification."""
    is_valid: bool
    orphan_nodes: List[str] = Field(default_factory=list)
    disconnected_components: List[List[str]] = Field(default_factory=list)
    duplicate_entities: List[str] = Field(default_factory=list)
    invalid_edges: List[Dict[str, Any]] = Field(default_factory=list)
    missing_evidence_refs: List[str] = Field(default_factory=list)
    missing_case_refs: List[str] = Field(default_factory=list)
    summary: str = ""


class KnowledgeGraphValidationError(Exception):
    """Custom exception raised when graph integrity or referential checks fail."""
    def __init__(self, message: str, errors: Optional[List[str]] = None):
        super().__init__(message)
        self.errors = errors or []
