"""Comprehensive unit and integration test suite for NEXUS-Bharat Hidden Connection Finder (Module 3)."""

import sys
from pathlib import Path
import pytest

root_dir = Path(__file__).resolve().parent.parent
nexus_bharat = root_dir / "nexus-bharat"
if str(nexus_bharat) not in sys.path:
    sys.path.insert(0, str(nexus_bharat))

from graph_engine.graph_service import KnowledgeGraphService
from graph_analytics.path_models import (
    PathResult,
    ConnectionResponse,
    CaseConnectionResponse,
    BrokerVerificationReport,
    VisualizationGraph,
)
from graph_analytics.connection_validator import ConnectionValidator
from graph_analytics.path_scorer import PathScorer
from graph_analytics.path_explainer import PathExplainer
from graph_analytics.connection_service import ConnectionService


@pytest.fixture
def conn_service():
    """Fixture providing initialized ConnectionService."""
    ConnectionService.reset_instance()
    service = ConnectionService.get_instance()
    return service


def test_connection_service_initialization(conn_service):
    """Verify singleton initialization and graph availability."""
    assert conn_service is not None
    assert conn_service.graph is not None
    assert conn_service.graph.number_of_nodes() == 136


def test_connection_validator(conn_service):
    """Verify input validation for entity connectivity."""
    graph = conn_service.graph

    # Valid entity pair
    valid, err = ConnectionValidator.validate_entity_pair(graph, "P001", "P002")
    assert valid is True
    assert err is None

    # Non-existent source
    valid, err = ConnectionValidator.validate_entity_pair(graph, "P999_MISSING", "P002")
    assert valid is False
    assert "does not exist" in err

    # Non-existent target
    valid, err = ConnectionValidator.validate_entity_pair(graph, "P001", "P999_MISSING")
    assert valid is False
    assert "does not exist" in err

    # Self-connection
    valid, err = ConnectionValidator.validate_entity_pair(graph, "P001", "P001")
    assert valid is False
    assert "same entity" in err

    # Empty string
    valid, err = ConnectionValidator.validate_entity_pair(graph, "", "P002")
    assert valid is False


def test_case_validator(conn_service):
    """Verify input validation for cross-case bridge queries."""
    graph = conn_service.graph

    # Valid cases
    valid, err = ConnectionValidator.validate_case_pair(graph, "FIR001", "FIR007")
    assert valid is True
    assert err is None

    # Non-existent case
    valid, err = ConnectionValidator.validate_case_pair(graph, "FIR999", "FIR007")
    assert valid is False
    assert "does not exist" in err

    # Non-case node type
    valid, err = ConnectionValidator.validate_case_pair(graph, "P001", "FIR007")
    assert valid is False
    assert "expected 'CASE'" in err

    # Self case
    valid, err = ConnectionValidator.validate_case_pair(graph, "FIR001", "FIR001")
    assert valid is False
    assert "identical case" in err


def test_find_shortest_connection_success(conn_service):
    """Verify BFS shortest path discovery between known connected entities."""
    # Test P001 to P004 inside Community A
    resp = conn_service.find_shortest_connection("P001", "P004")
    assert resp.connection_found is True
    assert resp.hops is not None
    assert resp.hops >= 1
    assert resp.path[0] == "P001"
    assert resp.path[-1] == "P004"
    assert resp.score is not None
    assert resp.score > 0
    assert len(resp.reasoning) == resp.hops


def test_shared_phone_connection(conn_service):
    """Verify path between suspects P005 and P018 via shared phone PH005."""
    resp = conn_service.find_connection("P005", "P018")
    assert resp.connection_found is True
    # In Pattern 2: P005 - USES -> PH005 <- USES - P018
    assert "PH005" in resp.path
    assert resp.hops == 2


def test_find_connection_defensive_never_crashes(conn_service):
    """Verify that querying nonexistent or invalid entities returns structured failure without crashing."""
    resp = conn_service.find_connection("UNKNOWN_SRC", "UNKNOWN_TGT")
    assert isinstance(resp, ConnectionResponse)
    assert resp.connection_found is False
    assert resp.reason is not None
    assert "does not exist" in resp.reason


