"""Data access repository for querying graph data from persistent Neo4j store."""

from __future__ import annotations
from typing import Any, Dict, List, Optional
from neo4j import Session

from neo4j_integration.config import Neo4jConfig, get_neo4j_config
from neo4j_integration.driver import get_driver, get_session
from neo4j_integration.models import Neo4jLabel, ENTITY_TYPE_TO_LABEL


class GraphRepository:
    """
    High-level query interface providing strongly typed graph lookups,
    subgraph extraction, and analytical aggregations directly against Neo4j.
    """

    def __init__(self, config: Optional[Neo4jConfig] = None):
        self.config = config or get_neo4j_config()

    def _clean_node_record(self, record_node: Any, labels: Optional[List[str]] = None) -> Dict[str, Any]:
        """Format a Neo4j Node object into a standardized dictionary."""
        if isinstance(record_node, dict):
            props = dict(record_node)
        elif hasattr(record_node, "items"):
            props = dict(record_node.items())
        else:
            try:
                props = dict(record_node)
            except Exception:
                props = {}

        node_labels = list(labels) if labels is not None else list(getattr(record_node, "labels", []))
        primary_label = next((l for l in node_labels if l != "Entity"), node_labels[0] if node_labels else "Node")
        props["labels"] = node_labels
        props["primary_label"] = primary_label
        if "id" not in props and hasattr(record_node, "id"):
            props["id"] = str(record_node.id)
        if "type" not in props:
            props["type"] = primary_label.upper()
        return props

    def _clean_rel_record(self, rel: Any, source: str, target: str, rel_type: Optional[str] = None) -> Dict[str, Any]:
        """Format a Neo4j Relationship object into a standardized dictionary."""
        if isinstance(rel, dict):
            props = dict(rel)
        elif isinstance(rel, tuple):
            # In neo4j Result.data(), relationship is serialized as (start_node, type, properties)
            props = dict(rel[2]) if len(rel) > 2 and isinstance(rel[2], dict) else {}
            if not rel_type and len(rel) > 1:
                rel_type = str(rel[1])
        elif hasattr(rel, "items"):
            props = dict(rel.items())
        else:
            try:
                props = dict(rel)
            except Exception:
                props = {}

        props["source"] = source
        props["target"] = target
        props["relationship_type"] = rel_type or getattr(rel, "type", props.get("relationship_type", "RELATED_TO"))
        return props

    def get_entity(self, entity_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve single entity by unique ID."""
        query = """
        MATCH (n {id: $entity_id})
        RETURN n, labels(n) AS labels
        LIMIT 1
        """
        with get_session(database=self.config.database) as session:
            record = session.run(query, entity_id=entity_id).single()
            if not record:
                return None
            return self._clean_node_record(record["n"], record["labels"])

    def get_entities_by_type(self, entity_type: str) -> List[Dict[str, Any]]:
        """Retrieve all entities matching given entity type (case-insensitive) or label."""
        norm_type = entity_type.strip().upper()
        label = ENTITY_TYPE_TO_LABEL.get(norm_type, None)
        label_val = label.value if label else entity_type.strip()

        query = """
        MATCH (n)
        WHERE $label_val IN labels(n) OR toUpper(n.type) = $norm_type
        RETURN n, labels(n) AS labels
        ORDER BY n.id ASC
        """
        with get_session(database=self.config.database) as session:
            results = session.run(query, label_val=label_val, norm_type=norm_type)
            return [self._clean_node_record(r["n"], r["labels"]) for r in results]

    def get_neighbors(self, entity_id: str, direction: str = "both") -> List[Dict[str, Any]]:
        """
        Retrieve neighbor nodes connected to entity_id.
        direction: 'in', 'out', or 'both'.
        """
        dir_clause = (
            "<-[r]-" if direction == "in"
            else "-[r]->" if direction == "out"
            else "-[r]-"
        )
        query = f"""
        MATCH (root {{id: $entity_id}}){dir_clause}(neighbor)
        RETURN DISTINCT neighbor, labels(neighbor) AS labels
        ORDER BY neighbor.id ASC
        """
        with get_session(database=self.config.database) as session:
            results = session.run(query, entity_id=entity_id)
            return [self._clean_node_record(r["neighbor"], r["labels"]) for r in results]

    def get_entity_relationships(self, entity_id: str, direction: str = "both") -> List[Dict[str, Any]]:
        """
        Retrieve all relationships incident to entity_id.
        direction: 'in', 'out', or 'both'.
        """
        pattern = (
            "(s)-[r]->(t {id: $entity_id})" if direction == "in"
            else "(s {id: $entity_id})-[r]->(t)" if direction == "out"
            else "(s)-[r]-(t) WHERE s.id = $entity_id OR t.id = $entity_id"
        )
        if direction in ("in", "out"):
            query = f"""
            MATCH {pattern}
            RETURN r, s.id AS source, t.id AS target, type(r) AS rel_type
            ORDER BY r.timestamp ASC
            """
        else:
            query = f"""
            MATCH (s)-[r]->(t)
            WHERE s.id = $entity_id OR t.id = $entity_id
            RETURN r, s.id AS source, t.id AS target, type(r) AS rel_type
            ORDER BY r.timestamp ASC
            """
        with get_session(database=self.config.database) as session:
            results = session.run(query, entity_id=entity_id)
            return [
                self._clean_rel_record(r["r"], r["source"], r["target"], r["rel_type"])
                for r in results
            ]

    def get_case_entities(self, case_id: str) -> List[Dict[str, Any]]:
        """Retrieve all unique entities participating in relationships of given FIR case."""
        query = """
        MATCH (s)-[r {case_id: $case_id}]->(t)
        WITH collect(DISTINCT s) + collect(DISTINCT t) AS all_nodes
        UNWIND all_nodes AS n
        WITH DISTINCT n
        RETURN n, labels(n) AS labels
        ORDER BY n.id ASC
        """
        with get_session(database=self.config.database) as session:
            results = session.run(query, case_id=case_id)
            return [self._clean_node_record(r["n"], r["labels"]) for r in results]

    def get_case_relationships(self, case_id: str) -> List[Dict[str, Any]]:
        """Retrieve all relationships belonging to given FIR case."""
        query = """
        MATCH (s)-[r {case_id: $case_id}]->(t)
        RETURN r, s.id AS source, t.id AS target, type(r) AS rel_type
        ORDER BY r.timestamp ASC
        """
        with get_session(database=self.config.database) as session:
            results = session.run(query, case_id=case_id)
            return [
                self._clean_rel_record(r["r"], r["source"], r["target"], r["rel_type"])
                for r in results
            ]

    def get_evidence(self, evidence_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve single evidence record by ID."""
        query = """
        MATCH (e:Evidence {id: $evidence_id})
        RETURN e
        LIMIT 1
        """
        with get_session(database=self.config.database) as session:
            record = session.run(query, evidence_id=evidence_id).single()
            if not record:
                return None
            return dict(record["e"])

    def get_entities_for_cases(self, case_ids: List[str]) -> List[Dict[str, Any]]:
        """Retrieve all unique entities across a list of FIR cases."""
        query = """
        MATCH (s)-[r]->(t)
        WHERE r.case_id IN $case_ids
        WITH collect(DISTINCT s) + collect(DISTINCT t) AS all_nodes
        UNWIND all_nodes AS n
        WITH DISTINCT n
        RETURN n, labels(n) AS labels
        ORDER BY n.id ASC
        """
        with get_session(database=self.config.database) as session:
            results = session.run(query, case_ids=case_ids)
            return [self._clean_node_record(r["n"], r["labels"]) for r in results]

    def get_subgraph(self, entity_id: str, depth: int = 1) -> Dict[str, Any]:
        """
        Extract subgraph centered at entity_id up to depth hops.
        Returns {'nodes': [...], 'relationships': [...]}.
        """
        depth = max(1, min(depth, 5))
        query = f"""
        MATCH path = (root {{id: $entity_id}})-[*1..{depth}]-(other)
        WITH collect(path) AS paths
        UNWIND paths AS p
        UNWIND nodes(p) AS n
        WITH DISTINCT n, paths
        WITH collect(n) AS distinct_nodes, paths
        UNWIND paths AS p
        UNWIND relationships(p) AS r
        WITH distinct_nodes, collect(DISTINCT r) AS distinct_rels
        RETURN distinct_nodes, distinct_rels
        """
        with get_session(database=self.config.database) as session:
            res = session.run(query, entity_id=entity_id).single()
            if not res:
                root_entity = self.get_entity(entity_id)
                nodes = [root_entity] if root_entity else []
                return {"nodes": nodes, "relationships": []}

            nodes = [self._clean_node_record(n) for n in res["distinct_nodes"]]
            rels = []
            for r in res["distinct_rels"]:
                # Lookup endpoints
                s_id = r.start_node.get("id") if hasattr(r, "start_node") else r.nodes[0].get("id")
                t_id = r.end_node.get("id") if hasattr(r, "end_node") else r.nodes[1].get("id")
                rels.append(self._clean_rel_record(r, s_id, t_id))

            return {"nodes": nodes, "relationships": rels}

    def get_graph_statistics(self) -> Dict[str, Any]:
        """Compute summary statistics directly from Neo4j."""
        query = """
        CALL () {
            MATCH (n:Person) RETURN 'persons' AS key, count(n) AS count
            UNION ALL
            MATCH (n:Phone) RETURN 'phones' AS key, count(n) AS count
            UNION ALL
            MATCH (n:Account) RETURN 'accounts' AS key, count(n) AS count
            UNION ALL
            MATCH (n:Vehicle) RETURN 'vehicles' AS key, count(n) AS count
            UNION ALL
            MATCH (n:Location) RETURN 'locations' AS key, count(n) AS count
            UNION ALL
            MATCH (n:Organization) RETURN 'organizations' AS key, count(n) AS count
            UNION ALL
            MATCH (n:Case) RETURN 'cases' AS key, count(n) AS count
            UNION ALL
            MATCH (n:Evidence) RETURN 'evidence' AS key, count(n) AS count
        }
        RETURN key, count
        """
        rel_type_query = """
        MATCH ()-[r]->()
        RETURN type(r) AS rel_type, count(r) AS count
        ORDER BY count DESC
        """
        with get_session(database=self.config.database) as session:
            node_counts = {r["key"]: r["count"] for r in session.run(query).data()}
            rel_counts = {r["rel_type"]: r["count"] for r in session.run(rel_type_query).data()}
            total_rels = sum(rel_counts.values())
            total_graph_nodes = sum(
                node_counts.get(k, 0)
                for k in ["persons", "phones", "accounts", "vehicles", "locations", "organizations", "cases"]
            )

            return {
                "node_counts": node_counts,
                "relationship_counts": rel_counts,
                "total_graph_nodes": total_graph_nodes,
                "total_relationships": total_rels,
                "total_evidence": node_counts.get("evidence", 0),
            }
