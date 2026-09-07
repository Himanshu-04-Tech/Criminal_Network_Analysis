"""Comprehensive unit and integration test suite for NEXUS-Bharat Case Fusion Engine (Module 6)."""

import json
import sys
from pathlib import Path
import pytest

root_dir = Path(__file__).resolve().parent.parent
nexus_bharat = root_dir / "nexus-bharat"
if str(nexus_bharat) not in sys.path:
    sys.path.insert(0, str(nexus_bharat))

from case_fusion.fusion_models import (
    FusionStrength,
    SharedEntitiesBreakdown,
    FusionBridgeEntity,
    EmergentPath,
    CommunityShift,
    ComparativeMetrics,
    FusionMetrics,
    FusionScoreResult,
    FusionAnalysis,
    FusionVisualizationPayload,
)
from case_fusion.fusion_service import CaseFusionService


@pytest.fixture
def fusion_service():
    """Fixture providing initialized CaseFusionService with clean cache."""
    CaseFusionService.reset_instance()
    service = CaseFusionService.get_instance()
    return service


def test_fusion_creation_and_id_generation(fusion_service):
    """Verify fusion session initialization, formatting (FC_001), and caching."""
    cases = ["FIR001", "FIR003", "FIR007"]
    fid1 = fusion_service.create_fusion(cases)
    assert fid1 == "FC_001"

    # Same cases (regardless of order) must return the cached fusion_id
    fid1_cached = fusion_service.create_fusion(["FIR007", "FIR001", "FIR003"])
    assert fid1_cached == "FC_001"

    # New distinct combination increments counter
    fid2 = fusion_service.create_fusion(["FIR002", "FIR004"])
    assert fid2 == "FC_002"


def test_fusion_graph_deduplication(fusion_service):
    """Verify identical entities appearing in multiple FIRs are deduplicated with provenance."""
    fid = fusion_service.create_fusion(["FIR001", "FIR003", "FIR007"])
    analysis = fusion_service.analyze_fusion(fid)
    f_graph = fusion_service._fusion_graphs[fid]

    # Shared entity P006 appears in all 3 cases
    assert "P006" in f_graph.graph.nodes
    p006_cases = f_graph.get_entity_cases("P006")
    assert len(p006_cases) >= 2

    # Verify no duplicate node keys
    all_nodes = list(f_graph.graph.nodes())
    assert len(all_nodes) == len(set(all_nodes))


def test_fusion_metrics_benchmark_calibration(fusion_service):
    """Verify consolidated graph metrics for FIR001 + FIR003 + FIR007 match benchmark targets."""
    fid = fusion_service.create_fusion(["FIR001", "FIR003", "FIR007"])
    metrics = fusion_service.get_fusion_metrics(fid)

    assert isinstance(metrics, FusionMetrics)
    assert metrics.total_cases == 3
    assert metrics.total_entities == 67
    assert metrics.total_relationships == 104
    assert metrics.shared_entities == 8
    assert metrics.bridge_entities == 3
    assert metrics.brokers == 1


def test_shared_entities_discovery(fusion_service):
    """Verify detection of shared persons, phones, accounts, vehicles, and front organizations."""
    fid = fusion_service.create_fusion(["FIR001", "FIR003", "FIR007"])
    shared = fusion_service.get_shared_entities(fid)

    assert isinstance(shared, SharedEntitiesBreakdown)
    assert shared.total_shared == 8
    assert len(shared.persons) > 0
    assert len(shared.phones) > 0
    assert len(shared.accounts) > 0
    assert len(shared.organizations) > 0
    assert "P006" in shared.persons
    assert "ORG001" in shared.organizations


def test_bridge_entities_and_broker_p017(fusion_service):
    """Verify discovery of critical bridge entities and natural surfacing of broker P017."""
    fid = fusion_service.create_fusion(["FIR001", "FIR003", "FIR007"])
    bridges = fusion_service.get_bridge_entities(fid)

    assert len(bridges) == 3
    bridge_ids = [b.entity_id for b in bridges]
    assert "P017" in bridge_ids

    p017_bridge = next(b for b in bridges if b.entity_id == "P017")
    assert p017_bridge.role == "BROKER"
    assert len(p017_bridge.cases_bridged) >= 2


def test_emergent_hidden_paths_discovery(fusion_service):
    """Verify discovery of hidden cross-case paths uniting previously isolated suspects."""
    fid = fusion_service.create_fusion(["FIR001", "FIR003", "FIR007"])
    paths = fusion_service.get_new_connections(fid)

    assert len(paths) > 0
    for p in paths:
        assert isinstance(p, EmergentPath)
        assert p.source_case != p.target_case
        assert p.hops >= 2
        assert len(p.path) == p.hops + 1
        assert p.source_entity == p.path[0]
        assert p.target_entity == p.path[-1]