def test_find_multiple_connections_ranking(conn_service):
    """Verify multiple path discovery and top-k score descending ranking."""
    resp = conn_service.find_multiple_connections("P001", "P020", top_k=5, max_depth=6)
    assert resp.connection_found is True
    assert len(resp.paths) > 0
    assert len(resp.paths) <= 5

    # Check descending order of scores
    scores = [p.score for p in resp.paths]
    assert scores == sorted(scores, reverse=True)


def test_path_scoring_logic(conn_service):
    """Verify that path scoring properly evaluates length and broker participation."""
    scorer = PathScorer(conn_service.graph)

    # 2-hop path should score higher than 5-hop path
    p2 = ["P001", "PH001", "P002"]
    steps_2, _, _ = PathExplainer(conn_service.graph).explain_path(p2)
    score_2 = scorer.compute_score(p2, steps_2)

    p5 = ["P001", "PH001", "P006", "VEH002", "LOC006", "P020"]
    steps_5, _, _ = PathExplainer(conn_service.graph).explain_path(p5)
    score_5 = scorer.compute_score(p5, steps_5)

    assert score_2 >= score_5


def test_path_explanation_translation(conn_service):
    """Verify that path explainer generates grammatically coherent natural language reasoning."""
    explainer = PathExplainer(conn_service.graph)
    path = ["P001", "PH001", "P006"]
    steps, reasoning, summary = explainer.explain_path(path)

    assert len(steps) == 2
    assert len(reasoning) == 2
    assert "uses" in reasoning[0] or "is used by" in reasoning[0]
    assert "P001" in summary and "P006" in summary


def test_cross_case_bridge_discovery(conn_service):
    """Verify Case-to-Case connection finder connects FIR001 and FIR007 via cross-case bridge."""
    case_resp = conn_service.find_case_connection("FIR001", "FIR007")
    assert isinstance(case_resp, CaseConnectionResponse)
    assert case_resp.connected is True
    assert case_resp.hops is not None
    assert len(case_resp.bridge_entities) > 0
    assert case_resp.path[0] == "FIR001"
    assert case_resp.path[-1] == "FIR007"


def test_hidden_broker_verification(conn_service):
    """Verify that verify_hidden_broker confirms P017 bridges Community A and Community B."""
    report = conn_service.verify_hidden_broker("P017")
    assert isinstance(report, BrokerVerificationReport)
    assert report.broker == "P017"
    assert report.broker_detected is True
    assert report.communities_connected == 2
    assert len(report.sample_paths) > 0
    assert report.details.get("verification_status") == "VERIFIED"


def test_visualization_graph_payload(conn_service):
    """Verify that get_visualization_data generates valid node-link payload for UI."""
    resp = conn_service.find_connection("P001", "P004")
    assert resp.connection_found is True
    assert resp.paths

    vis_data = conn_service.get_visualization_data(resp.paths[0])
    assert "nodes" in vis_data
    assert "edges" in vis_data
    assert len(vis_data["nodes"]) == len(resp.path)
    assert len(vis_data["edges"]) == resp.hops

    for node in vis_data["nodes"]:
        assert "id" in node
        assert "label" in node
        assert "type" in node

    for edge in vis_data["edges"]:
        assert "id" in edge
        assert "source" in edge
        assert "target" in edge
        assert "type" in edge


def test_arbitrary_node_types_connectivity(conn_service):
    """Verify connection finding works across arbitrary entity types (Person -> Vehicle, Org -> Location, etc.)."""
    # Person to Account
    resp1 = conn_service.find_connection("P001", "ACC001")
    assert resp1.connection_found is True

    # Vehicle to Location
    resp2 = conn_service.find_connection("VEH003", "LOC003")
    assert resp2.connection_found is True

    # Organization to Person
    resp3 = conn_service.find_connection("ORG001", "P001")
    assert resp3.connection_found is True


def test_caching_behavior(conn_service):
    """Verify that repeated shortest connection queries return cached results."""
    resp_initial = conn_service.find_shortest_connection("P001", "P002")
    resp_cached = conn_service.find_shortest_connection("P001", "P002")
    assert resp_initial is resp_cached
