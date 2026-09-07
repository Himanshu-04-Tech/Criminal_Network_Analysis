"""Role Classifier mapping topological graph metrics to investigative criminal network roles."""

import threading
from typing import Dict, List, Set, Tuple, Optional, Any
import networkx as nx

from .role_models import InvestigationRole, RoleClassification
from .centrality_engine import CentralityEngine
from .community_detector import CommunityDetector
from .influence_analyzer import InfluenceAnalyzer
from .role_explainer import RoleExplainer


class RoleClassifier:
    """
    Evaluates investigation entities against topological graph criteria to determine
    their primary operational role within the criminal syndicate.
    """

    def __init__(
        self,
        multigraph: nx.MultiDiGraph,
        centrality_engine: CentralityEngine,
        community_detector: CommunityDetector,
        influence_analyzer: InfluenceAnalyzer,
    ):
        self._multigraph = multigraph
        self._centrality = centrality_engine
        self._communities = community_detector
        self._influence = influence_analyzer
        self._lock = threading.Lock()

        self._classifications: Optional[Dict[str, RoleClassification]] = None

    def classify_all(self, force_refresh: bool = False) -> Dict[str, RoleClassification]:
        """Classifies all entities in the graph into investigation roles."""
        with self._lock:
            if not force_refresh and self._classifications is not None:
                return dict(self._classifications)

            # Ensure dependencies are precomputed
            self._centrality.compute_all()
            self._communities.detect_communities()
            self._influence.calculate_influence_scores()

            g = self._centrality.analysis_graph
            deg_dict = self._centrality.get_degree_centrality()
            bet_direct = self._centrality.get_betweenness_centrality(use_footprint=False)
            bet_footprint = self._centrality.get_betweenness_centrality(use_footprint=True)
            pr_dict = self._centrality.get_pagerank()
            influence_scores = self._influence.calculate_influence_scores()

            # Thresholds
            top_deg_threshold = self._centrality.get_percentile_threshold("degree", 0.90)
            top_bet_threshold = self._centrality.get_percentile_threshold("betweenness", 0.90, use_footprint=True)
            top_pr_threshold = self._centrality.get_percentile_threshold("pagerank", 0.90)

            # Pre-scan shared resources
            shared_resource_map = self._scan_shared_resources()

            # Pre-scan financial conduits
            financial_conduit_map = self._scan_financial_conduits()

            # Articulation points (cut-vertices)
            try:
                cut_vertices = set(nx.articulation_points(g))
            except Exception:
                cut_vertices = set()

            classifications: Dict[str, RoleClassification] = {}

            for node_id in self._multigraph.nodes():
                node_data = self._multigraph.nodes.get(node_id, {})
                node_type = node_data.get("type", "UNKNOWN")
                node_name = node_data.get("name", node_id)

                # Skip pure FIR case nodes from entity role classification if desired, or classify as CASE
                if node_type == "CASE":
                    continue

                deg = deg_dict.get(node_id, 0.0)
                bet = bet_direct.get(node_id, 0.0)
                bet_eff = bet_footprint.get(node_id, bet)
                pr = pr_dict.get(node_id, 0.0)
                inf_score = influence_scores.get(node_id, 0.0)

                metrics_dict = {
                    "degree": round(deg, 6),
                    "betweenness": round(bet, 6),
                    "betweenness_footprint": round(bet_eff, 6),
                    "pagerank": round(pr, 6),
                    "influence_score": inf_score,
                }

                connected_comms = self._communities.get_node_connected_communities(node_id)
                connected_cases = self._communities.get_node_cases(node_id)
                comm_count = len(connected_comms)
                case_count = len(connected_cases)

                role = InvestigationRole.UNKNOWN
                confidence = 1.0
                details: Dict[str, Any] = {}

                # 1. Rule: ISOLATED_ENTITY (Degree = 0)
                if self._multigraph.degree(node_id) == 0:
                    role = InvestigationRole.ISOLATED_ENTITY
                    confidence = 1.0

                # 2. Rule: SHARED_RESOURCE (Shared phones, accounts, vehicles used/owned by >1 Person)
                elif node_id in shared_resource_map:
                    role = InvestigationRole.SHARED_RESOURCE
                    confidence = 0.95
                    details = shared_resource_map[node_id]

                # 3. Rule: FINANCIAL_CONDUIT (Accounts with high transfer patterns)
                elif node_id in financial_conduit_map and node_type == "ACCOUNT":
                    role = InvestigationRole.FINANCIAL_CONDUIT
                    confidence = 0.95
                    details = financial_conduit_map[node_id]

                # 4. Rule: HUB (Top 10% Degree Centrality)
                elif deg >= top_deg_threshold and deg > 0.0:
                    role = InvestigationRole.HUB
                    confidence = 0.90
                    details["direct_connections_count"] = self._multigraph.degree(node_id)

                # 5. Rule: BROKER
                # Top Betweenness (direct or footprint) AND connects multiple communities/cases
                # Or structural cut-vertex between multiple communities
                elif (
                    (bet_eff >= top_bet_threshold or node_id in cut_vertices)
                    and (comm_count > 1 or case_count > 1)
                ):
                    role = InvestigationRole.BROKER
                    confidence = 0.95
                    broker_score = self._influence.calculate_broker_score(node_id)
                    details["broker_score"] = broker_score
                    details["is_cut_vertex"] = (node_id in cut_vertices)
                    metrics_dict["broker_score"] = broker_score

                    # Track covert proxy assets if any
                    assets_used = [
                        v for u, v, d in self._multigraph.edges(node_id, data=True)
                        if d.get("relationship_type") in ("USES", "OWNS")
                    ]
                    if assets_used:
                        details["covert_assets"] = assets_used

                    # Calculate covert brokerage leverage (cross-community paths / direct degree)
                    try:
                        from graph_analytics.connection_service import ConnectionService
                        cs = ConnectionService.get_instance()
                        b_report = cs.verify_hidden_broker(node_id)
                        paths_count = b_report.details.get("paths_routing_via_broker_infrastructure", 0)
                    except Exception:
                        paths_count = 0

                    deg_val = self._multigraph.degree(node_id)
                    details["paths_routed"] = paths_count
                    details["brokerage_leverage"] = (paths_count / deg_val) if deg_val > 0 else 0.0

                # 6. Rule: HIGH_INFLUENCE (Top PageRank or high composite influence score)
                elif pr >= top_pr_threshold or inf_score >= 80.0:
                    role = InvestigationRole.HIGH_INFLUENCE
                    confidence = 0.85

                # 7. Rule: CONNECTOR (Links multiple communities without top betweenness)
                elif comm_count > 1 or case_count > 1:
                    role = InvestigationRole.CONNECTOR
                    confidence = 0.80

                # 8. Rule: COORDINATOR (Within-community coordinator)
                elif deg >= 0.02 and comm_count == 1:
                    role = InvestigationRole.COORDINATOR
                    confidence = 0.75

                else:
                    role = InvestigationRole.UNKNOWN
                    confidence = 0.50

                reasons = RoleExplainer.generate_reasons(
                    role=role,
                    entity_id=node_id,
                    metrics=metrics_dict,
                    communities_connected=connected_comms,
                    cases_involved=connected_cases,
                    details=details,
                )

                classifications[node_id] = RoleClassification(
                    entity_id=node_id,
                    entity_name=node_name,
                    entity_type=node_type,
                    role=role,
                    confidence=confidence,
                    influence_score=inf_score,
                    reasons=reasons,
                    metrics=metrics_dict,
                    communities_connected=connected_comms,
                    cases_involved=connected_cases,
                    details=details,
                )

            self._classifications = classifications
            return dict(classifications)

    def _scan_shared_resources(self) -> Dict[str, Dict[str, Any]]:
        """Identifies non-person resources that are connected to 2 or more distinct persons."""
        resource_users: Dict[str, Set[str]] = {}
        for u, v, k, d in self._multigraph.edges(keys=True, data=True):
            rel_type = d.get("relationship_type")
            if rel_type in ("USES", "OWNS"):
                u_type = self._multigraph.nodes.get(u, {}).get("type")
                v_type = self._multigraph.nodes.get(v, {}).get("type")
                if u_type == "PERSON" and v_type in ("PHONE", "ACCOUNT", "VEHICLE"):
                    resource_users.setdefault(v, set()).add(u)

        shared: Dict[str, Dict[str, Any]] = {}
        for res_id, persons in resource_users.items():
            if len(persons) > 1:
                res_type = self._multigraph.nodes.get(res_id, {}).get("type", "Resource")
                shared[res_id] = {
                    "resource_type": res_type,
                    "shared_by": sorted(list(persons)),
                    "shared_count": len(persons),
                }
        return shared

    def _scan_financial_conduits(self) -> Dict[str, Dict[str, Any]]:
        """Identifies financial accounts performing Fan-In, Fan-Out, or Money Routing."""
        transfers_in: Dict[str, int] = {}
        transfers_out: Dict[str, int] = {}

        for u, v, k, d in self._multigraph.edges(keys=True, data=True):
            if d.get("relationship_type") == "TRANSFERRED_TO":
                transfers_out[u] = transfers_out.get(u, 0) + 1
                transfers_in[v] = transfers_in.get(v, 0) + 1

        all_accounts = set(list(transfers_in.keys()) + list(transfers_out.keys()))
        conduits: Dict[str, Dict[str, Any]] = {}

        for acc in all_accounts:
            in_c = transfers_in.get(acc, 0)
            out_c = transfers_out.get(acc, 0)
            total = in_c + out_c

            if total >= 2:
                if out_c >= 2 and in_c == 0:
                    conduit_type = "Fan-Out Distribution"
                elif in_c >= 2 and out_c == 0:
                    conduit_type = "Fan-In Aggregation"
                elif in_c >= 1 and out_c >= 1:
                    conduit_type = "Money Routing & Layering"
                else:
                    conduit_type = "High-Volume Transfer Node"

                conduits[acc] = {
                    "conduit_type": conduit_type,
                    "transfers_count": total,
                    "fan_in_count": in_c,
                    "fan_out_count": out_c,
                }

        return conduits

    def get_classification(self, entity_id: str) -> Optional[RoleClassification]:
        """Returns the classified role for an entity."""
        if self._classifications is None:
            self.classify_all()
        return self._classifications.get(entity_id)

    def get_entities_by_role(self, role: InvestigationRole) -> List[RoleClassification]:
        """Returns all entities classified under a specific investigation role."""
        if self._classifications is None:
            self.classify_all()
        return [c for c in self._classifications.values() if c.role == role]

    def get_top_brokers(self, limit: int = 5) -> List[RoleClassification]:
        """Returns top brokers ranked by broker score and brokerage leverage descending."""
        brokers = self.get_entities_by_role(InvestigationRole.BROKER)
        sorted_brokers = sorted(
            brokers,
            key=lambda b: (
                b.details.get("broker_score", 0.0),
                b.details.get("brokerage_leverage", 0.0),
                b.details.get("paths_routed", 0),
                b.metrics.get("betweenness_footprint", 0.0),
            ),
            reverse=True,
        )
        return sorted_brokers[:limit]

    def get_top_hubs(self, limit: int = 5) -> List[RoleClassification]:
        """Returns top hubs ranked by degree centrality descending."""
        hubs = self.get_entities_by_role(InvestigationRole.HUB)
        # If fewer hubs, also include highest degree entities
        if len(hubs) < limit:
            all_sorted = sorted(
                self.classify_all().values(),
                key=lambda c: c.metrics.get("degree", 0.0),
                reverse=True,
            )
            hubs = [c for c in all_sorted if c.role in (InvestigationRole.HUB, InvestigationRole.BROKER)][:limit]
        else:
            hubs = sorted(hubs, key=lambda c: c.metrics.get("degree", 0.0), reverse=True)[:limit]
        return hubs

    def get_top_influencers(self, limit: int = 5) -> List[RoleClassification]:
        """Returns top entities ranked by overall 0-100 influence score."""
        all_entities = list(self.classify_all().values())
        sorted_entities = sorted(all_entities, key=lambda c: c.influence_score, reverse=True)
        return sorted_entities[:limit]
