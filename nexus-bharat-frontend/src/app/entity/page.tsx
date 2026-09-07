"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Search,
  Filter,
  UserCheck,
  Phone,
  CreditCard,
  Building,
  TrendingUp,
  AlertOctagon,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";

export default function RoleIntelligencePage() {
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const classifiedEntities = [
    {
      id: "P017",
      name: "Arjun Verma",
      type: "PERSON",
      role: "BROKER",
      confidence: 0.94,
      cases: ["FIR001", "FIR003"],
      explanation: "Highest betweenness centrality (0.412) in fused graph. Bridges cyber extortion cell and Hawala remittance network.",
      metrics: { degree: 11, betweenness: 0.412, pagerank: 0.082 },
      threatLevel: "CRITICAL",
    },
    {
      id: "P020",
      name: "Rajesh Shrivastav",
      type: "PERSON",
      role: "BROKER",
      confidence: 0.89,
      cases: ["FIR003", "FIR007"],
      explanation: "Facilitates contraband logistics financing through shell account ACC018. Connects Mumbai cell to Ahmedabad ring.",
      metrics: { degree: 9, betweenness: 0.354, pagerank: 0.065 },
      threatLevel: "HIGH",
    },
    {
      id: "P001",
      name: "Vikram Malhotra",
      type: "PERSON",
      role: "HUB",
      confidence: 0.97,
      cases: ["FIR001"],
      explanation: "Dominant degree centrality (14 incident edges). Controls operational commands, bank conduits, and primary burners.",
      metrics: { degree: 14, betweenness: 0.281, pagerank: 0.115 },
      threatLevel: "CRITICAL",
    },
    {
      id: "ACC018",
      name: "ICICI ...9012",
      type: "BANK_ACCOUNT",
      role: "FINANCIAL_CONDUIT",
      confidence: 0.92,
      cases: ["FIR003", "FIR007"],
      explanation: "Layering funnel account receiving aggregated funds from multiple mule branches before offshore wire dissipation.",
      metrics: { degree: 8, betweenness: 0.298, pagerank: 0.058 },
      threatLevel: "CRITICAL",
    },
    {
      id: "PH016",
      name: "+91 98220 54321",
      type: "PHONE",
      role: "SHARED_RESOURCE",
      confidence: 0.88,
      cases: ["FIR001", "FIR003"],
      explanation: "Single hardware IMEI communicating across both FIR001 syndicate leaders and FIR003 hawala couriers.",
      metrics: { degree: 7, betweenness: 0.195, pagerank: 0.044 },
      threatLevel: "HIGH",
    },
    {
      id: "P005",
      name: "Dinesh Rawat",
      type: "PERSON",
      role: "CONNECTOR",
      confidence: 0.79,
      cases: ["FIR001"],
      explanation: "Sub-lieutenant coordinating field mule recruitments across localized NCR sectors.",
      metrics: { degree: 6, betweenness: 0.124, pagerank: 0.038 },
      threatLevel: "MODERATE",
    },
  ];

  const rolesList = [
    "ALL",
    "BROKER",
    "HUB",
    "CONNECTOR",
    "FINANCIAL_CONDUIT",
    "SHARED_RESOURCE",
    "HIGH_INFLUENCE",
  ];

  const filteredEntities = classifiedEntities.filter((entity) => {
    const matchesRole = selectedRole === "ALL" || entity.role === selectedRole;
    const matchesSearch =
      entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Network Role Intelligence"
        subtitle="Graph-algorithmic topological role classification (Broker, Hub, Connector, Conduit) with transparent explainability."
        badge="MODULE 4 // ROLE ENGINE"
        badgeColor="bg-amber-500/10 text-amber-400 border-amber-500/30"
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1F2937] bg-[#111827] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-gray-400 uppercase mr-1">Filter Role:</span>
          {rolesList.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`rounded-lg px-2.5 py-1 text-xs font-mono transition-colors ${
                selectedRole === role
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold"
                  : "bg-[#0B1020] text-gray-400 hover:text-white border border-[#1F2937]"
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Entity ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-[#1F2937] bg-[#0B1020] pl-8 pr-3 py-1.5 text-xs font-mono text-gray-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Role Dossier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEntities.map((entity) => (
          <div
            key={entity.id}
            className="flex flex-col justify-between rounded-xl border border-[#1F2937] bg-[#111827] p-5 hover:border-gray-600 transition-colors"
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">{entity.id}</span>
                    <span
                      className={`rounded px-1.5 py-0.2 text-[9px] font-mono font-bold border ${
                        entity.threatLevel === "CRITICAL"
                          ? "border-red-500/30 bg-red-500/10 text-red-400"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {entity.threatLevel}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#E5E7EB] mt-0.5">{entity.name}</h3>
                </div>

                <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] font-mono font-bold text-amber-300">
                  {entity.role}
                </span>
              </div>

              {/* Explainable Logic */}
              <p className="text-xs text-gray-300 leading-relaxed bg-[#0B1020] p-3 rounded-lg border border-[#1F2937]">
                {entity.explanation}
              </p>

              {/* Centrality Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono border-t border-[#1F2937] pt-3">
                <div className="rounded bg-[#0B1020] p-1.5 border border-[#1F2937]/80">
                  <div className="text-[9px] text-gray-400">Degree</div>
                  <div className="text-emerald-400 font-bold">{entity.metrics.degree}</div>
                </div>
                <div className="rounded bg-[#0B1020] p-1.5 border border-[#1F2937]/80">
                  <div className="text-[9px] text-gray-400">Betweenness</div>
                  <div className="text-amber-400 font-bold">{entity.metrics.betweenness}</div>
                </div>
                <div className="rounded bg-[#0B1020] p-1.5 border border-[#1F2937]/80">
                  <div className="text-[9px] text-gray-400">PageRank</div>
                  <div className="text-blue-400 font-bold">{entity.metrics.pagerank}</div>
                </div>
              </div>
            </div>

            {/* Cases Tag Footer & Action */}
            <div className="mt-4 pt-3 border-t border-[#1F2937] flex items-center justify-between text-xs">
              <div className="flex gap-1.5">
                {entity.cases.map((c) => (
                  <span
                    key={c}
                    className="rounded bg-blue-900/30 border border-blue-500/30 px-1.5 py-0.5 text-[10px] font-mono text-blue-300"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <Link
                href={`/entity/${entity.id}`}
                className="flex items-center gap-1 text-[11px] font-mono text-blue-400 hover:text-blue-300 font-semibold transition-colors group"
              >
                <span>Dossier</span>
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
