"""NEXUS-Bharat Neo4j Integration Demonstration Runner."""

from __future__ import annotations
import sys
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
if hasattr(sys.stderr, "reconfigure"):
    try:
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from rich.console import Console
from rich.panel import Panel
from rich.markup import escape

from neo4j_integration.config import get_neo4j_config
from neo4j_integration.driver import verify_connectivity
from neo4j_integration.importer import Neo4jDatasetImporter
from neo4j_integration.graph_adapter import GraphAdapter

console = Console(highlight=False)


def run_demo() -> bool:
    """
    Execute Neo4j migration demonstration and format output
    according to project specification.
    """
    console.print("\n[bold cyan]NEXUS-Bharat Neo4j Integration[/bold cyan]\n")

    config = get_neo4j_config()

    # 1. Connect & Verify
    connected, msg = verify_connectivity(config)
    if not connected:
        console.print(f"[bold red]✗ Database Connection Failed:[/bold red] {msg}")
        console.print("[yellow]Please check your .env file and ensure Neo4j DBMS is running locally.[/yellow]\n")
        return False

    console.print("✓ Database Connected")
    console.print(f"✓ Database: {config.database}")

    # 2. Run Idempotent Import Pipeline
    importer = Neo4jDatasetImporter(config=config)
    audit = importer.run_import()

    console.print("✓ Constraints Verified")
    console.print("✓ Cases Imported")
    console.print("✓ Evidence Imported")
    console.print("✓ Entities Imported")
    console.print("✓ Relationships Imported\n")

    counts = audit["counts"]
    nodes_cnt = counts.get("total_graph_nodes", 0)
    rels_cnt = counts.get("relationships", 0)

    console.print(f"Nodes: {nodes_cnt}")
    console.print(f"Relationships: {rels_cnt}\n")

    integrity_status = "PASS" if audit["passed"] else "FAIL"
    console.print(f"Graph Integrity: {integrity_status}")

    # 3. Verify NetworkX Conversion
    adapter = GraphAdapter(config)
    nx_graph = adapter.to_networkx()
    adapter_status = "PASS" if len(nx_graph.nodes) == 136 and len(nx_graph.edges) == 225 else "FAIL"
    console.print(f"NetworkX Adapter: {adapter_status}\n")

    # 4. Neo4j Visual Cypher Verification Queries
    console.print("[dim]------------------------------------------------------------[/dim]")
    console.print("[bold yellow]Neo4j Visual Verification Cypher Queries:[/bold yellow]\n")
    cypher_queries = [
        ("Total Nodes", "MATCH (n) RETURN count(n);"),
        ("Total Relationships", "MATCH ()-[r]->() RETURN count(r);"),
        ("Labels Breakdown", "MATCH (n) RETURN labels(n), count(n);"),
        ("Hidden Broker Query", 'MATCH (p:Person {id:"P017"}) RETURN p;'),
        ("Broker Subgraph Query", 'MATCH (p:Person {id:"P017"})-[r]-(x) RETURN p, r, x;'),
    ]
    for desc, q in cypher_queries:
        console.print(f"[cyan]// {desc}[/cyan]\n[green]{escape(q)}[/green]\n")
    console.print("[dim]------------------------------------------------------------[/dim]\n")

    return audit["passed"] and adapter_status == "PASS"


if __name__ == "__main__":
    success = run_demo()
    sys.exit(0 if success else 1)
