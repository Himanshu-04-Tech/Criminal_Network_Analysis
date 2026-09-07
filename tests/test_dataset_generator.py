"""Unit and integration test suite for NEXUS-Bharat dataset generator."""

import sys
import json
from datetime import datetime
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent
nexus_bharat = root_dir / "nexus-bharat"
if str(nexus_bharat) not in sys.path:
    sys.path.insert(0, str(nexus_bharat))

import pytest

from dataset_generator.generators import (
    EntityGenerator,
    CaseGenerator,
    EvidenceGenerator,
)
from dataset_generator.models import (
    EntityType,
    CaseStatus,
    InvestigationDataset,
)
from dataset_generator.relationship_generator import RelationshipGenerator
from dataset_generator.export import DatasetExporter


@pytest.fixture
def generated_dataset():
    """Fixture providing a fresh complete dataset."""
    entity_gen = EntityGenerator()
    entities = entity_gen.generate_all_entities()

    case_gen = CaseGenerator()
    cases = case_gen.generate_cases()

    evidence_gen = EvidenceGenerator()
    rel_gen = RelationshipGenerator(entities, cases, evidence_gen)
    relationships, evidence = rel_gen.generate_all_relationships(target_count=210)

    dataset = InvestigationDataset(
        entities=entities,
        cases=cases,
        evidence=evidence,
        relationships=relationships,
    )
    return dataset


def test_entity_counts(generated_dataset):
    """Test that exact required counts of all entity categories are produced."""
    type_counts = {}
    for ent in generated_dataset.entities:
        type_counts[ent.type] = type_counts.get(ent.type, 0) + 1

    assert type_counts[EntityType.PERSON.value] == 35
    assert type_counts[EntityType.PHONE.value] == 45
    assert type_counts[EntityType.ACCOUNT.value] == 20
    assert type_counts[EntityType.VEHICLE.value] == 10
    assert type_counts[EntityType.LOCATION.value] == 10
    assert type_counts[EntityType.ORGANIZATION.value] == 6
    assert len(generated_dataset.entities) == 126


def test_case_counts_and_statuses(generated_dataset):
    """Test that exactly 10 FIR cases are created with valid lifecycle statuses."""
    assert len(generated_dataset.cases) == 10
    valid_statuses = {s.value for s in CaseStatus}
    case_ids = {c.id for c in generated_dataset.cases}
    expected_ids = {f"FIR{i:03d}" for i in range(1, 11)}

    assert case_ids == expected_ids
    for c in generated_dataset.cases:
        assert c.status in valid_statuses


def test_relationship_and_evidence_ranges(generated_dataset):
    """Test that relationship and evidence counts meet project specifications."""
    rel_count = len(generated_dataset.relationships)
    ev_count = len(generated_dataset.evidence)

    assert 180 <= rel_count <= 250, f"Relationship count {rel_count} outside [180, 250]"
    assert ev_count >= 150, f"Evidence count {ev_count} less than 150"


def test_referential_integrity(generated_dataset):
    """Test that every relationship and evidence record resolves to valid existing nodes."""
    entity_ids = {e.id for e in generated_dataset.entities}
    case_ids = {c.id for c in generated_dataset.cases}
    evidence_ids = {ev.id for ev in generated_dataset.evidence}
    all_node_ids = entity_ids.union(case_ids)

    for rel in generated_dataset.relationships:
        assert rel.source in all_node_ids, f"Orphan source {rel.source} in rel {rel.id}"
        assert rel.target in all_node_ids, f"Orphan target {rel.target} in rel {rel.id}"
        assert rel.case_id in case_ids, f"Invalid case_id {rel.case_id} in rel {rel.id}"
        assert rel.evidence_id in evidence_ids, f"Missing evidence_id {rel.evidence_id} in rel {rel.id}"

    for ev in generated_dataset.evidence:
        assert ev.case_id in case_ids, f"Evidence {ev.id} references non-existent case {ev.case_id}"


def test_pattern_1_hidden_broker(generated_dataset):
    """Verify Pattern 1: P017 acts as hidden broker without direct community person-to-person links."""
    comm_a_persons = {"P001", "P002", "P003", "P004"}
    comm_b_persons = {"P010", "P011", "P012", "P013"}

    # Assert no direct person-to-person edges between Comm A and Comm B
    for rel in generated_dataset.relationships:
        assert not (rel.source in comm_a_persons and rel.target in comm_b_persons), "Direct A->B edge detected!"
        assert not (rel.source in comm_b_persons and rel.target in comm_a_persons), "Direct B->A edge detected!"
        assert not (rel.source in comm_a_persons and rel.target == "P017"), "Direct A->P017 edge detected!"
        assert not (rel.source == "P017" and rel.target in comm_b_persons), "Direct P017->B edge detected!"

    # Verify bridge through operational nodes
    bridge_call = any(r.source == "PH004" and r.target == "PH016" for r in generated_dataset.relationships)
    bridge_tx = any(r.source == "ACC017" and r.target == "ACC010" for r in generated_dataset.relationships)
    assert bridge_call, "Inter-community bridge call PH004 -> PH016 missing"
    assert bridge_tx, "Inter-community bridge wire ACC017 -> ACC010 missing"


