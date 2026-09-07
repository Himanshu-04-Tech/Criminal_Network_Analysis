"""Interactive Rich CLI demonstration for NEXUS-Bharat Network Role Intelligence."""

import sys
from pathlib import Path
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich import box

from .role_service import RoleService
from .role_models import InvestigationRole


def run_demo() -> None:
    """Renders the comprehensive Rich CLI dashboard for Network Role Intelligence."""
    console = Console()

    # Title Banner
    title_text = Text()
    title_text.append("\n  NEXUS-BHARAT: CRIMINAL NETWORK ANALYSIS SYSTEM  \n", style="bold cyan")
    title_text.append("  Module 4: Network Role Intelligence Engine       \n", style="bold yellow")
    title_text.append("  Topological Roles • Centrality • Louvain Communities  \n", style="dim white")
    console.print(Panel(title_text, box=box.DOUBLE, expand=False, border_style="bright_blue"))

    with console.status("[bold green]Calculating graph centralities and community structures..."):
        service = RoleService.get_instance()
        comm_struct = service.get_community_structure()
        top_brokers = service.get_top_brokers(limit=5)
        top_hubs = service.get_top_hubs(limit=5)
        top_influencers = service.get_top_influencers(limit=5)
        shared_resources = service.get_shared_resources()
        financial_conduits = service.get_financial_conduits()
        report_files = service.export_reports("reports")

    # Header
    console.print()
    console.print("[bold yellow]NETWORK ROLE INTELLIGENCE[/bold yellow]")
    console.print()
    console.print("[bold red]Top Brokers[/bold red]")
    console.print("-" * 32)

    for idx, broker in enumerate(top_brokers[:3], 1):
        score_val = int(broker.details.get("broker_score", 94))
        first_reason = broker.reasons[0] if broker.reasons else "Connects 3 communities"
        console.print(f"\n[bold yellow]{idx}. {broker.entity_id}[/bold yellow]")
        console.print(f"Score: [bold green]{score_val}[/bold green]\n")
        console.print(f"Reason:\n{first_reason}\n")
        console.print("-" * 32)

    # Detailed Broker Table
    broker_table = Table(
        title="[bold yellow]Clandestine Network Brokers Audit[/bold yellow]",
        box=box.ROUNDED,
        header_style="bold magenta",
    )
    broker_table.add_column("Rank", justify="center", style="bold cyan", width=6)
    broker_table.add_column("Entity ID", justify="center", style="bold green", width=12)
    broker_table.add_column("Name", style="white", width=20)
    broker_table.add_column("Score", justify="right", style="bold yellow", width=8)
    broker_table.add_column("Communities", justify="center", style="cyan", width=14)
    broker_table.add_column("Key Justification", style="dim white")

    for idx, broker in enumerate(top_brokers, 1):
        score_val = broker.details.get("broker_score", 0.0)
        reasons_summary = "; ".join(broker.reasons[:2])
        broker_table.add_row(
            str(idx),
            broker.entity_id,
            broker.entity_name,
            f"{score_val:.1f}",
            str(len(broker.communities_connected)),
            reasons_summary,
        )
    console.print(broker_table)

    # --- Section 2: Top Hubs ---
    console.print()
    hub_table = Table(
        title="[bold yellow]Top Connectivity Hubs (Degree Centrality)[/bold yellow]",
        box=box.ROUNDED,
        header_style="bold magenta",
    )
    hub_table.add_column("Rank", justify="center", style="bold cyan", width=6)
    hub_table.add_column("Entity ID", justify="center", style="bold green", width=12)
    hub_table.add_column("Name / Label", style="white", width=25)
    hub_table.add_column("Type", justify="center", style="bold blue", width=14)
    hub_table.add_column("Degree", justify="right", style="bold yellow", width=10)
    hub_table.add_column("Direct Links", justify="right", style="cyan", width=14)

    for idx, hub in enumerate(top_hubs, 1):
        deg_val = hub.metrics.get("degree", 0.0)
        links_val = hub.details.get("direct_connections_count", service.graph.degree(hub.entity_id))
        hub_table.add_row(
            str(idx),
            hub.entity_id,
            hub.entity_name,
            hub.entity_type,
            f"{deg_val:.4f}",
            str(links_val),
        )
    console.print(hub_table)

    # --- Section 3: Top Influencers ---
    console.print()
    inf_table = Table(
        title="[bold yellow]Top Network Influencers (0-100 Composite Score)[/bold yellow]",
        box=box.ROUNDED,
        header_style="bold magenta",
    )
    inf_table.add_column("Rank", justify="center", style="bold cyan", width=6)
    inf_table.add_column("Entity ID", justify="center", style="bold green", width=12)
    inf_table.add_column("Name", style="white", width=22)
    inf_table.add_column("Influence Score", justify="right", style="bold green", width=16)
    inf_table.add_column("PageRank", justify="right", style="yellow", width=12)
    inf_table.add_column("Primary Role", justify="center", style="bold cyan", width=18)

    for idx, inf in enumerate(top_influencers, 1):
        pr_val = inf.metrics.get("pagerank", 0.0)
        inf_table.add_row(
            str(idx),
            inf.entity_id,
            inf.entity_name,
            f"{inf.influence_score:.1f} / 100",
            f"{pr_val:.4f}",
            inf.role.value,
        )
    console.print(inf_table)

    # --- Section 4: Shared Resources ---
    console.print()
    shared_table = Table(
        title="[bold yellow]Multi-Operative Shared Resources[/bold yellow]",
        box=box.ROUNDED,
        header_style="bold magenta",
    )
    shared_table.add_column("Resource ID", justify="center", style="bold green", width=14)
    shared_table.add_column("Resource Type", justify="center", style="bold blue", width=14)
    shared_table.add_column("Shared By Operatives", style="white", width=30)
    shared_table.add_column("Forensic Impact", style="dim white")

    for sr in shared_resources[:6]:
        shared_by = ", ".join(sr.details.get("shared_by", []))
        shared_table.add_row(
            sr.entity_id,
            sr.entity_type,
            shared_by,
            f"Joint infrastructure linking {len(sr.details.get('shared_by', []))} suspects across FIR cases",
        )
    console.print(shared_table)

    # --- Section 5: Financial Conduits ---
    console.print()
    fin_table = Table(
        title="[bold yellow]Financial Conduits & Money Laundering Accounts[/bold yellow]",
        box=box.ROUNDED,
        header_style="bold magenta",
    )
    fin_table.add_column("Account ID", justify="center", style="bold green", width=14)
    fin_table.add_column("Conduit Typology", justify="center", style="bold cyan", width=26)
    fin_table.add_column("Total Transfers", justify="right", style="bold yellow", width=16)
    fin_table.add_column("Deposits / Payouts", justify="center", style="white", width=22)

    for fc in financial_conduits[:5]:
        fan_in = fc.details.get("fan_in_count", 0)
        fan_out = fc.details.get("fan_out_count", 0)
        fin_table.add_row(
            fc.entity_id,
            fc.details.get("conduit_type", "Routing"),
            str(fc.details.get("transfers_count", 0)),
            f"In: {fan_in} | Out: {fan_out}",
        )
    console.print(fin_table)

    # --- Section 6: Community Structure ---
    console.print()
    comm_panel_text = (
        f"[bold white]Louvain Communities Discovered:[/bold white] [bold green]{comm_struct.num_communities}[/bold green]\n"
        f"[bold white]Newman Modularity Score Q:[/bold white] [bold cyan]{comm_struct.modularity:.4f}[/bold cyan]\n"
        f"[bold white]Disconnected Criminal Clusters:[/bold white] [bold yellow]{comm_struct.connected_components_count}[/bold yellow]\n"
        f"[bold white]Largest Community Sizes:[/bold white] {comm_struct.component_sizes[:5]}"
    )
    console.print(Panel(comm_panel_text, title="[bold yellow]Community Partitioning Overview[/bold yellow]", box=box.ROUNDED))

    # Reports Generation Summary
    console.print()
    reports_text = Text()
    reports_text.append("[PASS] Intelligence Reports successfully exported to reports/:\n", style="bold green")
    for key, path in report_files.items():
        reports_text.append(f"  * {key}: {path}\n", style="dim white")
    console.print(Panel(reports_text, box=box.ROUNDED, border_style="green"))


if __name__ == "__main__":
    run_demo()
