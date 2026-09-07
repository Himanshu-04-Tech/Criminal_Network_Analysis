"""Public Service Facade for Hidden Connection Discovery with caching and error resilience."""

from __future__ import annotations
import threading
from typing import Any, Dict, List, Optional, Tuple

from graph_engine.graph_service import KnowledgeGraphService
from graph_analytics.path_models import (
    PathResult,
    ConnectionResponse,
    CaseConnectionResponse,
    BrokerVerificationReport,
    VisualizationGraph,
)
from graph_analytics.connection_validator import ConnectionValidator
from graph_analytics.path_finder import PathFinder


class ConnectionService:
    """
    Singleton service exposing public graph intelligence APIs.
    Consumes Module 2 KnowledgeGraphService and provides defensive, structured responses.
    """

    _instance: Optional["ConnectionService"] = None
    _lock: threading.Lock = threading.Lock()

    def __init__(self, kg_service: Optional[KnowledgeGraphService] = None):
        self.kg_service = kg_service or KnowledgeGraphService.get_instance()
        self.graph = self.kg_service.get_graph()
        self.finder = PathFinder(self.graph)
        self._cache: Dict[Tuple[str, str, str], Any] = {}
        self._cache_lock = threading.Lock()

    @classmethod
    def get_instance(cls, kg_service: Optional[KnowledgeGraphService] = None) -> "ConnectionService":
        """Thread-safe singleton accessor."""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls(kg_service=kg_service)
        return cls._instance

    @classmethod
    def reset_instance(cls) -> None:
        """Reset singleton (useful for test isolation)."""
        with cls._lock:
            cls._instance = None

    def find_connection(self, source: str, target: str) -> ConnectionResponse:
        """
        Primary API answering 'How is Entity A connected to Entity B?'.
        Returns shortest hop path with score and narrative explanation.
        """
        return self.find_shortest_connection(source, target)

    def find_shortest_connection(self, source: str, target: str) -> ConnectionResponse:
        """
        Discover shortest associative path between source and target using BFS.
        """
        # Defensive validation
        is_valid, err_msg = ConnectionValidator.validate_entity_pair(self.graph, source, target)
        if not is_valid:
            return ConnectionResponse(
                connection_found=False,
                reason=err_msg,
                source=source,
                target=target
            )

        cache_key = ("shortest", source, target)
        with self._cache_lock:
            if cache_key in self._cache:
                return self._cache[cache_key]

        result = self.finder.find_shortest_connection(source, target)
        if result is None:
            resp = ConnectionResponse(
                connection_found=False,
                reason=f"No connected path exists between '{source}' and '{target}'.",
                source=source,
                target=target
            )
        else:
            resp = ConnectionResponse(
                connection_found=True,
                source=source,
                target=target,
                hops=result.hops,
                score=result.score,
                path=result.path,
                reasoning=result.reasoning,
                summary=result.summary,
                paths=[result]
            )

        with self._cache_lock:
            self._cache[cache_key] = resp

        return resp

    def find_multiple_connections(
        self, source: str, target: str, top_k: int = 5, max_depth: int = 6
    ) -> ConnectionResponse:
        """
        Discover up to top_k distinct candidate paths between source and target, ranked by score.
        """
        is_valid, err_msg = ConnectionValidator.validate_entity_pair(self.graph, source, target)
        if not is_valid:
            return ConnectionResponse(
                connection_found=False,
                reason=err_msg,
                source=source,
                target=target
            )

        paths = self.finder.find_multiple_connections(source, target, top_k=top_k, max_depth=max_depth)
        if not paths:
            return ConnectionResponse(
                connection_found=False,
                reason=f"No paths found within {max_depth} hops between '{source}' and '{target}'.",
                source=source,
                target=target
            )

        best_path = paths[0]
        return ConnectionResponse(
            connection_found=True,
            source=source,
            target=target,
            hops=best_path.hops,
            score=best_path.score,
            path=best_path.path,
            reasoning=best_path.reasoning,
            summary=best_path.summary,
            paths=paths
        )

    def get_top_paths(self, source: str, target: str, top_k: int = 5) -> List[PathResult]:
        """Convenience method returning raw list of top-K ranked PathResult objects."""
        resp = self.find_multiple_connections(source, target, top_k=top_k)
        return resp.paths

    def get_connection_explanation(self, source: str, target: str) -> Dict[str, Any]:
        """
        Return structured narrative explanation for the connection between source and target.
        """
        resp = self.find_connection(source, target)
        if not resp.connection_found:
            return {
                "connection_found": False,
                "reason": resp.reason
            }

        return {
            "connection_found": True,
            "source": source,
            "target": target,
            "hops": resp.hops,
            "score": resp.score,
            "path": resp.path,
            "reasoning": resp.reasoning,
            "summary": resp.summary
        }

    def find_case_connection(self, case_1: str, case_2: str) -> CaseConnectionResponse:
        """
        Discover investigative bridge connecting two FIR criminal cases.
        """
        is_valid, err_msg = ConnectionValidator.validate_case_pair(self.graph, case_1, case_2)
        if not is_valid:
            return CaseConnectionResponse(
                connected=False,
                source_case=case_1,
                target_case=case_2,
                reason=err_msg
            )

        return self.finder.find_case_connection(case_1, case_2)

    def verify_hidden_broker(self, broker_id: str = "P017") -> BrokerVerificationReport:
        """
        Validate that the specified broker successfully connects Community A and Community B.
        """
        return self.finder.verify_hidden_broker(broker_id=broker_id)

    def get_visualization_data(self, path_result: PathResult) -> Dict[str, Any]:
        """
        Convert a PathResult into a frontend-ready JSON node-link visualization payload.
        """
        vis_graph = self.finder.build_visualization_graph(path_result)
        return vis_graph.model_dump()
