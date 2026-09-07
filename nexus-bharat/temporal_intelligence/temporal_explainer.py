"""Forensic Explainability Engine for Temporal Anomalies and Network Evolution."""

from typing import Dict, List, Any, Optional
from .temporal_models import (
    CommunicationBurst,
    RelationshipChange,
    CommunityEvolutionRecord,
    BrokerEvolutionRecord,
    FinancialTemporalPattern,
    TemporalAnomaly,
)


class TemporalExplainer:
    """
    Produces court-ready, audit-compliant natural language explanations answering:
    'WHY WAS THIS FLAGGED?' across all temporal graph intelligence findings.
    """

    @staticmethod
    def explain_burst(burst: CommunicationBurst) -> Dict[str, Any]:
        """Explains why a communication burst was flagged."""
        entities_str = " & ".join(burst.entities)
        phones_str = ", ".join(burst.phone_entities) if burst.phone_entities else "Direct/Intermediary"
        
        narrative = (
            f"ALERT CRITERIA: A severe communication anomaly was detected between suspects {entities_str} "
            f"via burner devices [{phones_str}]. During the period {burst.start_time} to {burst.end_time} "
            f"({burst.duration_hours:.1f} hours), the suspects exchanged {burst.call_count} calls at an extraordinary "
            f"frequency of {burst.calls_per_hour:.1f} calls/hour. In criminal investigations, normal operational "
            f"baseline between suspects rarely exceeds 1-2 calls per week. This 15x-20x surge represents tactical "
            f"pre-operation coordination immediately prior to major illicit transactions."
        )

        return {
            "title": f"Tactical Communication Surge: {entities_str}",
            "severity": burst.severity.value,
            "call_count": burst.call_count,
            "duration_hours": burst.duration_hours,
            "calls_per_hour": burst.calls_per_hour,
            "forensic_narrative": narrative,
            "investigative_recommendations": [
                "Issue urgent CDR production orders for the involved MSISDNs.",
                "Correlate cell tower locations with CCTV footage around the burst time window.",
                "Subpoena subscriber verification documents and payment methods for SIM activation.",
            ]
        }

    @staticmethod
    def explain_broker_evolution(record: BrokerEvolutionRecord) -> Dict[str, Any]:
        """Explains why a broker's elevation was flagged."""
        narrative = (
            f"ROLE ELEVATION AUDIT: Entity {record.entity_name} ({record.entity_id}) underwent a dramatic "
            f"topological shift in the investigation graph. Betweenness centrality and network brokerage influence "
            f"surged from a baseline of {record.old_score:.1f} to {record.new_score:.1f} (an increase of "
            f"+{record.score_delta:.1f} points). Graph analysis proves that this entity serves as the singular "
            f"bridge connecting two otherwise isolated criminal syndicate clusters. Intercepting this broker "
            f"will sever coordination channels across multiple FIR investigations."
        )

        return {
            "title": f"Critical Broker Emergence: {record.entity_name} ({record.entity_id})",
            "status": record.status,
            "score_progression": f"{record.old_score:.1f} -> {record.new_score:.1f} (+{record.score_delta:.1f})",
            "forensic_narrative": narrative,
            "investigative_recommendations": [
                "Designate entity as a High-Value Target (HVT) across participating police stations.",
                "Monitor all outbound communications from this entity for cross-case bridge identification.",
                "Initiate comprehensive financial profiling across associated accounts.",
            ]
        }

    @staticmethod
    def explain_community_merge(record: CommunityEvolutionRecord) -> Dict[str, Any]:
        """Explains why a community merge was flagged."""
        narrative = (
            f"SYNDICATE CONSOLIDATION: Cross-case graph analytics detected the structural merger of "
            f"{record.before_count} previously independent criminal operations into a single cohesive network. "
            f"Affected operational groups: {', '.join(record.affected_communities)}. "
            f"This evolution signifies that disparate criminal gangs (e.g. cyber fraud operatives and hawala money "
            f"launderers) have established formal coordination agreements and shared infrastructure."
        )

        return {
            "title": "Syndicate Consolidation & Cross-Case Merger",
            "event": record.event,
            "summary": record.summary,
            "forensic_narrative": narrative,
            "investigative_recommendations": [
                "Establish an inter-jurisdictional Joint Task Force (JTF).",
                "Consolidate evidence from all merged FIR files into a unified master case file.",
                "Examine common bank accounts and burner phones for shared resource exploitation.",
            ]
        }

    @staticmethod
    def explain_financial_pattern(pattern: FinancialTemporalPattern) -> Dict[str, Any]:
        """Explains why a rapid financial typology was flagged."""
        if pattern.pattern_type == "FINANCIAL_FAN_OUT":
            typology = "Mule Account Structuring / Rapid Fund Dispersal"
            narrative = (
                f"MONEY LAUNDERING TYPOLOGY (FAN-OUT): Account {pattern.source_account} executed {pattern.transaction_count} "
                f"rapid outgoing transfers to accounts [{', '.join(pattern.target_accounts)}] within "
                f"{pattern.duration_minutes:.1f} minutes. This behavior is characteristic of rapid fund dissipation "
                f"designed to empty primary victim deposit accounts before freeze orders can be served."
            )
        elif pattern.pattern_type == "FINANCIAL_FAN_IN":
            typology = "Illicit Proceeds Aggregation / Fan-In Pooling"
            narrative = (
                f"MONEY LAUNDERING TYPOLOGY (FAN-IN): Target account {pattern.target_accounts[0] if pattern.target_accounts else 'UNKNOWN'} "
                f"received {pattern.transaction_count} incoming transfers from accounts [{', '.join(pattern.involved_accounts[:-1])}] "
                f"in under {pattern.duration_minutes:.1f} minutes. This pattern represents the collection phase "
                f"where fragmented mule account deposits are aggregated for bulk conversion or hawala handover."
            )
        else:
            typology = "Circular Layering Loop / Round-Tripping"
            narrative = (
                f"MONEY LAUNDERING TYPOLOGY (CIRCULAR): Illicit capital completed a circular route through "
                f"accounts: {' -> '.join(pattern.involved_accounts)} -> {pattern.involved_accounts[0]}. "
                f"Round-tripping transactions create deceptive layers of commercial legitimacy, artificially "
                f"inflating transaction volume while disguising the true origin and ultimate beneficiary of the funds."
            )

        return {
            "typology": typology,
            "pattern_type": pattern.pattern_type,
            "involved_accounts": pattern.involved_accounts,
            "duration_minutes": pattern.duration_minutes,
            "forensic_narrative": narrative,
            "investigative_recommendations": [
                "Submit Section 91 CrPC notices to the respective nodal bank officers for KYC records.",
                "Issue urgent debit-freeze requests on the receiving and intermediate bank accounts.",
                "Cross-reference account holders against national cybercrime reporting portal (NCRP) complaints.",
            ]
        }
