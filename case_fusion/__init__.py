"""NEXUS-Bharat Module 6: Case Fusion Engine."""

from .fusion_models import (
    FusionStrength,
    FusionCaseReference,
    SharedEntitiesBreakdown,
    EmergentPath,
    FusionBridgeEntity,
    CommunityShift,
    ComparativeMetrics,
    FusionMetrics,
    FusionScoreResult,
    FusionAnalysis,
    FusionVisualizationPayload,
)
from .fusion_graph import FusionGraph
from .fusion_builder import FusionBuilder
from .fusion_analyzer import FusionAnalyzer
from .fusion_scorer import FusionScorer
from .fusion_explainer import FusionExplainer
from .fusion_reporter import FusionReporter
from .fusion_service import CaseFusionService

__all__ = [
    "CaseFusionService",
    "FusionGraph",
    "FusionBuilder",
    "FusionAnalyzer",
    "FusionScorer",
    "FusionExplainer",
    "FusionReporter",
    "FusionStrength",
    "FusionCaseReference",
    "SharedEntitiesBreakdown",
    "EmergentPath",
    "FusionBridgeEntity",
    "CommunityShift",
    "ComparativeMetrics",
    "FusionMetrics",
    "FusionScoreResult",
    "FusionAnalysis",
    "FusionVisualizationPayload",
]
