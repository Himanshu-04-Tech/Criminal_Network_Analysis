"""Data models and schemas for NEXUS-Bharat Network Role Intelligence."""

from enum import Enum
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field


class InvestigationRole(str, Enum):
    """Investigative entity classifications within criminal networks."""
    BROKER = "BROKER"
    HUB = "HUB"
    HIGH_INFLUENCE = "HIGH_INFLUENCE"
    CONNECTOR = "CONNECTOR"
    COORDINATOR = "COORDINATOR"
    FINANCIAL_CONDUIT = "FINANCIAL_CONDUIT"
    SHARED_RESOURCE = "SHARED_RESOURCE"
    ISOLATED_ENTITY = "ISOLATED_ENTITY"
    UNKNOWN = "UNKNOWN"


class CentralityMetrics(BaseModel):
    """Raw and normalized centrality metrics for a network node."""
    degree: float = Field(..., description="Degree centrality [0, 1]")
    betweenness: float = Field(..., description="Betweenness centrality [0, 1]")
    closeness: float = Field(..., description="Closeness centrality [0, 1]")
    eigenvector: float = Field(..., description="Eigenvector centrality [0, 1]")
    pagerank: float = Field(..., description="PageRank influence score [0, 1]")


class RoleClassification(BaseModel):
    """Auditable classification result for an investigative entity."""
    entity_id: str
    entity_name: str
    entity_type: str
    role: InvestigationRole
    confidence: float = 1.0
    influence_score: float = Field(default=0.0, description="Composite score [0, 100]")
    reasons: List[str] = Field(default_factory=list, description="Forensic auditable justification points")
    metrics: Dict[str, float] = Field(default_factory=dict, description="Numerical metric values")
    communities_connected: List[str] = Field(default_factory=list, description="List of community IDs bridged")
    cases_involved: List[str] = Field(default_factory=list, description="FIR Case IDs associated")
    details: Dict[str, Any] = Field(default_factory=dict, description="Domain-specific role attributes")


class CommunityStructure(BaseModel):
    """Results of Louvain community partitioning and connected components."""
    communities: Dict[str, List[str]] = Field(..., description="Map of community name/id to member node IDs")
    modularity: float = Field(..., description="Newman modularity score Q")
    num_communities: int
    connected_components_count: int
    component_sizes: List[int] = Field(default_factory=list)


class BrokerReport(BaseModel):
    """Intelligence report summarizing top clandestine brokers."""
    top_brokers: List[RoleClassification]
    total_brokers: int
    summary: str


class HubReport(BaseModel):
    """Intelligence report summarizing highest degree entities."""
    top_hubs: List[RoleClassification]
    total_hubs: int
    summary: str


class InfluenceReport(BaseModel):
    """Intelligence report ranking top global influencers."""
    top_influencers: List[RoleClassification]
    total_evaluated: int
    formula_weights: Dict[str, float]


class SharedResourceReport(BaseModel):
    """Intelligence report detailing shared phones, accounts, and vehicles."""
    shared_resources: List[RoleClassification]
    total_shared_resources: int
    by_type: Dict[str, int]


class FinancialConduitReport(BaseModel):
    """Intelligence report detailing money laundering and financial conduits."""
    conduits: List[RoleClassification]
    fan_in_accounts: List[str]
    fan_out_accounts: List[str]
    routing_accounts: List[str]


class CommunityReport(BaseModel):
    """Intelligence report detailing community structure and clusters."""
    community_count: int
    modularity: float
    communities: Dict[str, List[str]]
    connected_components: List[List[str]]


class CommunityVisualizationPayload(BaseModel):
    """Standardized node-link-community payload for frontend visualizers."""
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    communities: List[Dict[str, Any]]
