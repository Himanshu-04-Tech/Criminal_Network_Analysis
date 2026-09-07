"""Overlap Detector identifying direct shared entities between FIR cases."""

import threading
from typing import Dict, Tuple, Optional
from .models import CaseOverlap
from .case_loader import CaseLoader


class OverlapDetector:
    """
    Computes and caches direct entity intersections across all entity types between pairs of FIR cases.
    """

    def __init__(self, case_loader: CaseLoader):
        self._loader = case_loader
        self._lock = threading.Lock()
        self._overlap_cache: Dict[Tuple[str, str], CaseOverlap] = {}

    def find_shared_entities(self, case_a: str, case_b: str) -> CaseOverlap:
        """Computes direct shared entities across all categories between two FIR cases."""
        cache_key = tuple(sorted([case_a, case_b]))
        with self._lock:
            if cache_key in self._overlap_cache:
                return self._overlap_cache[cache_key]

        entities_a = self._loader.get_case_entities(case_a)
        entities_b = self._loader.get_case_entities(case_b)

        sh_persons = sorted(list(set(entities_a.persons).intersection(set(entities_b.persons))))
        sh_phones = sorted(list(set(entities_a.phones).intersection(set(entities_b.phones))))
        sh_accounts = sorted(list(set(entities_a.accounts).intersection(set(entities_b.accounts))))
        sh_vehicles = sorted(list(set(entities_a.vehicles).intersection(set(entities_b.vehicles))))
        sh_locations = sorted(list(set(entities_a.locations).intersection(set(entities_b.locations))))
        sh_orgs = sorted(list(set(entities_a.organizations).intersection(set(entities_b.organizations))))

        total = len(sh_persons) + len(sh_phones) + len(sh_accounts) + len(sh_vehicles) + len(sh_locations) + len(sh_orgs)

        overlap = CaseOverlap(
            case_a=case_a,
            case_b=case_b,
            shared_persons=sh_persons,
            shared_phones=sh_phones,
            shared_accounts=sh_accounts,
            shared_vehicles=sh_vehicles,
            shared_locations=sh_locations,
            shared_organizations=sh_orgs,
            total_shared=total,
        )

        with self._lock:
            self._overlap_cache[cache_key] = overlap

        return overlap
