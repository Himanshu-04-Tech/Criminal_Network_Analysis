"""Comprehensive relationship generator coordinating pattern injection and background graph wiring."""

from __future__ import annotations
import random
import uuid
from typing import Dict, List, Set, Tuple

from dataset_generator.models import (
    Entity,
    Case,
    Evidence,
    Relationship,
    RelationshipType,
)
from dataset_generator.generators import EvidenceGenerator
from dataset_generator.pattern_injector import PatternInjector


class RelationshipGenerator:
    """Coordinates generation of 180-250 relationships with 150+ evidence records."""

    def __init__(
        self,
        entities: List[Entity],
        cases: List[Case],
        evidence_gen: EvidenceGenerator,
    ):
        self.entities = entities
        self.cases = cases
        self.evidence_gen = evidence_gen
        self.pattern_injector = PatternInjector(evidence_gen)

        # Index entities by type for quick lookup
        self.entities_by_type: Dict[str, List[Entity]] = {}
        for ent in entities:
            self.entities_by_type.setdefault(ent.type, []).append(ent)

        self.case_ids = [c.id for c in cases]

    def generate_all_relationships(
        self, target_count: int = 210
    ) -> Tuple[List[Relationship], List[Evidence]]:
        """
        Generate complete set of relationships embedding all 10 intelligence patterns
        and organic background investigative connections.
        """
        all_relationships: List[Relationship] = []
        all_evidence: List[Evidence] = []
        existing_edge_keys: Set[Tuple[str, str, str, str]] = set()

        def add_pattern(pattern_rels: List[Relationship], pattern_evs: List[Evidence]):
            for ev in pattern_evs:
                all_evidence.append(ev)
            for rel in pattern_rels:
                edge_key = (rel.source, rel.target, rel.relationship_type, rel.case_id)
                existing_edge_keys.add(edge_key)
                all_relationships.append(rel)

        # 1. Inject Pattern 1: Hidden Broker (P017 between Community A and B)
        r1, e1 = self.pattern_injector.inject_pattern_1_hidden_broker()
        add_pattern(r1, e1)

        # 2. Inject Pattern 2: Shared Phone (PH005 used by P005 and P018)
        r2, e2 = self.pattern_injector.inject_pattern_2_shared_phone()
        add_pattern(r2, e2)

        # 3. Inject Pattern 3: Shared Vehicle (VEH003 in FIR003 and FIR008)
        r3, e3 = self.pattern_injector.inject_pattern_3_shared_vehicle()
        add_pattern(r3, e3)

        # 4. Inject Pattern 4: Cross Case Bridge (FIR001 -> Person -> Phone -> Person -> Account -> Person -> FIR007)
        r4, e4 = self.pattern_injector.inject_pattern_4_cross_case_bridge()
        add_pattern(r4, e4)

        # 5. Inject Pattern 5: Financial Fan Out (ACC001 -> ACC002..ACC005)
        r5, e5 = self.pattern_injector.inject_pattern_5_financial_fan_out()
        add_pattern(r5, e5)

        # 6. Inject Pattern 6: Financial Fan In (ACC007, ACC008, ACC010 -> ACC009)
        r6, e6 = self.pattern_injector.inject_pattern_6_financial_fan_in()
        add_pattern(r6, e6)

        # 7. Inject Pattern 7: Circular Transactions (ACC012 -> ACC013 -> ACC014 -> ACC012)
        r7, e7 = self.pattern_injector.inject_pattern_7_circular_transactions()
        add_pattern(r7, e7)

        # 8. Inject Pattern 8: Communication Burst (32 calls between PH020 and PH021 in < 6h)
        r8, e8 = self.pattern_injector.inject_pattern_8_communication_burst()
        add_pattern(r8, e8)

        # 9. Inject Pattern 9: Alias Records (Rahul Sharma, R Sharma, Rahul S)
        r9, e9 = self.pattern_injector.inject_pattern_9_alias_records()
        add_pattern(r9, e9)

        # 10. Inject Pattern 10: Temporal Changes (Pre-Aug 15 and Post-Aug 15)
        r10, e10 = self.pattern_injector.inject_pattern_10_temporal_changes()
        add_pattern(r10, e10)

        # --- Background Organic Investigation Connections ---
        # Populate realistic graph linkages for remaining persons, phones, accounts, vehicles, orgs, locations
        persons = self.entities_by_type.get("PERSON", [])
        phones = self.entities_by_type.get("PHONE", [])
        accounts = self.entities_by_type.get("ACCOUNT", [])
        vehicles = self.entities_by_type.get("VEHICLE", [])
        locations = self.entities_by_type.get("LOCATION", [])
        organizations = self.entities_by_type.get("ORGANIZATION", [])

        # Assign phones to remaining persons (USES)
        for i, p in enumerate(persons):
            ph = phones[i % len(phones)]
            case_id = f"FIR{(i % 10) + 1:03d}"
            ts = f"2026-07-{(i % 25) + 1:02d}T10:00:00Z"
            edge_key = (p.id, ph.id, RelationshipType.USES.value, case_id)
            if edge_key not in existing_edge_keys:
                ev = self.evidence_gen.create_evidence(
                    case_id=case_id,
                    source_file=f"cdr_subscriber_profile_{case_id.lower()}.csv",
                    timestamp=ts,
                    description=f"Telecom service CAF subscription for {p.name}"
                )
                existing_edge_keys.add(edge_key)
                all_relationships.append(Relationship(
                    id=str(uuid.uuid4()), source=p.id, target=ph.id,
                    relationship_type=RelationshipType.USES.value, case_id=case_id,
                    timestamp=ts, confidence=1.0, evidence_id=ev.id
                ))
                all_evidence.append(ev)

        # Assign vehicles to persons (OWNS)
        for i in range(len(vehicles)):
            v = vehicles[i]
            p = persons[(i * 3 + 2) % len(persons)]
            case_id = f"FIR{(i % 10) + 1:03d}"
            ts = f"2026-07-{(i % 20) + 5:02d}T11:00:00Z"
            edge_key = (p.id, v.id, RelationshipType.OWNS.value, case_id)
            if edge_key not in existing_edge_keys:
                ev = self.evidence_gen.create_evidence(
                    case_id=case_id,
                    source_file=f"rto_vehicle_registration_{v.id.lower()}.pdf",
                    timestamp=ts,
                    description=f"RTO ownership deed registering vehicle {v.name} to {p.name}"
                )
                existing_edge_keys.add(edge_key)
                all_relationships.append(Relationship(
                    id=str(uuid.uuid4()), source=p.id, target=v.id,
                    relationship_type=RelationshipType.OWNS.value, case_id=case_id,
                    timestamp=ts, confidence=1.0, evidence_id=ev.id
                ))
                all_evidence.append(ev)

        # Assign accounts to persons (OWNS)
        for i in range(len(accounts)):
            acc = accounts[i]
            p = persons[(i * 2 + 1) % len(persons)]
            case_id = f"FIR{(i % 10) + 1:03d}"
            ts = f"2026-07-{(i % 22) + 3:02d}T09:30:00Z"
            edge_key = (p.id, acc.id, RelationshipType.OWNS.value, case_id)
            if edge_key not in existing_edge_keys:
                ev = self.evidence_gen.create_evidence(
                    case_id=case_id,
                    source_file=f"bank_account_opening_form_{acc.id.lower()}.pdf",
                    timestamp=ts,
                    description=f"Bank KYC signature card for account {acc.name}"
                )
                existing_edge_keys.add(edge_key)
                all_relationships.append(Relationship(
                    id=str(uuid.uuid4()), source=p.id, target=acc.id,
                    relationship_type=RelationshipType.OWNS.value, case_id=case_id,
                    timestamp=ts, confidence=1.0, evidence_id=ev.id
                ))
                all_evidence.append(ev)

        # Vehicle sightings at locations (OBSERVED_AT)
        for i in range(len(vehicles)):
            v = vehicles[i]
            loc = locations[(i + 4) % len(locations)]
            case_id = f"FIR{(i % 10) + 1:03d}"
            ts = f"2026-07-{(i % 24) + 2:02d}T15:20:00Z"
            edge_key = (v.id, loc.id, RelationshipType.OBSERVED_AT.value, case_id)
            if edge_key not in existing_edge_keys:
                ev = self.evidence_gen.create_evidence(
                    case_id=case_id,
                    source_file=f"anpr_camera_capture_{loc.id.lower()}.mp4",
                    timestamp=ts,
                    description=f"Automated number plate reader capture of {v.name} at {loc.name}"
                )
                existing_edge_keys.add(edge_key)
                all_relationships.append(Relationship(
                    id=str(uuid.uuid4()), source=v.id, target=loc.id,
                    relationship_type=RelationshipType.OBSERVED_AT.value, case_id=case_id,
                    timestamp=ts, confidence=1.0, evidence_id=ev.id
                ))
                all_evidence.append(ev)

        # Person visits to locations (VISITED)
        for i in range(15):
            p = persons[(i * 2 + 3) % len(persons)]
            loc = locations[(i * 3 + 1) % len(locations)]
            case_id = f"FIR{(i % 10) + 1:03d}"
            ts = f"2026-07-{(i % 26) + 1:02d}T17:40:00Z"
            edge_key = (p.id, loc.id, RelationshipType.VISITED.value, case_id)
            if edge_key not in existing_edge_keys:
                ev = self.evidence_gen.create_evidence(
                    case_id=case_id,
                    source_file=f"cctv_surveillance_log_{loc.id.lower()}.mp4",
                    timestamp=ts,
                    description=f"Facial recognition match for {p.name} visiting {loc.name}"
                )
                existing_edge_keys.add(edge_key)
                all_relationships.append(Relationship(
                    id=str(uuid.uuid4()), source=p.id, target=loc.id,
                    relationship_type=RelationshipType.VISITED.value, case_id=case_id,
                    timestamp=ts, confidence=1.0, evidence_id=ev.id
                ))
                all_evidence.append(ev)

        # Organization memberships (MEMBER_OF)
        for i in range(12):
            p = persons[(i * 3) % len(persons)]
            org = organizations[i % len(organizations)]
            case_id = f"FIR{(i % 10) + 1:03d}"
            ts = f"2026-06-{(i % 25) + 1:02d}T10:00:00Z"
            edge_key = (p.id, org.id, RelationshipType.MEMBER_OF.value, case_id)
            if edge_key not in existing_edge_keys:
                ev = self.evidence_gen.create_evidence(
                    case_id=case_id,
                    source_file=f"mca_company_directors_filing_{org.id.lower()}.pdf",
                    timestamp=ts,
                    description=f"MCA official filing showing {p.name} associated with {org.name}"
                )
                existing_edge_keys.add(edge_key)
                all_relationships.append(Relationship(
                    id=str(uuid.uuid4()), source=p.id, target=org.id,
                    relationship_type=RelationshipType.MEMBER_OF.value, case_id=case_id,
                    timestamp=ts, confidence=1.0, evidence_id=ev.id
                ))
                all_evidence.append(ev)

        # FIR case mentions (MENTIONED_IN)
        for i in range(15):
            p = persons[(i * 2 + 5) % len(persons)]
            case = self.cases[i % len(self.cases)]
            ts = f"2026-07-{(i % 25) + 1:02d}T12:00:00Z"
            edge_key = (p.id, case.id, RelationshipType.MENTIONED_IN.value, case.id)
            if edge_key not in existing_edge_keys:
                ev = self.evidence_gen.create_evidence(
                    case_id=case.id,
                    source_file=f"fir_witness_charge_sheet_{case.id.lower()}.pdf",
                    timestamp=ts,
                    description=f"Charge-sheet statement citing {p.name} in {case.id}"
                )
                existing_edge_keys.add(edge_key)
                all_relationships.append(Relationship(
                    id=str(uuid.uuid4()), source=p.id, target=case.id,
                    relationship_type=RelationshipType.MENTIONED_IN.value, case_id=case.id,
                    timestamp=ts, confidence=1.0, evidence_id=ev.id
                ))
                all_evidence.append(ev)

        # Additional phone-to-phone contacts to achieve natural network density
        phone_pairs = [
            ("PH008", "PH009"), ("PH009", "PH014"), ("PH022", "PH023"),
            ("PH024", "PH028"), ("PH029", "PH030"), ("PH031", "PH032"),
            ("PH033", "PH034"), ("PH035", "PH036"), ("PH037", "PH038"),
            ("PH039", "PH040"), ("PH041", "PH042"), ("PH043", "PH044"),
        ]
        for idx, (p_src, p_tgt) in enumerate(phone_pairs):
            case_id = f"FIR{(idx % 10) + 1:03d}"
            ts = f"2026-07-{(idx % 20) + 2:02d}T18:15:00Z"
            edge_key = (p_src, p_tgt, RelationshipType.CONTACTED.value, case_id)
            if edge_key not in existing_edge_keys:
                ev = self.evidence_gen.create_evidence(
                    case_id=case_id,
                    source_file=f"cdr_telecom_interconnect_{case_id.lower()}.csv",
                    timestamp=ts,
                    description=f"Telecom interconnect billing record for {p_src} -> {p_tgt}"
                )
                existing_edge_keys.add(edge_key)
                all_relationships.append(Relationship(
                    id=str(uuid.uuid4()), source=p_src, target=p_tgt,
                    relationship_type=RelationshipType.CONTACTED.value, case_id=case_id,
                    timestamp=ts, confidence=1.0, evidence_id=ev.id
                ))
                all_evidence.append(ev)

        # Fill remaining up to target_count (between 180 and 250)
        curr_count = len(all_relationships)
        if curr_count < target_count:
            fill_needed = target_count - curr_count
            for j in range(fill_needed):
                p_src = phones[(j * 3 + 7) % len(phones)].id
                p_tgt = phones[(j * 5 + 11) % len(phones)].id
                if p_src == p_tgt:
                    p_tgt = phones[(j * 5 + 12) % len(phones)].id
                case_id = f"FIR{(j % 10) + 1:03d}"
                ts = f"2026-07-{(j % 28) + 1:02d}T16:{(j * 4) % 60:02d}:00Z"
                ev = self.evidence_gen.create_evidence(
                    case_id=case_id,
                    source_file=f"cdr_ambient_traffic_{case_id.lower()}.csv",
                    timestamp=ts,
                    description=f"Ambient telecom CDR record #{j+1}"
                )
                all_relationships.append(Relationship(
                    id=str(uuid.uuid4()), source=p_src, target=p_tgt,
                    relationship_type=RelationshipType.CONTACTED.value, case_id=case_id,
                    timestamp=ts, confidence=1.0, evidence_id=ev.id
                ))
                all_evidence.append(ev)

        # Ensure evidence count is at least 150
        while len(all_evidence) < 150:
            ev = self.evidence_gen.create_evidence(
                case_id=self.case_ids[len(all_evidence) % len(self.case_ids)],
                source_file=f"forensic_case_annexure_{len(all_evidence)+1}.pdf",
                timestamp="2026-07-30T10:00:00Z",
                description="General forensic case file annexure"
            )
            all_evidence.append(ev)

        return all_relationships, all_evidence
