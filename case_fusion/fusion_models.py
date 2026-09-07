"""Data models and schemas for NEXUS-Bharat Case Fusion Engine (Module 6)."""

from enum import Enum
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field


class FusionStrength(str, Enum):
    """Categorical classification of analytical fusion cohesion."""
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class FusionCaseReference(BaseModel):
    """Entity provenance and case occurrence metadata."""
    entity_id: str
    appears_in: List[str] = Field(default_factory=list, description="FIR cases referencing this entity")
    case_count: int = 1


class SharedEntitiesBreakdown(BaseModel):
    """Categorized breakdown of all entities appearing across 2 or more fused FIRs."""
    persons: List[str] = Field(default_factory=list)
    phones: List[str] = Field(default_factory=list)
    accounts: List[str] = Field(default_factory=list)
    vehicles: List[str] = Field(default_factory=list)
    locations: List[str] = Field(default_factory=list)
    organizations: List[str] = Field(default_factory=list)
    total_shared: int = 0


class EmergentPath(BaseModel):
    """Hidden path discoverable across previously isolated case silos."""
    source_entity: str
    target_entity: str
    source_case: str
    target_case: str
    hops: int
    path: List[str] = Field(default_factory=list)
    bridge_nodes: List[str] = Field(default_factory=list)
    significance: str = ""


class FusionBridgeEntity(BaseModel):
    """Entity operating as a critical nexus between multiple fused cases."""
    entity_id: str
    entity_name: str
    entity_type: str
    role: str = Field(default="UNKNOWN", description="Role classification from Module 4")
    bridge_type: str = Field(default="Cross-Case Bridge", description="Bridge typology")
    cases_bridged: List[str] = Field(default_factory=list)
    centrality: float = 0.0
    details: Dict[str, Any] = Field(default_factory=dict)


class CommunityShift(BaseModel):
    """Before vs After community structure evolution."""
    communities_before: int = 0
    communities_after: int = 0
    modularity: float = 0.0
    consolidation_summary: str = ""


class ComparativeMetrics(BaseModel):
    """Side-by-side comparison illustrating value added by analytical fusion."""
    entities_before: int = 0
    entities_after: int = 0
    relationships_before: int = 0
    relationships_after: int = 0
    communities_before: int = 0
    communities_after: int = 0
    density_gain: float = 0.0


class FusionMetrics(BaseModel):
    """Consolidated graph and intelligence metrics for the fused graph."""
    total_cases: int
    total_entities: int
    total_relationships: int
    shared_entities: int
    bridge_entities: int
    communities: int
    brokers: int
    hubs: int


class FusionScoreResult(BaseModel):
    """Overall intelligence fusion score and qualitative strength."""
    fusion_score: float = Field(..., description="Composite 0-100 fusion score")
    strength: FusionStrength
    factors: Dict[str, float] = Field(default_factory=dict, description="Factor breakdown [0-100]")


class FusionAnalysis(BaseModel):
    """Complete analytical dossier resulting from multi-case fusion."""
    fusion_id: str
    selected_cases: List[str]
    metrics: FusionMetrics
    score: FusionScoreResult
    shared_entities: SharedEntitiesBreakdown
    bridge_entities: List[FusionBridgeEntity] = Field(default_factory=list)
    emergent_paths: List[EmergentPath] = Field(default_factory=list)
    community_shift: CommunityShift
    comparative: ComparativeMetrics
    reasons: List[str] = Field(default_factory=list, description="Forensic audit justifications")


class FusionVisualizationPayload(BaseModel):
    """Frontend-ready node-link-community schema for graph visualizers."""
    nodes: List[Dict[str, Any]] = Field(default_factory=list)
    edges: List[Dict[str, Any]] = Field(default_factory=list)
    communities: List[Dict[str, Any]] = Field(default_factory=list)
    bridges: List[str] = Field(default_factory=list)
    brokers: List[str] = Field(default_factory=list)
