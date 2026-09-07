"""CLI Demo and Entrypoint for NEXUS-Bharat Knowledge Graph Engine."""

from __future__ import annotations
import sys
from pathlib import Path

# Add project roots to sys.path
current_file = Path(__file__).resolve()
nexus_bharat_dir = current_file.parent.parent  # nexus-bharat
workspace_dir = nexus_bharat_dir.parent        # Criminal_Network_Analysis

for p in [str(nexus_bharat_dir), str(workspace_dir)]:
    if p not in sys.path:
        sys.path.insert(0, p)

# Ensure console stdout handles UTF-8 on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.tree import Tree
from rich import box

from graph_engine.graph_service import KnowledgeGraphService


def run_cli_demo() -> None:
    """Execute Rich CLI demonstration of Knowledge Graph Engine."""
    console = Console()

    # 1. Header Banner
    console.print(
        Panel.fit(
            "[bold cyan]NEXUS-BHARAT: CRIMINAL NETWORK ANALYSIS SYSTEM[/bold cyan]\n"
            "[yellow]Module 2: In-Memory Knowledge Graph Engine[/yellow]",
            border_style="cyan",
            padding=(1, 4),
        )
    )

    # 2. Load Knowledge Graph via Singleton Service
    with console.status("[bold green]Loading and indexing Knowledge Graph...", spinner="dots"):
        service = KnowledgeGraphService.get_instance()
        graph = service.load_graph()
        stats = service.get_statistics()
        report = service.get_integrity_report()

    console.print("\n[bold green][PASS] NEXUS Knowledge Graph Loaded Successfully![/bold green]\n")

    # 3. Core Graph Metric Summary Cards
    metric_table = Table(title="[bold white]Graph Summary Overview[/bold white]", box=box.ROUNDED)
    metric_table.add_column("Metric", style="cyan", justify="left")
    metric_table.add_column("Count / Value", style="bold green", justify="right")

    metric_table.add_row("Total Graph Nodes", str(stats.total_nodes))
    metric_table.add_row("Total Directed Edges", str(stats.total_edges))
    metric_table.add_row("Graph Density", f"{stats.density:.6f}")
    metric_table.add_row("Avg In-Degree", f"{stats.avg_in_degree:.2f}")
    metric_table.add_row("Avg Out-Degree", f"{stats.avg_out_degree:.2f}")
    metric_table.add_row("Connected Components", str(stats.connected_components))

    console.print(metric_table)

    # 4. Node Types Table
    node_table = Table(title="[bold white]Node Types Distribution[/bold white]", box=box.ROUNDED)
    node_table.add_column("Node Type", style="cyan")
    node_table.add_column("Node Count", style="bold yellow", justify="right")
    node_table.add_column("Percentage", style="magenta", justify="right")

    node_breakdown = [
        ("PERSON", stats.persons),
        ("PHONE", stats.phones),
        ("ACCOUNT", stats.accounts),
        ("VEHICLE", stats.vehicles),
        ("LOCATION", stats.locations),
        ("ORGANIZATION", stats.organizations),
        ("CASE", stats.cases),
    ]

    for ntype, count in node_breakdown:
        pct = (count / stats.total_nodes) * 100 if stats.total_nodes > 0 else 0
        node_table.add_row(ntype, str(count), f"{pct:.1f}%")

    console.print(node_table)

    # 5. Relationship Types Table
    edge_table = Table(title="[bold white]Edge / Relationship Types Distribution[/bold white]", box=box.ROUNDED)
    edge_table.add_column("Relationship Type", style="cyan")
    edge_table.add_column("Edge Count", style="bold green", justify="right")
    edge_table.add_column("Percentage", style="magenta", justify="right")

    for rtype, count in sorted(stats.relationship_counts.items(), key=lambda x: -x[1]):
        pct = (count / stats.total_edges) * 100 if stats.total_edges > 0 else 0
        edge_table.add_row(rtype, str(count), f"{pct:.1f}%")

    console.print(edge_table)

    # 6. Graph Validation & Integrity Audit Panel
    if report.is_valid:
        audit_text = (
            f"[bold green][PASS] Graph Validation Passed[/bold green]\n"
            f"[white]• Orphan Nodes: {len(report.orphan_nodes)}\n"
            f"• Invalid Edges: {len(report.invalid_edges)}\n"
            f"• Weakly Connected Components: {len(report.disconnected_components)}\n"
            f"• Status: 100% Referential & Structural Integrity Confirmed[/white]"
        )
        border = "green"
    else:
        audit_text = f"[bold red][FAIL] Graph Validation Failed: {len(report.invalid_edges)} invalid edges[/bold red]"
        border = "red"

    console.print(Panel(audit_text, title="[bold]Structural Audit[/bold]", border_style=border))

    # 7. Query Engine Demonstration
    console.print("\n[bold white]🔍 Demonstrating Indexed Query Engine API:[/bold white]")
    queries = service.get_queries()

    query_tree = Tree("[bold cyan]Query API Execution Samples[/bold cyan]")

    # Sample 1: Node Lookup
    node_p017 = queries.get_node("P017")
    if node_p017:
        p17_branch = query_tree.add(f"[green]get_node('P017'):[/green] {node_p017.name} ({node_p017.type})")
        neighbors = queries.get_neighbors("P017")
        p17_branch.add(f"Neighbors ({len(neighbors)}): {', '.join(n.id + ' (' + n.name + ')' for n in neighbors)}")

    # Sample 2: Shared Phone Lookup
    ph005_rels = queries.get_relationships("PH005")
    ph_branch = query_tree.add(f"[green]get_relationships('PH005'):[/green] Shared Phone Links ({len(ph005_rels)})")
    for r in ph005_rels:
        ph_branch.add(f"{r.source} -[{r.relationship_type}]-> {r.target} (Case: {r.case_id})")

    # Sample 3: Case Entities Lookup
    fir1_entities = queries.get_case_entities("FIR001")
    query_tree.add(f"[green]get_case_entities('FIR001'):[/green] {len(fir1_entities)} entities active in Cyber Extortion Case")

    console.print(query_tree)

    # 8. Export Graph Files (Gephi & Web visualization)
    export_dirs = [
        nexus_bharat_dir / "exports",
        workspace_dir / "exports",
    ]

    console.print("\n[bold white]Exporting Gephi & Web Graph Formats:[/bold white]")
    for edir in export_dirs:
        exported_files = service.export_all(export_dir=edir)
        console.print(f"  [bold green][DIR][/bold green] Export Directory: [cyan]{edir}[/cyan]")
        for fmt, path in exported_files.items():
            console.print(f"      • {path.name} ({fmt.upper()})")

    console.print("\n[bold green][PASS] Export Complete[/bold green]")
    console.print(Panel("[bold yellow]Module 2 Knowledge Graph Engine ready for downstream analytics modules![/bold yellow]", border_style="yellow"))


if __name__ == "__main__":
    run_cli_demo()
