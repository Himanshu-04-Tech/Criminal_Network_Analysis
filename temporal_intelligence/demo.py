"""Interactive Rich CLI demonstration for NEXUS-Bharat Temporal Intelligence Engine."""

import sys
from pathlib import Path
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich import box

from .temporal_service import TemporalIntelligenceService
from .temporal_models import AnomalySeverity


def run_demo() -> None:
    """Renders the comprehensive Rich CLI dashboard for Temporal Intelligence Engine."""
    console = Console()

    # Title Banner
    title_text = Text()
    title_text.append("\n  NEXUS-BHARAT: CRIMINAL NETWORK ANALYSIS SYSTEM  \n", style="bold cyan")
    title_text.append("  Module 7: Temporal Intelligence Engine           \n", style="bold yellow")
    title_text.append("  Time-Series Graph Analytics | Evolution Tracking | Anomaly Recognition  \n", style="dim white")
    console.print(Panel(title_text, box=box.DOUBLE, expand=False, border_style="bright_blue"))

    with console.status("[bold green]Analyzing temporal evolution, communication bursts, and financial patterns..."):
        service = TemporalIntelligenceService.get_instance()
        summary = service.get_temporal_summary()
        bursts = service.get_communication_bursts()
        anomalies = service.get_anomalies()
        fin_patterns = service.get_financial_patterns()
        broker_ev = service.get_broker_evolution()
        comm_ev = service.get_community_evolution()
        comparison = service.compare_canonical_phases()
        report_files = service.export_all_reports()

    console.print()
    console.print("[bold yellow]TEMPORAL INTELLIGENCE ENGINE[/bold yellow]")
    console.print()
    console.print("[bold cyan]Analysis Period[/bold cyan]")
    console.print("[bold white]2026-06-02T10:00:00Z to 2026-08-28T18:00:00Z[/bold white]")
    console.print()
    console.print("-" * 40)
    console.print()

    # Summary Metrics Table
    summary_table = Table(box=box.ROUNDED, title="[bold white]Network Evolution Summary[/bold white]")
    summary_table.add_column("Intelligence Metric", style="cyan", justify="left")
    summary_table.add_column("Count / Status", style="bold green", justify="center")
    summary_table.add_column("Diagnostic Notes", style="dim white", justify="left")

    summary_table.add_row(
        "Communication Bursts",
        str(summary["communication_bursts_count"]),
        "Sudden high-density burner SIM call surges (< 6h window)"
    )
    summary_table.add_row(
        "New Relationships",
        str(summary["new_relationships_count"]),
        "Emergent links across Phase 1 -> Phase 2 investigation windows"
    )
    summary_table.add_row(
        "Inactive Relationships",
        str(summary["inactive_relationships_count"]),
        "Decayed or abandoned operational links past threshold"
    )
    summary_table.add_row(
        "Community Merges",
        str(summary["community_merges_count"]),
        "Consolidation of disparate syndicate clusters into unified enterprise"
    )
    summary_table.add_row(
        "New Brokers",
        str(summary["new_brokers_count"]),
        "Elevation of clandestine intermediaries bridging FIR cases"
    )
    summary_table.add_row(
        "Anomalies Flagged",
        str(summary["anomalies_count"]),
        "Prioritized tactical and financial laundering alerts"
    )
    console.print(summary_table)
    console.print()

    # Highest Severity Alert Panel
    alert = summary["highest_severity_alert"]
    alert_text = Text()
    alert_text.append("CRITICAL INVESTIGATIVE ALERT\n", style="bold red underline")
    alert_text.append(f"Alert Type: {alert['alert_type']}\n", style="bold white")
    alert_text.append(f"Severity: {alert['severity']}\n", style="bold red on black")
    alert_text.append(f"Involved Entities: {', '.join(alert['entities'])}\n", style="bold yellow")
    alert_text.append(f"Summary: {alert['description']}\n\n", style="white")
    alert_text.append("Forensic Assessment:\n", style="bold cyan")
    alert_text.append("Tactical burner communications peaked directly prior to mule fund routing.\n", style="dim white")
    alert_text.append("Entities P001 (Syndicate Leader) and P017 (Broker) established direct operational command.\n", style="dim white")
    console.print(Panel(alert_text, box=box.HEAVY, border_style="red", title="[bold red]ALERT: CRITICAL SURGE[/bold red]"))
    console.print()

    # Communication Bursts Table
    burst_table = Table(box=box.ROUNDED, title="[bold cyan]Detected Communication Bursts[/bold cyan]")
    burst_table.add_column("Burst ID", style="bold white")
    burst_table.add_column("Suspect Entities", style="yellow")
    burst_table.add_column("Burner Phones", style="dim cyan")
    burst_table.add_column("Calls", justify="right", style="bold green")
    burst_table.add_column("Window", justify="right")
    burst_table.add_column("Rate", justify="right", style="bold magenta")
    burst_table.add_column("Severity", justify="center")

    for b in bursts:
        sev_style = "bold red on black" if b.severity == AnomalySeverity.CRITICAL else "bold red"
        burst_table.add_row(
            b.burst_id,
            ", ".join(b.entities),
            ", ".join(b.phone_entities) if b.phone_entities else "Intermediary",
            str(b.call_count),
            f"{b.duration_hours:.1f}h",
            f"{b.calls_per_hour:.1f}/h",
            Text(b.severity.value, style=sev_style)
        )
    console.print(burst_table)
    console.print()

    # Financial Typologies Table
    fin_table = Table(box=box.ROUNDED, title="[bold yellow]Temporal Financial Typologies[/bold yellow]")
    fin_table.add_column("Typology", style="bold magenta")
    fin_table.add_column("Primary Origin / Target", style="cyan")
    fin_table.add_column("Involved Accounts", style="white")
    fin_table.add_column("Duration", justify="right", style="bold green")
    fin_table.add_column("Severity", justify="center", style="bold red")

    for f in fin_patterns:
        fin_table.add_row(
            f.pattern_type,
            f.source_account or (f.target_accounts[0] if f.target_accounts else "N/A"),
            f"{len(f.involved_accounts)} accounts ({', '.join(f.involved_accounts[:3])}...)",
            f"{f.duration_minutes:.1f} min",
            f.severity.value
        )
    console.print(fin_table)
    console.print()

    # Broker Elevation & Community Merges
    evolution_table = Table(box=box.ROUNDED, title="[bold magenta]Network Role & Structural Evolution[/bold magenta]")
    evolution_table.add_column("Evolution Type", style="bold cyan")
    evolution_table.add_column("Target Entity / Cluster", style="yellow")
    evolution_table.add_column("Transition Delta", style="bold green")
    evolution_table.add_column("Operational Impact", style="dim white")

    if broker_ev:
        b = broker_ev[0]
        evolution_table.add_row(
            "BROKER ELEVATION",
            f"{b.entity_id} ({b.entity_name})",
            f"{b.old_score:.1f} -> {b.new_score:.1f} (+{b.score_delta:.1f})",
            f"Became critical bridge linking cyber fraud and hawala finance cells"
        )

    if comm_ev:
        c = comm_ev[0]
        evolution_table.add_row(
            "COMMUNITY MERGE",
            f"{c.before_count} clusters -> 1 unified syndicate",
            f"-{c.before_count - 1} modular clusters",
            c.summary[:75] + "..."
        )

    console.print(evolution_table)
    console.print()

    # Exported Reports
    report_panel_text = Text()
    report_panel_text.append("7 Forensic Intelligence Reports Generated:\n\n", style="bold green")
    for key, path in report_files.items():
        report_panel_text.append(f"  • {key:22s} : {path}\n", style="dim white")
    console.print(Panel(report_panel_text, box=box.ROUNDED, title="[bold white]Artifacts & Reports[/bold white]", border_style="green"))


if __name__ == "__main__":
    run_demo()
