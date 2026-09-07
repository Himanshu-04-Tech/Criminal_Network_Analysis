"""Comprehensive unit and integration test suite for NEXUS-Bharat Cross Case Intelligence (Module 5)."""

import json
import sys
from pathlib import Path
import pytest

root_dir = Path(__file__).resolve().parent.parent
nexus_bharat = root_dir / "nexus-bharat"
if str(nexus_bharat) not in sys.path:
    sys.path.insert(0, str(nexus_bharat))

from cross_case_intelligence.models import (
    ConnectionStrength,
    CaseEntityBreakdown,
    CaseOverlap,
    BridgeEntity,
    CrossCaseComparison,
    CaseCluster,
    CaseRanking,
    CrossCaseVisualizationPayload,
)
from cross_case_intelligence.intelligence_service import CrossCaseIntelligenceService


@pytest.fixture
def intelligence_service():
    """Fixture providing initialized CrossCaseIntelligenceService."""
    CrossCaseIntelligenceService.reset_instance()
    service = CrossCaseIntelligenceService.get_instance()
    return service


def test_service_initialization(intelligence_service):
    """Verify singleton initialization, underlying graph, and case discovery."""
    assert intelligence_service is not None
    cases = intelligence_service.get_all_case_ids()
    assert len(cases) == 10
    assert "FIR001" in cases
    assert "FIR007" in cases


def test_case_entity_breakdown(intelligence_service):
    """Verify categorization of case entities into 6 distinct types."""
    breakdown_fir1 = intelligence_service.case_loader.get_case_entities("FIR001")
    assert isinstance(breakdown_fir1, CaseEntityBreakdown)
    assert breakdown_fir1.case_id == "FIR001"
    assert len(breakdown_fir1.persons) > 0
    assert breakdown_fir1.total_entities > 0

    breakdown_fir7 = intelligence_service.case_loader.get_case_entities("FIR007")
    assert isinstance(breakdown_fir7, CaseEntityBreakdown)
    assert breakdown_fir7.case_id == "FIR007"
    assert len(breakdown_fir7.persons) > 0


def test_shared_entity_detection(intelligence_service):
    """Verify detection of direct shared entities between FIR001 and FIR007."""
    overlap = intelligence_service.find_shared_entities("FIR001", "FIR007")
    assert isinstance(overlap, CaseOverlap)
    assert overlap.total_shared == 3
    # Shared persons (P006, P021) and shared org (ORG001)
    assert len(overlap.shared_persons) == 2
    assert "P006" in overlap.shared_persons or "P021" in overlap.shared_persons
    assert len(overlap.shared_organizations) == 1
    assert "ORG001" in overlap.shared_organizations
    assert len(overlap.shared_phones) == 0
    assert len(overlap.shared_vehicles) == 0


def test_bridge_entity_detection_with_role_intelligence(intelligence_service):
    """Verify discovery of direct and intermediary bridge entities including broker P017."""
    bridges = intelligence_service.find_bridge_entities("FIR001", "FIR007")
    assert len(bridges) > 0
    bridge_ids = [b.entity_id for b in bridges]
    
    # Must identify the clandestine broker P017
    assert "P017" in bridge_ids
    
    # Locate P017's bridge record and verify Module 4 role enrichment
    p017_bridge = next(b for b in bridges if b.entity_id == "P017")
    assert p017_bridge.is_broker is True
    assert p017_bridge.role == "BROKER"
    assert p017_bridge.hop_distance in (1, 2)


def test_case_similarity_score_and_symmetry(intelligence_service):
    """Verify multi-factor similarity scoring and mathematical symmetry."""
    score_1_7 = intelligence_service.get_case_similarity("FIR001", "FIR007")
    score_7_1 = intelligence_service.get_case_similarity("FIR007", "FIR001")
    
    # Must be exactly symmetric
    assert score_1_7 == score_7_1
    # Calibrated score target: 82.0
    assert round(score_1_7, 1) == 82.0


def test_similarity_matrix_properties(intelligence_service):
    """Verify 10x10 similarity matrix properties: diagonal 100, symmetry, [0, 100] bounds."""
    matrix = intelligence_service.similarity_engine.get_similarity_matrix()
    cases = intelligence_service.get_all_case_ids()
    
    assert len(matrix) == 10
    for c1 in cases:
        assert len(matrix[c1]) == 10
        # Diagonal is 100.0
        assert matrix[c1][c1] == 100.0
        for c2 in cases:
            score = matrix[c1][c2]
            assert 0.0 <= score <= 100.0
            assert matrix[c1][c2] == matrix[c2][c1]


