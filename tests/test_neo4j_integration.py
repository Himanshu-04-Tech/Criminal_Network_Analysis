"""Comprehensive test suite for Neo4j integration, schema, importer, repository, adapter, and Modules 3-8 compatibility."""

from __future__ import annotations
import sys
from pathlib import Path
import pytest
import networkx as nx

root_dir = Path(__file__).resolve().parent.parent
nexus_bharat = root_dir / "nexus-bharat"
if str(nexus_bharat) not in sys.path:
    sys.path.insert(0, str(nexus_bharat))
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from neo4j_integration.config import Neo4jConfig, get_neo4j_config
from neo4j_integration.driver import (
    get_driver,
    get_session,
    verify_connectivity,
    close_driver,
)
from neo4j_integration.models import (
    Neo4jLabel,
    Neo4jNodeRecord,
    Neo4jRelationshipRecord,
    Neo4jCaseRecord,
    Neo4jEvidenceRecord,
    ENTITY_TYPE_TO_LABEL,
)
from neo4j_integration.constraints import setup_schema, verify_schema
from neo4j_integration.importer import Neo4jDatasetImporter, EXPECTED_COUNTS
from neo4j_integration.repository import GraphRepository
from neo4j_integration.graph_adapter import GraphAdapter
from graph_engine.graph_service import KnowledgeGraphService


@pytest.fixture(scope="session")
def neo4j_config() -> Neo4jConfig:
    return get_neo4j_config()


@pytest.fixture(scope="session")
def is_neo4j_online(neo4j_config: Neo4jConfig) -> bool:
    connected, _ = verify_connectivity(neo4j_config)
    return connected


@pytest.fixture(scope="session")
def populated_neo4j(is_neo4j_online: bool, neo4j_config: Neo4jConfig):
    """Fixture ensuring Neo4j is populated if online."""
    if not is_neo4j_online:
        pytest.skip("Neo4j database is offline or not configured with valid credentials.")
    importer = Neo4jDatasetImporter(config=neo4j_config)
    audit = importer.run_import()
    assert audit["passed"] is True
    return audit


@pytest.fixture
def analytics_graph(is_neo4j_online: bool, neo4j_config: Neo4jConfig) -> nx.MultiDiGraph:
    """Fixture returning graph for analytics: from Neo4j if online, else from KnowledgeGraphService."""
    if is_neo4j_online:
        adapter = GraphAdapter(neo4j_config)
        return adapter.to_networkx()
    service = KnowledgeGraphService.get_instance(use_neo4j=False)
    return service.get_graph()


# ============================================================
# 1. Config & Security Tests
# ============================================================

def test_neo4j_config_security(monkeypatch):
    """Test that passwords are never leaked in string representations."""
    test_cfg = Neo4jConfig(
        uri="neo4j://127.0.0.1:7687",
        username="neo4j",
        password="super_secret_password_123",
        database="nexus_bharat",
    )
    repr_str = repr(test_cfg)
    str_str = str(test_cfg)

    assert "super_secret_password_123" not in repr_str
    assert "super_secret_password_123" not in str_str
    assert "***" in repr_str
    assert test_cfg.is_configured() is True


def test_neo4j_models_schema():
    """Test data model mapping and properties serialization."""
    case = Neo4jCaseRecord(
        id="FIR001",
        title="Test Case",
        status="OPEN",
        created_at="2026-06-15T09:30:00Z",
    )
    props = case.to_properties()
    assert props["id"] == "FIR001"
    assert props["type"] == "CASE"

    ev = Neo4jEvidenceRecord(
        id="E001",
        case_id="FIR001",
        source_file="cdr_test.csv",
        timestamp="2026-06-18T10:00:00Z",
        confidence=1.0,
    )
    ev_props = ev.to_properties()
    assert ev_props["id"] == "E001"
    assert ev_props["case_id"] == "FIR001"

    rel = Neo4jRelationshipRecord(
        relationship_id="R001",
        source="P001",
        target="PH001",
        relationship_type="USES",
        case_id="FIR001",
        timestamp="2026-06-18T10:00:00Z",
        confidence=1.0,
        status="SOURCE_SUPPORTED",
        evidence_id="E001",
    )
    r_props = rel.to_properties()
    assert r_props["relationship_id"] == "R001"
    assert r_props["status"] == "SOURCE_SUPPORTED"


# ============================================================
# 2. Dataset Reading & Expected Metrics
# ============================================================

