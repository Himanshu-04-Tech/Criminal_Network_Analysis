"""Interactive Rich CLI demonstration for NEXUS-Bharat Cross Case Intelligence."""

import sys
from pathlib import Path
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich import box

from .intelligence_service import CrossCaseIntelligenceService
from .models import ConnectionStrength


def run_demo() -> None:
    """Renders the comprehensive Rich CLI dashboard for Cross Case Intelligence."""
    console = Console()

    # Title Banner
    title_text = Text()
    title_text.append("\n  NEXUS-BHARAT: CRIMINAL NETWORK ANALYSIS SYSTEM  \n", style="bold cyan")
    title_text.append("  Module 5: Cross Case Intelligence Engine        \n", style="bold yellow")
    title_text.append("  Cross-Case Graph Fusion | Hidden Case Links | Cluster Detection  \n", style="dim white")
    console.print(Panel(title_text, box=box.DOUBLE, expand=False, border_style="bright_blue"))

    with console.status("[bold green]Analyzing cross-case linkages, overlaps, and cluster graphs..."):
        service = CrossCaseIntelligenceService.get_instance()
        # Ensure reports are generated
        report_files = service.export_reports("reports")
        comp = service.compare_cases("FIR001", "FIR007")
        clusters = service.detect_case_clusters()
        rankings = service.rank_cases()
        all_cases = sorted(list(service.get_all_case_ids()))

    # Core Terminal Header Matching User Specification
    console.print()
    console.print("[bold yellow]CROSS CASE INTELLIGENCE[/bold yellow]")
    console.print()
    console.print("[bold cyan]Comparing Cases[/bold cyan]")
    console.print()
    console.print("[bold white]FIR001 <-> FIR007[/bold white]")
    console.print()

    # Shared details
    shared_ent_count = comp.shared_entities.total_shared
    shared_phones_count = len(comp.shared_entities.shared_phones)
    shared_vehicles_count = len(comp.shared_entities.shared_vehicles)
    
    # Bridge text
    bridge_strs = []
    for b in comp.bridge_entities:
        role_tag = f" ({b.role.title()})" if b.role else ""
        bridge_strs.append(f"{b.entity_id}{role_tag}")
    bridge_display = ", ".join(bridge_strs) if bridge_strs else "None"

    # Color for connection strength
    strength_style = {
        ConnectionStrength.CRITICAL: "bold red on black",
        ConnectionStrength.STRONG: "bold red",
        ConnectionStrength.MODERATE: "bold yellow",
        ConnectionStrength.WEAK: "bold blue",
    }.get(comp.connection_strength, "white")

    console.print(f"Shared Entities: [bold green]{shared_ent_count}[/bold green]")
    console.print(f"Shared Phones: [bold green]{shared_phones_count}[/bold green]")
    console.print(f"Shared Vehicles: [bold green]{shared_vehicles_count}[/bold green]")
    console.print(f"Bridge Entities: [bold magenta]{bridge_display}[/bold magenta]")
    console.print()
    console.print(f"Similarity Score: [bold green]{comp.similarity_score:.0f}[/bold green]")
    console.print()
    console.print(f"Connection Strength: [{strength_style}]{comp.connection_strength.value}[/{strength_style}]")
    console.print()

    # Detailed Forensic Summary Panel
    summary_text = Text()
    summary_text.append(f"Forensic Reasoning & Graph Audit:\n", style="bold yellow")
    for r in comp.reasons:
        summary_text.append(f" - {r}\n", style="white")
    if comp.evidence_count > 0:
        summary_text.append(f"\nCorroborating Evidences in Graph: {comp.evidence_count} items\n", style="dim green")
    
    console.print(Panel(summary_text, title="[bold red]Forensic Cross-Case Intelligence Summary[/bold red]", box=box.ROUNDED))

    # Top Cross-Case Connections Table
    console.print()
    top_conn_table = Table(
        title="[bold yellow]Top Inter-Case Nexus Connections (Pairwise Analysis)[/bold yellow]",
        box=box.ROUNDED,
        header_style="bold magenta",
    )
    top_conn_table.add_column("Case A", justify="center", style="bold cyan", width=10)
    top_conn_table.add_column("Case B", justify="center", style="bold cyan", width=10)
    top_conn_table.add_column("Shared Ents", justify="right", style="bold green", width=12)
    top_conn_table.add_column("Bridge Ents", justify="center", style="magenta", width=20)
    top_conn_table.add_column("Sim Score", justify="right", style="bold yellow", width=11)
    top_conn_table.add_column("Strength", justify="center", width=14)

    seen_pairs = set()
    scored_pairs = []
    for c1 in all_cases:
        for c2 in all_cases:
            if c1 < c2:
                pair = (c1, c2)
                if pair not in seen_pairs:
                    seen_pairs.add(pair)
                    c_res = service.compare_cases(c1, c2)
                    if c_res.similarity_score > 0 or c_res.shared_entities.total_shared > 0:
                        scored_pairs.append(c_res)

    scored_pairs.sort(key=lambda x: x.similarity_score, reverse=True)

    for item in scored_pairs[:7]:
        b_summary = ", ".join([b.entity_id for b in item.bridge_entities[:2]]) or "None"
        c_style = {
            ConnectionStrength.CRITICAL: "[bold red]CRITICAL[/bold red]",
            ConnectionStrength.STRONG: "[red]STRONG[/red]",
            ConnectionStrength.MODERATE: "[yellow]MODERATE[/yellow]",
            ConnectionStrength.WEAK: "[blue]WEAK[/blue]",
        }.get(item.connection_strength, str(item.connection_strength.value))

        top_conn_table.add_row(
            item.case_a,
            item.case_b,
            str(item.shared_entities.total_shared),
            b_summary,
            f"{item.similarity_score:.1f}",
            c_style,
        )
    console.print(top_conn_table)

    # Section 2: Case Clusters
    console.print()
    console.print("[bold yellow]Cross Case Clusters Detected[/bold yellow]")
    console.print()

    cluster_table = Table(
        title="[bold yellow]Syndicate Case Clusters (Secondary Case Network)[/bold yellow]",
        box=box.ROUNDED,
        header_style="bold magenta",
    )
    cluster_table.add_column("Cluster ID", justify="center", style="bold cyan", width=12)
    cluster_table.add_column("Case Count", justify="right", style="bold green", width=12)
    cluster_table.add_column("Member Cases", style="white", width=30)
    cluster_table.add_column("Lead Case", justify="center", style="bold yellow", width=12)
    cluster_table.add_column("Common Operatives", style="magenta", width=22)
    cluster_table.add_column("Cohesion", justify="right", style="cyan", width=10)

    for cl in clusters:
        cases_str = ", ".join(cl.cases)
        operatives_str = ", ".join(cl.common_operatives[:3]) if cl.common_operatives else "None"
        cluster_table.add_row(
            f"Cluster #{cl.cluster_id}",
            str(len(cl.cases)),
            cases_str,
            cl.lead_case,
            operatives_str,
            f"{cl.internal_cohesion:.2f}",
        )
    console.print(cluster_table)

    # Section 3: Case Rankings
    console.print()
    console.print("[bold yellow]Case Rankings[/bold yellow]")
    console.print()

    ranking_table = Table(
        title="[bold yellow]Investigative Case Rankings (Priority Order)[/bold yellow]",
        box=box.ROUNDED,
        header_style="bold magenta",
    )
    ranking_table.add_column("Rank", justify="center", style="bold cyan", width=6)
    ranking_table.add_column("Case ID", justify="center", style="bold green", width=10)
    ranking_table.add_column("Importance", justify="right", style="bold yellow", width=12)
    ranking_table.add_column("Tied Cases", justify="right", style="cyan", width=12)
    ranking_table.add_column("Bridges", justify="right", style="magenta", width=10)
    ranking_table.add_column("Key Syndicate Ties", style="dim white")

    for idx, r in enumerate(rankings, 1):
        ties_str = ", ".join(r.key_syndicate_ties) if r.key_syndicate_ties else "None"
        ranking_table.add_row(
            str(idx),
            r.case_id,
            f"{r.importance_score:.1f}",
            str(r.connected_cases_count),
            str(r.bridge_entities_count),
            ties_str,
        )
    console.print(ranking_table)

    # Section 4: Export Reports
    console.print()
    export_table = Table(
        title="[bold green]Generated Intelligence Reports[/bold green]",
        box=box.SIMPLE,
        header_style="bold green",
    )
    export_table.add_column("Report Type", style="bold white", width=25)
    export_table.add_column("File Path", style="dim cyan", width=45)
    export_table.add_column("Status", style="bold green", width=10)

    for rep_name, path_str in report_files.items():
        export_table.add_row(rep_name.replace("_", " ").title(), path_str, "OK (Saved)")
    console.print(export_table)
    console.print()


if __name__ == "__main__":
    run_demo()
