"""Comprehensive unit and integration test suite for NEXUS-Bharat Network Role Intelligence (Module 4)."""

import json
import sys
from pathlib import Path
import pytest

root_dir = Path(__file__).resolve().parent.parent
nexus_bharat = root_dir / "nexus-bharat"
if str(nexus_bharat) not in sys.path:
    sys.path.insert(0, str(nexus_bharat))

from role_intelligence.role_models import (
    InvestigationRole,
    CentralityMetrics,
    RoleClassification,
    CommunityStructure,
)
from role_intelligence.role_service import RoleService


@pytest.fixture
def role_service():
    """Fixture providing initialized RoleService."""
    RoleService.reset_instance()
    service = RoleService.get_instance()
    return service


def test_role_service_initialization(role_service):
    """Verify singleton initialization and graph availability."""
    assert role_service is not None
    assert role_service.graph is not None
    assert role_service.graph.number_of_nodes() == 136
    assert role_service.graph.number_of_edges() == 225


def test_centrality_engine_all_metrics(role_service):
    """Verify calculation and ranges of all 5 centrality metrics."""
    engine = role_service.centrality_engine
    engine.compute_all()

    deg = engine.get_degree_centrality()
    bet = engine.get_betweenness_centrality()
    close = engine.get_closeness_centrality()
    eig = engine.get_eigenvector_centrality()
    pr = engine.get_pagerank()

    for node_id in role_service.graph.nodes():
        assert 0.0 <= deg[node_id] <= 1.0
        assert 0.0 <= bet[node_id] <= 1.0
        assert 0.0 <= close[node_id] <= 1.0
        assert 0.0 <= eig[node_id] <= 1.0
        assert 0.0 <= pr[node_id] <= 1.0

    # Test single node metrics model
    node_metrics = engine.get_node_metrics("P017")
    assert node_metrics is not None
    assert isinstance(node_metrics, CentralityMetrics)
    assert node_metrics.degree > 0
    assert node_metrics.betweenness > 0


def test_centrality_caching(role_service):
    """Verify that centrality calls use cached dictionaries."""
    engine = role_service.centrality_engine
    deg1 = engine.get_degree_centrality()
    deg2 = engine.get_degree_centrality()
    assert deg1 is not None
    assert deg1 == deg2


def test_community_detector_louvain(role_service):
    """Verify Louvain community detection and modularity score."""
    detector = role_service.community_detector
    struct = detector.get_community_structure()

    assert isinstance(struct, CommunityStructure)
    assert struct.num_communities >= 5
    assert struct.modularity > 0.35  # Strong modularity
    assert struct.connected_components_count >= 1

    # Verify every node is mapped to a community
    all_members = []
    for members in struct.communities.values():
        all_members.extend(members)
    assert len(all_members) == 136


def test_hidden_broker_p017_automatic_detection(role_service):
    """
    Critical requirement: Verify P017 is automatically detected as BROKER
    with score 94, reason 'Connects 3 communities', and ranks as #1 broker.
    """
    p017_rec = role_service.get_entity_role("P017")
    assert p017_rec is not None
    assert p017_rec.role == InvestigationRole.BROKER
    assert p017_rec.details.get("broker_score") == 94.0
    assert p017_rec.details.get("is_cut_vertex") is True
    assert "Connects 3 communities" in p017_rec.reasons[0]

    # Verify P017 is top broker in ranking
    top_brokers = role_service.get_top_brokers(limit=5)
    assert len(top_brokers) >= 1
    assert top_brokers[0].entity_id == "P017"
    assert top_brokers[0].details.get("broker_score") == 94.0


def test_top_hubs_detection(role_service):
    """Verify top degree hubs are identified."""
    top_hubs = role_service.get_top_hubs(limit=5)
    assert len(top_hubs) == 5

    hub_ids = [h.entity_id for h in top_hubs]
    # Check that known high degree persons are captured
    assert any(hid in ("P006", "P010", "P014", "P018", "P020") for hid in hub_ids)
    for h in top_hubs:
        assert h.role in (InvestigationRole.HUB, InvestigationRole.BROKER)
        assert h.metrics.get("degree", 0.0) > 0.04


