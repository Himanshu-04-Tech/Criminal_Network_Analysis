"""Deliberate intelligence pattern injector for NEXUS-Bharat Knowledge Graph."""

from __future__ import annotations
import uuid
from typing import Dict, List, Tuple

from dataset_generator.models import (
    Relationship,
    RelationshipType,
    Evidence,
)
from dataset_generator.generators import EvidenceGenerator


class PatternInjector:
    """Injects all 10 deliberate intelligence patterns required by NEXUS-Bharat."""

    def __init__(self, evidence_gen: EvidenceGenerator):
        self.evidence_gen = evidence_gen

    def inject_pattern_1_hidden_broker(
        self,
    ) -> Tuple[List[Relationship], List[Evidence]]:
        """
        Pattern 1: Hidden Broker.
        Community A: P001, P002, P003, P004
        Community B: P010, P011, P012, P013
        P017 as hidden broker connecting both via intermediate phones/accounts/orgs.
        No direct person-to-person edge between communities or to P017.
        """
        rels: List[Relationship] = []
        evs: List[Evidence] = []

        # --- Community A Internal Links ---
        a_members = [("P001", "PH001"), ("P002", "PH002"), ("P003", "PH003"), ("P004", "PH004")]
        for pid, phid in a_members:
            ev = self.evidence_gen.create_evidence(
                case_id="FIR001",
                source_file="cdr_delhi_telecom_comm_a.csv",
                timestamp="2026-06-18T10:00:00Z",
                description=f"Subscriber identification record for {pid}"
            )
            evs.append(ev)
            rels.append(Relationship(
                id=str(uuid.uuid4()),
                source=pid,
                target=phid,
                relationship_type=RelationshipType.USES.value,
                case_id="FIR001",
                timestamp="2026-06-18T10:00:00Z",
                confidence=1.0,
                evidence_id=ev.id
            ))

        # Comm A Phone Communications
        a_calls = [("PH001", "PH002"), ("PH002", "PH003"), ("PH003", "PH004"), ("PH004", "PH001")]
        for src, tgt in a_calls:
            ev = self.evidence_gen.create_evidence(
                case_id="FIR001",
                source_file="cdr_internal_comm_a.csv",
                timestamp="2026-06-20T14:30:00Z",
                description="Call detail record within Community A"
            )
            evs.append(ev)
            rels.append(Relationship(
                id=str(uuid.uuid4()),
                source=src,
                target=tgt,
                relationship_type=RelationshipType.CONTACTED.value,
                case_id="FIR001",
                timestamp="2026-06-20T14:30:00Z",
                confidence=1.0,
                evidence_id=ev.id
            ))

        # Comm A Org & Accounts
        ev_org1_p1 = self.evidence_gen.create_evidence("FIR001", "roc_apex_freight_records_p1.pdf", "2026-06-16T11:00:00Z")
        evs.append(ev_org1_p1)
        rels.append(Relationship(
            id=str(uuid.uuid4()), source="P001", target="ORG001",
            relationship_type=RelationshipType.MEMBER_OF.value, case_id="FIR001",
            timestamp="2026-06-16T11:00:00Z", confidence=1.0, evidence_id=ev_org1_p1.id
        ))

        ev_org1_p2 = self.evidence_gen.create_evidence("FIR001", "roc_apex_freight_records_p2.pdf", "2026-06-16T11:00:00Z")
        evs.append(ev_org1_p2)
        rels.append(Relationship(
            id=str(uuid.uuid4()), source="P002", target="ORG001",
            relationship_type=RelationshipType.MEMBER_OF.value, case_id="FIR001",
            timestamp="2026-06-16T11:00:00Z", confidence=1.0, evidence_id=ev_org1_p2.id
        ))

        # --- Community B Internal Links ---
        b_members = [("P010", "PH010"), ("P011", "PH011"), ("P012", "PH012"), ("P013", "PH013")]
        for pid, phid in b_members:
            ev = self.evidence_gen.create_evidence(
                case_id="FIR002",
                source_file="cdr_mumbai_cell_comm_b.csv",
                timestamp="2026-07-02T11:15:00Z",
                description=f"Device linkage for {pid}"
            )
            evs.append(ev)
            rels.append(Relationship(
                id=str(uuid.uuid4()),
                source=pid,
                target=phid,
                relationship_type=RelationshipType.USES.value,
                case_id="FIR002",
                timestamp="2026-07-02T11:15:00Z",
                confidence=1.0,
                evidence_id=ev.id
            ))

        # Comm B Phone Communications
        b_calls = [("PH010", "PH011"), ("PH011", "PH012"), ("PH012", "PH013"), ("PH013", "PH010")]
        for src, tgt in b_calls:
            ev = self.evidence_gen.create_evidence(
                case_id="FIR002",
                source_file="cdr_internal_comm_b.csv",
                timestamp="2026-07-05T16:45:00Z",
                description="Call detail record within Community B"
            )
            evs.append(ev)
            rels.append(Relationship(
                id=str(uuid.uuid4()),
                source=src,
                target=tgt,
                relationship_type=RelationshipType.CONTACTED.value,
                case_id="FIR002",
                timestamp="2026-07-05T16:45:00Z",
                confidence=1.0,
                evidence_id=ev.id
            ))

        # Comm B Org & Accounts
        ev_org2 = self.evidence_gen.create_evidence("FIR002", "roc_silverline_trading.pdf", "2026-07-01T10:00:00Z")
        evs.append(ev_org2)
        rels.append(Relationship(
            id=str(uuid.uuid4()), source="P010", target="ORG002",
            relationship_type=RelationshipType.MEMBER_OF.value, case_id="FIR002",
            timestamp="2026-07-01T10:00:00Z", confidence=1.0, evidence_id=ev_org2.id
        ))

        ev_acc10 = self.evidence_gen.create_evidence("FIR002", "bank_acc010_opening_form.pdf", "2026-07-01T10:00:00Z")
        evs.append(ev_acc10)
        rels.append(Relationship(
            id=str(uuid.uuid4()), source="P010", target="ACC010",
            relationship_type=RelationshipType.OWNS.value, case_id="FIR002",
            timestamp="2026-07-01T10:00:00Z", confidence=1.0, evidence_id=ev_acc10.id
        ))

        # --- P017 Hidden Broker Intermediary Setup ---
        # P017 uses burner phone PH016 and owns account ACC017
        ev_p017_ph = self.evidence_gen.create_evidence("FIR002", "burner_forensics_p017.bin", "2026-07-10T09:00:00Z")
        evs.append(ev_p017_ph)
        rels.append(Relationship(
            id=str(uuid.uuid4()), source="P017", target="PH016",
            relationship_type=RelationshipType.USES.value, case_id="FIR002",
            timestamp="2026-07-10T09:00:00Z", confidence=1.0, evidence_id=ev_p017_ph.id
        ))

        ev_p017_acc = self.evidence_gen.create_evidence("FIR006", "bank_stmt_acc017_broker.pdf", "2026-07-10T09:00:00Z")
        evs.append(ev_p017_acc)
        rels.append(Relationship(
            id=str(uuid.uuid4()), source="P017", target="ACC017",
            relationship_type=RelationshipType.OWNS.value, case_id="FIR006",
            timestamp="2026-07-10T09:00:00Z", confidence=1.0, evidence_id=ev_p017_acc.id
        ))

        # Hidden Bridge Link 1: Community A operative (P004 via PH004) contacts Hidden Broker phone (PH016)
        ev_bridge_call = self.evidence_gen.create_evidence(
            case_id="FIR002",
            source_file="interception_log_gateway_delhi_mumbai.csv",
            timestamp="2026-07-12T13:20:00Z",
            description="Interception log of encrypted call between PH004 and PH016"
        )
        evs.append(ev_bridge_call)
        rels.append(Relationship(
            id=str(uuid.uuid4()),
            source="PH004",
            target="PH016",
            relationship_type=RelationshipType.CONTACTED.value,
            case_id="FIR002",
            timestamp="2026-07-12T13:20:00Z",
            confidence=1.0,
            evidence_id=ev_bridge_call.id
        ))

        # Hidden Bridge Link 2: Hidden Broker account (ACC017) transfers funds to Community B leader account (ACC010)
        ev_bridge_tx = self.evidence_gen.create_evidence(
            case_id="FIR006",
            source_file="neft_rtgs_financial_wire_settlement.pdf",
            timestamp="2026-07-14T15:40:00Z",
            description="Wire transfer clearance from ACC017 to ACC010"
        )
        evs.append(ev_bridge_tx)
        rels.append(Relationship(
            id=str(uuid.uuid4()),
            source="ACC017",
            target="ACC010",
            relationship_type=RelationshipType.TRANSFERRED_TO.value,
            case_id="FIR006",
            timestamp="2026-07-14T15:40:00Z",
            confidence=1.0,
            evidence_id=ev_bridge_tx.id
        ))

        return rels, evs

    def inject_pattern_2_shared_phone(
        self,
    ) -> Tuple[List[Relationship], List[Evidence]]:
        """
        Pattern 2: Shared Phone.
        One phone (PH005) linked to P005 and P018 across different FIRs (FIR002 and FIR005).
        """
        rels: List[Relationship] = []
        evs: List[Evidence] = []

        # P005 uses PH005 in FIR002
        ev1 = self.evidence_gen.create_evidence(
            case_id="FIR002",
            source_file="seizure_memo_mobile_p005.pdf",
            timestamp="2026-07-03T18:00:00Z",
            description="Physical seizure memo for mobile PH005 from suspect P005"
        )
        evs.append(ev1)
        rels.append(Relationship(
            id=str(uuid.uuid4()),
            source="P005",
            target="PH005",
            relationship_type=RelationshipType.USES.value,
            case_id="FIR002",
            timestamp="2026-07-03T18:00:00Z",
            confidence=1.0,
            evidence_id=ev1.id
        ))

        # P018 uses PH005 in FIR005
        ev2 = self.evidence_gen.create_evidence(
            case_id="FIR005",
            source_file="forensic_cdr_tower_extraction_fir005.csv",
            timestamp="2026-08-01T12:30:00Z",
            description="IMEI/IMSI forensic tower registration linking P018 to PH005"
        )
        evs.append(ev2)
        rels.append(Relationship(
            id=str(uuid.uuid4()),
            source="P018",
            target="PH005",
            relationship_type=RelationshipType.USES.value,
            case_id="FIR005",
            timestamp="2026-08-01T12:30:00Z",
            confidence=1.0,
            evidence_id=ev2.id
        ))

        return rels, evs

    def inject_pattern_3_shared_vehicle(
        self,
    ) -> Tuple[List[Relationship], List[Evidence]]:
        """
        Pattern 3: Shared Vehicle.
        One vehicle (VEH003) appears in FIR003 and FIR008.
        """
        rels: List[Relationship] = []
        evs: List[Evidence] = []

        # In FIR003: VEH003 observed at Dhaula Kuan Highway Toll Plaza (LOC003)
        ev1 = self.evidence_gen.create_evidence(
            case_id="FIR003",
            source_file="cctv_dhaula_kuan_toll_cam03.mp4",
            timestamp="2026-07-07T03:14:00Z",
            description="CCTV ANPR footage of VEH003 speeding past toll plaza"
        )
        evs.append(ev1)
        rels.append(Relationship(
            id=str(uuid.uuid4()),
            source="VEH003",
            target="LOC003",
            relationship_type=RelationshipType.OBSERVED_AT.value,
            case_id="FIR003",
            timestamp="2026-07-07T03:14:00Z",
            confidence=1.0,
            evidence_id=ev1.id
        ))

        ev_fir3 = self.evidence_gen.create_evidence(
            case_id="FIR003",
            source_file="fir003_case_dairy_entry.pdf",
            timestamp="2026-07-07T06:00:00Z",
            description="Stolen luxury vehicle report listing VEH003"
        )
        evs.append(ev_fir3)
        rels.append(Relationship(
            id=str(uuid.uuid4()),
            source="VEH003",
            target="FIR003",
            relationship_type=RelationshipType.MENTIONED_IN.value,
            case_id="FIR003",
            timestamp="2026-07-07T06:00:00Z",
            confidence=1.0,
            evidence_id=ev_fir3.id
        ))

        # In FIR008: VEH003 observed at Wagah Border Logistics Depot (LOC008)
        ev2 = self.evidence_gen.create_evidence(
            case_id="FIR008",
            source_file="border_checkpoint_log_wagah.pdf",
            timestamp="2026-08-12T22:45:00Z",
            description="Border transit checkpost manifest registering VEH003"
        )
        evs.append(ev2)
        rels.append(Relationship(
            id=str(uuid.uuid4()),
            source="VEH003",
            target="LOC008",
            relationship_type=RelationshipType.OBSERVED_AT.value,
            case_id="FIR008",
            timestamp="2026-08-12T22:45:00Z",
            confidence=1.0,
            evidence_id=ev2.id
        ))

        ev_fir8 = self.evidence_gen.create_evidence(
            case_id="FIR008",
            source_file="contraband_confiscation_memo_fir008.pdf",
            timestamp="2026-08-13T04:00:00Z",
            description="Customs contraband impoundment naming vehicle VEH003"
        )
        evs.append(ev_fir8)
        rels.append(Relationship(
            id=str(uuid.uuid4()),
            source="VEH003",
            target="FIR008",
            relationship_type=RelationshipType.MENTIONED_IN.value,
            case_id="FIR008",
            timestamp="2026-08-13T04:00:00Z",
            confidence=1.0,
            evidence_id=ev_fir8.id
        ))

        return rels, evs

    def inject_pattern_4_cross_case_bridge(
        self,
    ) -> Tuple[List[Relationship], List[Evidence]]:
        """
        Pattern 4: Cross Case Bridge.
        Path: FIR001 -> Person -> Phone -> Person -> Account -> Person -> FIR007
        Chain:
          FIR001 <- MENTIONED_IN - P001
          P001 - USES -> PH001
          P006 - USES -> PH001
          P006 - OWNS -> ACC006
          P007 - USES -> ACC006
          P007 - MENTIONED_IN -> FIR007
        """
        rels: List[Relationship] = []
        evs: List[Evidence] = []

        # 1. P001 mentioned in FIR001
        ev1 = self.evidence_gen.create_evidence("FIR001", "fir001_initial_complaint.pdf", "2026-06-15T10:00:00Z")
        evs.append(ev1)
        rels.append(Relationship(
            id=str(uuid.uuid4()),
            source="P001",
            target="FIR001",
            relationship_type=RelationshipType.MENTIONED_IN.value,
            case_id="FIR001",
            timestamp="2026-06-15T10:00:00Z",
            confidence=1.0,
            evidence_id=ev1.id
        ))

        # 2. P001 uses PH001
        ev2 = self.evidence_gen.create_evidence("FIR001", "sim_caf_verification_ph001.pdf", "2026-06-16T14:00:00Z")
        evs.append(ev2)
        rels.append(Relationship(
            id=str(uuid.uuid4()),
            source="P001",
            target="PH001",
            relationship_type=RelationshipType.USES.value,
            case_id="FIR001",
            timestamp="2026-06-16T14:00:00Z",
            confidence=1.0,
            evidence_id=ev2.id
        ))

        # 3. P006 also uses PH001 (shared device / cooperative communication)
        ev3 = self.evidence_gen.create_evidence("FIR001", "device_digital_forensic_image_p006.bin", "2026-06-25T11:20:00Z")
        evs.append(ev3)
        rels.append(Relationship(
            id=str(uuid.uuid4()),
            source="P006",
            target="PH001",
            relationship_type=RelationshipType.USES.value,
            case_id="FIR001",
            timestamp="2026-06-25T11:20:00Z",
            confidence=1.0,
            evidence_id=ev3.id
        ))

        # 4. P006 owns ACC006
        ev4 = self.evidence_gen.create_evidence("FIR007", "bank_kyc_mandate_acc006.pdf", "2026-07-15T09:45:00Z")
        evs.append(ev4)
        rels.append(Relationship(
            id=str(uuid.uuid4()),
            source="P006",
            target="ACC006",
            relationship_type=RelationshipType.OWNS.value,
            case_id="FIR007",
            timestamp="2026-07-15T09:45:00Z",
            confidence=1.0,
            evidence_id=ev4.id
        ))

        # 5. P007 uses ACC006 (authorized corporate signatory / mule debit card user)
        ev5 = self.evidence_gen.create_evidence("FIR007", "atm_atm_withdrawal_surveillance.mp4", "2026-07-28T16:10:00Z")
        evs.append(ev5)
        rels.append(Relationship(
            id=str(uuid.uuid4()),
            source="P007",
            target="ACC006",
            relationship_type=RelationshipType.USES.value,
            case_id="FIR007",
            timestamp="2026-07-28T16:10:00Z",
            confidence=1.0,
            evidence_id=ev5.id
        ))

        # 6. P007 mentioned in FIR007
        ev6 = self.evidence_gen.create_evidence("FIR007", "procurement_bid_rigging_affidavit.pdf", "2026-08-08T16:00:00Z")
        evs.append(ev6)
        rels.append(Relationship(
            id=str(uuid.uuid4()),
            source="P007",
            target="FIR007",
            relationship_type=RelationshipType.MENTIONED_IN.value,
            case_id="FIR007",
            timestamp="2026-08-08T16:00:00Z",
            confidence=1.0,
            evidence_id=ev6.id
        ))

        return rels, evs

    def inject_pattern_5_financial_fan_out(
        self,
    ) -> Tuple[List[Relationship], List[Evidence]]:
        """
        Pattern 5: Financial Fan Out.
        Account A (ACC001) -> Account B (ACC002), Account C (ACC003),
        Account D (ACC004), Account E (ACC005) within a short time period (50 mins).
        """
        rels: List[Relationship] = []
        evs: List[Evidence] = []

        recipients = ["ACC002", "ACC003", "ACC004", "ACC005"]
        timestamps = [
            "2026-08-10T14:05:00Z",
            "2026-08-10T14:18:00Z",
            "2026-08-10T14:32:00Z",
            "2026-08-10T14:48:00Z"
        ]

        for target_acc, ts in zip(recipients, timestamps):
            ev = self.evidence_gen.create_evidence(
                case_id="FIR001",
                source_file="rtgs_rapid_layering_log_fir001.csv",
                timestamp=ts,
                description=f"Automated swift wire from ACC001 to {target_acc}"
            )
            evs.append(ev)
            rels.append(Relationship(
                id=str(uuid.uuid4()),
                source="ACC001",
                target=target_acc,
                relationship_type=RelationshipType.TRANSFERRED_TO.value,
                case_id="FIR001",
                timestamp=ts,
                confidence=1.0,
                evidence_id=ev.id
            ))

        return rels, evs

    def inject_pattern_6_financial_fan_in(
        self,
    ) -> Tuple[List[Relationship], List[Evidence]]:
        """
        Pattern 6: Financial Fan In.
        Account B (ACC007), Account C (ACC008), Account D (ACC010) -> Account A (ACC009)
        within a short time period (30 mins).
        """
        rels: List[Relationship] = []
        evs: List[Evidence] = []

        sources = ["ACC007", "ACC008", "ACC010"]
        timestamps = [
            "2026-08-11T16:05:00Z",
            "2026-08-11T16:15:00Z",
            "2026-08-11T16:25:00Z"
        ]

        for src_acc, ts in zip(sources, timestamps):
            ev = self.evidence_gen.create_evidence(
                case_id="FIR006",
                source_file="bank_imps_aggregation_feed_fir006.csv",
                timestamp=ts,
                description=f"Inflow transfer from {src_acc} into pooling account ACC009"
            )
            evs.append(ev)
            rels.append(Relationship(
                id=str(uuid.uuid4()),
                source=src_acc,
                target="ACC009",
                relationship_type=RelationshipType.TRANSFERRED_TO.value,
                case_id="FIR006",
                timestamp=ts,
                confidence=1.0,
                evidence_id=ev.id
            ))

        return rels, evs

    def inject_pattern_7_circular_transactions(
        self,
    ) -> Tuple[List[Relationship], List[Evidence]]:
        """
        Pattern 7: Circular Transactions.
        A (ACC012) -> B (ACC013) -> C (ACC014) -> A (ACC012)
        Executed within the same business day for layering.
        """
        rels: List[Relationship] = []
        evs: List[Evidence] = []

        cycle_hops = [
            ("ACC012", "ACC013", "2026-08-12T09:15:00Z", "Hop 1: Placement to layering entity"),
            ("ACC013", "ACC014", "2026-08-12T11:30:00Z", "Hop 2: Inter-bank pass-through transfer"),
            ("ACC014", "ACC012", "2026-08-12T14:45:00Z", "Hop 3: Complete round-trip settlement")
        ]

        for src, tgt, ts, desc in cycle_hops:
            ev = self.evidence_gen.create_evidence(
                case_id="FIR002",
                source_file="fiu_suspicious_transaction_report_str901.pdf",
                timestamp=ts,
                description=desc
            )
            evs.append(ev)
            rels.append(Relationship(
                id=str(uuid.uuid4()),
                source=src,
                target=tgt,
                relationship_type=RelationshipType.TRANSFERRED_TO.value,
                case_id="FIR002",
                timestamp=ts,
                confidence=1.0,
                evidence_id=ev.id
            ))

        return rels, evs

    def inject_pattern_8_communication_burst(
        self,
    ) -> Tuple[List[Relationship], List[Evidence]]:
        """
        Pattern 8: Communication Burst.
        30+ CONTACTED relationships between two entities (PH020 and PH021) within 6 hours.
        Generates 32 high-frequency calls across a 4.5 hour span.
        """
        rels: List[Relationship] = []
        evs: List[Evidence] = []

        base_hour = 10
        base_minute = 0
        total_calls = 32

        for i in range(total_calls):
            minute_offset = i * 8  # spaced ~8 mins apart -> 256 minutes = 4.26 hours (< 6 hours)
            h = base_hour + (minute_offset // 60)
            m = minute_offset % 60
            s = (i * 17) % 60
            ts = f"2026-08-13T{h:02d}:{m:02d}:{s:02d}Z"

            # Alternate caller and receiver to model bidirectional phone burst
            src = "PH020" if i % 2 == 0 else "PH021"
            tgt = "PH021" if i % 2 == 0 else "PH020"

            ev = self.evidence_gen.create_evidence(
                case_id="FIR004",
                source_file="cdr_high_density_burst_fir004.csv",
                timestamp=ts,
                description=f"Call detail record event #{i+1} in high-frequency burst"
            )
            evs.append(ev)
            rels.append(Relationship(
                id=str(uuid.uuid4()),
                source=src,
                target=tgt,
                relationship_type=RelationshipType.CONTACTED.value,
                case_id="FIR004",
                timestamp=ts,
                confidence=1.0,
                evidence_id=ev.id
            ))

        return rels, evs

    def inject_pattern_9_alias_records(
        self,
    ) -> Tuple[List[Relationship], List[Evidence]]:
        """
        Pattern 9: Alias Records.
        Connect distinct entities Rahul Sharma (P025), R Sharma (P026), and Rahul S (P027)
        to surrounding infrastructure for downstream resolution.
        """
        rels: List[Relationship] = []
        evs: List[Evidence] = []

        alias_assignments = [
            ("P025", "PH025", RelationshipType.USES.value, "FIR009", "sim_caf_kyc_rahul_sharma.pdf", "2026-08-03T11:00:00Z"),
            ("P025", "ACC015", RelationshipType.OWNS.value, "FIR009", "bank_account_mandate_p025.pdf", "2026-08-03T11:30:00Z"),
            ("P026", "PH026", RelationshipType.USES.value, "FIR009", "sim_caf_r_sharma.pdf", "2026-08-04T14:00:00Z"),
            ("P026", "LOC001", RelationshipType.VISITED.value, "FIR009", "atm_surveillance_cp_p026.mp4", "2026-08-04T15:30:00Z"),
            ("P027", "PH027", RelationshipType.USES.value, "FIR009", "device_seizure_rahul_s.pdf", "2026-08-05T09:15:00Z"),
            ("P027", "FIR009", RelationshipType.MENTIONED_IN.value, "FIR009", "fir009_suspect_annexure.pdf", "2026-08-14T12:00:00Z"),
        ]

        for src, tgt, rtype, cid, sfile, ts in alias_assignments:
            ev = self.evidence_gen.create_evidence(
                case_id=cid,
                source_file=sfile,
                timestamp=ts,
                description=f"Evidence establishing {rtype} between {src} and {tgt}"
            )
            evs.append(ev)
            rels.append(Relationship(
                id=str(uuid.uuid4()),
                source=src,
                target=tgt,
                relationship_type=rtype,
                case_id=cid,
                timestamp=ts,
                confidence=1.0,
                evidence_id=ev.id
            ))

        return rels, evs

    def inject_pattern_10_temporal_changes(
        self,
    ) -> Tuple[List[Relationship], List[Evidence]]:
        """
        Pattern 10: Temporal Changes for Graph Diff testing.
        Strict boundary at August 15, 2026 (2026-08-15T00:00:00Z):
        - Relationships that strictly appear before August 15 and stop before Aug 15.
        - Relationships that strictly appear after August 15.
        """
        rels: List[Relationship] = []
        evs: List[Evidence] = []

        # Pre-August 15 relationships (Active in July/Early August, completely terminated before Aug 15)
        pre_aug15_ops = [
            ("P014", "PH014", RelationshipType.USES.value, "FIR004", "cdr_telecom_pre_aug.csv", "2026-07-22T08:00:00Z"),
            ("P015", "PH015", RelationshipType.USES.value, "FIR004", "cdr_telecom_pre_aug.csv", "2026-07-23T09:00:00Z"),
            ("PH014", "PH015", RelationshipType.CONTACTED.value, "FIR004", "cdr_burner_calls_pre_aug.csv", "2026-07-25T14:10:00Z"),
            ("PH015", "PH014", RelationshipType.CONTACTED.value, "FIR004", "cdr_burner_calls_pre_aug.csv", "2026-08-02T19:30:00Z"),
            ("P014", "LOC005", RelationshipType.VISITED.value, "FIR004", "cctv_noida_sec62_pre_aug.mp4", "2026-08-08T17:00:00Z"),
            ("VEH004", "LOC005", RelationshipType.OBSERVED_AT.value, "FIR004", "fastag_noida_toll_pre_aug.csv", "2026-08-10T11:45:00Z"),
            ("P014", "ACC014", RelationshipType.OWNS.value, "FIR004", "bank_statement_pre_aug.pdf", "2026-08-12T10:00:00Z"),
            ("ACC014", "ACC015", RelationshipType.TRANSFERRED_TO.value, "FIR004", "wire_log_pre_aug.csv", "2026-08-14T20:30:00Z"),
        ]

        for src, tgt, rtype, cid, sfile, ts in pre_aug15_ops:
            ev = self.evidence_gen.create_evidence(
                case_id=cid,
                source_file=sfile,
                timestamp=ts,
                description=f"Pre-Aug 15 operational record ({src} -> {tgt})"
            )
            evs.append(ev)
            rels.append(Relationship(
                id=str(uuid.uuid4()),
                source=src,
                target=tgt,
                relationship_type=rtype,
                case_id=cid,
                timestamp=ts,
                confidence=1.0,
                evidence_id=ev.id
            ))

        # Post-August 15 relationships (Emerge strictly after August 15, representing reconfigured network)
        post_aug15_ops = [
            ("P019", "PH019", RelationshipType.USES.value, "FIR010", "new_sim_activation_post_aug.pdf", "2026-08-16T10:15:00Z"),
            ("P020", "PH022", RelationshipType.USES.value, "FIR010", "new_sim_activation_post_aug.pdf", "2026-08-17T11:45:00Z"),
            ("PH019", "PH022", RelationshipType.CONTACTED.value, "FIR010", "cdr_reconfigured_network_post_aug.csv", "2026-08-18T16:20:00Z"),
            ("P019", "LOC007", RelationshipType.VISITED.value, "FIR010", "hotel_guest_register_post_aug.pdf", "2026-08-20T21:00:00Z"),
            ("VEH007", "LOC007", RelationshipType.OBSERVED_AT.value, "FIR010", "parking_surveillance_post_aug.mp4", "2026-08-21T09:30:00Z"),
            ("P020", "ORG005", RelationshipType.MEMBER_OF.value, "FIR010", "roc_director_appointment_post_aug.pdf", "2026-08-23T14:00:00Z"),
            ("ACC018", "ACC019", RelationshipType.TRANSFERRED_TO.value, "FIR010", "rtgs_settlement_post_aug.csv", "2026-08-25T11:10:00Z"),
            ("P019", "FIR010", RelationshipType.MENTIONED_IN.value, "FIR010", "fir010_investigation_progress_report.pdf", "2026-08-28T18:00:00Z"),
        ]

        for src, tgt, rtype, cid, sfile, ts in post_aug15_ops:
            ev = self.evidence_gen.create_evidence(
                case_id=cid,
                source_file=sfile,
                timestamp=ts,
                description=f"Post-Aug 15 operational record ({src} -> {tgt})"
            )
            evs.append(ev)
            rels.append(Relationship(
                id=str(uuid.uuid4()),
                source=src,
                target=tgt,
                relationship_type=rtype,
                case_id=cid,
                timestamp=ts,
                confidence=1.0,
                evidence_id=ev.id
            ))

        return rels, evs
