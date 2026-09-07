"""NEXUS-Bharat Network Role Intelligence Engine (Module 4).

This module analyzes entity roles inside criminal networks using graph centrality,
community detection, financial topology, and multi-factor influence scoring.
"""

from .role_models import (
    InvestigationRole,
    CentralityMetrics,
    RoleClassification,
    CommunityStructure,
    BrokerReport,
    HubReport,
    InfluenceReport,
    SharedResourceReport,
    FinancialConduitReport,
    CommunityReport,
    CommunityVisualizationPayload,
)
from .centrality_engine import CentralityEngine
from .community_detector import CommunityDetector
from .influence_analyzer import InfluenceAnalyzer
from .role_classifier import RoleClassifier
from .role_explainer import RoleExplainer
from .role_service import RoleService

__all__ = [
    "InvestigationRole",
    "CentralityMetrics",
    "RoleClassification",
    "CommunityStructure",
    "BrokerReport",
    "HubReport",
    "InfluenceReport",
    "SharedResourceReport",
    "FinancialConduitReport",
    "CommunityReport",
    "CommunityVisualizationPayload",
    "CentralityEngine",
    "CommunityDetector",
    "InfluenceAnalyzer",
    "RoleClassifier",
    "RoleExplainer",
    "RoleService",
]