def test_pattern_2_shared_phone(generated_dataset):
    """Verify Pattern 2: PH005 shared across P005 and P018 in different FIRs."""
    ph005_rels = [
        r for r in generated_dataset.relationships
        if r.target == "PH005" and r.relationship_type == "USES"
    ]
    users = {r.source for r in ph005_rels}
    cases = {r.case_id for r in ph005_rels}

    assert "P005" in users
    assert "P018" in users
    assert len(cases) >= 2


def test_pattern_3_shared_vehicle(generated_dataset):
    """Verify Pattern 3: VEH003 appears in both FIR003 and FIR008."""
    veh003_cases = {
        r.case_id for r in generated_dataset.relationships
        if r.source == "VEH003" or r.target == "VEH003"
    }
    assert "FIR003" in veh003_cases
    assert "FIR008" in veh003_cases


def test_pattern_4_cross_case_bridge(generated_dataset):
    """Verify Pattern 4: Path FIR001 -> P001 -> PH001 -> P006 -> ACC006 -> P007 -> FIR007 exists."""
    rels = generated_dataset.relationships
    assert any(r.source == "P001" and r.target == "FIR001" for r in rels)
    assert any(r.source == "P001" and r.target == "PH001" for r in rels)
    assert any(r.source == "P006" and r.target == "PH001" for r in rels)
    assert any(r.source == "P006" and r.target == "ACC006" for r in rels)
    assert any(r.source == "P007" and r.target == "ACC006" for r in rels)
    assert any(r.source == "P007" and r.target == "FIR007" for r in rels)


def test_pattern_5_financial_fan_out(generated_dataset):
    """Verify Pattern 5: ACC001 fans out to ACC002, ACC003, ACC004, ACC005."""
    fan_out_targets = {
        r.target for r in generated_dataset.relationships
        if r.source == "ACC001" and r.relationship_type == "TRANSFERRED_TO"
    }
    assert {"ACC002", "ACC003", "ACC004", "ACC005"}.issubset(fan_out_targets)


def test_pattern_6_financial_fan_in(generated_dataset):
    """Verify Pattern 6: ACC007, ACC008, ACC010 fan in to ACC009."""
    fan_in_sources = {
        r.source for r in generated_dataset.relationships
        if r.target == "ACC009" and r.relationship_type == "TRANSFERRED_TO"
    }
    assert {"ACC007", "ACC008", "ACC010"}.issubset(fan_in_sources)


def test_pattern_7_circular_transactions(generated_dataset):
    """Verify Pattern 7: ACC012 -> ACC013 -> ACC014 -> ACC012 loop."""
    tx_edges = {
        (r.source, r.target) for r in generated_dataset.relationships
        if r.relationship_type == "TRANSFERRED_TO"
    }
    assert ("ACC012", "ACC013") in tx_edges
    assert ("ACC013", "ACC014") in tx_edges
    assert ("ACC014", "ACC012") in tx_edges


def test_pattern_8_communication_burst(generated_dataset):
    """Verify Pattern 8: 30+ calls between PH020 & PH021 in < 6 hours."""
    burst_calls = [
        r for r in generated_dataset.relationships
        if r.relationship_type == "CONTACTED" and {r.source, r.target} == {"PH020", "PH021"}
    ]
    assert len(burst_calls) >= 30
    timestamps = sorted([datetime.fromisoformat(r.timestamp.replace("Z", "+00:00")) for r in burst_calls])
    duration = (timestamps[-1] - timestamps[0]).total_seconds() / 3600.0
    assert duration <= 6.0


def test_pattern_9_alias_records(generated_dataset):
    """Verify Pattern 9: Distinct unmerged nodes for Rahul Sharma, R Sharma, Rahul S."""
    alias_nodes = [e for e in generated_dataset.entities if e.id in {"P025", "P026", "P027"}]
    assert len(alias_nodes) == 3
    names = {e.name for e in alias_nodes}
    assert names == {"Rahul Sharma", "R Sharma", "Rahul S"}


def test_pattern_10_temporal_changes(generated_dataset):
    """Verify Pattern 10: Relationships partitioned across August 15, 2026."""
    cutoff = datetime.fromisoformat("2026-08-15T00:00:00+00:00")
    pre_aug15 = [
        r for r in generated_dataset.relationships
        if datetime.fromisoformat(r.timestamp.replace("Z", "+00:00")) < cutoff
    ]
    post_aug15 = [
        r for r in generated_dataset.relationships
        if datetime.fromisoformat(r.timestamp.replace("Z", "+00:00")) >= cutoff
    ]
    assert len(pre_aug15) > 0
    assert len(post_aug15) > 0


def test_exported_json_files(tmp_path, generated_dataset):
    """Test export of JSON files and inspect content validity."""
    exporter = DatasetExporter([tmp_path])
    summary = exporter.export(generated_dataset)

    expected_files = [
        "entities.json",
        "relationships.json",
        "evidence.json",
        "cases.json",
        "dataset_summary.json",
    ]

    for fname in expected_files:
        fpath = tmp_path / fname
        assert fpath.exists(), f"Missing exported file {fname}"
        with open(fpath, "r", encoding="utf-8") as f:
            data = json.load(f)
            assert len(data) > 0

    assert summary.persons == 35
    assert summary.phones == 45
    assert summary.cases == 10
    assert summary.hidden_broker == "P017"
    assert summary.cross_case_bridge_exists is True
