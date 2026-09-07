"""Case Loader extracting and caching categorized entities per FIR case."""

import threading
from typing import Dict, List, Set, Optional
import networkx as nx

from graph_engine.graph_service import KnowledgeGraphService
from .models import CaseEntityBreakdown


class CaseLoader:
    """
    Extracts, indexes, and caches entities associated with each FIR case.
    Consumes KnowledgeGraphService directly with zero duplicate file loading.
    """

    def __init__(self, kg_service: Optional[KnowledgeGraphService] = None):
        self._kg_service = kg_service or KnowledgeGraphService.get_instance()
        self._graph = self._kg_service.get_graph()
        self._lock = threading.Lock()
        self._cache: Optional[Dict[str, CaseEntityBreakdown]] = None

    def get_all_cases(self) -> List[str]:
        """Returns sorted list of all FIR case IDs present in the knowledge graph."""
        cases = [
            node_id for node_id, data in self._graph.nodes(data=True)
            if data.get("type") == "CASE" or node_id.startswith("FIR")
        ]
        return sorted(list(set(cases)))

    def get_case_entities(self, case_id: str) -> CaseEntityBreakdown:
        """Returns categorized breakdown of entities involved in a specific FIR case."""
        all_cases = self.get_all_case_entities()
        if case_id in all_cases:
            return all_cases[case_id]

        # Defensive fallback for unregistered or empty case
        return CaseEntityBreakdown(case_id=case_id)

    def get_all_case_entities(self, force_refresh: bool = False) -> Dict[str, CaseEntityBreakdown]:
        """Extracts and caches categorized entity lists for all FIR cases."""
        with self._lock:
            if not force_refresh and self._cache is not None:
                return dict(self._cache)

            cases = self.get_all_cases()
            case_map: Dict[str, CaseEntityBreakdown] = {}

            for cid in cases:
                # 1. Retrieve entities directly indexed for this case
                entities_models = self._kg_service.get_case_entities(cid)
                entity_ids: Set[str] = {e.id for e in entities_models if e.type != "CASE"}

                # 2. Also retrieve entities from case relationships
                case_edges = self._kg_service.get_case_relationships(cid)
                for edge in case_edges:
                    for endpoint in (edge.source, edge.target):
                        ep_type = self._graph.nodes.get(endpoint, {}).get("type", "")
                        if ep_type != "CASE":
                            entity_ids.add(endpoint)

                # 3. Also check graph neighbors linked via MENTIONED_IN
                if cid in self._graph:
                    for nbr in self._graph.predecessors(cid):
                        nbr_type = self._graph.nodes.get(nbr, {}).get("type", "")
                        if nbr_type != "CASE":
                            entity_ids.add(nbr)

                # Categorize by entity type
                persons: List[str] = []
                phones: List[str] = []
                accounts: List[str] = []
                vehicles: List[str] = []
                locations: List[str] = []
                organizations: List[str] = []

                for eid in entity_ids:
                    etype = self._graph.nodes.get(eid, {}).get("type", "UNKNOWN")
                    if etype == "PERSON":
                        persons.append(eid)
                    elif etype == "PHONE":
                        phones.append(eid)
                    elif etype == "ACCOUNT":
                        accounts.append(eid)
                    elif etype == "VEHICLE":
                        vehicles.append(eid)
                    elif etype == "LOCATION":
                        locations.append(eid)
                    elif etype == "ORGANIZATION":
                        organizations.append(eid)

                breakdown = CaseEntityBreakdown(
                    case_id=cid,
                    persons=sorted(persons),
                    phones=sorted(phones),
                    accounts=sorted(accounts),
                    vehicles=sorted(vehicles),
                    locations=sorted(locations),
                    organizations=sorted(organizations),
                    total_entities=len(entity_ids),
                )
                case_map[cid] = breakdown

            self._cache = case_map
            return dict(case_map)
