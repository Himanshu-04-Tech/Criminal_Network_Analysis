"""NEXUS-Bharat Synthetic Investigation Dataset Generator - Main Pipeline Orchestrator."""

from __future__ import annotations
import sys
from pathlib import Path
from datetime import datetime

# Add project root to sys.path so modules resolve cleanly
current_file = Path(__file__).resolve()
project_root = current_file.parent.parent  # nexus-bharat
workspace_root = project_root.parent        # Criminal_Network_Analysis

for p in [str(project_root), str(workspace_root)]:
    if p not in sys.path:
        sys.path.insert(0, p)

# Ensure stdout handles UTF-8 on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from dataset_generator.generators import (
    EntityGenerator,
    CaseGenerator,
    EvidenceGenerator,
)
from dataset_generator.models import InvestigationDataset
from dataset_generator.relationship_generator import RelationshipGenerator
from dataset_generator.export import DatasetExporter


def verify_intelligence_patterns(dataset: InvestigationDataset) -> None:
    """Run programmatic assertions to confirm that all 10 deliberate intelligence patterns exist."""
    print("\n>>> AUDITING INTELLIGENCE PATTERNS...")

    # Pattern 1: Hidden Broker (P017)
    broker_rels = [r for r in dataset.relationships if r.source == "P017" or r.target == "P017"]
    assert len(broker_rels) >= 2, "Pattern 1 Failed: P017 not properly connected!"
    # Check intermediate bridge PH004 -> PH016 and ACC017 -> ACC010
    bridge_call = any(r.source == "PH004" and r.target == "PH016" for r in dataset.relationships)
    bridge_tx = any(r.source == "ACC017" and r.target == "ACC010" for r in dataset.relationships)
    assert bridge_call and bridge_tx, "Pattern 1 Failed: Hidden bridge intermediaries missing!"
    print("  [OK] Pattern 1: Hidden Broker (P017 intermediate bridge between Comm A and Comm B verified)")

    # Pattern 2: Shared Phone (PH005 across P005 and P018)
    ph005_users = {r.source for r in dataset.relationships if r.target == "PH005" and r.relationship_type == "USES"}
    ph005_cases = {r.case_id for r in dataset.relationships if r.target == "PH005" and r.relationship_type == "USES"}
    assert "P005" in ph005_users and "P018" in ph005_users, "Pattern 2 Failed: PH005 not linked to both P005 and P018!"
    assert len(ph005_cases) >= 2, "Pattern 2 Failed: PH005 not linked across multiple FIRs!"
    print(f"  [OK] Pattern 2: Shared Phone (PH005 linked to P005 and P018 across {ph005_cases})")

    # Pattern 3: Shared Vehicle (VEH003 in FIR003 and FIR008)
    veh003_cases = {r.case_id for r in dataset.relationships if r.source == "VEH003" or r.target == "VEH003"}
    assert "FIR003" in veh003_cases and "FIR008" in veh003_cases, "Pattern 3 Failed: VEH003 missing in FIR003/FIR008!"
    print(f"  [OK] Pattern 3: Shared Vehicle (VEH003 observed in FIR003 and FIR008)")

    # Pattern 4: Cross Case Bridge (FIR001 -> Person -> Phone -> Person -> Account -> Person -> FIR007)
    # Trace step-by-step
    p001_in_fir1 = any(r.source == "P001" and r.target == "FIR001" for r in dataset.relationships)
    p001_uses_ph1 = any(r.source == "P001" and r.target == "PH001" for r in dataset.relationships)
    p006_uses_ph1 = any(r.source == "P006" and r.target == "PH001" for r in dataset.relationships)
    p006_owns_acc6 = any(r.source == "P006" and r.target == "ACC006" for r in dataset.relationships)
    p007_uses_acc6 = any(r.source == "P007" and r.target == "ACC006" for r in dataset.relationships)
    p007_in_fir7 = any(r.source == "P007" and r.target == "FIR007" for r in dataset.relationships)
    assert p001_in_fir1 and p001_uses_ph1 and p006_uses_ph1 and p006_owns_acc6 and p007_uses_acc6 and p007_in_fir7, \
        "Pattern 4 Failed: Cross-Case Bridge chain is broken!"
    print("  [OK] Pattern 4: Cross Case Bridge (FIR001 -> P001 -> PH001 -> P006 -> ACC006 -> P007 -> FIR007 verified)")

    # Pattern 5: Financial Fan Out (ACC001 -> ACC002, ACC003, ACC004, ACC005)
    fan_out_targets = {
        r.target for r in dataset.relationships
        if r.source == "ACC001" and r.relationship_type == "TRANSFERRED_TO"
    }
    assert {"ACC002", "ACC003", "ACC004", "ACC005"}.issubset(fan_out_targets), "Pattern 5 Failed: Fan out targets missing!"
    print(f"  [OK] Pattern 5: Financial Fan Out (ACC001 -> {fan_out_targets})")

    # Pattern 6: Financial Fan In (ACC007, ACC008, ACC010 -> ACC009)
    fan_in_sources = {
        r.source for r in dataset.relationships
        if r.target == "ACC009" and r.relationship_type == "TRANSFERRED_TO"
    }
    assert {"ACC007", "ACC008", "ACC010"}.issubset(fan_in_sources), "Pattern 6 Failed: Fan in sources missing!"
    print(f"  [OK] Pattern 6: Financial Fan In ({fan_in_sources} -> ACC009)")

    # Pattern 7: Circular Transactions (ACC012 -> ACC013 -> ACC014 -> ACC012)
    cycle_edges = {
        (r.source, r.target) for r in dataset.relationships
        if r.relationship_type == "TRANSFERRED_TO"
    }
    assert ("ACC012", "ACC013") in cycle_edges and ("ACC013", "ACC014") in cycle_edges and ("ACC014", "ACC012") in cycle_edges, \
        "Pattern 7 Failed: Circular transaction cycle missing!"
    print("  [OK] Pattern 7: Circular Transactions (ACC012 -> ACC013 -> ACC014 -> ACC012 verified)")

    # Pattern 8: Communication Burst (30+ CONTACTED between two entities in < 6 hours)
    burst_calls = [
        r for r in dataset.relationships
        if r.relationship_type == "CONTACTED" and {r.source, r.target} == {"PH020", "PH021"}
    ]
    assert len(burst_calls) >= 30, f"Pattern 8 Failed: Expected 30+ burst calls, found {len(burst_calls)}"
    burst_timestamps = sorted([datetime.fromisoformat(r.timestamp.replace("Z", "+00:00")) for r in burst_calls])
    time_span = (burst_timestamps[-1] - burst_timestamps[0]).total_seconds() / 3600.0
    assert time_span <= 6.0, f"Pattern 8 Failed: Burst span {time_span:.2f}h exceeds 6 hours!"
    print(f"  [OK] Pattern 8: Communication Burst ({len(burst_calls)} calls between PH020 & PH021 in {time_span:.2f} hours)")

    # Pattern 9: Alias Records (Rahul Sharma, R Sharma, Rahul S)
    alias_names = {e.name for e in dataset.entities if e.id in {"P025", "P026", "P027"}}
    expected_aliases = {"Rahul Sharma", "R Sharma", "Rahul S"}
    assert expected_aliases == alias_names, f"Pattern 9 Failed: Alias names mismatch: {alias_names}"
    print(f"  [OK] Pattern 9: Alias Records (Entities {expected_aliases} created unmerged with resolving metadata)")

    # Pattern 10: Temporal Changes (Pre-Aug 15 and Post-Aug 15)
    cutoff = datetime.fromisoformat("2026-08-15T00:00:00+00:00")
    pre_aug15 = [
        r for r in dataset.relationships
        if datetime.fromisoformat(r.timestamp.replace("Z", "+00:00")) < cutoff
    ]
    post_aug15 = [
        r for r in dataset.relationships
        if datetime.fromisoformat(r.timestamp.replace("Z", "+00:00")) >= cutoff
    ]
    assert len(pre_aug15) > 0 and len(post_aug15) > 0, "Pattern 10 Failed: Pre/Post Aug 15 split missing!"
    print(f"  [OK] Pattern 10: Temporal Changes ({len(pre_aug15)} relationships pre-Aug 15, {len(post_aug15)} post-Aug 15)")


