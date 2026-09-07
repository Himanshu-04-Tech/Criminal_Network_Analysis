"""Temporal Graph Builder providing time-filtered snapshots and sliding windows."""

import threading
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Tuple, Any
import networkx as nx
from dateutil import parser as dt_parser

from graph_engine.graph_service import KnowledgeGraphService
from .temporal_models import TemporalSnapshot


class TemporalGraphBuilder:
    """
    Constructs time-sliced graph snapshots from the global knowledge graph.
    Indexes timestamps and provides windowed subgraphs with thread-safe caching.
    """

    def __init__(self, kg_service: Optional[KnowledgeGraphService] = None):
        self._kg_service = kg_service or KnowledgeGraphService.get_instance()
        self._global_graph: nx.MultiDiGraph = self._kg_service.get_graph()
        self._snapshot_cache: Dict[str, nx.MultiDiGraph] = {}
        self._lock = threading.Lock()

        # Cache parsed edge timestamps: (u, v, key) -> datetime
        self._edge_datetimes: Dict[Tuple[str, str, Any], datetime] = {}
        self._index_edge_timestamps()

    def _index_edge_timestamps(self) -> None:
        """Parses and indexes all edge timestamps for rapid temporal range queries."""
        for u, v, key, data in self._global_graph.edges(keys=True, data=True):
            ts_str = data.get("timestamp")
            if ts_str:
                try:
                    dt = dt_parser.isoparse(ts_str)
                    if dt.tzinfo is None:
                        dt = dt.replace(tzinfo=timezone.utc)
                    self._edge_datetimes[(u, v, key)] = dt
                except Exception:
                    pass

    @property
    def latest_timestamp(self) -> datetime:
        """Returns the latest timestamp present in the entire knowledge graph."""
        if self._edge_datetimes:
            return max(self._edge_datetimes.values())
        return datetime(2026, 8, 28, 18, 0, 0, tzinfo=timezone.utc)

    @property
    def earliest_timestamp(self) -> datetime:
        """Returns the earliest timestamp present in the entire knowledge graph."""
        if self._edge_datetimes:
            return min(self._edge_datetimes.values())
        return datetime(2026, 6, 2, 10, 0, 0, tzinfo=timezone.utc)

    def parse_time(self, time_val: Any) -> datetime:
        """Converts date string or datetime into UTC timezone-aware datetime."""
        if isinstance(time_val, datetime):
            if time_val.tzinfo is None:
                return time_val.replace(tzinfo=timezone.utc)
            return time_val
        dt = dt_parser.parse(str(time_val))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt

    def get_time_window(self, window_code: str) -> Tuple[datetime, datetime]:
        """
        Converts window presets into (start_dt, end_dt).
        Presets: '24h', '7d', '30d', '90d', 'all'.
        Anchors to the latest activity timestamp in the dataset.
        """
        anchor = self.latest_timestamp
        code = window_code.lower().strip()

        if code in ("24h", "1d", "last 24 hours"):
            start = anchor - timedelta(hours=24)
        elif code in ("7d", "last 7 days"):
            start = anchor - timedelta(days=7)
        elif code in ("30d", "last 30 days"):
            start = anchor - timedelta(days=30)
        elif code in ("90d", "last 90 days"):
            start = anchor - timedelta(days=90)
        elif code in ("all", "all time"):
            start = self.earliest_timestamp
        else:
            # Default fallback 30d
            start = anchor - timedelta(days=30)

        return start, anchor

    def build_snapshot(self, start_date: Any, end_date: Any) -> nx.MultiDiGraph:
        """
        Builds a MultiDiGraph snapshot containing only nodes and edges active
        between start_date and end_date (inclusive).
        """
        start_dt = self.parse_time(start_date)
        end_dt = self.parse_time(end_date)

        cache_key = f"{start_dt.isoformat()}_{end_dt.isoformat()}"
        with self._lock:
            if cache_key in self._snapshot_cache:
                return self._snapshot_cache[cache_key].copy()

        snapshot = nx.MultiDiGraph(
            start_date=start_dt.isoformat(),
            end_date=end_dt.isoformat(),
        )

        active_nodes = set()
        for (u, v, key), edge_dt in self._edge_datetimes.items():
            if start_dt <= edge_dt <= end_dt:
                edge_data = self._global_graph.get_edge_data(u, v, key=key)
                if edge_data:
                    # Add nodes with full attributes
                    if u not in active_nodes:
                        snapshot.add_node(u, **self._global_graph.nodes.get(u, {}))
                        active_nodes.add(u)
                    if v not in active_nodes:
                        snapshot.add_node(v, **self._global_graph.nodes.get(v, {}))
                        active_nodes.add(v)
                    snapshot.add_edge(u, v, key=key, **edge_data)

        with self._lock:
            self._snapshot_cache[cache_key] = snapshot

        return snapshot.copy()

    def get_snapshot_metadata(self, start_date: Any, end_date: Any) -> TemporalSnapshot:
        """Returns Pydantic model summary of snapshot attributes."""
        start_dt = self.parse_time(start_date)
        end_dt = self.parse_time(end_date)
        subg = self.build_snapshot(start_dt, end_dt)

        return TemporalSnapshot(
            snapshot_id=f"SNAP_{start_dt.strftime('%Y%m%d')}_{end_dt.strftime('%Y%m%d')}",
            start_date=start_dt.isoformat(),
            end_date=end_dt.isoformat(),
            nodes_count=subg.number_of_nodes(),
            edges_count=subg.number_of_edges(),
            active_entities=sorted(list(subg.nodes())),
        )
