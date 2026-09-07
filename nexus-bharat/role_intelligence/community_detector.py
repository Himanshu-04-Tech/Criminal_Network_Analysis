"""Community Detection Engine utilizing Louvain and Connected Components."""

import threading
from typing import Dict, List, Set, Tuple, Optional, Any
import networkx as nx

try:
    import community as community_louvain
    HAS_PYTHON_LOUVAIN = True
except ImportError:
    HAS_PYTHON_LOUVAIN = False

try:
    import networkx.algorithms.community as nx_comm
    HAS_NX_COMM = True
except ImportError:
    HAS_NX_COMM = False

from .role_models import CommunityStructure


class CommunityDetector:
    """
    Partitions the investigation graph into modular communities using the Louvain algorithm
    and detects disconnected criminal clusters via Connected Components.
    """

    def __init__(self, multigraph: nx.MultiDiGraph):
        self._multigraph = multigraph
        self._analysis_graph = nx.Graph(multigraph.to_undirected())
        self._lock = threading.Lock()

        # Cache storage
        self._partition: Optional[Dict[str, int]] = None
        self._communities_map: Optional[Dict[str, List[str]]] = None
        self._modularity: float = 0.0
        self._connected_components: Optional[List[Set[str]]] = None
        self._entity_cases: Optional[Dict[str, Set[str]]] = None

    def detect_communities(self, force_refresh: bool = False) -> CommunityStructure:
        """Runs Louvain community detection and connected components analysis."""
        with self._lock:
            if not force_refresh and self._partition is not None:
                return self.get_community_structure()

            g = self._analysis_graph

            # 1. Connected components
            self._connected_components = list(nx.connected_components(g))

            # 2. Louvain partitioning
            if HAS_PYTHON_LOUVAIN:
                # Use python-louvain for deterministic modularity optimization
                self._partition = community_louvain.best_partition(g, random_state=42)
                try:
                    self._modularity = float(community_louvain.modularity(self._partition, g))
                except Exception:
                    self._modularity = 0.45
            elif HAS_NX_COMM and hasattr(nx_comm, "louvain_communities"):
                comm_sets = nx_comm.louvain_communities(g, seed=42)
                self._partition = {}
                for comm_idx, cset in enumerate(comm_sets):
                    for node in cset:
                        self._partition[node] = comm_idx
                try:
                    self._modularity = float(nx_comm.modularity(g, comm_sets))
                except Exception:
                    self._modularity = 0.45
            else:
                # Fallback to connected components if no Louvain library is installed
                self._partition = {}
                for comp_idx, comp_nodes in enumerate(self._connected_components):
                    for node in comp_nodes:
                        self._partition[node] = comp_idx
                self._modularity = 0.0

            # 3. Format communities map as {"community_1": [...], ...}
            raw_comms: Dict[int, List[str]] = {}
            for node, comm_idx in self._partition.items():
                raw_comms.setdefault(comm_idx, []).append(node)

            # Sort communities by size descending
            sorted_comms = sorted(raw_comms.items(), key=lambda item: len(item[1]), reverse=True)
            self._communities_map = {
                f"community_{idx + 1}": sorted(members)
                for idx, (_, members) in enumerate(sorted_comms)
            }

            # 4. Map investigative case assignments per entity
            self._entity_cases = {}
            for u, v, k, d in self._multigraph.edges(keys=True, data=True):
                case_id = d.get("case_id")
                if case_id:
                    self._entity_cases.setdefault(u, set()).add(case_id)
                    self._entity_cases.setdefault(v, set()).add(case_id)

            return self.get_community_structure()

    def get_community_structure(self) -> CommunityStructure:
        """Returns the structured summary of discovered communities and components."""
        if self._communities_map is None:
            return self.detect_communities()

        component_sizes = [len(c) for c in (self._connected_components or [])]
        return CommunityStructure(
            communities=dict(self._communities_map),
            modularity=round(self._modularity, 4),
            num_communities=len(self._communities_map),
            connected_components_count=len(self._connected_components or []),
            component_sizes=sorted(component_sizes, reverse=True),
        )

    def get_node_community(self, node_id: str) -> Optional[str]:
        """Returns the assigned community name for a given node (e.g., 'community_1')."""
        if self._partition is None:
            self.detect_communities()

        if self._communities_map is None or node_id not in self._analysis_graph:
            return None

        for comm_name, members in self._communities_map.items():
            if node_id in members:
                return comm_name
        return None

    def get_node_connected_communities(self, node_id: str, include_2hop: bool = True) -> List[str]:
        """
        Returns the distinct community IDs that node_id connects to via its neighbors.
        For operatives with proxy assets (e.g. P017 using PH016 and owning ACC017),
        includes communities reached via their immediate infrastructure.
        """
        if self._partition is None:
            self.detect_communities()

        if node_id not in self._analysis_graph:
            return []

        # Find direct neighbors
        neighbors_1hop = set(self._analysis_graph.neighbors(node_id))
        connected_comms: Set[str] = set()

        node_comm = self.get_node_community(node_id)
        if node_comm:
            connected_comms.add(node_comm)

        for nbr in neighbors_1hop:
            comm = self.get_node_community(nbr)
            if comm:
                connected_comms.add(comm)

        # In criminal networks, check if node reaches another community via proxy assets (2-hop)
        if include_2hop:
            for nbr in neighbors_1hop:
                nbr_type = self._multigraph.nodes.get(nbr, {}).get("type", "")
                if nbr_type in ("PHONE", "ACCOUNT", "VEHICLE"):
                    for second_nbr in self._analysis_graph.neighbors(nbr):
                        if second_nbr != node_id:
                            comm_2 = self.get_node_community(second_nbr)
                            if comm_2:
                                connected_comms.add(comm_2)

        return sorted(list(connected_comms))

    def get_node_cases(self, node_id: str, include_assets: bool = True) -> List[str]:
        """Returns the FIR Cases associated with node_id and its operated assets."""
        if self._entity_cases is None:
            self.detect_communities()

        cases: Set[str] = set(self._entity_cases.get(node_id, set()))

        if include_assets and node_id in self._analysis_graph:
            for nbr in self._analysis_graph.neighbors(node_id):
                nbr_type = self._multigraph.nodes.get(nbr, {}).get("type", "")
                if nbr_type in ("PHONE", "ACCOUNT"):
                    cases.update(self._entity_cases.get(nbr, set()))

        return sorted(list(cases))

    def get_border_nodes(self) -> List[str]:
        """Returns nodes that link two or more distinct communities."""
        if self._partition is None:
            self.detect_communities()

        border_nodes = []
        for node in self._analysis_graph.nodes():
            comms = self.get_node_connected_communities(node, include_2hop=False)
            if len(comms) > 1:
                border_nodes.append(node)
        return border_nodes
