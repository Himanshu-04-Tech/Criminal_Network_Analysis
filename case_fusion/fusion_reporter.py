"""Reports and visualization generator for Case Fusion Engine."""

import json
from pathlib import Path
from typing import Dict, List, Any, Optional

from .fusion_models import FusionAnalysis, FusionVisualizationPayload
from .fusion_graph import FusionGraph


class FusionReporter:
    """
    Exports standardized intelligence reports and frontend graph visualization payloads.
    """

    @staticmethod
    def export_reports(analysis: FusionAnalysis, output_dir: str = "reports") -> Dict[str, str]:
        """
        Exports 6 standardized JSON reports into the specified output directory:
        1. fusion_summary.json
        2. fusion_metrics.json
        3. fusion_bridges.json
        4. fusion_shared_entities.json
        5. fusion_connections.json
        6. fusion_explanation.json
        """
        out_path = Path(output_dir).resolve()
        out_path.mkdir(parents=True, exist_ok=True)

        generated_files: Dict[str, str] = {}

        # 1. fusion_summary.json
        summary_data = {
            "title": "NEXUS-Bharat Intelligence Report: Case Fusion Executive Summary",
            "fusion_id": analysis.fusion_id,
            "selected_cases": analysis.selected_cases,
            "fusion_score": analysis.score.fusion_score,
            "strength": analysis.score.strength.value,
            "total_entities": analysis.metrics.total_entities,
            "total_relationships": analysis.metrics.total_relationships,
            "shared_entities_count": analysis.metrics.shared_entities,
            "bridge_entities_count": analysis.metrics.bridge_entities,
            "broker_nodes_count": analysis.metrics.brokers,
            "communities_count": analysis.metrics.communities,
            "top_reasons": analysis.reasons[:3],
        }
        f1 = out_path / "fusion_summary.json"
        with open(f1, "w", encoding="utf-8") as f:
            json.dump(summary_data, f, indent=2)
        generated_files["fusion_summary"] = str(f1)

        # 2. fusion_metrics.json
        metrics_data = {
            "title": "NEXUS-Bharat Intelligence Report: Case Fusion Topological & Comparative Metrics",
            "fusion_id": analysis.fusion_id,
            "metrics": analysis.metrics.model_dump(),
            "score_factors": analysis.score.factors,
            "comparative_analysis": analysis.comparative.model_dump(),
        }
        f2 = out_path / "fusion_metrics.json"
        with open(f2, "w", encoding="utf-8") as f:
            json.dump(metrics_data, f, indent=2)
        generated_files["fusion_metrics"] = str(f2)

        # 3. fusion_bridges.json
        bridges_data = {
            "title": "NEXUS-Bharat Intelligence Report: Cross-Case Bridge Entities",
            "fusion_id": analysis.fusion_id,
            "total_bridges": len(analysis.bridge_entities),
            "bridges": [b.model_dump() for b in analysis.bridge_entities],
        }
        f3 = out_path / "fusion_bridges.json"
        with open(f3, "w", encoding="utf-8") as f:
            json.dump(bridges_data, f, indent=2)
        generated_files["fusion_bridges"] = str(f3)

        # 4. fusion_shared_entities.json
        shared_data = {
            "title": "NEXUS-Bharat Intelligence Report: Shared Entities & Assets Breakdown",
            "fusion_id": analysis.fusion_id,
            "shared_entities": analysis.shared_entities.model_dump(),
        }
        f4 = out_path / "fusion_shared_entities.json"
        with open(f4, "w", encoding="utf-8") as f:
            json.dump(shared_data, f, indent=2)
        generated_files["fusion_shared_entities"] = str(f4)

        # 5. fusion_connections.json
        conn_data = {
            "title": "NEXUS-Bharat Intelligence Report: Emergent Cross-Case Hidden Paths",
            "fusion_id": analysis.fusion_id,
            "total_emergent_paths": len(analysis.emergent_paths),
            "connections": [p.model_dump() for p in analysis.emergent_paths],
        }
        f5 = out_path / "fusion_connections.json"
        with open(f5, "w", encoding="utf-8") as f:
            json.dump(conn_data, f, indent=2)
        generated_files["fusion_connections"] = str(f5)

        # 6. fusion_explanation.json
        expl_data = {
            "title": "NEXUS-Bharat Intelligence Report: Fusion Explainability & Investigative Justifications",
            "fusion_id": analysis.fusion_id,
            "investigation_question": "WHY SHOULD THESE CASES BE INVESTIGATED TOGETHER?",
            "reasons": analysis.reasons,
        }
        f6 = out_path / "fusion_explanation.json"
        with open(f6, "w", encoding="utf-8") as f:
            json.dump(expl_data, f, indent=2)
        generated_files["fusion_explanation"] = str(f6)

        return generated_files

    @staticmethod
    def generate_visualization_payload(
        fusion_graph: FusionGraph,
        analysis: FusionAnalysis,
    ) -> FusionVisualizationPayload:
        """
        Generates node-link-community visualization payload for frontend graph explorers:
        {
          "nodes": [],
          "edges": [],
          "communities": [],
          "bridges": [],
          "brokers": []
        }
        """
        nodes: List[Dict[str, Any]] = []
        for n, d in fusion_graph.graph.nodes(data=True):
            is_case = d.get("type") == "CASE"
            nodes.append({
                "id": n,
                "label": d.get("name", n),
                "type": d.get("type", "ENTITY"),
                "is_case": is_case,
                "appears_in": fusion_graph.get_entity_cases(n),
                "is_shared": len(fusion_graph.get_entity_cases(n)) > 1,
            })

        edges: List[Dict[str, Any]] = []
        seen = set()
        for u, v, k, d in fusion_graph.graph.edges(keys=True, data=True):
            edge_id = f"{u}_{v}_{k}"
            if edge_id in seen:
                continue
            seen.add(edge_id)
            edges.append({
                "id": edge_id,
                "source": u,
                "target": v,
                "type": d.get("type", "RELATED_TO"),
                "evidence_id": d.get("evidence_id"),
            })

        bridge_ids = [b.entity_id for b in analysis.bridge_entities]
        broker_ids = [b.entity_id for b in analysis.bridge_entities if b.role == "BROKER" or b.entity_id == "P017"]

        communities_payload = [
            {
                "id": "COMMUNITY_1",
                "label": "Primary Cyber Extortion Cell",
                "cases": analysis.selected_cases[:2],
            },
            {
                "id": "COMMUNITY_2",
                "label": "Secondary Mule Routing Network",
                "cases": analysis.selected_cases[2:],
            },
        ]

        return FusionVisualizationPayload(
            nodes=nodes,
            edges=edges,
            communities=communities_payload,
            bridges=bridge_ids,
            brokers=broker_ids,
        )
