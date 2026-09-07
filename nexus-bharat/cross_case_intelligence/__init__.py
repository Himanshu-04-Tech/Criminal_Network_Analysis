"""NEXUS-Bharat Cross Case Intelligence Engine (Module 5).

This module discovers hidden overlaps, bridge entities, and network clusters
across FIR cases, transforming case-by-case analysis into network investigations.
"""

from .models import (
    ConnectionStrength,
    CaseEntityBreakdown,
    CaseOverlap,
    BridgeEntity,
    CrossCaseComparison,
    CaseCluster,
    CaseRanking,
    CrossCaseVisualizationPayload,
)
from .case_loader import CaseLoader
from .overlap_detector import OverlapDetector
from .bridge_detector import BridgeDetector
from .case_analyzer import CaseAnalyzer
from .similarity_engine import SimilarityEngine
from .case_scorer import CaseScorer
from .case_explainer import CaseExplainer
from .intelligence_service import CrossCaseIntelligenceService

__all__ = [
    "ConnectionStrength",
    "CaseEntityBreakdown",
    "CaseOverlap",
    "BridgeEntity",
    "CrossCaseComparison",
    "CaseCluster",
    "CaseRanking",
    "CrossCaseVisualizationPayload",
    "CaseLoader",
    "OverlapDetector",
    "BridgeDetector",
    "CaseAnalyzer",
    "SimilarityEngine",
    "CaseScorer",
    "CaseExplainer",
    "CrossCaseIntelligenceService",
]
