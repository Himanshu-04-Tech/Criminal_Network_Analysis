# NEXUS-Bharat: AI-Powered Criminal Network Analysis System
## Module 01: Synthetic Investigation Dataset Generator
## Module 02: In-Memory Knowledge Graph Engine
## Module 03: Hidden Connection Finder
## Module 04: Network Role Intelligence Engine
## Module 05: Cross Case Intelligence Engine
## Module 06: Case Fusion Engine

[![Python 3.12+](https://img.shields.io/badge/python-3.12%2B-blue.svg)](https://www.python.org/)
[![NetworkX](https://img.shields.io/badge/networkx-3.6%2B-orange.svg)](https://networkx.org/)
[![Pydantic v2](https://img.shields.io/badge/pydantic-v2.10%2B-green.svg)](https://docs.pydantic.dev/)
[![Rich CLI](https://img.shields.io/badge/CLI-Rich-purple.svg)](https://rich.readthedocs.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📌 Overview

**NEXUS-Bharat** is an enterprise-grade Criminal Network Analysis & Knowledge Graph Intelligence platform engineered for national law enforcement and security agencies.

- **Module 1 (Dataset Generator)**: Generates strictly validated investigation datasets with 10 deliberate intelligence patterns across entities, cases, relationships, and evidence records.
- **Module 2 (Knowledge Graph Engine)**: Constructs an in-memory `networkx.MultiDiGraph` with $O(1)$ secondary query indexing, referential validation, topological metrics, Gephi/Web exports, and a singleton service interface.
- **Module 3 (Hidden Connection Finder)**: Answers *"How is Entity A connected to Entity B?"* across direct and multi-hop paths, scoring path credibility (0–100), explaining traversals in natural language, surfacing cross-case bridges, verifying covert brokers, and emitting frontend graph payloads.
- **Module 4 (Network Role Intelligence Engine)**: Classifies entities into 8 operational roles (`BROKER`, `HUB`, `HIGH_INFLUENCE`, `CONNECTOR`, `COORDINATOR`, `FINANCIAL_CONDUIT`, `SHARED_RESOURCE`, `ISOLATED_ENTITY`), calculates 5 centrality metrics, partitions networks via Louvain community detection, provides 0–100 influence scores, exports 5 intelligence reports, and emits community visualization payloads.
- **Module 5 (Cross Case Intelligence Engine)**: Discovers hidden links between FIR criminal cases (*"Are FIR001 and FIR007 connected?"*). Calculates multi-factor case similarity (0–100), classifies connection strength (`WEAK`, `MODERATE`, `STRONG`, `CRITICAL`), detects direct and covert bridge entities (such as broker `P017`), uncovers syndicate case clusters, ranks cases by network priority, exports 5 intelligence reports, and generates node-link visualization payloads.
- **Module 6 (Case Fusion Engine)**: Temporarily merges multiple FIR investigations into a unified analytical graph (`FusionGraph` e.g. `FC_001`), answering *"What happens if we investigate these FIRs together?"*. Performs strict entity deduplication with provenance tracking, detects emergent hidden paths, evaluates before-and-after comparative gains, surfaces clandestine brokers, analyzes community structural shifts, calculates a 6-factor composite 0–100 **Fusion Intelligence Score** (`91.0` / `CRITICAL`), provides court-ready explainability justifications, and exports 6 intelligence reports.

### Intelligence Roadmap
- [x] 📦 **Module 1**: Investigation Dataset Generator
- [x] 🕸️ **Module 2**: Knowledge Graph Engine
- [x] 🕵️ **Module 3**: Hidden Connection Finder
- [x] 🧠 **Module 4**: Network Role Intelligence
- [x] 🔗 **Module 5**: Cross-Case Intelligence
- [x] 🧩 **Module 6**: Case Fusion
- [ ] ⏱️ **Module 7**: Temporal Analysis
- [ ] 📊 **Module 8**: Graph Diff
- [ ] 🚨 **Module 9**: Pattern Detection

---

## 🏗️ Architecture & Project Structure

```
nexus-bharat/
│
├── dataset_generator/              # [Module 1] Synthetic Data Generation (READ ONLY)
│   ├── models.py
│   ├── generators.py
│   ├── pattern_injector.py
│   ├── relationship_generator.py
│   ├── export.py
│   └── main.py
│
├── graph_engine/                   # [Module 2] Knowledge Graph Engine (READ ONLY)
│   ├── __init__.py
│   ├── models.py                  # Pydantic schemas: NodeModel, EdgeModel, GraphStatistics
│   ├── graph_loader.py            # Dataset file discovery, parsing, and caching
│   ├── graph_validator.py         # Integrity validation & audit checks
│   ├── graph_builder.py           # NetworkX MultiDiGraph builder, indexing, and exports
│   ├── graph_queries.py           # O(1) indexed query engine
│   ├── graph_statistics.py        # Topological metric calculator
│   ├── graph_service.py           # Singleton KnowledgeGraphService
│   └── main.py                    # Rich CLI dashboard demonstration runner
│
├── graph_analytics/                # [Module 3] Hidden Connection Finder (READ ONLY)
│   ├── __init__.py
│   ├── path_models.py             # Pydantic models: PathStep, PathResult, ConnectionResponse, etc.
│   ├── connection_validator.py    # Defensive input validator (handles missing nodes, errors)
│   ├── path_scorer.py             # 4-factor composite scoring engine (0-100 score)
│   ├── path_explainer.py          # Forensic natural language translation layer
│   ├── path_finder.py             # BFS, All Simple Paths, Case Bridges, Broker Verification
│   ├── connection_service.py      # Thread-safe ConnectionService with query cache
│   └── demo.py                    # Module 3 Rich CLI demonstration
│
├── role_intelligence/              # [Module 4] Network Role Intelligence Engine
│   ├── __init__.py
│   ├── role_models.py             # Schemas: RoleClassification, CentralityMetrics, CommunityStructure
│   ├── centrality_engine.py       # Degree, Betweenness, Closeness, Eigenvector, PageRank
│   ├── community_detector.py      # Louvain community detection & connected components
│   ├── influence_analyzer.py      # Composite 0-100 influence scoring engine
│   ├── role_classifier.py         # Rule mapping for 8 investigation roles
│   ├── role_explainer.py          # Auditable forensic natural language justifications
│   ├── role_service.py            # Singleton RoleService facade, APIs, & report export
│   └── demo.py                    # Module 4 Rich CLI demonstration
│
├── cross_case_intelligence/        # [Module 5] Cross Case Intelligence Engine
│   ├── __init__.py
│   ├── models.py                  # Pydantic schemas: ConnectionStrength, CaseOverlap, BridgeEntity, etc.
│   ├── case_loader.py             # Categorized entity extraction per FIR case
│   ├── overlap_detector.py        # Direct pairwise entity overlap detection across 6 types
│   ├── bridge_detector.py         # Direct & covert bridge discovery with Module 4 role enrichment
│   ├── case_analyzer.py           # Multi-hop path tracing & evidence collection via Module 3
│   ├── similarity_engine.py       # 8-factor composite similarity (0-100) & symmetric matrix
│   ├── case_scorer.py             # Connection strength classification, cluster detection & case ranking
│   ├── case_explainer.py          # Forensic explainability & natural language audit trails
│   ├── intelligence_service.py    # Singleton facade, 5 JSON report exporters & vis payload
│   └── demo.py                    # Module 5 Rich CLI demonstration
│
├── case_fusion/                    # [Module 6] Case Fusion Engine
│   ├── __init__.py
│   ├── fusion_models.py           # Schemas: FusionMetrics, FusionScoreResult, FusionAnalysis, etc.
│   ├── fusion_graph.py            # Fused NetworkX MultiDiGraph wrapper with case provenance
│   ├── fusion_builder.py          # Multi-case fusion constructor & deduplication engine
│   ├── fusion_analyzer.py         # Emergent intelligence detector (paths, bridges, communities)
│   ├── fusion_scorer.py           # 6-factor composite 0-100 score & strength classifier
│   ├── fusion_explainer.py        # Court-ready natural language forensic justifications
│   ├── fusion_reporter.py         # Exporter for 6 JSON reports & visualization payload
│   ├── fusion_service.py          # Thread-safe singleton service facade with query caching
│   └── demo.py                    # Module 6 Rich CLI demonstration
│
├── output/                        # Raw Investigation Data from Module 1 (READ ONLY)
│   ├── entities.json              # 126 Entities (35 Persons, 45 Phones, 20 Accounts, 10 Vehicles, 10 Locations, 6 Orgs)
│   ├── relationships.json         # 225 Relationships
│   ├── evidence.json              # 225 Forensic Evidence records
│   ├── cases.json                 # 10 FIR Criminal Cases (FIR001 to FIR010)
│   └── dataset_summary.json       # Audit summary
│
├── exports/                       # Graph Visualizations from Module 2
│   ├── graph.graphml              # Gephi-compatible GraphML
│   ├── graph.gexf                 # Gephi-compatible GEXF
│   └── graph.json                 # Node-Link JSON (Cytoscape / D3 / Sigma.js)
│
├── reports/                       # Intelligence Reports from Modules 4, 5 & 6
│   ├── fusion_summary.json        # [M6] Case fusion executive summary & metrics
│   ├── fusion_metrics.json        # [M6] Comparative before/after metrics & scores
│   ├── fusion_bridges.json        # [M6] Inter-case bridge entities & broker nodes
│   ├── fusion_shared_entities.json# [M6] Categorized shared assets across fused FIRs
│   ├── fusion_connections.json    # [M6] Emergent hidden cross-case paths discovered
│   ├── fusion_explanation.json    # [M6] Forensic reasons answering: Why investigate together?
│   ├── cross_case_report.json     # [M5] Top pairwise case connections & bridges
│   ├── case_clusters.json         # [M5] Syndicate case clusters & internal cohesion
│   ├── similarity_matrix.json     # [M5] Symmetric 10x10 inter-case similarity matrix
│   ├── bridge_entities.json       # [M5] Intermediary bridges & broker routing
│   ├── case_rankings.json         # [M5] Prioritized case rankings by network importance
│   ├── broker_report.json         # [M4] Top clandestine brokers and leverage scores
│   ├── hub_report.json            # [M4] High-degree connectivity hubs
│   ├── community_report.json      # [M4] Louvain partitions and connected clusters
│   ├── influence_report.json      # [M4] 0-100 composite influence ranking
│   └── shared_resource_report.json# [M4] Multi-suspect shared phones, accounts, vehicles
│
├── tests/
│   ├── test_case_fusion.py        # 13 tests for Module 6 (Fusion, Deduplication, Emergence, Scoring, Reports)
│   ├── test_cross_case_intelligence.py # 13 tests for Module 5 (Overlaps, Bridges, Sim Matrix, Clusters, Rankings)
│   ├── test_role_intelligence.py  # 13 tests for Module 4 (Roles, Centrality, Communities, Reports)
│   ├── test_graph_analytics.py    # 14 tests for Module 3 (Paths, Scoring, Explainer, Broker, Vis)
│   ├── test_graph_engine.py       # 13 tests for Module 2 (Graph, Queries, Services, Exports)
│   └── test_dataset_generator.py  # 15 tests for Module 1 (Patterns & Schema)
│
├── demo.py                        # Root CLI entrypoint (Runs Module 6 by default, or -m 5 / 4 / 3 / all)
├── main.py                        # Root CLI entrypoint for Module 2 Graph Engine
├── requirements.txt               # Dependencies: faker, pydantic, networkx, rich, pytest, numpy, pandas, python-louvain
└── pyproject.toml                 # Pytest & package configuration
```

---

## 🚀 Quick Start

### 1. Installation
```powershell
pip install -r requirements.txt
```

### 2. Run Module 6 Case Fusion Engine (Default Rich CLI Dashboard)
From workspace root:
```powershell
python demo.py
```
*Executes analytical fusion for `FIR001 + FIR003 + FIR007` (Fusion ID: `FC_001`, Total Entities: `67`, Total Relationships: `104`, Shared Entities: `8`, Bridge Entities: `3`, Broker Nodes: `1`, Fusion Score: `91`, Strength: `CRITICAL`), displaying comparative value added, shared assets, emergent paths, and explainability.*

### 3. Run Module 5 Cross Case Intelligence Demo
```powershell
python demo.py --module 5
```

### 4. Run Module 4 Network Role Intelligence Demo
```powershell
python demo.py --module 4
```

### 5. Run Module 3 Hidden Connection Finder Demo
```powershell
python demo.py --module 3
```

### 6. Run All Intelligence Demos Sequentially
```powershell
python demo.py --module all
```

### 7. Run Module 2 Knowledge Graph Engine (Graph Summary)
```powershell
python main.py
```

### 8. Run Automated Test Suite (All 81 Tests)
```powershell
python -m pytest -v tests/
```
*(100% passing across Module 1 [15], Module 2 [13], Module 3 [14], Module 4 [13], Module 5 [13], and Module 6 [13])*

---

## 🧩 Module 6: Case Fusion Engine APIs

The `CaseFusionService` provides unified temporary analytical fusion:

```python
from case_fusion.fusion_service import CaseFusionService

service = CaseFusionService.get_instance()

# 1. Create a Temporary Case Fusion Session
fusion_id = service.create_fusion(["FIR001", "FIR003", "FIR007"])
print("Fusion Session:", fusion_id)                            # 'FC_001'

# 2. Execute Full Analytical Fusion
analysis = service.analyze_fusion(fusion_id)
print(f"Fusion Score: {analysis.score.fusion_score}")          # 91.0
print(f"Fusion Strength: {analysis.score.strength.value}")      # 'CRITICAL'
print(f"Total Entities: {analysis.metrics.total_entities}")    # 67
print(f"Total Relationships: {analysis.metrics.total_relationships}") # 104
print(f"Shared Entities: {analysis.metrics.shared_entities}")  # 8
print(f"Bridge Entities: {analysis.metrics.bridge_entities}")  # 3
print(f"Broker Nodes: {analysis.metrics.brokers}")              # 1

# 3. Retrieve Shared Criminal Infrastructure
shared = service.get_shared_entities(fusion_id)
print("Shared Phones:", shared.phones)                         # ['PH003', 'PH033']
print("Shared Accounts:", shared.accounts)                     # ['ACC003']

# 4. Discover Emergent Hidden Paths
paths = service.get_new_connections(fusion_id)
for p in paths[:3]:
    print(f"{p.source_case}:{p.source_entity} -> {p.target_case}:{p.target_entity} ({p.hops} hops)")

# 5. Court-Ready Forensic Explainability
reasons = service.get_fusion_explanation(fusion_id)
for r in reasons:
    print(" -", r)

# 6. Export 6 Standardized Intelligence Reports
reports = service.export_fusion_report(fusion_id, output_dir="reports")

# 7. Frontend Graph Visualization Payload
vis = service.get_visualization_payload(fusion_id)
```

---

## 🔗 Module 5: Cross Case Intelligence APIs

The `CrossCaseIntelligenceService` provides comprehensive cross-case discovery and syndicate clustering:

```python
from cross_case_intelligence.intelligence_service import CrossCaseIntelligenceService

service = CrossCaseIntelligenceService.get_instance()

# 1. Compare Two Cases (e.g. FIR001 and FIR007)
comp = service.compare_cases("FIR001", "FIR007")
print(f"Similarity Score: {comp.similarity_score}")           # 82.0
print(f"Connection Strength: {comp.connection_strength.value}") # CRITICAL
print(f"Shared Entities Count: {comp.shared_entities.total_shared}") # 3
print(f"Broker Identified: {comp.broker_id}")                 # P017
for reason in comp.reasons:
    print(f" - {reason}")

# 2. Extract Shared Entities Breakdown (Persons, Phones, Vehicles, Accounts, etc.)
overlap = service.find_shared_entities("FIR001", "FIR007")
print("Shared Persons:", overlap.shared_persons)             # ['P006', 'P021']
print("Shared Orgs:", overlap.shared_organizations)          # ['ORG001']

# 3. Discover Bridge Entities (with Module 4 Role Enrichment)
bridges = service.find_bridge_entities("FIR001", "FIR007")
for b in bridges:
    print(f"{b.entity_id} ({b.role}) - {b.bridge_type}")

# 4. Generate 10x10 Symmetric Similarity Matrix
sim_matrix = service.similarity_engine.get_similarity_matrix()
print(f"FIR001 <-> FIR007: {sim_matrix['FIR001']['FIR007']}") # 82.0

# 5. Detect Syndicate Case Clusters (Secondary Network)
clusters = service.detect_case_clusters()
for cl in clusters:
    print(f"Cluster {cl.cluster_id}: Lead={cl.lead_case}, Cases={cl.cases}, Cohesion={cl.internal_cohesion}")

# 6. Rank FIR Cases by Network Importance
rankings = service.rank_cases()
for r in rankings:
    print(f"{r.case_id} - Score: {r.importance_score:.1f}, Ties: {r.connected_cases_count}")

# 7. Export 5 Standardized Intelligence Reports to disk
reports = service.export_reports(output_dir="reports")

# 8. Export Node-Link Visualization Payload
payload = service.get_visualization_payload()
```

---

## 🧠 Module 4: Network Role Intelligence APIs

The `RoleService` provides high-performance cached access to role intelligence:

```python
from role_intelligence.role_service import RoleService

service = RoleService.get_instance()

# 1. Get classified role and forensic reasons for an entity
role_record = service.get_entity_role("P017")
print(f"Role: {role_record.role.value}")                # BROKER
print(f"Broker Score: {role_record.details.get('broker_score')}") # 94.0
print(f"Reasons: {role_record.reasons}")

# 2. Get Top Clandestine Brokers
top_brokers = service.get_top_brokers(limit=5)
for b in top_brokers:
    print(f"{b.entity_id} ({b.entity_name}) - Score: {b.details.get('broker_score')}")

# 3. Get Top Connectivity Hubs
top_hubs = service.get_top_hubs(limit=5)
for h in top_hubs:
    print(f"{h.entity_id} - Degree: {h.metrics.get('degree')}")

# 4. Get Top Global Influencers (0-100 Score)
top_influencers = service.get_top_influencers(limit=5)
for inf in top_influencers:
    print(f"{inf.entity_id} - Score: {inf.influence_score}")

# 5. Get Shared Resources & Financial Conduits
shared_assets = service.get_shared_resources()
conduits = service.get_financial_conduits()

# 6. Get Louvain Community Structure
community_struct = service.get_community_structure()
print(f"Communities: {community_struct.num_communities}, Modularity Q: {community_struct.modularity}")

# 7. Export 5 JSON Intelligence Reports
reports = service.export_reports(output_dir="reports")

# 8. Export Community Visualization JSON Payload
vis_graph = service.get_community_visualization_graph()
```

---

## 🕵️ Module 3: Hidden Connection Finder APIs

The `ConnectionService` provides direct and multi-hop graph path discovery:

```python
from graph_analytics.connection_service import ConnectionService

conn_service = ConnectionService.get_instance()

# 1. Discover Shortest Path Between Any Two Entities
response = conn_service.find_connection("P004", "P010", max_depth=6)
if response.connection_found:
    print(f"Path Length: {response.shortest_path.hop_count} hops")
    print(f"Connection Score: {response.shortest_path.score}/100")
    print(f"Explanation:\n{response.shortest_path.narrative_explanation}")

# 2. Discover Multiple Ranked Paths
multi_paths = conn_service.find_multiple_connections("P001", "P003", max_depth=4, limit=5)

# 3. Cross-Case Bridging
case_bridge = conn_service.find_case_connection("FIR002", "FIR005")

# 4. Verify Clandestine Broker Infrastructure
broker_audit = conn_service.verify_hidden_broker("P017")
```

---

## 🧩 Unified Graph Model & Data Integrity

NEXUS-Bharat models the investigation as a `networkx.MultiDiGraph`:
- **Directed Edges**: Captures operational flow (`USES`, `CONTACTED`, `TRANSFERRED_TO`, `OBSERVED_AT`, `MENTIONED_IN`, `MEMBER_OF`, `OWNS`, `VISITED`).
- **Multi-Edges**: Preserves recurring interactions (e.g. 32 calls in burst).
- **Unified Node System**: $126\text{ Entities} + 10\text{ FIR Cases} = \mathbf{136}\text{ Total Nodes}$.
- **Zero Data Loss**: All raw attributes (IMEI, IFSC, vehicle reg, coordinates, case status) are preserved.
- **Topological Statistics**: 136 nodes, 225 edges, 14 Louvain communities, modularity $Q=0.6694$.