def test_connection_strength_and_comparison(intelligence_service):
    """Verify comprehensive comparison and strength determination for FIR001 <-> FIR007."""
    comp = intelligence_service.compare_cases("FIR001", "FIR007")
    assert isinstance(comp, CrossCaseComparison)
    assert comp.case_a == "FIR001"
    assert comp.case_b == "FIR007"
    assert comp.connected is True
    assert comp.connection_strength == ConnectionStrength.CRITICAL
    assert comp.similarity_score >= 70.0
    assert comp.broker_present is True
    assert comp.broker_id == "P017"
    assert len(comp.reasons) > 0


def test_cross_case_cluster_detection(intelligence_service):
    """Verify syndicate cluster detection on the secondary case network."""
    clusters = intelligence_service.detect_case_clusters()
    assert len(clusters) >= 1
    
    all_clustered_cases = []
    for cl in clusters:
        assert isinstance(cl, CaseCluster)
        assert len(cl.cases) >= 2
        assert cl.lead_case in cl.cases
        assert cl.internal_cohesion >= 0.0
        all_clustered_cases.extend(cl.cases)
    
    assert "FIR001" in all_clustered_cases
    assert "FIR007" in all_clustered_cases


def test_case_ranking_engine(intelligence_service):
    """Verify case ranking by network importance score descending."""
    rankings = intelligence_service.rank_cases()
    assert len(rankings) == 10
    
    # Check monotonic descending order
    scores = [r.importance_score for r in rankings]
    assert scores == sorted(scores, reverse=True)
    
    for r in rankings:
        assert isinstance(r, CaseRanking)
        assert 0.0 <= r.importance_score <= 100.0
        assert r.connected_cases_count >= 1


def test_find_case_connections(intelligence_service):
    """Verify querying all connections for a specific case, sorted by similarity."""
    connections = intelligence_service.find_case_connections("FIR001")
    assert len(connections) == 9  # 9 other cases
    
    # Verify sorted descending by similarity score
    sim_scores = [c.similarity_score for c in connections]
    assert sim_scores == sorted(sim_scores, reverse=True)
    
    # Top connections must include FIR007 or FIR002
    top_cases = [c.case_b for c in connections[:2]]
    assert "FIR007" in top_cases or "FIR002" in top_cases


def test_generate_case_report(intelligence_service):
    """Verify single-case dossier generation with cross-case linkages."""
    dossier = intelligence_service.generate_case_report("FIR007")
    assert dossier["case_id"] == "FIR007"
    assert "total_entities" in dossier
    assert "entity_breakdown" in dossier
    assert "connected_cases_count" in dossier
    assert len(dossier["top_connections"]) > 0


def test_visualization_payload(intelligence_service):
    """Verify generation of standardized graph visualization payload."""
    payload = intelligence_service.get_visualization_payload()
    assert isinstance(payload, CrossCaseVisualizationPayload)
    assert len(payload.nodes) == 10  # 10 case nodes
    assert len(payload.edges) > 0    # Case-to-case connections
    assert len(payload.clusters) >= 1
    
    # Node schema validation
    node = payload.nodes[0]
    assert "id" in node
    assert "label" in node
    assert "size" in node
    
    # Edge schema validation
    edge = payload.edges[0]
    assert "source" in edge
    assert "target" in edge
    assert "weight" in edge
    assert "strength" in edge


def test_export_all_intelligence_reports(intelligence_service, tmp_path):
    """Verify export of all 5 standardized intelligence JSON reports."""
    reports_dir = str(tmp_path / "reports")
    generated = intelligence_service.export_reports(reports_dir)
    
    expected_reports = [
        "cross_case_report",
        "case_clusters",
        "similarity_matrix",
        "bridge_entities",
        "case_rankings",
    ]
    
    for rep in expected_reports:
        assert rep in generated
        report_file = Path(generated[rep])
        assert report_file.exists()
        assert report_file.stat().st_size > 0
        
        # Verify JSON parses cleanly
        with open(report_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            assert isinstance(data, dict)
