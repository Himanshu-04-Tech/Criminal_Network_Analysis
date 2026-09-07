"""NEXUS-Bharat Graph Diff Engine (Module 8).

Provides structural graph differencing, entity and relationship deltas,
community and broker shifts, path evolution, and impact scoring across time-bounded snapshots.
"""

from .diff_models import (
    ChangeSeverity,
    EntityDiffItem,
    EntityDiff,
    RelationshipDiffItem,
    RelationshipDiff,
    SharedResourceDiff,
    CommunityDiffRecord,
    BrokerDiffRecord,
    PathDiffRecord,
    GraphDensityAnalysis,
    ConnectivityAnalysis,
    NetworkHealthMetrics,
    ImpactScoreResult,
    HiddenIntelligenceReport,
    GraphDiffAnalysis,
    GraphDiffVisualizationPayload,
)
from .snapshot_loader import SnapshotLoader
from .entity_diff import EntityDiffEngine
from .relationship_diff import RelationshipDiffEngine
from .community_diff import CommunityDiffEngine
from .broker_diff import BrokerDiffEngine
from .path_diff import PathEvolutionEngine
from .graph_comparator import GraphComparator
from .diff_explainer import DiffExplainer
from .diff_service import GraphDiffService

__all__ = [
    "ChangeSeverity",
    "EntityDiffItem",
    "EntityDiff",
    "RelationshipDiffItem",
    "RelationshipDiff",
    "SharedResourceDiff",
    "CommunityDiffRecord",
    "BrokerDiffRecord",
    "PathDiffRecord",
    "GraphDensityAnalysis",
    "ConnectivityAnalysis",
    "NetworkHealthMetrics",
    "ImpactScoreResult",
    "HiddenIntelligenceReport",
    "GraphDiffAnalysis",
    "GraphDiffVisualizationPayload",
    "SnapshotLoader",
    "EntityDiffEngine",
    "RelationshipDiffEngine",
    "CommunityDiffEngine",
    "BrokerDiffEngine",
    "PathEvolutionEngine",
    "GraphComparator",
    "DiffExplainer",
    "GraphDiffService",
]