def run_pipeline() -> None:
    """Execute complete dataset generation, validation, and JSON export."""
    print("=" * 70)
    print("  NEXUS-BHARAT: CRIMINAL NETWORK ANALYSIS SYSTEM")
    print("  Synthetic Investigation Dataset Generator")
    print("=" * 70)

    # 1. Generate Entities
    print("\n[1/5] Generating Investigation Entities...")
    entity_gen = EntityGenerator()
    entities = entity_gen.generate_all_entities()
    print(f"      Created {len(entities)} entities (35 Persons, 45 Phones, 20 Accounts, 10 Vehicles, 10 Locations, 6 Orgs)")

    # 2. Generate FIR Cases
    print("\n[2/5] Generating FIR Criminal Cases...")
    case_gen = CaseGenerator()
    cases = case_gen.generate_cases()
    print(f"      Created {len(cases)} FIR cases (FIR001 through FIR010)")

    # 3. Generate Evidence & Relationships
    print("\n[3/5] Wiring Relationships & Evidence (Injecting 10 Intelligence Patterns)...")
    evidence_gen = EvidenceGenerator()
    rel_gen = RelationshipGenerator(entities, cases, evidence_gen)
    relationships, evidence = rel_gen.generate_all_relationships(target_count=210)
    print(f"      Created {len(relationships)} relationships (target: 180-250)")
    print(f"      Created {len(evidence)} evidence records (target: >= 150)")

    # 4. Strict Pydantic Referential Validation
    print("\n[4/5] Validating Entire Graph Dataset via Pydantic...")
    dataset = InvestigationDataset(
        entities=entities,
        cases=cases,
        evidence=evidence,
        relationships=relationships,
    )
    print("      [PASS] Zero orphaned relationships detected.")
    print("      [PASS] 100% referential integrity verified.")

    # Audit Patterns
    verify_intelligence_patterns(dataset)

    # 5. Export JSON Files
    print("\n[5/5] Exporting JSON Files to Output Directories...")
    output_dirs = [
        project_root / "output",
        workspace_root / "output",
    ]
    exporter = DatasetExporter(output_dirs=output_dirs)
    summary = exporter.export(
        dataset=dataset,
        hidden_broker_id="P017",
        shared_phone_id="PH005",
        shared_vehicle_id="VEH003",
        cross_case_bridge_exists=True,
    )

    print("\n" + "=" * 70)
    print("  DATASET GENERATION COMPLETE - SUMMARY REPORT")
    print("=" * 70)
    for k, v in summary.model_dump().items():
        print(f"  {k.replace('_', ' ').title():<28}: {v}")
    print("=" * 70)
    print("  Output Files Written To:")
    for out_dir in output_dirs:
        print(f"   [DIR] {out_dir}")
        print("      - entities.json")
        print("      - relationships.json")
        print("      - evidence.json")
        print("      - cases.json")
        print("      - dataset_summary.json")
    print("=" * 70)


if __name__ == "__main__":
    run_pipeline()
