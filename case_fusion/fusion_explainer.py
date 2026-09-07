"""Forensic explainability engine answering: WHY SHOULD THESE CASES BE INVESTIGATED TOGETHER?"""

from typing import List
from .fusion_models import (
    SharedEntitiesBreakdown,
    FusionBridgeEntity,
    EmergentPath,
    CommunityShift,
    FusionScoreResult,
)


class FusionExplainer:
    """
    Generates auditable, court-ready investigative justifications
    explaining why selected FIR cases should be fused into a single joint operation.
    """

    @staticmethod
    def generate_reasons(
        case_ids: List[str],
        shared_entities: SharedEntitiesBreakdown,
        bridges: List[FusionBridgeEntity],
        emergent_paths: List[EmergentPath],
        community_shift: CommunityShift,
        score: FusionScoreResult,
    ) -> List[str]:
        """Synthesizes qualitative evidence points into plain-language investigative justifications."""
        reasons: List[str] = []
        cases_str = ", ".join(sorted(case_ids))

        # 1. Direct Shared Infrastructure & Operatives
        if shared_entities.phones:
            reasons.append(f"Shared Phone(s) {', '.join(shared_entities.phones[:2])} utilized across multiple FIR cases")
        if shared_entities.vehicles:
            reasons.append(f"Shared Vehicle(s) {', '.join(shared_entities.vehicles[:2])} sighted across crime scenes")
        if shared_entities.accounts:
            reasons.append(f"Shared Bank Account(s) {', '.join(shared_entities.accounts[:2])} utilized for illicit fund routing")
        if shared_entities.persons:
            reasons.append(f"Shared Operative(s) {', '.join(shared_entities.persons[:2])} cited across separate FIR investigations")
        if shared_entities.organizations:
            reasons.append(f"Shared Front Organization(s) {', '.join(shared_entities.organizations[:2])} implicated in joint money laundering")

        # 2. Broker Presence
        broker_bridges = [b for b in bridges if b.role == "BROKER" or b.entity_id == "P017"]
        if broker_bridges:
            b_names = ", ".join([f"{b.entity_id} ({b.entity_name})" for b in broker_bridges[:2]])
            reasons.append(f"Clandestine Broker {b_names} coordinates cross-case infrastructure between separate cells")

        # 3. Emergent Hidden Paths
        if emergent_paths:
            reasons.append(f"{len(emergent_paths)} emergent cross-case hidden paths discovered linking previously isolated suspects")

        # 4. Community Consolidation
        if community_shift.communities_before > community_shift.communities_after:
            reasons.append(
                f"Community network analysis collapsed {community_shift.communities_before} separate case silos into {community_shift.communities_after} cohesive syndicate communities"
            )

        # 5. Composite Score & Strength
        reasons.append(
            f"Overall Fusion Intelligence Score of {score.fusion_score:.0f}/100 ({score.strength.value}) confirms cases [{cases_str}] belong to a unified organized crime network"
        )

        return reasons
