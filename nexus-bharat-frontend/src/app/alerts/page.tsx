"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Filter,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  Search,
  ExternalLink
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { IntelligenceCard } from "@/components/cards/IntelligenceCard";

export default function AlertsPage() {
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");

  const alerts = [
    {
      id: "ALT-001",
      title: "COMMUNICATION_BURST: High-Frequency Pre-Operation Surge",
      description: "Tactical burner communication surge detected: 37 calls exchanged over a 6.0-hour window (frequency 6.2 calls/hour vs normal baseline of 2 calls/day). Directly precedes multi-account money laundering wire transfers.",
      severity: "CRITICAL" as const,
      timestamp: "2026-08-13T10:00:00Z",
      caseId: "FIR001",
      entityTags: ["P001 (Leader)", "P017 (Broker)", "PH001", "PH016"],
    },
    {
      id: "ALT-002",
      title: "FINANCIAL_FAN_OUT: Rapid Account Structuring",
      description: "Rapid fund dissipation identified: Source account ACC001 dispersed capital to 4 target accounts (ACC002, ACC003, ACC004, ACC005) in 43.0 minutes. Classic mule distribution typology before freeze orders.",
      severity: "HIGH" as const,
      timestamp: "2026-08-10T14:05:00Z",
      caseId: "FIR001",
      entityTags: ["ACC001", "ACC002", "ACC003", "ACC004", "ACC005"],
    },
    {
      id: "ALT-003",
      title: "CIRCULAR_FINANCIAL_FLOW: Multi-Hop Layering Loop",
      description: "Illicit capital completed a circular route through accounts: ACC012 -> ACC013 -> ACC014 -> ACC012 within 5.5 hours. Round-tripping transactions create deceptive layers of commercial legitimacy.",
      severity: "HIGH" as const,
      timestamp: "2026-08-12T09:15:00Z",
      caseId: "FIR002",
      entityTags: ["ACC012", "ACC013", "ACC014"],
    },
    {
      id: "ALT-004",
      title: "FINANCIAL_FAN_IN: Illicit Proceeds Aggregation",
      description: "Rapid pooling of illicit proceeds: Target account ACC009 received 3 incoming transfers from ACC007, ACC008, ACC010 in under 20.0 minutes. Collection phase prior to bulk offshore remittance.",
      severity: "HIGH" as const,
      timestamp: "2026-08-11T16:05:00Z",
      caseId: "FIR006",
      entityTags: ["ACC007", "ACC008", "ACC010", "ACC009"],
    },
    {
      id: "ALT-005",
      title: "EMERGENT_INTER_STATE_BROKER: P020 Activated",
      description: "Entity P020 developed cross-cluster bridging connections between FIR003 (Mumbai) and FIR007 (Ahmedabad) syndicate cells. Betweenness metric surged 340%.",
      severity: "CRITICAL" as const,
      timestamp: "2026-08-15T08:30:00Z",
      caseId: "FIR003/FIR007",
      entityTags: ["P020", "ACC018", "ORG002"],
    },
  ];

  const filteredAlerts = alerts.filter(
    (a) => selectedSeverity === "ALL" || a.severity === selectedSeverity
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tactical Intelligence Alerts"
        subtitle="Heuristic and topological anomaly detection stream across cross-jurisdictional syndicate graphs."
        badge="5 ACTIVE ANOMALIES"
        badgeColor="bg-red-500/10 text-red-400 border-red-500/30"
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1F2937] bg-[#111827] p-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-gray-400 uppercase mr-1">Severity:</span>
          {["ALL", "CRITICAL", "HIGH", "MODERATE", "LOW"].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`rounded-lg px-2.5 py-1 text-xs font-mono transition-colors ${
                selectedSeverity === sev
                  ? "bg-red-600 text-white font-semibold"
                  : "bg-[#0B1020] text-gray-400 hover:text-white border border-[#1F2937]"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <span className="text-xs font-mono text-gray-400">
          Showing {filteredAlerts.length} of {alerts.length} Detected Alerts
        </span>
      </div>

      {/* Alerts Stream */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <IntelligenceCard
            key={alert.id}
            title={alert.title}
            description={alert.description}
            severity={alert.severity}
            timestamp={alert.timestamp}
            caseId={alert.caseId}
            entityTags={alert.entityTags}
          />
        ))}
      </div>
    </div>
  );
}
