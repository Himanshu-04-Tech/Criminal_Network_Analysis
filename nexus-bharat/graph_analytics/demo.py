"""Interactive CLI Demonstration for NEXUS-Bharat Hidden Connection Finder (Module 3)."""

from __future__ import annotations
import sys
import json
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

from graph_analytics.connection_service import ConnectionService


def run_demo() -> None:
    """Run interactive demonstration of Module 3 Hidden Connection Finder."""
    console = Console()

    # 1. Header Banner
    console.print(
        Panel.fit(
            "[bold cyan]NEXUS-BHARAT: CRIMINAL NETWORK ANALYSIS SYSTEM[/bold cyan]\n"
            "[yellow]Module 3: Hidden Connection Finder (Graph Analytics Engine)[/yellow]",
            border_style="cyan",
            padding=(1, 4),
        )
    )

    with console.status("[bold green]Initializing Connection Service...", spinner="dots"):
        service = ConnectionService.get_instance()

    console.print("\n[bold green][PASS] Knowledge Graph Loaded & Connection Service Ready![/bold green]\n")

    # ---------------------------------------------------------
    # Demo 1: Core Entity Connection Discovery (P001 -> P020)
    # ---------------------------------------------------------
    console.print(Panel("[bold white]DEMO 1: Entity-to-Entity Connection Discovery[/bold white]", border_style="blue"))
    source_entity = "P001"
    target_entity = "P020"

    console.print(f"[bold cyan]Source:[/bold cyan] {source_entity} (Vikram Singhania - Community A Leader)")
    console.print(f"[bold cyan]Target:[/bold cyan] {target_entity} (Associate / Syndicate Operative)\n")

    resp = service.find_connection(source_entity, target_entity)

    if resp.connection_found:
        console.print("[bold green]Connection Found[/bold green]\n")

        # Display Path with vertical arrows
        console.print("[bold yellow]Path:[/bold yellow]")
        for i, node_id in enumerate(resp.path):
            console.print(f"  [bold white]{node_id}[/bold white]")
            if i < len(resp.path) - 1:
                console.print("  [cyan]↓[/cyan]")

        console.print(f"\n[bold magenta]Hops:[/bold magenta] {resp.hops}")
        console.print(f"[bold green]Score:[/bold green] {resp.score:.0f}")

        # Step-by-Step Reasoning
        console.print("\n[bold yellow]Investigative Reasoning Chain:[/bold yellow]")
        for idx, step_reason in enumerate(resp.reasoning, 1):
            console.print(f"  [cyan]{idx}.[/cyan] {step_reason}")
    else:
        console.print(f"[bold red]Connection Not Found:[/bold red] {resp.reason}")

    # ---------------------------------------------------------
    # Demo 2: Ranked Multi-Path Discovery (Top 3 candidate paths)
    # ---------------------------------------------------------
    console.print()
    console.print(Panel("[bold white]DEMO 2: Multi-Path Candidate Discovery & Ranking[/bold white]", border_style="blue"))
    console.print(f"[cyan]Discovering alternative routes between {source_entity} and {target_entity}...[/cyan]")

    top_paths = service.get_top_paths(source_entity, target_entity, top_k=3)
    path_table = Table(title=f"Top {len(top_paths)} Paths Connecting {source_entity} and {target_entity}", box=box.ROUNDED)
    path_table.add_column("Rank", style="cyan", justify="center")
    path_table.add_column("Score", style="bold green", justify="right")
    path_table.add_column("Hops", style="bold yellow", justify="center")
    path_table.add_column("Path Traversal", style="white")

    for rank, p in enumerate(top_paths, 1):
        path_str = " -> ".join(p.path)
        path_table.add_row(f"#{rank}", f"{p.score:.1f}", str(p.hops), path_str)

    console.print(path_table)

    # ---------------------------------------------------------
    # Demo 3: Cross-Case Connection Finder (FIR001 -> FIR007)
    # ---------------------------------------------------------
    console.print()
    console.print(Panel("[bold white]DEMO 3: Cross-Case Intelligence Bridge[/bold white]", border_style="blue"))
    case_1 = "FIR001"
    case_2 = "FIR007"

    console.print(f"[bold cyan]Searching Bridge Between:[/bold cyan] {case_1} (Cyber Fraud) and {case_2} (Bid Rigging)\n")
    case_resp = service.find_case_connection(case_1, case_2)

    if case_resp.connected:
        console.print("[bold green]Cross-Case Bridge Confirmed![/bold green]")
        console.print(f"[bold magenta]Hops:[/bold magenta] {case_resp.hops}")
        console.print(f"[bold yellow]Bridge Entities:[/bold yellow] {', '.join(case_resp.bridge_entities)}")
        console.print(f"[bold white]Path:[/bold white] {' -> '.join(case_resp.path)}")
        console.print("\n[bold yellow]Bridge Narrative:[/bold yellow]")
        for idx, r in enumerate(case_resp.reasoning, 1):
            console.print(f"  [cyan]{idx}.[/cyan] {r}")
    else:
        console.print(f"[bold red]Cases Not Linked:[/bold red] {case_resp.reason}")

    # ---------------------------------------------------------
    # Demo 4: Hidden Broker Verification (P017 between Comm A & B)
    # ---------------------------------------------------------
    console.print()
    console.print(Panel("[bold white]DEMO 4: Hidden Broker Verification Audit[/bold white]", border_style="blue"))
    broker_report = service.verify_hidden_broker("P017")

    broker_table = Table(title="Hidden Broker Verification Metrics", box=box.ROUNDED)
    broker_table.add_column("Metric", style="cyan")
    broker_table.add_column("Value", style="bold green", justify="right")

    broker_table.add_row("Broker Node", broker_report.broker)
    broker_table.add_row("Broker Detected", str(broker_report.broker_detected))
    broker_table.add_row("Communities Connected", str(broker_report.communities_connected))
    broker_table.add_row("Community A Nodes", ", ".join(broker_report.community_a_nodes))
    broker_table.add_row("Community B Nodes", ", ".join(broker_report.community_b_nodes))
    broker_table.add_row("Inter-Community Paths Verified", str(broker_report.details.get("paths_routing_via_broker_infrastructure", 0)))
    broker_table.add_row("Status", f"[bold green]{broker_report.details.get('verification_status')}[/bold green]")

    console.print(broker_table)

    # ---------------------------------------------------------
    # Demo 5: Frontend Visualization JSON Output Sample
    # ---------------------------------------------------------
    console.print()
    console.print(Panel("[bold white]DEMO 5: Frontend Visualization JSON Payload Generation[/bold white]", border_style="blue"))
    if resp.paths:
        vis_payload = service.get_visualization_data(resp.paths[0])
        console.print(f"[bold green]Visualization Nodes Generated:[/bold green] {len(vis_payload['nodes'])}")
        console.print(f"[bold green]Visualization Edges Generated:[/bold green] {len(vis_payload['edges'])}")
        console.print("[yellow]Sample Node JSON Structure:[/yellow]")
        console.print(json.dumps(vis_payload["nodes"][0], indent=2))

    console.print()
    console.print(Panel("[bold yellow]Module 3 Hidden Connection Finder successfully verified![/bold yellow]", border_style="yellow"))


if __name__ == "__main__":
    run_demo()
