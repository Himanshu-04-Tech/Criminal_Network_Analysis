"""Timeline Engine generating chronological event histories for entities and cases."""

from typing import Dict, List, Any, Optional
from dateutil import parser as dt_parser

from graph_engine.graph_service import KnowledgeGraphService
from .temporal_models import TimelineEvent, EntityTimeline, CaseTimeline


class TimelineBuilder:
    """
    Constructs chronological event streams for suspects, resources, and FIR cases.
    Aggregates relationship timestamps, evidence attachments, and operational actions.
    """

    def __init__(self, kg_service: Optional[KnowledgeGraphService] = None):
        self._kg_service = kg_service or KnowledgeGraphService.get_instance()
        self._graph = self._kg_service.get_graph()

    def get_entity_timeline(self, entity_id: str) -> EntityTimeline:
        """
        Builds a strictly chronological event timeline for the specified entity.
        Includes all incoming and outgoing interactions.
        """
        if entity_id not in self._graph:
            return EntityTimeline(
                entity_id=entity_id,
                entity_name=entity_id,
                entity_type="UNKNOWN",
                events=[],
                total_events=0,
            )

        node_data = self._graph.nodes.get(entity_id, {})
        entity_name = node_data.get("name", entity_id)
        entity_type = node_data.get("type", "UNKNOWN")

        events: List[TimelineEvent] = []

        # 1. Outgoing edges (entity -> target)
        for _, v, key, data in self._graph.out_edges(entity_id, keys=True, data=True):
            ts = data.get("timestamp")
            if ts:
                rtype = data.get("relationship_type", "RELATED_TO")
                desc = f"{entity_id} {rtype} {v}"
                events.append(TimelineEvent(
                    timestamp=ts,
                    event_type=rtype,
                    description=desc,
                    source=entity_id,
                    target=v,
                    case_id=data.get("case_id"),
                    evidence_id=data.get("evidence_id"),
                    details=dict(data),
                ))

        # 2. Incoming edges (source -> entity)
        for u, _, key, data in self._graph.in_edges(entity_id, keys=True, data=True):
            ts = data.get("timestamp")
            if ts:
                rtype = data.get("relationship_type", "RELATED_TO")
                desc = f"{u} {rtype} {entity_id}"
                events.append(TimelineEvent(
                    timestamp=ts,
                    event_type=rtype,
                    description=desc,
                    source=u,
                    target=entity_id,
                    case_id=data.get("case_id"),
                    evidence_id=data.get("evidence_id"),
                    details=dict(data),
                ))

        # Sort chronologically
        events.sort(key=lambda e: dt_parser.isoparse(e.timestamp))

        first_act = events[0].timestamp if events else None
        last_act = events[-1].timestamp if events else None

        return EntityTimeline(
            entity_id=entity_id,
            entity_name=entity_name,
            entity_type=entity_type,
            events=events,
            first_activity=first_act,
            last_activity=last_act,
            total_events=len(events),
        )

    def get_case_timeline(self, case_id: str) -> CaseTimeline:
        """
        Builds a chronological timeline of all events and evidence filed under an FIR case.
        """
        case_data = self._graph.nodes.get(case_id, {})
        case_title = case_data.get("title", case_data.get("name", f"FIR Case {case_id}"))

        events: List[TimelineEvent] = []

        for u, v, key, data in self._graph.edges(keys=True, data=True):
            if data.get("case_id") == case_id:
                ts = data.get("timestamp")
                if ts:
                    rtype = data.get("relationship_type", "RELATED_TO")
                    desc = f"[{case_id}] {u} {rtype} {v}"
                    events.append(TimelineEvent(
                        timestamp=ts,
                        event_type=rtype,
                        description=desc,
                        source=u,
                        target=v,
                        case_id=case_id,
                        evidence_id=data.get("evidence_id"),
                        details=dict(data),
                    ))

        # Sort chronologically
        events.sort(key=lambda e: dt_parser.isoparse(e.timestamp))

        first_act = events[0].timestamp if events else None
        last_act = events[-1].timestamp if events else None

        return CaseTimeline(
            case_id=case_id,
            case_title=case_title,
            events=events,
            first_activity=first_act,
            last_activity=last_act,
            total_events=len(events),
        )
