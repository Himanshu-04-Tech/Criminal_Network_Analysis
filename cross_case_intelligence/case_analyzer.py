"""Case Analyzer executing multi-hop path discovery and forensic evidence synthesis."""

import threading
from typing import Dict, List, Tuple, Optional, Any
from graph_engine.graph_service import KnowledgeGraphService
from graph_analytics.connection_service import ConnectionService


class CaseAnalyzer:
    """
    Leverages Module 3 ConnectionService to trace shortest paths and multi-hop connections
    between entities in Case A and Case B, gathering supporting evidence records.
    """

    def __init__(
        self,
        kg_service: Optional[KnowledgeGraphService] = None,
        conn_service: Optional[ConnectionService] = None,
    ):
        self._kg_service = kg_service or KnowledgeGraphService.get_instance()
        self._conn_service = conn_service or ConnectionService.get_instance()
        self._graph = self._kg_service.get_graph()
        self._lock = threading.Lock()
        self._path_cache: Dict[Tuple[str, str], Dict[str, Any]] = {}

    def analyze_cross_case_paths(self, case_a: str, case_b: str) -> Dict[str, Any]:
        """Discovers operational paths and evidence linking case_a and case_b."""
        cache_key = tuple(sorted([case_a, case_b]))
        with self._lock:
            if cache_key in self._path_cache:
                return dict(self._path_cache[cache_key])

        # 1. Use ConnectionService.find_case_connection
        case_conn_res = self._conn_service.find_case_connection(case_a, case_b)

        paths_data: List[Dict[str, Any]] = []
        evidence_ids = set()

        if case_conn_res.connected and case_conn_res.path:
            paths_data.append({
                "type": "Case-to-Case Direct Shortest Path",
                "hops": case_conn_res.hops,
                "path": case_conn_res.path,
                "bridge_entities": case_conn_res.bridge_entities,
                "summary": case_conn_res.summary,
                "reasoning": case_conn_res.reasoning,
            })

            # Gather evidence for edges along this path
            u_graph = self._graph
            for i in range(len(case_conn_res.path) - 1):
                u, v = case_conn_res.path[i], case_conn_res.path[i + 1]
                edge_dict = u_graph.get_edge_data(u, v) or {}
                for edge_key, edata in edge_dict.items():
                    ev_id = edata.get("evidence_id")
                    if ev_id:
                        evidence_ids.add(ev_id)
                rev_edge_dict = u_graph.get_edge_data(v, u) or {}
                for edge_key, edata in rev_edge_dict.items():
                    ev_id = edata.get("evidence_id")
                    if ev_id:
                        evidence_ids.add(ev_id)

        result = {
            "connected": case_conn_res.connected,
            "hops": case_conn_res.hops or 99,
            "paths": paths_data,
            "evidence_count": len(evidence_ids),
            "evidence_ids": sorted(list(evidence_ids)),
            "summary": case_conn_res.summary or f"Connectivity evaluated between {case_a} and {case_b}",
        }

        with self._lock:
            self._path_cache[cache_key] = result

        return result