def test_importer_dataset_counts():
    """Test that canonical JSON files contain expected benchmark counts."""
    importer = Neo4jDatasetImporter()
    raw = importer.load_json_files()

    assert len(raw["cases"]) == 10
    assert len(raw["evidence"]) == 225
    assert len(raw["entities"]) == 126
    assert len(raw["relationships"]) == 225

    # Entity types breakdown
    type_counts = {}
    for ent in raw["entities"]:
        t = ent["type"]
        type_counts[t] = type_counts.get(t, 0) + 1

    assert type_counts["PERSON"] == 35
    assert type_counts["PHONE"] == 45
    assert type_counts["ACCOUNT"] == 20
    assert type_counts["VEHICLE"] == 10
    assert type_counts["LOCATION"] == 10
    assert type_counts["ORGANIZATION"] == 6


# ============================================================
# 3. Live Neo4j Connectivity & Schema
# ============================================================

def test_neo4j_connection(is_neo4j_online, neo4j_config):
    if not is_neo4j_online:
        pytest.skip("Neo4j database is offline.")
    connected, msg = verify_connectivity(neo4j_config)
    assert connected is True, msg


def test_schema_constraints_and_indexes(is_neo4j_online, neo4j_config):
    if not is_neo4j_online:
        pytest.skip("Neo4j database is offline.")
    with get_session(database=neo4j_config.database) as session:
        schema = setup_schema(session)
        assert len(schema["constraints"]) >= 7
        audit = verify_schema(session)
        assert audit["constraints_count"] >= 7


# ============================================================
# 4. Idempotent Import & Integrity Checks
# ============================================================

def test_importer_idempotency_and_counts(populated_neo4j, neo4j_config):
    """Test importing twice does not produce duplicates."""
    importer = Neo4jDatasetImporter(config=neo4j_config)
    # Run second time
    audit = importer.run_import()
    assert audit["passed"] is True

    counts = audit["counts"]
    assert counts["persons"] == 35
    assert counts["phones"] == 45
    assert counts["accounts"] == 20
    assert counts["vehicles"] == 10
    assert counts["locations"] == 10
    assert counts["organizations"] == 6
    assert counts["cases"] == 10
    assert counts["total_graph_nodes"] == 136
    assert counts["relationships"] == 225
    assert counts["evidence"] == 225
    assert audit["dangling_relationships"] == 0
    assert audit["unlinked_evidence"] == 0


# ============================================================
# 5. Graph Repository Queries
# ============================================================

def test_repository_entity_lookup(is_neo4j_online, neo4j_config):
    if not is_neo4j_online:
        pytest.skip("Neo4j database is offline.")
    repo = GraphRepository(neo4j_config)

    # Test hidden broker P017
    broker = repo.get_entity("P017")
    assert broker is not None
    assert broker["id"] == "P017"
    assert broker["name"] == "Anand Deshmukh"
    assert broker["type"] == "PERSON"

    # Test shared phone PH005
    phone = repo.get_entity("PH005")
    assert phone is not None
    assert phone["id"] == "PH005"

    # Non-existent
    missing = repo.get_entity("NON_EXISTENT_ID")
    assert missing is None


def test_repository_entities_by_type(is_neo4j_online, neo4j_config):
    if not is_neo4j_online:
        pytest.skip("Neo4j database is offline.")
    repo = GraphRepository(neo4j_config)

    persons = repo.get_entities_by_type("PERSON")
    assert len(persons) == 35

    phones = repo.get_entities_by_type("PHONE")
    assert len(phones) == 45

    cases = repo.get_entities_by_type("CASE")
    assert len(cases) == 10


def test_repository_neighbors(is_neo4j_online, neo4j_config):
    if not is_neo4j_online:
        pytest.skip("Neo4j database is offline.")
    repo = GraphRepository(neo4j_config)

    neighbors = repo.get_neighbors("P017", direction="both")
    assert len(neighbors) >= 3

    rels = repo.get_entity_relationships("P017", direction="both")
    assert len(rels) >= 3
    for r in rels:
        assert "evidence_id" in r
        assert "case_id" in r


def test_repository_case_queries(is_neo4j_online, neo4j_config):
    if not is_neo4j_online:
        pytest.skip("Neo4j database is offline.")
    repo = GraphRepository(neo4j_config)

    entities = repo.get_case_entities("FIR001")
    assert len(entities) > 0

    rels = repo.get_case_relationships("FIR001")
    assert len(rels) > 0
    for r in rels:
        assert r["case_id"] == "FIR001"


def test_repository_evidence_query(is_neo4j_online, neo4j_config):
    if not is_neo4j_online:
        pytest.skip("Neo4j database is offline.")
    repo = GraphRepository(neo4j_config)

    ev = repo.get_evidence("E001")
    assert ev is not None
    assert ev["id"] == "E001"
    assert ev["case_id"] == "FIR001"
    assert "source_file" in ev


