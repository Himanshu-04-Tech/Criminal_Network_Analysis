"""Manual database reset utility requiring explicit user confirmation before executing DETACH DELETE."""

from __future__ import annotations
import sys
import argparse
from rich.console import Console
from rich.prompt import Confirm, Prompt

from neo4j_integration.config import get_neo4j_config
from neo4j_integration.driver import verify_connectivity, get_session

console = Console()


def reset_database(force: bool = False) -> bool:
    """
    Safely reset Neo4j database by deleting all nodes and relationships.
    NEVER executed automatically. Requires explicit user consent.
    """
    config = get_neo4j_config()
    connected, msg = verify_connectivity(config)
    if not connected:
        console.print(f"[bold red]Cannot connect to Neo4j:[/bold red] {msg}")
        return False

    console.print(
        f"[bold yellow]WARNING: You are about to wipe ALL graph data from database '{config.database}'![/bold yellow]"
    )

    if not force:
        confirmation = Prompt.ask(
            "To confirm deletion, please type 'RESET NEXUS BHARAT'",
            default="",
        )
        if confirmation.strip() != "RESET NEXUS BHARAT":
            console.print("[green]Database reset aborted. No data was deleted.[/green]")
            return False

    with get_session(database=config.database) as session:
        # Pre-count
        counts = session.run("""
            MATCH (n)
            OPTIONAL MATCH (n)-[r]->()
            RETURN count(DISTINCT n) AS nodes, count(DISTINCT r) AS rels
        """).single()
        node_cnt = counts["nodes"] if counts else 0
        rel_cnt = counts["rels"] if counts else 0

        # Execute detach delete
        session.run("MATCH (n) DETACH DELETE n")

        console.print(
            f"[bold green]Successfully reset database '{config.database}'. "
            f"Deleted {node_cnt} nodes and {rel_cnt} relationships.[/bold green]"
        )

    return True


def main() -> None:
    parser = argparse.ArgumentParser(
        description="NEXUS-Bharat Manual Database Reset Utility. Requires explicit confirmation."
    )
    parser.add_argument(
        "--confirm",
        action="store_true",
        help="Bypass interactive confirmation prompt (use only for automated teardown in CI/testing)",
    )
    args = parser.parse_args()

    success = reset_database(force=args.confirm)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
