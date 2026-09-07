"""Pydantic v2 data models and schemas for NEXUS-Bharat Graph Diff Engine (Module 8)."""

from enum import Enum
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


class ChangeSeverity(str, Enum):
    """Investigative severity classification for graph structural modifications."""
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class EntityDiffItem(BaseModel):
    """Individual entity change entry."""
    entity_id: str
    entity_name: str
    entity_type: str
    status: str = Field(..., description="NEW, REMOVED, REACTIVATED")
    cases: List[str] = Field(default_factory=list)


class EntityDiff(BaseModel):
    """Entity set delta across two graph snapshots."""
    new_entities: List[str] = Field(default_factory=list, description="IDs of newly appeared entities")
    removed_entities: List[str] = Field(default_factory=list, description="IDs of disappeared entities")
    reactivated_entities: List[str] = Field(default_factory=list, description="IDs of re-emerged dormant entities")
    total_new: int = 0
    total_removed: int = 0
    total_reactivated: int = 0
    entity_details: List[EntityDiffItem] = Field(default_factory=list)


class RelationshipDiffItem(BaseModel):
    """Individual relationship change record."""
    source: str
    target: str
    relationship_type: str
    status: str = Field(..., description="NEW, REMOVED, INACTIVE, REACTIVATED")
    details: Dict[str, Any] = Field(default_factory=dict)


class RelationshipDiff(BaseModel):
    """Relationship topology changes between two graph snapshots."""
    new_relationships: List[RelationshipDiffItem] = Field(default_factory=list)
    removed_relationships: List[RelationshipDiffItem] = Field(default_factory=list)
    reactivated_relationships: List[RelationshipDiffItem] = Field(default_factory=list)
    inactive_relationships: List[RelationshipDiffItem] = Field(default_factory=list)
    new_count: int = 0
    removed_count: int = 0
    reactivated_count: int = 0
    inactive_count: int = 0


class SharedResourceDiff(BaseModel):
    """Shared infrastructure emergence or changes (phones, accounts, vehicles)."""
    resource_id: str
    resource_type: str = Field(..., description="PHONE, BANK_ACCOUNT, VEHICLE")
    new_shared_entities: int = Field(..., description="Number of additional suspects utilizing resource")
    associated_entities: List[str] = Field(default_factory=list)
    description: str = ""


class CommunityDiffRecord(BaseModel):
    """Structural community shifts between snapshots."""
    before_count: int
    after_count: int
    event: str = Field(default="COMMUNITY_MERGE", description="COMMUNITY_MERGE, COMMUNITY_SPLIT, NO_CHANGE")
    affected_communities: List[str] = Field(default_factory=list)
    summary: str = ""


class BrokerDiffRecord(BaseModel):
    """Broker emergence or topological betweenness shifts."""
    entity_id: str
    entity_name: str
    old_betweenness: float
    new_betweenness: float
    delta: float
    status: str = Field(default="NEW_BROKER", description="NEW_BROKER, REMOVED_BROKER, INFLUENCE_INCREASE, INFLUENCE_DECREASE")
    reasons: List[str] = Field(default_factory=list)


class PathDiffRecord(BaseModel):
    """Associative path transformation across snapshots."""
    source: str
    target: str
    path_str: str = Field(..., description="e.g. P001 -> P017 -> P020")
    path_nodes: List[str] = Field(default_factory=list)
    old_hops: Optional[int] = None
    new_hops: Optional[int] = None
    status: str = Field(..., description="NEW, REMOVED, SHORTENED, EXPANDED, UNCHANGED")
    explanation: str = ""


class GraphDensityAnalysis(BaseModel):
    """Topological density variation between snapshots."""
    density_before: float
    density_after: float
    density_change: float
    growth_rate: float


class ConnectivityAnalysis(BaseModel):
    """Connected component health and consolidation metrics."""
    components_before: int
    components_after: int
    fragmentation_status: str = Field(default="CONSOLIDATED", description="CONSOLIDATED, FRAGMENTED, STABLE")
    largest_component_before: int
    largest_component_after: int


class NetworkHealthMetrics(BaseModel):
    """Macro indicators of network structural health."""
    new_nodes: int
    removed_nodes: int
    new_edges: int
    removed_edges: int
    density_change: float
    community_change: int
    broker_change: int


class ImpactScoreResult(BaseModel):
    """Multi-factor quantitative impact score (0-100) and severity rating."""
    impact_score: float = Field(..., description="Calibrated score between 0 and 100")
    severity: ChangeSeverity
    factor_breakdown: Dict[str, float] = Field(default_factory=dict)
    reasons: List[str] = Field(default_factory=list)


class HiddenIntelligenceReport(BaseModel):
    """Clandestine structures that exist strictly after graph reconfiguration."""
    new_bridges: List[str] = Field(default_factory=list)
    new_brokers: List[str] = Field(default_factory=list)
    new_shared_resources: List[str] = Field(default_factory=list)
    new_cross_case_connections: List[str] = Field(default_factory=list)
    new_financial_routes: List[str] = Field(default_factory=list)


class GraphDiffAnalysis(BaseModel):
    """Comprehensive comparative analysis container for two graph snapshots."""
    snapshot_a: str
    snapshot_b: str
    entity_diff: EntityDiff
    relationship_diff: RelationshipDiff
    shared_resource_diffs: List[SharedResourceDiff] = Field(default_factory=list)
    community_diff: CommunityDiffRecord
    broker_diffs: List[BrokerDiffRecord] = Field(default_factory=list)
    path_diffs: List[PathDiffRecord] = Field(default_factory=list)
    density_analysis: GraphDensityAnalysis
    connectivity_analysis: ConnectivityAnalysis
    network_health: NetworkHealthMetrics
    impact_score: ImpactScoreResult
    hidden_intelligence: HiddenIntelligenceReport
    summary: Dict[str, Any] = Field(default_factory=dict)


class GraphDiffVisualizationPayload(BaseModel):
    """Frontend-ready graph diff schema for UI visualizers."""
    before: Dict[str, Any] = Field(default_factory=dict)
    after: Dict[str, Any] = Field(default_factory=dict)
    changes: List[Dict[str, Any]] = Field(default_factory=list)
    communities: List[Dict[str, Any]] = Field(default_factory=list)
    brokers: List[Dict[str, Any]] = Field(default_factory=list)
