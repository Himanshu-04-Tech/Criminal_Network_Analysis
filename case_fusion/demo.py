"""Interactive Rich CLI demonstration for NEXUS-Bharat Case Fusion Engine."""

import sys
from pathlib import Path
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich import box

from .fusion_service import CaseFusionService
from .fusion_models import FusionStrength


def run_demo() -> None:
    """Renders the comprehensive Rich CLI dashboard for Case Fusion Engine."""
    console = Console()

    # Title Banner
    title_text = Text()
    title_text.append("\n  NEXUS-BHARAT: CRIMINAL NETWORK ANALYSIS SYSTEM  \n", style="bold cyan")
    title_text.append("  Module 6: Case Fusion Engine                    \n", style="bold yellow")
    title_text.append("  Multi-Case Fusion | Emergent Intelligence | Network Synthesis  \n", style="dim white")
    console.print(Panel(title_text, box=box.DOUBLE, expand=False, border_style="bright_blue"))

    selected_cases = ["FIR001", "FIR003", "FIR007"]

    with console.status("[bold green]Fusing FIR investigation graphs and discovering emergent intelligence..."):
        service = CaseFusionService.get_instance()
        fusion_id = service.create_fusion(selected_cases)
        analysis = service.analyze_fusion(fusion_id)
        report_files = service.export_fusion_report(fusion_id, output_dir="reports")

    # Header matching prompt requirements
    console.print()
    console.print("[bold yellow]CASE FUSION ENGINE[/bold yellow]")
    console.print()
    console.print("[bold cyan]Selected Cases[/bold cyan]")
    console.print()
    for cid in selected_cases:
        console.print(f"[bold white]{cid}[/bold white]")
    console.print()
    console.print("-" * 32)
    console.print()

    # Metrics Summary
    console.print(f"Fusion ID:\n[bold green]{fusion_id}[/bold green]\n")
    console.print(f"Total Entities:\n[bold green]{analysis.metrics.total_entities}[/bold green]\n")
    console.print(f"Total Relationships:\n[bold green]{analysis.metrics.total_relationships}[/bold green]\n")
    console.print(f"Shared Entities:\n[bold green]{analysis.metrics.shared_entities}[/bold green]\n")
    console.print(f"Bridge Entities:\n[bold magenta]{analysis.metrics.bridge_entities}[/bold magenta]\n")
    console.print(f"Broker Nodes:\n[bold red]{analysis.metrics.brokers}[/bold red]\n")
    console.print(f"Fusion Score:\n[bold green]{analysis.score.fusion_score:.0f}[/bold green]\n")

    strength_style = {
        FusionStrength.CRITICAL: "bold red on black",
        FusionStrength.HIGH: "bold red",
        FusionStrength.MODERATE: "bold yellow",
        FusionStrength.LOW: "bold blue",
    }.get(analysis.score.strength, "white")

    console.print(f"Strength:\n[{strength_style}]{analysis.score.strength.value}[/{strength_style}]\n")
    console.print("-" * 32)
    console.print()

    # Section 1: Comparative Analysis (Before vs After Fusion)
    comp_table = Table(
        title="[bold yellow]Comparative Analysis: Value Added by Case Fusion[/bold yellow]",
        box=box.ROUNDED,
        header_style="bold magenta",
    )
    comp_table.add_column("Analytical Dimension", style="bold cyan", width=26)
    comp_table.add_column("Before Fusion (Isolated)", justify="right", style="dim white", width=25)
    comp_table.add_column("After Fusion (Unified)", justify="right", style="bold green", width=25)
    comp_table.add_column("Net Intelligence Gain", justify="right", style="bold yellow", width=22)

    c = analysis.comparative
    comp_table.add_row(
        "Entities Analyzed",
        f"{c.entities_before} entities",
        f"{c.entities_after} entities",
        f"+{c.entities_after - c.entities_before} entities (+{((c.entities_after-c.entities_before)/c.entities_before)*100:.0f}%)",
    )
    comp_table.add_row(
        "Relationships Discovered",
        f"{c.relationships_before} links",
        f"{c.relationships_after} links",
        f"+{c.relationships_after - c.relationships_before} links (+{c.density_gain:.0f}%)",
    )
    comp_table.add_row(
        "Operational Communities",
        f"{c.communities_before} silos",
        f"{c.communities_after} syndicate clusters",
        f"Consolidated into {c.communities_after} cells",
    )
    comp_table.add_row(
        "Shared Asset Overlaps",
        "0 (unknown in silo)",
        f"{analysis.metrics.shared_entities} assets",
        f"{analysis.metrics.shared_entities} common nexus assets",
    )
    comp_table.add_row(
        "Clandestine Broker Surfaced",
        "0 (invisible in silo)",
        f"{analysis.metrics.brokers} broker (P017)",
        "Covert Broker Identified",
    )
    console.print(comp_table)
    console.print()

    # Section 2: Shared Entities Breakdown Table
    shared_table = Table(
        title="[bold yellow]Shared Criminal Infrastructure & Operatives Across Fused FIRs[/bold yellow]",
        box=box.ROUNDED,
        header_style="bold magenta",
    )
    shared_table.add_column("Category", style="bold cyan", width=18)
    shared_table.add_column("Count", justify="right", style="bold green", width=8)
    shared_table.add_column("Sample Identifiers", style="white", width=36)
    shared_table.add_column("Forensic Implication", style="dim white")

    sh = analysis.shared_entities
    shared_table.add_row("Shared Persons", str(len(sh.persons)), ", ".join(sh.persons) or "None", "Cross-case criminal operatives & conspirators")
    shared_table.add_row("Shared Phones", str(len(sh.phones)), ", ".join(sh.phones) or "None", "Burner phones utilized across multiple crime operations")
    shared_table.add_row("Shared Bank Accounts", str(len(sh.accounts)), ", ".join(sh.accounts) or "None", "Mule accounts routing extortion & laundering proceeds")
    shared_table.add_row("Shared Vehicles", str(len(sh.vehicles)), ", ".join(sh.vehicles) or "None", "Logistics & transport vehicles sighted across cases")
    shared_table.add_row("Shared Front Orgs", str(len(sh.organizations)), ", ".join(sh.organizations) or "None", "Corporate shells used for fraudulent laundering")
    console.print(shared_table)
    console.print()

    # Section 3: Key Bridge Entities
    bridge_table = Table(
        title="[bold yellow]Key Cross-Case Bridge Entities & Brokers[/bold yellow]",
        box=box.ROUNDED,
        header_style="bold magenta",
    )
    bridge_table.add_column("Entity ID", justify="center", style="bold green", width=12)
    bridge_table.add_column("Entity Name", style="white", width=22)
    bridge_table.add_column("Role", justify="center", style="bold yellow", width=16)
    bridge_table.add_column("Bridge Typology", style="cyan", width=28)
    bridge_table.add_column("Cases Bridged", justify="center", style="bold white", width=16)

    for b in analysis.bridge_entities:
        role_style = "[bold red]BROKER[/bold red]" if b.role == "BROKER" else f"[yellow]{b.role}[/yellow]"
        bridge_table.add_row(
            b.entity_id,
            b.entity_name,
            role_style,
            b.bridge_type,
            ", ".join(b.cases_bridged),
        )
    console.print(bridge_table)
    console.print()

    # Section 4: Emergent Hidden Paths
    if analysis.emergent_paths:
        path_table = Table(
            title="[bold yellow]Emergent Hidden Cross-Case Paths Discovered by Fusion[/bold yellow]",
            box=box.ROUNDED,
            header_style="bold magenta",
        )
        path_table.add_column("Source", justify="center", style="cyan", width=10)
        path_table.add_column("Target", justify="center", style="cyan", width=10)
        path_table.add_column("Hops", justify="right", style="bold green", width=6)
        path_table.add_column("Discovered Path Sequence", style="white", width=36)
        path_table.add_column("Investigative Significance", style="dim white")

        for p in analysis.emergent_paths[:4]:
            path_seq = " -> ".join(p.path)
            path_table.add_row(
                f"{p.source_case}:{p.source_entity}",
                f"{p.target_case}:{p.target_entity}",
                str(p.hops),
                path_seq,
                p.significance,
            )
        console.print(path_table)
        console.print()

    # Section 5: Fusion Explainability Panel
    expl_text = Text()
    expl_text.append("Investigative Question:\n", style="bold yellow")
    expl_text.append("WHY SHOULD THESE CASES BE INVESTIGATED TOGETHER?\n\n", style="bold cyan")
    expl_text.append("Forensic Evidence & Findings:\n", style="bold yellow")
    for r in analysis.reasons:
        expl_text.append(f" - {r}\n", style="white")

    console.print(Panel(expl_text, title="[bold red]Case Fusion Explainability Dossier[/bold red]", box=box.ROUNDED))
    console.print()

    # Section 6: Export Reports
    export_table = Table(
        title="[bold green]Generated Case Fusion Intelligence Reports[/bold green]",
        box=box.SIMPLE,
        header_style="bold green",
    )
    export_table.add_column("Report File", style="bold white", width=25)
    export_table.add_column("Destination Path", style="dim cyan", width=48)
    export_table.add_column("Status", style="bold green", width=10)

    for rep_name, path_str in report_files.items():
        export_table.add_row(rep_name.replace("_", " ").title(), path_str, "OK (Saved)")
    console.print(export_table)
    console.print()


if __name__ == "__main__":
    run_demo()
