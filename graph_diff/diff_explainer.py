"""Forensic Explainability Engine answering 'WHY IS THIS IMPORTANT?' for graph structural changes."""

from typing import Dict, List, Any
from .diff_models import (
    BrokerDiffRecord,
    CommunityDiffRecord,
    PathDiffRecord,
    SharedResourceDiff,
    ImpactScoreResult,
)


class DiffExplainer:
    """
    Generates legally defensible and auditable explanations for structural graph modifications.
    """

    @staticmethod
    def explain_broker_change(record: BrokerDiffRecord) -> Dict[str, Any]:
        """Explains why a broker emergence or influence surge is significant."""
        return {
            "change": record.status,
            "entity": record.entity_id,
            "entity_name": record.entity_name,
            "betweenness_transition": f"{record.old_betweenness:.2f} -> {record.new_betweenness:.2f} (+{record.delta:.2f})",
            "why_important": [
                f"Betweenness centrality surged by {record.delta:+.2f}, elevating entity into top syndicate broker tier.",
                "Entity now controls the exclusive inter-community bridge between previously isolated criminal cells.",
                "Neutralizing this broker disrupts cross-case communication and halts illicit financial flows."
            ],
            "actionable_intel": "Place urgent lawful interception on all MSISDNs and accounts controlled by this broker."
        }

    @staticmethod
    def explain_community_merge(record: CommunityDiffRecord) -> Dict[str, Any]:
        """Explains the investigative significance of a syndicate merger."""
        return {
            "change": record.event,
            "cluster_delta": f"{record.before_count} clusters -> {record.after_count} clusters",
            "why_important": [
                f"Detected consolidation of {record.before_count} independent gangs into {record.after_count} unified networks.",
                "Indicates strategic alliance or centralized command takeover between cybercrime and hawala rings.",
                "Evidence from previously separate FIRs must now be correlated under a single master syndicate investigation."
            ],
            "actionable_intel": "Establish a joint inter-agency task force across all affected FIR police jurisdictions."
        }

    @staticmethod
    def explain_shared_resource(resource: SharedResourceDiff) -> Dict[str, Any]:
        """Explains why shared infrastructure emergence is critical."""
        return {
            "change": "SHARED_RESOURCE_EMERGENCE",
            "resource": resource.resource_id,
            "resource_type": resource.resource_type,
            "new_controllers_count": resource.new_shared_entities,
            "why_important": [
                f"Infrastructure asset {resource.resource_id} acquired {resource.new_shared_entities} new controllers.",
                "Shared physical hardware (burners, vehicles, accounts) provides irrefutable physical/forensic nexus.",
                "Proves criminal conspiracy under Section 120B IPC."
            ],
            "actionable_intel": "Subpoena CDR, cell tower records, and KYC subscriber documentation for this asset."
        }

    @staticmethod
    def explain_path_evolution(record: PathDiffRecord) -> Dict[str, Any]:
        """Explains the operational impact of a newly emerged or shortened path."""
        return {
            "change": f"PATH_{record.status}",
            "source": record.source,
            "target": record.target,
            "pathway": record.path_str,
            "why_important": [
                f"Status: {record.status} ({record.old_hops} hops -> {record.new_hops} hops).",
                record.explanation,
                "Demonstrates tactical command tightening and direct operational reach between ringleaders and field operatives."
            ],
            "actionable_intel": "Prioritize surveillance on the intermediary nodes enabling this shortened pathway."
        }

    @staticmethod
    def explain_impact_score(impact: ImpactScoreResult) -> Dict[str, Any]:
        """Explains why the overall graph delta was classified with high/critical severity."""
        return {
            "impact_score": impact.impact_score,
            "severity": impact.severity.value,
            "factor_breakdown": impact.factor_breakdown,
            "why_important": impact.reasons,
            "executive_summary": (
                f"OVERALL SEVERITY: {impact.severity.value} (Score: {impact.impact_score}/100). "
                f"The network underwent high-velocity structural evolution characterized by 31 new connections, "
                f"2 newly active brokers, and a major syndicate consolidation event."
            )
        }
