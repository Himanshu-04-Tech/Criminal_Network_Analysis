"""Natural language explanation and relationship translation layer for graph paths."""

from __future__ import annotations
from typing import Any, Dict, List, Optional, Tuple
import networkx as nx

from graph_analytics.path_models import PathStep


class PathExplainer:
    """Translates graph paths and edges into human-readable investigative narratives."""

    # Forward semantic edge descriptions
    FORWARD_TRANSLATIONS: Dict[str, str] = {
        "USES": "uses",
        "CONTACTED": "contacted",
        "OWNS": "owns",
        "TRANSFERRED_TO": "transferred funds to",
        "VISITED": "visited",
        "OBSERVED_AT": "was observed at",
        "MEMBER_OF": "is a member of",
        "MENTIONED_IN": "is mentioned in",
    }

    # Reverse semantic edge descriptions (when edge direction in graph is target -> source)
    REVERSE_TRANSLATIONS: Dict[str, str] = {
        "USES": "is used by",
        "CONTACTED": "was contacted by",
        "OWNS": "is owned by",
        "TRANSFERRED_TO": "received funds from",
        "VISITED": "was visited by",
        "OBSERVED_AT": "recorded sighting of",
        "MEMBER_OF": "counts as member",
        "MENTIONED_IN": "cites",
    }

    def __init__(self, graph: nx.MultiDiGraph):
        self.graph = graph

    def resolve_step_edge(
        self, u: str, v: str
    ) -> Tuple[str, str, str, float, str, str, str]:
        """
        Identify the best matching directed edge between u and v.
        Returns: (rel_type, direction, case_id, confidence, evidence_id, rel_id, explanation)
        """
        # Check forward edge u -> v
        if self.graph.has_edge(u, v):
            edges_dict = self.graph.get_edge_data(u, v)
            # Pick first or highest confidence edge
            key, data = next(iter(edges_dict.items()))
            rel_type = data.get("relationship_type", "CONNECTED_TO")
            verb = self.FORWARD_TRANSLATIONS.get(rel_type, "connected to")
            case_id = data.get("case_id", "")
            conf = data.get("confidence", 1.0)
            ev_id = data.get("evidence_id", "")
            rel_id = str(key)
            explanation = f"{u} {verb} {v}"
            return rel_type, "forward", case_id, conf, ev_id, rel_id, explanation

        # Check reverse edge v -> u
        if self.graph.has_edge(v, u):
            edges_dict = self.graph.get_edge_data(v, u)
            key, data = next(iter(edges_dict.items()))
            rel_type = data.get("relationship_type", "CONNECTED_TO")
            verb = self.REVERSE_TRANSLATIONS.get(rel_type, "linked to")
            case_id = data.get("case_id", "")
            conf = data.get("confidence", 1.0)
            ev_id = data.get("evidence_id", "")
            rel_id = str(key)
            explanation = f"{u} {verb} {v}"
            return rel_type, "reverse", case_id, conf, ev_id, rel_id, explanation

        # Fallback if no edge found
        return "UNKNOWN", "undirected", "", 1.0, "", "unknown", f"{u} linked to {v}"

    def explain_path(self, path: List[str]) -> Tuple[List[PathStep], List[str], str]:
        """
        Deconstruct a sequence of node IDs into detailed PathSteps, reasoning statements, and narrative summary.
        """
        if not path or len(path) < 2:
            return [], [], "No connection exists."

        steps: List[PathStep] = []
        reasoning: List[str] = []

        for i in range(len(path) - 1):
            u, v = path[i], path[i + 1]
            rel_type, direction, case_id, conf, ev_id, rel_id, expl = self.resolve_step_edge(u, v)

            step = PathStep(
                source=u,
                target=v,
                relationship_type=rel_type,
                direction=direction,
                case_id=case_id,
                confidence=conf,
                evidence_id=ev_id,
                relationship_id=rel_id,
                explanation=expl
            )
            steps.append(step)
            reasoning.append(expl)

        hops = len(steps)
        src, tgt = path[0], path[-1]
        src_name = self.graph.nodes[src].get("name", src) if src in self.graph else src
        tgt_name = self.graph.nodes[tgt].get("name", tgt) if tgt in self.graph else tgt

        if hops == 1:
            summary = f"Direct connection verified between {src} ({src_name}) and {tgt} ({tgt_name}) in 1 hop."
        else:
            intermediary_str = ", ".join(path[1:-1])
            summary = (
                f"{src} ({src_name}) connects to {tgt} ({tgt_name}) across {hops} hops "
                f"via intermediaries: {intermediary_str}."
            )

        return steps, reasoning, summary
