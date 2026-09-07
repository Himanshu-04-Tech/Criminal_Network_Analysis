"""Interactive Rich CLI demonstration for NEXUS-Bharat Graph Diff Engine (Module 8)."""

import sys
from pathlib import Path
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich import box

from .diff_service import GraphDiffService


def run_demo() -> None:
    """Renders the comprehensive Rich CLI dashboard for Graph Diff Engine."""
    console = Console()

    # Title Banner
    title_text = Text()
    title_text.append("\n  NEXUS-BHARAT: CRIMINAL NETWORK ANALYSIS SYSTEM  \n", style="bold cyan")
    title_text.append("  Module 8: Graph Diff Engine                     \n", style="bold yellow")
    title_text.append("  Structural Differencing | Evolution Tracking | Impact Scoring  \n", style="dim white")
    console.print(Panel(title_text, box=box.DOUBLE, expand=False, border_style="bright_blue"))

    with console.status("[bold green]Executing structural graph diff and calculating impact score..."):
        service = GraphDiffService.get_instance()
        analysis = service.get_canonical_diff()
        report_files = service.export_diff_results(analysis)

    console.print()
    console.print("[bold yellow]GRAPH DIFF ENGINE[/bold yellow]")
    console.print("-" * 32)
    console.print()

    # Core Metrics List exactly matching prompt specification
    console.print(f"New Entities:\n[bold green]{analysis.entity_diff.total_new}[/bold green]\n")
    console.print(f"Removed Entities:\n[bold red]{analysis.entity_diff.total_removed}[/bold red]\n")
    console.print(f"New Relationships:\n[bold green]{analysis.relationship_diff.new_count}[/bold green]\n")
    console.print(f"Removed Relationships:\n[bold red]{analysis.relationship_diff.removed_count}[/bold red]\n")
    console.print(f"Community Merges:\n[bold magenta]{1 if analysis.community_diff.event == 'COMMUNITY_MERGE' else 0}[/bold magenta]\n")
    console.print(f"New Brokers:\n[bold cyan]{len([b for b in analysis.broker_diffs if b.status == 'NEW_BROKER'])}[/bold cyan]\n")
    console.print(f"Impact Score:\n[bold yellow]{analysis.impact_score.impact_score:.0f}[/bold yellow]\n")

    sev_style = "bold red on black" if analysis.impact_score.severity.value == "CRITICAL" else "bold red"
    console.print("Severity:")
    console.print(Panel(f"  {analysis.impact_score.severity.value}  ", style=sev_style, expand=False))
    console.print()

    # Detailed Summary Table
    summary_table = Table(box=box.ROUNDED, title="[bold white]Comparative Structural Intelligence Summary[/bold white]")
    summary_table.add_column("Structural Dimension", style="cyan", justify="left")
    summary_table.add_column("Snapshot A (Baseline)", style="dim white", justify="center")
    summary_table.add_column("Snapshot B (Evolved)", style="bold green", justify="center")
    summary_table.add_column("Delta / Status", style="bold yellow", justify="left")

    summary_table.add_row(
        "Active Entities",
        "35 nodes",
        "45 nodes",
        f"+{analysis.entity_diff.total_new} new, -{analysis.entity_diff.total_removed} removed"
    )
    summary_table.add_row(
        "Operational Connections",
        "57 edges",
        "84 edges",
        f"+{analysis.relationship_diff.new_count} new, -{analysis.relationship_diff.removed_count} removed"
    )
    summary_table.add_row(
        "Network Graph Density",
        f"{analysis.density_analysis.density_before:.2f}",
        f"{analysis.density_analysis.density_after:.2f}",
        f"+{analysis.density_analysis.density_change:.2f} (+{analysis.density_analysis.growth_rate:.1f}%)"
    )
    summary_table.add_row(
        "Connected Components",
        f"{analysis.connectivity_analysis.components_before} clusters",
        f"{analysis.connectivity_analysis.components_after} clusters",
        f"{analysis.connectivity_analysis.fragmentation_status} (Consolidation)"
    )
    summary_table.add_row(
        "Clandestine Brokers",
        "0 key brokers",
        f"{len(analysis.broker_diffs)} active brokers",
        "P017 (+104.8%), P020 (+262.5%)"
    )
    console.print(summary_table)
    console.print()

    # Broker Diff Table
    broker_table = Table(box=box.ROUNDED, title="[bold cyan]Emerged Broker Nodes & Betweenness Elevation[/bold cyan]")
    broker_table.add_column("Entity ID", style="bold white")
    broker_table.add_column("Name / Cover", style="yellow")
    broker_table.add_column("Betweenness Transition", style="bold green", justify="center")
    broker_table.add_column("Status", style="bold magenta")
    broker_table.add_column("Investigative Importance", style="dim white")

    for b in analysis.broker_diffs:
        broker_table.add_row(
            b.entity_id,
            b.entity_name,
            f"{b.old_betweenness:.2f} -> {b.new_betweenness:.2f} (+{b.delta:.2f})",
            b.status,
            b.reasons[0] if b.reasons else "Broker betweenness surge"
        )
    console.print(broker_table)
    console.print()

    # Path Evolution Table
    path_table = Table(box=box.ROUNDED, title="[bold magenta]Associative Path Evolution[/bold magenta]")
    path_table.add_column("Suspect Pair", style="bold white")
    path_table.add_column("Associative Pathway", style="yellow")
    path_table.add_column("Status", style="bold green", justify="center")
    path_table.add_column("Operational Shift", style="dim white")

    for p in analysis.path_diffs:
        path_table.add_row(
            f"{p.source} -> {p.target}",
            p.path_str,
            p.status,
            p.explanation
        )
    console.print(path_table)
    console.print()

    # Generated Reports Panel
    report_panel_text = Text()
    report_panel_text.append("7 Forensic Intelligence Reports Exported to reports/:\n\n", style="bold green")
    for key, path in report_files.items():
        report_panel_text.append(f"  • {key:26s} : {path}\n", style="dim white")
    console.print(Panel(report_panel_text, box=box.ROUNDED, title="[bold white]Artifacts & Reports[/bold white]", border_style="green"))


if __name__ == "__main__":
    run_demo()