def test_top_influencers_scoring(role_service):
    """Verify composite 0-100 influence scoring."""
    top_inf = role_service.get_top_influencers(limit=5)
    assert len(top_inf) == 5

    scores = [inf.influence_score for inf in top_inf]
    # Scores must be sorted descending and in [0, 100]
    assert scores == sorted(scores, reverse=True)
    for sc in scores:
        assert 0.0 <= sc <= 100.0


def test_shared_resources_detection(role_service):
    """Verify detection of shared phones, accounts, and vehicles."""
    shared = role_service.get_shared_resources()
    assert len(shared) >= 5

    shared_ids = {s.entity_id for s in shared}
    # Verify expected shared resources from deliberate patterns
    assert "PH001" in shared_ids
    assert "PH005" in shared_ids
    assert "PH016" in shared_ids
    assert "ACC006" in shared_ids
    assert "ACC010" in shared_ids

    for s in shared:
        assert s.role == InvestigationRole.SHARED_RESOURCE
        assert s.details.get("shared_count", 0) >= 2
        assert len(s.details.get("shared_by", [])) >= 2


def test_financial_conduits_typologies(role_service):
    """Verify financial conduit classification into Fan-In, Fan-Out, and Routing."""
    conduits = role_service.get_financial_conduits()
    assert len(conduits) >= 3

    conduit_map = {c.entity_id: c.details.get("conduit_type") for c in conduits}

    # ACC001 has 4 outgoing transfers -> Fan-Out
    assert "ACC001" in conduit_map
    assert "Fan-Out" in conduit_map["ACC001"]

    # ACC009 has 3 incoming transfers -> Fan-In
    assert "ACC009" in conduit_map
    assert "Fan-In" in conduit_map["ACC009"]

    # ACC012 has 1 in and 1 out -> Money Routing
    assert "ACC012" in conduit_map
    assert "Routing" in conduit_map["ACC012"]


def test_isolated_entity_detection(role_service):
    """Verify degree 0 entities are classified as ISOLATED_ENTITY."""
    iso_entities = role_service.role_classifier.get_entities_by_role(InvestigationRole.ISOLATED_ENTITY)
    assert len(iso_entities) >= 1

    iso_ids = [i.entity_id for i in iso_entities]
    assert "PH045" in iso_ids

    ph045 = role_service.get_entity_role("PH045")
    assert ph045.role == InvestigationRole.ISOLATED_ENTITY
    assert any("0.0" in r or "Zero" in r for r in ph045.reasons)


def test_explainability_integrity(role_service):
    """Verify every entity classification contains non-empty, meaningful reasons."""
    all_classes = role_service.role_classifier.classify_all()
    for entity_id, record in all_classes.items():
        assert len(record.reasons) >= 1, f"Entity {entity_id} missing reasons!"
        for reason in record.reasons:
            assert reason and len(reason.strip()) > 3

    # Test get_role_explanation API
    expl = role_service.get_role_explanation("P017")
    assert expl["entity_id"] == "P017"
    assert expl["role"] == "BROKER"
    assert len(expl["reasons"]) >= 1


def test_reports_export(tmp_path, role_service):
    """Verify export_reports generates all 5 JSON intelligence reports."""
    export_dir = tmp_path / "test_reports"
    report_paths = role_service.export_reports(output_dir=str(export_dir))

    expected_reports = [
        "broker_report",
        "hub_report",
        "community_report",
        "influence_report",
        "shared_resource_report",
    ]
    for rep in expected_reports:
        assert rep in report_paths
        file_path = Path(report_paths[rep])
        assert file_path.exists()
        # Verify valid JSON
        data = json.loads(file_path.read_text(encoding="utf-8"))
        assert isinstance(data, dict)


def test_community_visualization_payload(role_service):
    """Verify visualization graph payload adheres to {nodes, edges, communities} schema."""
    vis = role_service.get_community_visualization_graph()
    assert "nodes" in vis
    assert "edges" in vis
    assert "communities" in vis

    assert len(vis["nodes"]) == 136
    assert len(vis["edges"]) == 225
    assert len(vis["communities"]) >= 5

    # Check node schema
    sample_node = vis["nodes"][0]
    for key in ("id", "label", "type", "role", "community", "influence_score", "degree"):
        assert key in sample_node

    # Check edge schema
    sample_edge = vis["edges"][0]
    for key in ("id", "source", "target", "type"):
        assert key in sample_edge

    # Check community schema
    sample_comm = vis["communities"][0]
    for key in ("id", "label", "member_count", "members"):
        assert key in sample_comm
