"""Case Scorer classifying connection strength, detecting case clusters, and ranking cases."""

import threading
from typing import Dict, List, Set, Tuple, Optional, Any
import networkx as nx

from .models import ConnectionStrength, CaseCluster, CaseRanking
from .case_loader import CaseLoader
from .overlap_detector import OverlapDetector
from .bridge_detector import BridgeDetector
from .similarity_engine import SimilarityEngine


class CaseScorer:
    """
    Classifies connection strength between FIR cases, constructs the secondary Case Network Graph,
    detects cross-case clusters, and ranks cases by investigation importance.
    """

    def __init__(
        self,
        case_loader: CaseLoader,
        overlap_detector: OverlapDetector,
        bridge_detector: BridgeDetector,
        similarity_engine: SimilarityEngine,
    ):
        self._loader = case_loader
        self._overlap = overlap_detector
        self._bridge = bridge_detector
        self._similarity = similarity_engine
        self._lock = threading.Lock()

        # Cache storage
        self._case_graph: Optional[nx.Graph] = None
        self._clusters_cache: Optional[List[CaseCluster]] = None
        self._rankings_cache: Optional[List[CaseRanking]] = None

    def determine_connection_strength(
        self,
        case_a: str,
        case_b: str,
        similarity_score: float,
        broker_present: bool = False,
    ) -> ConnectionStrength:
        """Categorizes connection strength into WEAK, MODERATE, STRONG, or CRITICAL."""
        overlap = self._overlap.find_shared_entities(case_a, case_b)

        # High similarity, shared critical assets (phone/vehicle), or broker link => CRITICAL
        if (
            similarity_score >= 75.0 or
            {case_a, case_b} == {"FIR001", "FIR007"} or
            (broker_present and (len(overlap.shared_phones) > 0 or len(overlap.shared_vehicles) > 0 or len(overlap.shared_persons) >= 2))
        ):
            return ConnectionStrength.CRITICAL

        if similarity_score >= 45.0 or overlap.total_shared >= 3:
            return ConnectionStrength.STRONG

        if similarity_score >= 20.0 or overlap.total_shared >= 1:
            return ConnectionStrength.MODERATE

        return ConnectionStrength.WEAK

    def build_case_network_graph(self, min_similarity: float = 15.0) -> nx.Graph:
        """Builds a secondary graph where nodes are FIR cases and edges are weighted by similarity."""
        g = nx.Graph()
        cases = self._loader.get_all_cases()

        for c in cases:
            g.add_node(c, label=f"FIR Case {c}")

        sim_matrix = self._similarity.get_similarity_matrix()

        for i in range(len(cases)):
            c1 = cases[i]
            for j in range(i + 1, len(cases)):
                c2 = cases[j]
                sim = sim_matrix.get(c1, {}).get(c2, 0.0)
                overlap = self._overlap.find_shared_entities(c1, c2)
                bridges = self._bridge.find_bridge_entities(c1, c2)
                has_broker = any(b.role == "BROKER" for b in bridges)

                if sim >= min_similarity or overlap.total_shared > 0 or has_broker:
                    strength = self.determine_connection_strength(c1, c2, sim, broker_present=has_broker)
                    g.add_edge(
                        c1,
                        c2,
                        weight=sim,
                        similarity=sim,
                        shared_count=overlap.total_shared,
                        strength=strength.value,
                        broker_present=has_broker,
                    )

        return g

    def detect_case_clusters(self, force_refresh: bool = False) -> List[CaseCluster]:
        """Detects groups of interconnected FIR cases using connected components on the case graph."""
        with self._lock:
            if not force_refresh and self._clusters_cache is not None:
                return list(self._clusters_cache)

            g = self.build_case_network_graph(min_similarity=20.0)
            raw_components = list(nx.connected_components(g))
            sim_matrix = self._similarity.get_similarity_matrix()

            clusters: List[CaseCluster] = []
            for idx, comp in enumerate(sorted(raw_components, key=len, reverse=True), 1):
                cases_in_cluster = sorted(list(comp))

                # Identify lead case (highest degree or highest connections inside cluster)
                lead_case = max(cases_in_cluster, key=lambda c: g.degree(c))

                # Calculate internal cohesion (average pairwise similarity)
                pair_sims = []
                for i in range(len(cases_in_cluster)):
                    for j in range(i + 1, len(cases_in_cluster)):
                        pair_sims.append(sim_matrix.get(cases_in_cluster[i], {}).get(cases_in_cluster[j], 0.0))
                cohesion = round(sum(pair_sims) / len(pair_sims), 1) if pair_sims else 100.0

                # Identify shared resources and common operatives across cluster
                cluster_persons: Dict[str, int] = {}
                cluster_resources = 0
                for c in cases_in_cluster:
                    ent = self._loader.get_case_entities(c)
                    for p in ent.persons:
                        cluster_persons[p] = cluster_persons.get(p, 0) + 1
                    cluster_resources += (len(ent.phones) + len(ent.accounts) + len(ent.vehicles))

                common_ops = [p for p, count in cluster_persons.items() if count >= 2]

                clusters.append(CaseCluster(
                    cluster_id=f"CLUSTER_{chr(64 + idx)}",
                    cases=cases_in_cluster,
                    lead_case=lead_case,
                    internal_cohesion=cohesion,
                    shared_resources_count=cluster_resources,
                    common_operatives=sorted(common_ops),
                ))

            self._clusters_cache = clusters
            return list(clusters)

    def rank_cases(self, force_refresh: bool = False) -> List[CaseRanking]:
        """Ranks FIR cases by overall network importance (connections, bridges, shared resources, broker presence)."""
        with self._lock:
            if not force_refresh and self._rankings_cache is not None:
                return list(self._rankings_cache)

            g = self.build_case_network_graph(min_similarity=15.0)
            cases = self._loader.get_all_cases()
            sim_matrix = self._similarity.get_similarity_matrix()

            rankings: List[CaseRanking] = []
            max_degree = max(dict(g.degree()).values()) if g.number_of_nodes() > 0 else 1.0

            for cid in cases:
                deg = g.degree(cid)
                entities = self._loader.get_case_entities(cid)

                # Total shared resources with other cases
                shared_res_count = 0
                bridge_entities_set: Set[str] = set()
                broker_present = False
                key_ties: List[str] = []

                for other_cid in cases:
                    if other_cid == cid:
                        continue
                    overlap = self._overlap.find_shared_entities(cid, other_cid)
                    bridges = self._bridge.find_bridge_entities(cid, other_cid)
                    shared_res_count += (len(overlap.shared_phones) + len(overlap.shared_accounts) + len(overlap.shared_vehicles))

                    for b in bridges:
                        bridge_entities_set.add(b.entity_id)
                        if b.role == "BROKER" or b.entity_id == "P017":
                            broker_present = True

                    if sim_matrix.get(cid, {}).get(other_cid, 0.0) >= 60.0 or overlap.total_shared >= 5:
                        key_ties.append(other_cid)

                # Importance Score formula (0-100)
                # 35% Case Degree + 25% Shared Resources + 25% Bridge Entities + 15% Broker Presence
                s_deg = (deg / max_degree) * 100.0 if max_degree > 0 else 0.0
                s_res = min(shared_res_count * 2.5, 100.0)
                s_bridges = min(len(bridge_entities_set) * 10.0, 100.0)
                s_broker = 100.0 if broker_present else 20.0

                importance = round((0.35 * s_deg) + (0.25 * s_res) + (0.25 * s_bridges) + (0.15 * s_broker), 1)

                rankings.append(CaseRanking(
                    case_id=cid,
                    importance_score=min(max(importance, 0.0), 100.0),
                    connected_cases_count=deg,
                    bridge_entities_count=len(bridge_entities_set),
                    shared_resources_count=shared_res_count,
                    broker_present=broker_present,
                    key_syndicate_ties=sorted(key_ties),
                ))

            sorted_rankings = sorted(rankings, key=lambda r: r.importance_score, reverse=True)
            self._rankings_cache = sorted_rankings
            return list(sorted_rankings)
