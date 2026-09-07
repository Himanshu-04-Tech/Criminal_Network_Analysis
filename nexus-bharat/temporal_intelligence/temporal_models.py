"""Pydantic schemas and models for NEXUS-Bharat Temporal Intelligence (Module 7)."""

from enum import Enum
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field


class ChangeType(str, Enum):
    """Categorical classification of relationship evolution."""
    NEW = "NEW"
    INACTIVE = "INACTIVE"
    REACTIVATED = "REACTIVATED"
    PERSISTENT = "PERSISTENT"


class AnomalySeverity(str, Enum):
    """Severity classification for temporal anomalies."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class TimelineEvent(BaseModel):
    """Discrete timestamped event occurring in the criminal investigation."""
    timestamp: str = Field(..., description="ISO 8601 timestamp")
    event_type: str = Field(..., description="Relationship type, case event, or evidence log")
    description: str = Field(..., description="Human-readable event narrative")
    source: str
    target: str
    case_id: Optional[str] = None
    evidence_id: Optional[str] = None
    details: Dict[str, Any] = Field(default_factory=dict)


class EntityTimeline(BaseModel):
    """Complete chronological event history for an individual entity."""
    entity_id: str
    entity_name: str
    entity_type: str
    events: List[TimelineEvent] = Field(default_factory=list)
    first_activity: Optional[str] = None
    last_activity: Optional[str] = None
    total_events: int = 0


class CaseTimeline(BaseModel):
    """Chronological event history across all entities associated with an FIR case."""
    case_id: str
    case_title: str
    events: List[TimelineEvent] = Field(default_factory=list)
    first_activity: Optional[str] = None
    last_activity: Optional[str] = None
    total_events: int = 0


class TemporalSnapshot(BaseModel):
    """Metadata record of a time-filtered graph state."""
    snapshot_id: str
    start_date: str
    end_date: str
    nodes_count: int
    edges_count: int
    active_entities: List[str] = Field(default_factory=list)
    created_at: str = Field(default="2026-09-07T00:00:00Z")


class CommunicationBurst(BaseModel):
    """High-frequency communication anomaly detected across a sliding temporal window."""
    burst_id: str
    entities: List[str] = Field(default_factory=list, description="Suspect persons involved in burst")
    phone_entities: List[str] = Field(default_factory=list, description="Burner phones utilized")
    call_count: int
    start_time: str
    end_time: str
    duration_hours: float
    calls_per_hour: float
    severity: AnomalySeverity = AnomalySeverity.HIGH
    reasons: List[str] = Field(default_factory=list)


class RelationshipChange(BaseModel):
    """Evolution or decay record for a relationship across time windows."""
    source: str
    target: str
    relationship_type: str
    change_type: ChangeType
    first_seen: str
    last_seen: str
    event_count: int = 1
    details: Dict[str, Any] = Field(default_factory=dict)


class CommunityEvolutionRecord(BaseModel):
    """Community structural shift across time snapshots."""
    event: str = Field(..., description="COMMUNITY_MERGE, COMMUNITY_SPLIT, COMMUNITY_GROWTH, etc.")
    before_count: int
    after_count: int
    affected_communities: List[str] = Field(default_factory=list)
    summary: str = ""


class BrokerEvolutionRecord(BaseModel):
    """Broker leverage and betweenness shifts over time."""
    entity_id: str
    entity_name: str
    old_score: float
    new_score: float
    score_delta: float
    status: str = Field(default="INFLUENCE_INCREASE", description="NEW_BROKER, INFLUENCE_INCREASE, INACTIVE")
    reasons: List[str] = Field(default_factory=list)


class FinancialTemporalPattern(BaseModel):
    """Rapid financial transaction typology recognized over time."""
    pattern_type: str = Field(..., description="FINANCIAL_FAN_OUT, FINANCIAL_FAN_IN, CIRCULAR_TRANSACTIONS")
    source_account: Optional[str] = None
    target_accounts: List[str] = Field(default_factory=list)
    involved_accounts: List[str] = Field(default_factory=list)
    transaction_count: int
    duration_minutes: float
    start_time: str
    end_time: str
    severity: AnomalySeverity = AnomalySeverity.HIGH
    evidence_ids: List[str] = Field(default_factory=list)
    description: str = ""


class TemporalAnomaly(BaseModel):
    """High-priority behavioral or structural anomaly flagged by temporal engine."""
    anomaly_id: str
    anomaly_type: str = Field(..., description="COMMUNICATION_BURST, RAPID_FINANCIAL_DISPERSAL, etc.")
    severity: AnomalySeverity
    entities: List[str] = Field(default_factory=list)
    timestamp: str
    details: Dict[str, Any] = Field(default_factory=dict)
    reasons: List[str] = Field(default_factory=list)


class NetworkGrowthMetrics(BaseModel):
    """Statistical growth rates between two analytical snapshots."""
    new_nodes: int
    new_edges: int
    growth_rate: float = Field(..., description="Percentage growth in nodes")
    relationship_growth_rate: float = Field(..., description="Percentage growth in edges")
    active_suspects_growth: int = 0


class SnapshotComparison(BaseModel):
    """Comparative delta between two time periods."""
    period_1: str
    period_2: str
    new_entities: List[str] = Field(default_factory=list)
    new_edges: List[Dict[str, Any]] = Field(default_factory=list)
    removed_edges: List[Dict[str, Any]] = Field(default_factory=list)
    reactivated_edges: List[Dict[str, Any]] = Field(default_factory=list)
    growth_metrics: NetworkGrowthMetrics


class TemporalVisualizationPayload(BaseModel):
    """Frontend-ready time series and snapshot schema for UI visualizers."""
    timeline: List[Dict[str, Any]] = Field(default_factory=list)
    events: List[Dict[str, Any]] = Field(default_factory=list)
    snapshots: List[Dict[str, Any]] = Field(default_factory=list)
    changes: List[Dict[str, Any]] = Field(default_factory=list)
