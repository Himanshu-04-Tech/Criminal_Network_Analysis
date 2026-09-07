"""Data models and schemas for NEXUS-Bharat Cross Case Intelligence."""

from enum import Enum
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field


class ConnectionStrength(str, Enum):
    """Categorical classification of linkage strength between FIR cases."""
    WEAK = "WEAK"
    MODERATE = "MODERATE"
    STRONG = "STRONG"
    CRITICAL = "CRITICAL"


class CaseEntityBreakdown(BaseModel):
    """Categorized breakdown of all entities participating in an FIR case."""
    case_id: str
    persons: List[str] = Field(default_factory=list)
    phones: List[str] = Field(default_factory=list)
    accounts: List[str] = Field(default_factory=list)
    vehicles: List[str] = Field(default_factory=list)
    locations: List[str] = Field(default_factory=list)
    organizations: List[str] = Field(default_factory=list)
    total_entities: int = 0


class CaseOverlap(BaseModel):
    """Detailed entity overlap between two FIR cases."""
    case_a: str
    case_b: str
    shared_persons: List[str] = Field(default_factory=list)
    shared_phones: List[str] = Field(default_factory=list)
    shared_accounts: List[str] = Field(default_factory=list)
    shared_vehicles: List[str] = Field(default_factory=list)
    shared_locations: List[str] = Field(default_factory=list)
    shared_organizations: List[str] = Field(default_factory=list)
    total_shared: int = 0


class BridgeEntity(BaseModel):
    """Entity that provides cross-case operational or structural connectivity."""
    entity_id: str
    entity_name: str
    entity_type: str
    role: str = Field(default="UNKNOWN", description="Role classification from Module 4")
    bridge_type: str = Field(default="Direct Shared Asset", description="Direct Shared vs Covert Intermediary")
    intermediary_cases: List[str] = Field(default_factory=list)
    hop_distance: int = 1
    is_broker: bool = False
    details: Dict[str, Any] = Field(default_factory=dict)


class CrossCaseComparison(BaseModel):
    """Comprehensive intelligence comparison report between two FIR cases."""
    case_a: str
    case_b: str
    connected: bool = True
    similarity_score: float = Field(default=0.0, description="Composite similarity [0, 100]")
    connection_strength: ConnectionStrength = ConnectionStrength.WEAK
    shared_entities: CaseOverlap
    bridge_entities: List[BridgeEntity] = Field(default_factory=list)
    connecting_paths: List[Dict[str, Any]] = Field(default_factory=list)
    reasons: List[str] = Field(default_factory=list, description="Human-readable forensic explanations")
    evidence_count: int = 0
    broker_present: bool = False
    broker_id: Optional[str] = None


class CaseCluster(BaseModel):
    """Syndicate cluster grouping multiple interconnected FIR cases."""
    cluster_id: str
    cases: List[str] = Field(default_factory=list)
    lead_case: str = ""
    internal_cohesion: float = 0.0
    shared_resources_count: int = 0
    common_operatives: List[str] = Field(default_factory=list)


class CaseRanking(BaseModel):
    """Ranked importance record for an individual FIR case within the case network."""
    case_id: str
    importance_score: float = Field(..., description="Calculated case network importance [0, 100]")
    connected_cases_count: int = 0
    bridge_entities_count: int = 0
    shared_resources_count: int = 0
    broker_present: bool = False
    key_syndicate_ties: List[str] = Field(default_factory=list)


class CrossCaseVisualizationPayload(BaseModel):
    """Standardized node-link-cluster payload for frontend network visualizers."""
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    clusters: List[Dict[str, Any]]
