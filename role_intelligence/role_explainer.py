"""Role Explainer generating auditable natural language justifications for role assignments."""

from typing import List, Dict, Any
from .role_models import InvestigationRole, RoleClassification


class RoleExplainer:
    """
    Translates mathematical graph metrics and topological patterns into
    human-readable, court-ready investigative justifications.
    """

    @staticmethod
    def generate_reasons(
        role: InvestigationRole,
        entity_id: str,
        metrics: Dict[str, float],
        communities_connected: List[str],
        cases_involved: List[str],
        details: Dict[str, Any],
    ) -> List[str]:
        """Generates a concise bulleted list of forensic justifications for the assigned role."""
        reasons: List[str] = []

        deg = metrics.get("degree", 0.0)
        bet = metrics.get("betweenness", 0.0)
        pr = metrics.get("pagerank", 0.0)
        inf_score = metrics.get("influence_score", 0.0)

        comm_count = len(communities_connected)
        case_count = len(cases_involved)

        if role == InvestigationRole.BROKER:
            effective_comms = max(comm_count, case_count)
            reasons.append(f"Connects {effective_comms} communities")
            reasons.append(f"Betweenness Centrality: {bet:.4f} (Top Tier Intermediary)")
            if case_count > 1:
                reasons.append(f"Bridges {case_count} FIR Cases ({', '.join(cases_involved[:3])})")
            if details.get("is_cut_vertex"):
                reasons.append("Structural articulation point: removal fragments inter-syndicate network")
            if details.get("covert_assets"):
                assets_str = ", ".join(details["covert_assets"])
                reasons.append(f"Operates through proxy assets: {assets_str}")

        elif role == InvestigationRole.HUB:
            reasons.append(f"Degree Centrality: {deg:.4f} (Top 10% direct connectivity)")
            if details.get("direct_connections_count"):
                reasons.append(f"Maintains {details['direct_connections_count']} direct links across network")
            if case_count > 0:
                reasons.append(f"Active in {case_count} FIR Cases ({', '.join(cases_involved[:3])})")

        elif role == InvestigationRole.HIGH_INFLUENCE:
            reasons.append(f"PageRank Score: {pr:.4f} (High global network prestige)")
            reasons.append(f"Composite Influence Score: {inf_score:.1f} / 100")
            if deg > 0.03:
                reasons.append(f"Strongly connected authority node with degree {deg:.4f}")

        elif role == InvestigationRole.CONNECTOR:
            reasons.append(f"Links {comm_count} distinct communities across network borders")
            if case_count > 1:
                reasons.append(f"Cross-case investigative link across {', '.join(cases_involved)}")

        elif role == InvestigationRole.COORDINATOR:
            reasons.append(f"High local clustering with degree {deg:.4f}")
            reasons.append("Coordinates operational activity within community")

        elif role == InvestigationRole.FINANCIAL_CONDUIT:
            pattern = details.get("conduit_type", "Money Routing")
            transfer_count = details.get("transfers_count", 0)
            reasons.append(f"Financial {pattern}: involved in {transfer_count} fund transfers")
            if details.get("fan_in_count"):
                reasons.append(f"Fan-In aggregation: receives deposits from {details['fan_in_count']} sources")
            if details.get("fan_out_count"):
                reasons.append(f"Fan-Out distribution: disburses funds to {details['fan_out_count']} accounts")

        elif role == InvestigationRole.SHARED_RESOURCE:
            shared_by = details.get("shared_by", [])
            res_type = details.get("resource_type", "Asset")
            if shared_by:
                reasons.append(
                    f"Shared {res_type} utilized by {len(shared_by)} distinct individuals ({', '.join(shared_by)})"
                )
            else:
                reasons.append(f"Shared {res_type} identified across multiple persons")
            if case_count > 1:
                reasons.append(f"Shared infrastructure linking {case_count} FIR investigations")

        elif role == InvestigationRole.ISOLATED_ENTITY:
            reasons.append("Degree Centrality: 0.0 (Zero active connections in knowledge graph)")
            reasons.append("Isolated entity record requiring intelligence validation or corroborating evidence")

        else:
            reasons.append(f"Degree Centrality: {deg:.4f}, Betweenness: {bet:.4f}")

        return reasons
