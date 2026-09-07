"""Domain models and response schemas for NEXUS-Bharat Hidden Connection Finder (Module 3)."""

from __future__ import annotations
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class PathStep(BaseModel):
    """Represents an individual hop along an associative path in the Knowledge Graph."""
    source: str = Field(..., description="Source node ID of the hop")
    target: str = Field(..., description="Target node ID of the hop")
    relationship_type: str = Field(..., description="Semantic edge type (USES, CONTACTED, etc.)")
    direction: str = Field(..., description="'forward' if source->target in graph, 'reverse' if target->source")
    case_id: str = Field(..., description="Associated FIR case ID")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="Evidentiary confidence")
    evidence_id: str = Field(..., description="Forensic evidence foreign key")
    relationship_id: str = Field(..., description="Unique edge UUID")
    explanation: str = Field(..., description="Human-readable explanation of this step")


class PathResult(BaseModel):
    """Detailed evaluated path connecting two entities."""
    path: List[str] = Field(..., description="Ordered list of node IDs forming the path")
    hops: int = Field(..., description="Number of edges in the path (len(path) - 1)")
    score: float = Field(..., ge=0.0, le=100.0, description="Intelligent connectivity score [0 - 100]")
    steps: List[PathStep] = Field(default_factory=list, description="Step-by-step metadata for each edge")
    reasoning: List[str] = Field(default_factory=list, description="List of natural language step descriptions")
    summary: str = Field(default="", description="Holistic narrative explaining the connection")
    cross_case_bridges: List[str] = Field(default_factory=list, description="Distinct FIR cases bridged along the path")
    brokers_involved: List[str] = Field(default_factory=list, description="Key broker nodes identified on the path")


class ConnectionResponse(BaseModel):
    """Standardized response schema for entity connection discovery APIs."""
    connection_found: bool
    reason: Optional[str] = None
    source: str
    target: str
    hops: Optional[int] = None
    score: Optional[float] = None
    path: List[str] = Field(default_factory=list)
    reasoning: List[str] = Field(default_factory=list)
    summary: Optional[str] = None
    paths: List[PathResult] = Field(default_factory=list, description="Ranked candidate paths for multi-path queries")


class CaseConnectionResponse(BaseModel):
    """Response schema for Case-to-Case bridge discovery."""
    connected: bool
    source_case: str
    target_case: str
    hops: Optional[int] = None
    bridge_entities: List[str] = Field(default_factory=list, description="Suspects, phones, accounts bridging cases")
    path: List[str] = Field(default_factory=list)
    reasoning: List[str] = Field(default_factory=list)
    summary: Optional[str] = None
    details: Optional[PathResult] = None
    reason: Optional[str] = None


class BrokerVerificationReport(BaseModel):
    """Audit report validating deliberate hidden broker patterns in the graph."""
    broker_detected: bool
    broker: str
    communities_connected: int
    community_a_nodes: List[str] = Field(default_factory=list)
    community_b_nodes: List[str] = Field(default_factory=list)
    sample_paths: List[Dict[str, Any]] = Field(default_factory=list)
    details: Dict[str, Any] = Field(default_factory=dict)


class VisualizationNode(BaseModel):
    """Node schema formatted for graph visualization libraries (Cytoscape/D3/Sigma)."""
    id: str
    label: str
    type: str
    attributes: Dict[str, Any] = Field(default_factory=dict)


class VisualizationEdge(BaseModel):
    """Edge schema formatted for graph visualization libraries."""
    id: str
    source: str
    target: str
    type: str
    label: str
    case_id: str
    confidence: float = 1.0


class VisualizationGraph(BaseModel):
    """Sub-graph visualization payload consumable by frontend web components."""
    nodes: List[VisualizationNode]
    edges: List[VisualizationEdge]
