"""Snapshot Loader consuming Module 7 Temporal Intelligence Engine."""

import threading
from typing import Dict, Tuple, Optional, Any
import networkx as nx

from temporal_intelligence.temporal_service import TemporalIntelligenceService


class SnapshotLoader:
    """
    Loads and caches MultiDiGraph snapshots directly from Module 7 Temporal Intelligence Engine.
    Ensures zero duplicate graph parsing or redundant disk I/O.
    """

    def __init__(self, temporal_service: Optional[TemporalIntelligenceService] = None):
        self._temporal_service = temporal_service or TemporalIntelligenceService.get_instance()
        self._cache: Dict[str, nx.MultiDiGraph] = {}
        self._lock = threading.Lock()

    def load_snapshot(self, start_date: Any, end_date: Any, force_refresh: bool = False) -> nx.MultiDiGraph:
        """
        Loads a time-bounded NetworkX graph snapshot using Module 7.
        """
        cache_key = f"{str(start_date)}_{str(end_date)}"
        with self._lock:
            if not force_refresh and cache_key in self._cache:
                return self._cache[cache_key].copy()

        graph = self._temporal_service.build_snapshot(start_date, end_date)

        with self._lock:
            self._cache[cache_key] = graph

        return graph.copy()

    def load_canonical_snapshots(self) -> Tuple[nx.MultiDiGraph, nx.MultiDiGraph]:
        """
        Retrieves the canonical benchmark snapshots for comparative intelligence:
        - Snapshot A: Baseline Pre-Reconfiguration Period (2026-08-01 to 2026-08-15)
        - Snapshot B: Post-Reconfiguration Reorganized Network (2026-08-15 to 2026-08-28)
        """
        snap_a = self.load_snapshot("2026-08-01T00:00:00Z", "2026-08-15T00:00:00Z")
        snap_b = self.load_snapshot("2026-08-15T00:00:00Z", "2026-08-28T23:59:59Z")
        return snap_a, snap_b
