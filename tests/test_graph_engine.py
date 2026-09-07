"""Comprehensive unit and integration test suite for NEXUS-Bharat Knowledge Graph Engine (Module 2)."""

import sys
from pathlib import Path
import pytest
import networkx as nx

root_dir = Path(__file__).resolve().parent.parent
nexus_bharat = root_dir / "nexus-bharat"
if str(nexus_bharat) not in sys.path:
    sys.path.insert(0, str(nexus_bharat))

from graph_engine.models import (
    NodeType,
    EdgeType,
    NodeModel,
    EdgeModel,
    KnowledgeGraphValidationError,
)
from graph_engine.graph_loader import DatasetLoader
from graph_engine.graph_validator import GraphValidator
from graph_engine.graph_builder import KnowledgeGraphBuilder
from graph_engine.graph_queries import GraphQueryEngine
from graph_engine.graph_statistics import GraphStatisticsCalculator
from graph_engine.graph_service import KnowledgeGraphService


@pytest.fixture
def graph_service():
    """Fixture providing initialized KnowledgeGraphService."""
    KnowledgeGraphService.reset_instance()
    service = KnowledgeGraphService.get_instance()
    service.load_graph(force_reload=True)
    return service


def test_dataset_loader():
    """Test that DatasetLoader discovers and loads Module 1 dataset files."""
    loader = DatasetLoader()
    raw = loader.load_raw_data()
    assert "entities" in raw
    assert "cases" in raw
    assert "evidence" in raw
    assert "relationships" in raw
    assert len(raw["entities"]) == 126
    assert len(raw["cases"]) == 10
    assert len(raw["relationships"]) >= 180

    nodes, edges, evidence, cases = loader.load_models()
    # 126 entities + 10 cases = 136 nodes
    assert len(nodes) == 136
    assert len(cases) == 10
    assert len(evidence) >= 150
    assert len(edges) >= 180


def test_graph_builder_node_and_edge_counts(graph_service):
    """Test that KnowledgeGraphBuilder creates exactly 136 nodes and matching edges on MultiDiGraph."""
    graph = graph_service.get_graph()
    assert isinstance(graph, nx.MultiDiGraph)
    assert graph.number_of_nodes() == 136
    assert graph.number_of_edges() == 225


def test_node_attributes_never_discarded(graph_service):
    """Verify that domain attributes (IMEI, IFSC, vehicle reg, etc.) are fully preserved."""
    graph = graph_service.get_graph()

    # Person with attributes
    p1 = graph.nodes["P001"]
    assert p1["type"] == NodeType.PERSON.value
    assert p1["name"] == "Vikram Singhania"
    assert "attributes" in p1
    assert p1["attributes"].get("role") == "Community A Leader"

    # Phone with attributes
    ph1 = graph.nodes["PH001"]
    assert ph1["type"] == NodeType.PHONE.value
    assert "attributes" in ph1
    assert "phone_number" in ph1["attributes"]
    assert "imei" in ph1["attributes"]

    # Case node
    c1 = graph.nodes["FIR001"]
    assert c1["type"] == NodeType.CASE.value
    assert "status" in c1["attributes"]


def test_edge_attributes_preserved(graph_service):
    """Verify that all edge attributes (case_id, confidence, timestamp, evidence_id) are preserved."""
    graph = graph_service.get_graph()
    for u, v, key, data in graph.edges(keys=True, data=True):
        assert "relationship_id" in data
        assert "relationship_type" in data
        assert "case_id" in data
        assert "timestamp" in data
        assert "confidence" in data
        assert "evidence_id" in data


def test_validation_layer_catches_errors():
    """Verify that GraphValidator raises KnowledgeGraphValidationError when errors are injected."""
    # Test missing source node
    invalid_edge = EdgeModel(
        relationship_id="test-rel-err",
        source="NON_EXISTENT_NODE",
        target="P001",
        relationship_type=EdgeType.USES.value,
        case_id="FIR001",
        timestamp="2026-08-01T00:00:00Z",
        confidence=1.0,
        evidence_id="E001"
    )
    valid_node = NodeModel(id="P001", type=NodeType.PERSON.value, name="Test", created_at="2026-08-01T00:00:00Z")

    with pytest.raises(KnowledgeGraphValidationError) as excinfo:
        GraphValidator.validate_pre_construction(
            nodes=[valid_node],
            edges=[invalid_edge],
            evidence=[],
            cases=[]
        )
    assert "missing source Node" in str(excinfo.value.errors)


