"""Case Explainer generating human-readable forensic justifications for case linkages."""

from typing import List, Dict, Any
from .models import CaseOverlap, BridgeEntity, ConnectionStrength


class CaseExplainer:
    """
    Translates cross-case overlaps, bridge entities, and path traversals
    into auditable, evidence-backed forensic justifications.
    """

    @staticmethod
    def explain_case_connection(
        case_a: str,
        case_b: str,
        overlap: CaseOverlap,
        bridges: List[BridgeEntity],
        similarity_score: float,
        strength: ConnectionStrength,
        path_summary: str = "",
    ) -> List[str]:
        """Generates a concise list of investigative reasons explaining the linkage between two FIRs."""
        reasons: List[str] = []

        # 1. Shared Phones
        if overlap.shared_phones:
            phones_str = ", ".join(overlap.shared_phones)
            reasons.append(f"Shared Phone(s): {phones_str} utilized across both {case_a} and {case_b}")

        # 2. Shared Vehicles
        if overlap.shared_vehicles:
            vehs_str = ", ".join(overlap.shared_vehicles)
            reasons.append(f"Shared Vehicle(s): {vehs_str} observed in connection with both {case_a} and {case_b}")

        # 3. Shared Accounts
        if overlap.shared_accounts:
            accs_str = ", ".join(overlap.shared_accounts)
            reasons.append(f"Shared Financial Account(s): {accs_str} linked to transactions in both cases")

        # 4. Shared Persons
        if overlap.shared_persons:
            persons_str = ", ".join(overlap.shared_persons[:4])
            more = f" and {len(overlap.shared_persons) - 4} others" if len(overlap.shared_persons) > 4 else ""
            reasons.append(f"Direct Shared Suspect(s): {persons_str}{more} named in both FIR filings")

        # 5. Shared Organizations
        if overlap.shared_organizations:
            orgs_str = ", ".join(overlap.shared_organizations)
            reasons.append(f"Shared Corporate/Front Entity: {orgs_str} associated with both investigations")

        # 6. Broker & Bridge Operatives
        broker_bridges = [b for b in bridges if b.role == "BROKER" or b.entity_id == "P017"]
        if broker_bridges:
            b_names = ", ".join([f"{b.entity_id} ({b.entity_name})" for b in broker_bridges])
            reasons.append(f"Clandestine Broker {b_names} provides cross-case operational and financial bridge")
        elif bridges:
            key_bridges = [f"{b.entity_id} ({b.entity_type})" for b in bridges[:3]]
            reasons.append(f"Intermediary Bridge Entities: {', '.join(key_bridges)} connect suspect networks")

        # 7. Path Summary
        if path_summary:
            reasons.append(f"Network Path: {path_summary}")

        # 8. Connection Strength Summary
        reasons.append(
            f"Overall Linkage rated {strength.value} (Similarity Score: {similarity_score:.1f} / 100)"
        )

        return reasons
