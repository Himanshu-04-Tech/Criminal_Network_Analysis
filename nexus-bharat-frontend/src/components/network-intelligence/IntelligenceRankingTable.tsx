"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Shield,
  Phone,
  CreditCard,
  Building,
  Car,
  MapPin,
  X,
} from "lucide-react";
import { RankedEntity, EntityType } from "@/types";
import { RoleBadge } from "./RoleBadge";

export interface IntelligenceRankingTableProps {
  entities: RankedEntity[];
}

type SortField =
  | "rank"
  | "influenceScore"
  | "brokerScore"
  | "riskScore"
  | "connections"
  | "cases";

export function IntelligenceRankingTable({ entities }: IntelligenceRankingTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [selectedRiskTier, setSelectedRiskTier] = useState<string>("ALL");
  const [sortField, setSortField] = useState<SortField>("influenceScore");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const getEntityIcon = (type: EntityType) => {
    switch (type) {
      case "PERSON":
        return <Shield className="h-3.5 w-3.5 text-blue-600" />;
      case "PHONE":
        return <Phone className="h-3.5 w-3.5 text-cyan-600" />;
      case "ACCOUNT":
      case "BANK_ACCOUNT":
        return <CreditCard className="h-3.5 w-3.5 text-emerald-600" />;
      case "VEHICLE":
        return <Car className="h-3.5 w-3.5 text-amber-600" />;
      case "ORGANIZATION":
        return <Building className="h-3.5 w-3.5 text-rose-600" />;
      case "LOCATION":
        return <MapPin className="h-3.5 w-3.5 text-purple-600" />;
      default:
        return <Shield className="h-3.5 w-3.5 text-blue-600" />;
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 90) return "text-red-700 border-red-200 bg-red-50";
    if (score >= 70) return "text-amber-800 border-amber-200 bg-amber-50";
    if (score >= 40) return "text-blue-700 border-blue-200 bg-blue-50";
    return "text-emerald-700 border-emerald-200 bg-emerald-50";
  };

  // Filter & Sort Pipeline
  const filteredAndSortedEntities = useMemo(() => {
    return entities
      .filter((entity) => {
        // Search filter
        const matchesSearch =
          entity.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entity.jurisdiction.toLowerCase().includes(searchTerm.toLowerCase());

        // Role filter
        const matchesRole =
          selectedRole === "ALL" || entity.role.toUpperCase() === selectedRole.toUpperCase();

        // Risk filter
        let matchesRisk = true;
        if (selectedRiskTier === "CRITICAL") matchesRisk = entity.riskScore >= 90;
        else if (selectedRiskTier === "HIGH") matchesRisk = entity.riskScore >= 70 && entity.riskScore < 90;
        else if (selectedRiskTier === "MEDIUM") matchesRisk = entity.riskScore >= 40 && entity.riskScore < 70;
        else if (selectedRiskTier === "LOW") matchesRisk = entity.riskScore < 40;

        return matchesSearch && matchesRole && matchesRisk;
      })
      .sort((a, b) => {
        let valA: number = 0;
        let valB: number = 0;

        if (sortField === "cases") {
          valA = a.cases.length;
          valB = b.cases.length;
        } else {
          valA = a[sortField];
          valB = b[sortField];
        }

        if (sortDirection === "asc") {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });
  }, [entities, searchTerm, selectedRole, selectedRiskTier, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-slate-400" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 text-blue-600" />
    ) : (
      <ArrowDown className="h-3 w-3 text-blue-600" />
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedRole("ALL");
    setSelectedRiskTier("ALL");
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs font-mono overflow-hidden">
      {/* Table Control Header */}
      <div className="p-6 border-b border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Comprehensive Intelligence Ranking Matrix
              </h3>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700">
                {filteredAndSortedEntities.length} TARGETS
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-dimensional centrality ranking with real-time client-side sorting and investigative filtering
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ID, name, or station..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8.5 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-2xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100 text-xs">
          {/* Role Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-slate-400 uppercase font-semibold mr-1">
              Role:
            </span>
            {["ALL", "BROKER", "HUB", "INFLUENCER", "CONNECTOR", "RESOURCE_CONTROLLER"].map(
              (role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    selectedRole === role
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200"
                  }`}
                >
                  {role === "RESOURCE_CONTROLLER" ? "CONTROLLER" : role}
                </button>
              )
            )}
          </div>

          {/* Risk Level Filter Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 uppercase font-semibold mr-1">
              Threat:
            </span>
            {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedRiskTier(tier)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  selectedRiskTier === tier
                    ? "bg-amber-600 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200"
                }`}
              >
                {tier}
              </button>
            ))}

            {(selectedRole !== "ALL" || selectedRiskTier !== "ALL" || searchTerm) && (
              <button
                onClick={resetFilters}
                className="text-[10px] text-red-600 hover:text-red-800 ml-2 font-semibold underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              <th
                onClick={() => handleSort("rank")}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center gap-1">
                  <span>Rank</span>
                  {getSortIcon("rank")}
                </div>
              </th>
              <th className="py-3.5 px-4">Target Entity</th>
              <th className="py-3.5 px-4">Assigned Role</th>
              <th
                onClick={() => handleSort("influenceScore")}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center gap-1">
                  <span>Influence</span>
                  {getSortIcon("influenceScore")}
                </div>
              </th>
              <th
                onClick={() => handleSort("brokerScore")}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center gap-1">
                  <span>Broker Score</span>
                  {getSortIcon("brokerScore")}
                </div>
              </th>
              <th
                onClick={() => handleSort("riskScore")}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center gap-1">
                  <span>Risk Score</span>
                  {getSortIcon("riskScore")}
                </div>
              </th>
              <th
                onClick={() => handleSort("cases")}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center gap-1">
                  <span>FIR Cases</span>
                  {getSortIcon("cases")}
                </div>
              </th>
              <th
                onClick={() => handleSort("connections")}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center gap-1">
                  <span>Links</span>
                  {getSortIcon("connections")}
                </div>
              </th>
              <th className="py-3.5 px-4 text-right">Dossier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAndSortedEntities.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                  No criminal entities matching the selected criteria.
                </td>
              </tr>
            ) : (
              filteredAndSortedEntities.map((e) => (
                <tr
                  key={e.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Rank */}
                  <td className="py-3.5 px-4 font-bold">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-black ${
                        e.rank === 1
                          ? "bg-amber-400 text-amber-950 shadow-2xs"
                          : e.rank === 2
                          ? "bg-slate-200 text-slate-800"
                          : e.rank === 3
                          ? "bg-amber-700 text-white"
                          : "text-slate-400"
                      }`}
                    >
                      {e.rank}
                    </span>
                  </td>

                  {/* Target Entity */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 shadow-2xs">
                        {getEntityIcon(e.type)}
                      </div>
                      <div>
                        <Link
                          href={`/entity/${e.id}`}
                          className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1"
                        >
                          <span>{e.id}</span>
                        </Link>
                        <div className="text-[11px] text-slate-500 font-medium truncate max-w-[130px]">
                          {e.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="py-3.5 px-4">
                    <RoleBadge role={e.role} />
                  </td>

                  {/* Influence Score */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-700 text-xs">
                        {e.influenceScore}
                      </span>
                      <div className="w-14 h-1.5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${e.influenceScore}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Broker Score */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-700 text-xs">
                        {e.brokerScore}
                      </span>
                      <div className="w-14 h-1.5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${e.brokerScore}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Risk Score */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full border text-[10px] ${getRiskColor(
                        e.riskScore
                      )}`}
                    >
                      {e.riskScore}
                    </span>
                  </td>

                  {/* Cases */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {e.cases.map((c) => (
                        <span
                          key={c}
                          className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[9px] text-blue-700 font-semibold"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Connections */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-indigo-700">{e.connections}</span>
                    <span className="text-[10px] text-slate-400 ml-1">links</span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/entity/${e.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-blue-700 transition-all text-[11px] font-semibold shadow-2xs"
                    >
                      <span>Profile</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Classification */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
        <span>RESTRICTED LAW ENFORCEMENT INTELLIGENCE DATASET</span>
        <span>SHOWING {filteredAndSortedEntities.length} OF {entities.length} TARGETS</span>
      </div>
    </div>
  );
}

