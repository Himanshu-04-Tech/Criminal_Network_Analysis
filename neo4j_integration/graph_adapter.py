"""Graph Adapter converting persistent Neo4j graph data into in-memory NetworkX MultiDiGraphs."""

from __future__ import annotations
from typing import Any, Dict, List, Optional, Set
import networkx as nx
from neo4j import Session

from neo4j_integration.config import Neo4jConfig, get_neo4j_config
from neo4j_integration.driver import get_session
from neo4j_integration.repository import GraphRepository

# Base keys that should not be placed into nested node attributes dictionary
NODE_BASE_KEYS: Set[str] = {"id", "name", "type", "created_at", "labels", "primary_label"}
EDGE_BASE_KEYS: Set[str] = {
    "relationship_id",
    "relationship_type",
    "case_id",
    "timestamp",
    "confidence",
    "status",
    "evidence_id",
    "source",
    "target",
}


class GraphAdapter:
    """
    Transforms persistent Neo4j graph nodes and relationships into an in-memory
    networkx.MultiDiGraph matching exact metadata specifications required by
    Modules 2 through 8.
    """

    def __init__(
        self,
        config: Optional[Neo4jConfig] = None,
        repository: Optional[GraphRepository] = None,
    ):
        self.config = config or get_neo4j_config()
        self.repository = repository or GraphRepository(self.config)

    def to_networkx(
        self,
        case_ids: Optional[List[str]] = None,
        include_cases: bool = True,
    ) -> nx.MultiDiGraph:
        """
        Construct a NetworkX MultiDiGraph from Neo4j data.
        If case_ids is specified, filters relationships to those FIR cases.
        """
        graph = nx.MultiDiGraph()

        with get_session(database=self.config.database) as session:
            # 1. Fetch Nodes: All Entities and optionally Cases
            node_label_filter = "n:Entity OR n:Case" if include_cases else "n:Entity"
            node_query = f"""
            MATCH (n)
            WHERE {node_label_filter}
            RETURN properties(n) AS n_props, labels(n) AS labels
            ORDER BY n.id ASC
            """
            node_records = session.run(node_query).data()

            for rec in node_records:
                n_props = dict(rec["n_props"]) if isinstance(rec["n_props"], dict) else {}
                node_id = n_props.get("id")
                if not node_id:
                    continue

                node_type = n_props.get("type", "UNKNOWN")
                node_name = n_props.get("name", node_id)
                created_at = n_props.get("created_at", "")

                # Separate domain-specific attributes
                custom_attrs = {
                    k: v for k, v in n_props.items()
                    if k not in NODE_BASE_KEYS and v is not None
                }

                node_payload = {
                    "id": node_id,
                    "type": node_type,
                    "name": node_name,
                    "created_at": created_at,
                    "attributes": custom_attrs,
                    **custom_attrs,  # Flatten for direct attribute access
                }
                graph.add_node(node_id, **node_payload)

            # 2. Fetch Directed Relationships
            if case_ids:
                rel_query = """
                MATCH (s)-[r]->(t)
                WHERE (s:Entity OR s:Case) AND (t:Entity OR t:Case)
                  AND r.case_id IN $case_ids
                RETURN s.id AS source, t.id AS target, type(r) AS rel_type, properties(r) AS r_props
                ORDER BY r.timestamp ASC
                """
                rel_records = session.run(rel_query, case_ids=case_ids).data()
            else:
                rel_query = """
                MATCH (s)-[r]->(t)
                WHERE (s:Entity OR s:Case) AND (t:Entity OR t:Case)
                RETURN s.id AS source, t.id AS target, type(r) AS rel_type, properties(r) AS r_props
                ORDER BY r.timestamp ASC
                """
                rel_records = session.run(rel_query).data()

            for rec in rel_records:
                source = rec["source"]
                target = rec["target"]
                rel_type = rec["rel_type"]
                raw_props = rec.get("r_props", {})
                r_props = dict(raw_props) if isinstance(raw_props, dict) else {}

                rel_id = r_props.get("relationship_id") or r_props.get("id") or f"{source}_{rel_type}_{target}"
                case_id = r_props.get("case_id", "")
                timestamp = r_props.get("timestamp", "")
                confidence = float(r_props.get("confidence", 1.0))
                status = r_props.get("status", "SOURCE_SUPPORTED")
                evidence_id = r_props.get("evidence_id", "")

                custom_edge_attrs = {
                    k: v for k, v in r_props.items()
                    if k not in EDGE_BASE_KEYS and v is not None
                }

                edge_payload = {
                    "relationship_id": rel_id,
                    "relationship_type": rel_type,
                    "case_id": case_id,
                    "timestamp": timestamp,
                    "confidence": confidence,
                    "status": status,
                    "evidence_id": evidence_id,
                    "attributes": custom_edge_attrs,
                    **custom_edge_attrs,
                }

                # Key MultiDiGraph edge by unique relationship_id
                graph.add_edge(source, target, key=rel_id, **edge_payload)

        return graph

    def to_subgraph_networkx(self, entity_id: str, depth: int = 1) -> nx.MultiDiGraph:
        """
        Extract ego-network subgraph around entity_id up to depth hops
        and return as NetworkX MultiDiGraph.
        """
        subgraph_data = self.repository.get_subgraph(entity_id=entity_id, depth=depth)
        graph = nx.MultiDiGraph()

        for n_props in subgraph_data.get("nodes", []):
            node_id = n_props.get("id")
            if not node_id:
                continue
            custom_attrs = {
                k: v for k, v in n_props.items()
                if k not in NODE_BASE_KEYS and v is not None
            }
            node_payload = {
                "id": node_id,
                "type": n_props.get("type", "UNKNOWN"),
                "name": n_props.get("name", node_id),
                "created_at": n_props.get("created_at", ""),
                "attributes": custom_attrs,
                **custom_attrs,
            }
            graph.add_node(node_id, **node_payload)

        for r_props in subgraph_data.get("relationships", []):
            source = r_props.get("source")
            target = r_props.get("target")
            rel_type = r_props.get("relationship_type", "RELATED_TO")
            rel_id = r_props.get("relationship_id", f"{source}_{rel_type}_{target}")

            custom_edge_attrs = {
                k: v for k, v in r_props.items()
                if k not in EDGE_BASE_KEYS and v is not None
            }
            edge_payload = {
                "relationship_id": rel_id,
                "relationship_type": rel_type,
                "case_id": r_props.get("case_id", ""),
                "timestamp": r_props.get("timestamp", ""),
                "confidence": float(r_props.get("confidence", 1.0)),
                "status": r_props.get("status", "SOURCE_SUPPORTED"),
                "evidence_id": r_props.get("evidence_id", ""),
                "attributes": custom_edge_attrs,
                **custom_edge_attrs,
            }
            graph.add_edge(source, target, key=rel_id, **edge_payload)

        return graph
