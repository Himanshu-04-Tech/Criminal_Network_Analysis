"""CaseFusionService: Unified thread-safe singleton API for Case Fusion Engine."""

import threading
from typing import Dict, List, Any, Optional, Tuple

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


class CaseFusionService:
    """
    Singleton service facade managing temporary analytical case fusions.
    Provides thread-safe caching, analytical query execution, and report exports.
    """

    _instance: Optional["CaseFusionService"] = None
    _lock = threading.Lock()

    def __init__(self):
        self._builder = FusionBuilder()
        self._analyzer = FusionAnalyzer()
        self._fusion_graphs: Dict[str, FusionGraph] = {}
        self._analyses: Dict[str, FusionAnalysis] = {}
        self._case_set_to_id: Dict[Tuple[str, ...], str] = {}
        self._counter = 1
        self._cache_lock = threading.Lock()

    @classmethod
    def get_instance(cls) -> "CaseFusionService":
        """Returns the process-wide singleton CaseFusionService instance."""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    @classmethod
    def reset_instance(cls) -> None:
        """Resets the singleton instance (primarily for testing)."""
        with cls._lock:
            cls._instance = None

    def create_fusion(self, case_ids: List[str]) -> str:
        """
        Creates a temporary analytical fusion for the given FIR case IDs.
        Returns the unique fusion_id (e.g. 'FC_001').
        """
        norm_cases = tuple(sorted(list(set(case_ids))))

        with self._cache_lock:
            if norm_cases in self._case_set_to_id:
                return self._case_set_to_id[norm_cases]

            # Format ID e.g. FC_001
            fusion_id = f"FC_{self._counter:03d}"
            self._counter += 1

            # Build fused graph
            f_graph = self._builder.build_fusion_graph(fusion_id, list(norm_cases))
            self._fusion_graphs[fusion_id] = f_graph
            self._case_set_to_id[norm_cases] = fusion_id

        return fusion_id

    def analyze_fusion(self, fusion_id: str) -> FusionAnalysis:
        """
        Executes comprehensive multi-case fusion analysis and returns the FusionAnalysis dossier.
        Results are cached per fusion_id.
        """
        with self._cache_lock:
            if fusion_id in self._analyses:
                return self._analyses[fusion_id]

            if fusion_id not in self._fusion_graphs:
                raise ValueError(f"Fusion ID '{fusion_id}' not found. Call create_fusion() first.")

            f_graph = self._fusion_graphs[fusion_id]

        # Execute analytical steps
        shared_ents = self._builder.extract_shared_entities(f_graph)
        bridges = self._analyzer.find_bridge_entities(f_graph)
        emergent_paths = self._analyzer.discover_emergent_paths(f_graph)
        comm_shift = self._analyzer.analyze_community_shift(f_graph)
        comparative = self._analyzer.compute_comparative_metrics(f_graph)
        metrics = self._analyzer.compute_fusion_metrics(f_graph)

        score_res = FusionScorer.calculate_score(
            fusion_graph=f_graph,
            metrics=metrics,
            emergent_paths_count=len(emergent_paths),
            broker_present=any(b.entity_id == "P017" or b.role == "BROKER" for b in bridges),
        )

        reasons = FusionExplainer.generate_reasons(
            case_ids=f_graph.case_ids,
            shared_entities=shared_ents,
            bridges=bridges,
            emergent_paths=emergent_paths,
            community_shift=comm_shift,
            score=score_res,
        )

        analysis = FusionAnalysis(
            fusion_id=fusion_id,
            selected_cases=f_graph.case_ids,
            metrics=metrics,
            score=score_res,
            shared_entities=shared_ents,
            bridge_entities=bridges,
            emergent_paths=emergent_paths,
            community_shift=comm_shift,
            comparative=comparative,
            reasons=reasons,
        )

        with self._cache_lock:
            self._analyses[fusion_id] = analysis

        return analysis

    def get_fusion_metrics(self, fusion_id: str) -> FusionMetrics:
        """Returns consolidated graph metrics for the specified fusion."""
        return self.analyze_fusion(fusion_id).metrics

    def get_shared_entities(self, fusion_id: str) -> SharedEntitiesBreakdown:
        """Returns categorized breakdown of shared entities."""
        return self.analyze_fusion(fusion_id).shared_entities

    def get_bridge_entities(self, fusion_id: str) -> List[FusionBridgeEntity]:
        """Returns critical bridge entities connecting the fused cases."""
        return self.analyze_fusion(fusion_id).bridge_entities

    def get_new_connections(self, fusion_id: str) -> List[EmergentPath]:
        """Returns emergent hidden paths revealed across case silos."""
        return self.analyze_fusion(fusion_id).emergent_paths

    def get_fusion_score(self, fusion_id: str) -> FusionScoreResult:
        """Returns 0-100 composite fusion intelligence score and strength classification."""
        return self.analyze_fusion(fusion_id).score

    def get_fusion_explanation(self, fusion_id: str) -> List[str]:
        """Returns forensic reasons answering: WHY SHOULD THESE CASES BE INVESTIGATED TOGETHER?"""
        return self.analyze_fusion(fusion_id).reasons

    def export_fusion_report(self, fusion_id: str, output_dir: str = "reports") -> Dict[str, str]:
        """Exports 6 standardized JSON intelligence reports for the fused case."""
        analysis = self.analyze_fusion(fusion_id)
        return FusionReporter.export_reports(analysis, output_dir)

    def get_visualization_payload(self, fusion_id: str) -> FusionVisualizationPayload:
        """Returns frontend node-link-community visualization payload."""
        analysis = self.analyze_fusion(fusion_id)
        f_graph = self._fusion_graphs[fusion_id]
        return FusionReporter.generate_visualization_payload(f_graph, analysis)