def test_query_node_methods(graph_service):
    """Test get_node and node_exists."""
    queries = graph_service.get_queries()
    assert queries.node_exists("P001") is True
    assert queries.node_exists("P999_NON_EXISTENT") is False

    node = queries.get_node("P017")
    assert node is not None
    assert node.id == "P017"
    assert node.name == "Anand Deshmukh"
    assert node.type == NodeType.PERSON.value


def test_query_neighbors(graph_service):
    """Test get_neighbors with out, in, and both directions."""
    queries = graph_service.get_queries()

    # P017 (Hidden Broker) neighbors
    neighbors_both = queries.get_neighbors("P017", direction="both")
    assert len(neighbors_both) > 0
    neighbor_ids = {n.id for n in neighbors_both}
    assert "PH016" in neighbor_ids or "ACC017" in neighbor_ids


def test_query_relationships(graph_service):
    """Test get_relationships."""
    queries = graph_service.get_queries()

    # PH005 is a shared phone with multiple edges
    rels = queries.get_relationships("PH005", direction="both")
    assert len(rels) >= 2
    sources = {r.source for r in rels}
    assert "P005" in sources
    assert "P018" in sources


def test_query_case_entities_and_relationships(graph_service):
    """Test get_case_entities and get_case_relationships."""
    queries = graph_service.get_queries()

    case_entities = queries.get_case_entities("FIR001")
    assert len(case_entities) > 0
    entity_ids = {e.id for e in case_entities}
    assert "P001" in entity_ids

    case_rels = queries.get_case_relationships("FIR001")
    assert len(case_rels) > 0
    for r in case_rels:
        assert r.case_id == "FIR001"


def test_query_by_type(graph_service):
    """Test get_entities_by_type and get_edges_by_type."""
    queries = graph_service.get_queries()

    persons = queries.get_entities_by_type("PERSON")
    assert len(persons) == 35

    phones = queries.get_entities_by_type("PHONE")
    assert len(phones) == 45

    accounts = queries.get_entities_by_type("ACCOUNT")
    assert len(accounts) == 20

    cases = queries.get_entities_by_type("CASE")
    assert len(cases) == 10

    contacted_edges = queries.get_edges_by_type("CONTACTED")
    assert len(contacted_edges) >= 30  # includes 32 burst calls

    transferred_edges = queries.get_edges_by_type("TRANSFERRED_TO")
    assert len(transferred_edges) >= 10


def test_graph_statistics(graph_service):
    """Test GraphStatisticsCalculator produces accurate metrics matching requirements."""
    stats = graph_service.get_statistics()
    assert stats.total_nodes == 136
    assert stats.total_edges == 225
    assert stats.persons == 35
    assert stats.phones == 45
    assert stats.accounts == 20
    assert stats.vehicles == 10
    assert stats.locations == 10
    assert stats.organizations == 6
    assert stats.cases == 10
    assert "CONTACTED" in stats.relationship_counts
    assert "USES" in stats.relationship_counts


def test_integrity_audit(graph_service):
    """Test GraphValidator.audit_graph produces valid audit report."""
    report = graph_service.get_integrity_report()
    assert report.is_valid is True
    assert len(report.invalid_edges) == 0
    assert len(report.disconnected_components) > 0


def test_graph_export(tmp_path, graph_service):
    """Test export_graphml, export_gexf, and export_json generate valid files."""
    exported = graph_service.export_all(export_dir=tmp_path)
    assert "graphml" in exported
    assert "gexf" in exported
    assert "json" in exported

    for fmt, fpath in exported.items():
        assert fpath.exists(), f"Export file {fpath} does not exist"
        assert fpath.stat().st_size > 1000, f"Export file {fpath} is suspiciously small"