def test_community_shift_analysis(fusion_service):
    """Verify community network consolidation from isolated silos to unified syndicate clusters."""
    fid = fusion_service.create_fusion(["FIR001", "FIR003", "FIR007"])
    analysis = fusion_service.analyze_fusion(fid)
    comm_shift = analysis.community_shift

    assert isinstance(comm_shift, CommunityShift)
    assert comm_shift.communities_before > comm_shift.communities_after
    assert comm_shift.communities_after <= 3
    assert comm_shift.modularity > 0.0
    assert len(comm_shift.consolidation_summary) > 0


def test_comparative_metrics_value_added(fusion_service):
    """Verify Before vs After comparative analysis metrics."""
    fid = fusion_service.create_fusion(["FIR001", "FIR003", "FIR007"])
    analysis = fusion_service.analyze_fusion(fid)
    comp = analysis.comparative

    assert isinstance(comp, ComparativeMetrics)
    assert comp.entities_before == 42
    assert comp.entities_after == 67
    assert comp.relationships_before == 58
    assert comp.relationships_after == 104
    assert comp.communities_before == 5
    assert comp.communities_after == 2
    assert comp.density_gain > 0.0


def test_fusion_score_and_strength_classification(fusion_service):
    """Verify 0-100 score calibration (91.0) and CRITICAL qualitative classification."""
    fid = fusion_service.create_fusion(["FIR001", "FIR003", "FIR007"])
    score_res = fusion_service.get_fusion_score(fid)

    assert isinstance(score_res, FusionScoreResult)
    assert score_res.fusion_score == 91.0
    assert score_res.strength == FusionStrength.CRITICAL

    # All 6 factors present
    expected_factors = [
        "shared_resources",
        "bridge_density",
        "broker_leverage",
        "community_overlap",
        "connection_density",
        "emergent_intelligence",
    ]
    for factor in expected_factors:
        assert factor in score_res.factors
        assert 0.0 <= score_res.factors[factor] <= 100.0


def test_fusion_explainability_justifications(fusion_service):
    """Verify court-ready natural language explanations answering: WHY SHOULD THESE CASES BE INVESTIGATED TOGETHER?"""
    fid = fusion_service.create_fusion(["FIR001", "FIR003", "FIR007"])
    reasons = fusion_service.get_fusion_explanation(fid)

    assert len(reasons) >= 4
    reasons_text = " ".join(reasons)
    assert "Shared Phone" in reasons_text or "Shared" in reasons_text
    assert "P017" in reasons_text
    assert "91" in reasons_text or "CRITICAL" in reasons_text


def test_export_all_fusion_reports(fusion_service, tmp_path):
    """Verify export of all 6 standardized JSON intelligence reports."""
    fid = fusion_service.create_fusion(["FIR001", "FIR003", "FIR007"])
    reports_dir = str(tmp_path / "reports")
    generated = fusion_service.export_fusion_report(fid, output_dir=reports_dir)

    expected_reports = [
        "fusion_summary",
        "fusion_metrics",
        "fusion_bridges",
        "fusion_shared_entities",
        "fusion_connections",
        "fusion_explanation",
    ]

    for rep in expected_reports:
        assert rep in generated
        report_file = Path(generated[rep])
        assert report_file.exists()
        assert report_file.stat().st_size > 0

        # Validate JSON parses without error
        with open(report_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            assert isinstance(data, dict)
            assert data.get("fusion_id") == fid


def test_visualization_payload(fusion_service):
    """Verify frontend node-link-community visualization payload."""
    fid = fusion_service.create_fusion(["FIR001", "FIR003", "FIR007"])
    payload = fusion_service.get_visualization_payload(fid)

    assert isinstance(payload, FusionVisualizationPayload)
    assert len(payload.nodes) > 0
    assert len(payload.edges) > 0
    assert len(payload.communities) > 0
    assert len(payload.bridges) > 0
    assert "P017" in payload.brokers

    # Node schema validation
    sample_node = payload.nodes[0]
    assert "id" in sample_node
    assert "label" in sample_node
    assert "type" in sample_node
    assert "is_case" in sample_node


def test_arbitrary_cases_fusion_dynamism(fusion_service):
    """Verify dynamic analytical fusion on arbitrary case selections (e.g. FIR002 + FIR004)."""
    fid = fusion_service.create_fusion(["FIR002", "FIR004"])
    assert fid == "FC_001"  # First call on fresh instance fixture

    analysis = fusion_service.analyze_fusion(fid)
    assert analysis.metrics.total_cases == 2
    assert analysis.metrics.total_entities > 0
    assert analysis.metrics.total_relationships > 0
    assert 0.0 <= analysis.score.fusion_score <= 100.0
    assert analysis.score.strength in (
        FusionStrength.LOW,
        FusionStrength.MODERATE,
        FusionStrength.HIGH,
        FusionStrength.CRITICAL,
    )
