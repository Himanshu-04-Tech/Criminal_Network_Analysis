"""Diagnostic health check verifying Neo4j connectivity, database schema, counts, and adapter fidelity."""

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

from typing import Dict, Any
from rich.console import Console
from rich.panel import Panel

from neo4j_integration.config import get_neo4j_config
from neo4j_integration.driver import verify_connectivity, get_session
from neo4j_integration.constraints import verify_schema
from neo4j_integration.repository import GraphRepository
from neo4j_integration.graph_adapter import GraphAdapter

console = Console(highlight=False)


def run_health_check() -> bool:
    """
    Execute comprehensive 10-point system health check.
    Returns True if all health assertions pass, False otherwise.
    """
    console.print(Panel("[bold cyan]NEXUS-Bharat Neo4j System Health Audit[/bold cyan]", expand=False))
    config = get_neo4j_config()
    all_passed = True

    # 1. Connectivity
    connected, conn_msg = verify_connectivity(config)
    if not connected:
        console.print(f"[bold red]✗ Connectivity Failed:[/bold red] {conn_msg}")
        return False
    console.print("[green]✓ Neo4j Connectivity: PASS[/green]")

    # 2. Database Availability
    console.print(f"[green]✓ Database Target: {config.database}[/green]")

    with get_session(database=config.database) as session:
        # 3. Schema & Constraints
        schema = verify_schema(session)
        has_constraints = schema["constraints_count"] >= 7
        if has_constraints:
            console.print(f"[green]✓ Schema Constraints: PASS ({schema['constraints_count']} constraints active)[/green]")
        else:
            console.print(f"[yellow]! Schema Constraints: WARNING ({schema['constraints_count']} constraints detected)[/yellow]")

    repo = GraphRepository(config)

    # 4. Node Counts
    stats = repo.get_graph_statistics()
    node_counts = stats["node_counts"]
    expected_nodes = 136
    actual_nodes = stats["total_graph_nodes"]
    if actual_nodes == expected_nodes:
        console.print(f"[green]✓ Node Counts: PASS (Total: {actual_nodes})[/green]")
    else:
        console.print(f"[bold red]✗ Node Counts: FAIL (Expected: {expected_nodes}, Found: {actual_nodes})[/bold red]")
        all_passed = False

    # 5. Relationship Counts
    expected_rels = 225
    actual_rels = stats["total_relationships"]
    if actual_rels == expected_rels:
        console.print(f"[green]✓ Relationship Counts: PASS (Total: {actual_rels})[/green]")
    else:
        console.print(f"[bold red]✗ Relationship Counts: FAIL (Expected: {expected_rels}, Found: {actual_rels})[/bold red]")
        all_passed = False

    # 6. Sample Entity Query (Hidden Broker P017)
    broker = repo.get_entity("P017")
    if broker and broker.get("id") == "P017" and broker.get("type") == "PERSON":
        console.print(f"[green]✓ Entity Lookup (P017): PASS ('{broker.get('name')}', {broker.get('type')})[/green]")
    else:
        console.print(f"[bold red]✗ Entity Lookup (P017): FAIL ({broker})[/bold red]")
        all_passed = False

    # 7. Sample Relationship Query
    broker_rels = repo.get_entity_relationships("P017")
    if len(broker_rels) >= 2:
        console.print(f"[green]✓ Relationship Query: PASS ({len(broker_rels)} incident edges for P017)[/green]")
    else:
        console.print(f"[bold red]✗ Relationship Query: FAIL ({len(broker_rels)} edges found for P017)[/bold red]")
        all_passed = False

    # 8. Case Query (FIR001)
    case_rec = repo.get_entity("FIR001")
    if case_rec and "FIR001" in case_rec.get("id", ""):
        case_entities = repo.get_case_entities("FIR001")
        console.print(f"[green]✓ Case Query (FIR001): PASS ({len(case_entities)} associated entities)[/green]")
    else:
        console.print(f"[bold red]✗ Case Query (FIR001): FAIL ({case_rec})[/bold red]")
        all_passed = False

    # 9. Evidence Query (E001)
    ev_rec = repo.get_evidence("E001")
    if ev_rec and ev_rec.get("id") == "E001":
        console.print(f"[green]✓ Evidence Provenance Query (E001): PASS ('{ev_rec.get('source_file')}', case: {ev_rec.get('case_id')})[/green]")
    else:
        console.print(f"[bold red]✗ Evidence Query (E001): FAIL ({ev_rec})[/bold red]")
        all_passed = False

    # 10. NetworkX Conversion
    adapter = GraphAdapter(config, repo)
    nx_graph = adapter.to_networkx()
    if len(nx_graph.nodes) == expected_nodes and len(nx_graph.edges) == expected_rels:
        console.print(f"[green]✓ NetworkX Graph Adapter: PASS ({len(nx_graph.nodes)} nodes, {len(nx_graph.edges)} edges)[/green]")
    else:
        console.print(
            f"[bold red]✗ NetworkX Graph Adapter: FAIL (Nodes: {len(nx_graph.nodes)}, Edges: {len(nx_graph.edges)})[/bold red]"
        )
        all_passed = False

    status_color = "bold green" if all_passed else "bold red"
    status_text = "ALL HEALTH CHECKS PASSED" if all_passed else "HEALTH CHECK FAILED"
    console.print(f"\n[{status_color}]>>> {status_text} <<<[/{status_color}]\n")

    return all_passed


if __name__ == "__main__":
    success = run_health_check()
    sys.exit(0 if success else 1)