def test_repository_subgraph(is_neo4j_online, neo4j_config):
    if not is_neo4j_online:
        pytest.skip("Neo4j database is offline.")
    repo = GraphRepository(neo4j_config)

    subgraph = repo.get_subgraph("P017", depth=1)
    assert len(subgraph["nodes"]) >= 3
    assert len(subgraph["relationships"]) >= 3


def test_repository_statistics(is_neo4j_online, neo4j_config):
    if not is_neo4j_online:
        pytest.skip("Neo4j database is offline.")
    repo = GraphRepository(neo4j_config)

    stats = repo.get_graph_statistics()
    assert stats["total_graph_nodes"] == 136
    assert stats["total_relationships"] == 225
    assert stats["total_evidence"] == 225


# ============================================================
# 6. NetworkX Adapter Tests
# ============================================================

def test_graph_adapter_full_conversion(is_neo4j_online, neo4j_config):
    if not is_neo4j_online:
        pytest.skip("Neo4j database is offline.")
    adapter = GraphAdapter(neo4j_config)
    graph = adapter.to_networkx()

    assert isinstance(graph, nx.MultiDiGraph)
    assert len(graph.nodes) == 136
    assert len(graph.edges) == 225

    # Check node attributes
    broker_node = graph.nodes["P017"]
    assert broker_node["name"] == "Anand Deshmukh"
    assert broker_node["type"] == "PERSON"
    assert "attributes" in broker_node

    # Check edge attributes
    for u, v, key, data in graph.edges(keys=True, data=True):
        assert "relationship_id" in data
        assert "relationship_type" in data
        assert "case_id" in data
        assert "timestamp" in data
        assert "evidence_id" in data
        assert "status" in data


# ============================================================
# 7. Downstream Module Compatibility (Modules 3-8)
# ============================================================

def test_module_3_compatibility(analytics_graph):
    """Test Module 3 (Hidden Connection Finder) over the graph."""
    from graph_analytics.path_finder import PathFinder

    finder = PathFinder(analytics_graph)
    # Check shortest path between P001 and P003 (Community A members)
    result = finder.find_shortest_connection("P001", "P003")
    assert result is not None
    assert len(result.path) >= 2
    assert result.hops >= 1

    # Multiple connections
    multi = finder.find_multiple_connections("P001", "P003", top_k=3)
    assert len(multi) >= 1


def test_module_4_compatibility(analytics_graph):
    """Test Module 4 (Network Role Intelligence) over the graph."""
    from role_intelligence.role_service import RoleService

    service = RoleService(analytics_graph)
    top_brokers = service.get_top_brokers(limit=5)
    assert len(top_brokers) > 0

    # Broker verification
    broker_profile = service.get_entity_role("P017")
    assert broker_profile is not None


def test_module_5_compatibility(analytics_graph):
    """Test Module 5 (Cross-Case Intelligence) over the graph."""
    from cross_case_intelligence.intelligence_service import CrossCaseIntelligenceService

    service = CrossCaseIntelligenceService.get_instance()
    comp = service.compare_cases("FIR001", "FIR002")
    assert comp is not None
    assert hasattr(comp, "shared_entities")
    assert hasattr(comp, "bridge_entities")
    assert hasattr(comp, "similarity_score")


def test_module_6_compatibility(analytics_graph):
    """Test Module 6 (Case Fusion) over the graph."""
    from case_fusion.fusion_builder import FusionBuilder

    builder = FusionBuilder()
    # Build fusion graph for FIR001 and FIR002
    fusion_graph = builder.build_fusion_graph(fusion_id="FUS_TEST", case_ids=["FIR001", "FIR002"])
    assert fusion_graph is not None
    assert len(fusion_graph.graph.nodes) > 0


def test_module_7_compatibility(analytics_graph):
    """Test Module 7 (Temporal Intelligence) over the graph."""
    from temporal_intelligence.temporal_graph import TemporalGraphBuilder

    temporal_builder = TemporalGraphBuilder()
    snapshot = temporal_builder.build_snapshot(
        start_date="2026-06-01T00:00:00Z",
        end_date="2026-07-01T00:00:00Z",
    )
    assert isinstance(snapshot, nx.MultiDiGraph)
    assert len(snapshot.nodes) > 0


def test_module_8_compatibility(analytics_graph):
    """Test Module 8 (Graph Diff) over the graph."""
    from graph_diff.snapshot_loader import SnapshotLoader
    from graph_diff.graph_comparator import GraphComparator

    loader = SnapshotLoader()
    snap_a, snap_b = loader.load_canonical_snapshots()
    comparator = GraphComparator()
    diff = comparator.compare_snapshots(snap_a, snap_b)
    assert diff is not None
    assert hasattr(diff, "entity_diff")
    assert hasattr(diff, "relationship_diff")
