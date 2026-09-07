"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Phone,
  CreditCard,
  Building,
  Car,
  MapPin,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Info,
  CheckCircle2,
  Calendar,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ConnectionPath, PathNode, PathEdge, EntityType } from "@/types";

export interface PathVisualizationProps {
  path: ConnectionPath;
  onSelectNode?: (node: PathNode) => void;
}

export function PathVisualization({ path, onSelectNode }: PathVisualizationProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const getNodeIcon = (type: EntityType) => {
    switch (type) {
      case "PERSON":
        return <Shield className="h-4 w-4 text-blue-400" />;
      case "PHONE":
        return <Phone className="h-4 w-4 text-cyan-400" />;
      case "ACCOUNT":
      case "BANK_ACCOUNT":
        return <CreditCard className="h-4 w-4 text-emerald-400" />;
      case "VEHICLE":
        return <Car className="h-4 w-4 text-amber-400" />;
      case "ORGANIZATION":
        return <Building className="h-4 w-4 text-red-400" />;
      case "LOCATION":
        return <MapPin className="h-4 w-4 text-purple-400" />;
      default:
        return <Shield className="h-4 w-4 text-blue-400" />;
    }
  };

  const getNodeBorderColor = (type: EntityType, isBridge?: boolean) => {
    if (isBridge) return "border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/50";
    switch (type) {
      case "PERSON":
        return "border-blue-500/40 hover:border-blue-500";
      case "PHONE":
        return "border-cyan-500/40 hover:border-cyan-500";
      case "ACCOUNT":
      case "BANK_ACCOUNT":
        return "border-emerald-500/40 hover:border-emerald-500";
      case "VEHICLE":
        return "border-amber-500/40 hover:border-amber-500";
      case "ORGANIZATION":
        return "border-red-500/40 hover:border-red-500";
      case "LOCATION":
        return "border-purple-500/40 hover:border-purple-500";
      default:
        return "border-[#1F2937] hover:border-blue-500/50";
    }
  };

  const selectedNode = path.nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-6 shadow-2xl font-mono">
      {/* Visual Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#1F2937]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Multi-Hop Discovery Chain
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400">
                {path.hops} HOPS
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Interactive horizontal topology flow from {path.source} to {path.target}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-gray-400">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          <span className="text-amber-400 font-semibold">Glowing = Critical Bridge Entity</span>
        </div>
      </div>

      {/* Horizontal Flow Container */}
      <div className="py-8 overflow-x-auto">
        <div className="flex items-center justify-start min-w-[900px] px-4 gap-2">
          {path.nodes.map((node, index) => {
            const edge = path.edges[index]; // edge leaving this node
            const isSelected = selectedNodeId === node.id;

            return (
              <React.Fragment key={node.id}>
                {/* Node Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, delay: index * 0.08 }}
                  onClick={() => {
                    setSelectedNodeId(isSelected ? null : node.id);
                    if (onSelectNode) onSelectNode(node);
                  }}
                  className={`relative flex-shrink-0 w-52 rounded-xl bg-[#0B1020] border p-4 cursor-pointer transition-all duration-200 hover:-translate-y-1 ${getNodeBorderColor(
                    node.type,
                    node.isBridge
                  )} ${isSelected ? "ring-2 ring-blue-400" : ""}`}
                >
                  {/* Bridge Beacon Badge */}
                  {node.isBridge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[9px] font-extrabold text-black uppercase tracking-wider shadow-lg">
                      <ShieldAlert className="h-3 w-3" />
                      <span>BRIDGE ENTITY</span>
                    </div>
                  )}

                  {/* Top Node Row: Icon + Type + Risk */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#111827] border border-[#1F2937]">
                        {getNodeIcon(node.type)}
                      </div>
                      <span className="text-[10px] text-gray-400 font-semibold uppercase">
                        {node.type}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        node.riskScore >= 90
                          ? "border-red-500/30 bg-red-500/10 text-red-400"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {node.riskScore}
                    </span>
                  </div>

                  {/* Identifier & Name */}
                  <div className="mt-3">
                    <div className="text-sm font-bold text-white truncate">{node.id}</div>
                    <div className="text-xs text-gray-400 truncate mt-0.5" title={node.name}>
                      {node.name}
                    </div>
                  </div>

                  {/* Role Tag */}
                  <div className="mt-3 pt-2.5 border-t border-[#1F2937] flex items-center justify-between text-[10px]">
                    <span className="text-gray-400 truncate max-w-[120px]">
                      {node.role || "ASSOCIATE"}
                    </span>
                    <Link
                      href={`/entity/${node.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      title="Open Full Dossier"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </motion.div>

                {/* Edge Connector (Arrow with relationship tag) */}
                {edge && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    transition={{ duration: 0.35, delay: index * 0.08 + 0.04 }}
                    className="flex flex-col items-center justify-center flex-shrink-0 px-2 min-w-[140px]"
                  >
                    {/* Relationship Badge */}
                    <div className="rounded-md border border-cyan-500/30 bg-[#0B1020] px-2.5 py-1 text-center shadow-lg hover:border-cyan-400 transition-colors">
                      <div className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                        {edge.relationshipType}
                      </div>
                      <div className="text-[9px] text-emerald-400 font-semibold mt-0.5">
                        {edge.confidence}% match
                      </div>
                    </div>

                    {/* Animated Directional Flow Line */}
                    <div className="relative flex items-center w-full my-2">
                      <div className="h-[2px] w-full bg-gradient-to-r from-[#1F2937] via-cyan-500 to-[#1F2937] relative">
                        <div className="absolute inset-0 bg-cyan-400/40 blur-[1px] animate-pulse" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-cyan-400 -ml-2" />
                    </div>

                    {/* Date/Case if available */}
                    {edge.date && (
                      <span className="text-[9px] text-gray-400 flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5" />
                        {edge.date}
                      </span>
                    )}
                  </motion.div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Selected Node Inspector Flyout */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-[#1F2937] bg-[#0B1020] p-4 rounded-xl space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">
                  {selectedNode.id} — {selectedNode.name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded border border-blue-500/30 bg-blue-500/10 text-blue-300">
                  {selectedNode.role}
                </span>
                {selectedNode.isBridge && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                    CRITICAL BROKER / BRIDGE
                  </span>
                )}
              </div>

              <Link
                href={`/entity/${selectedNode.id}`}
                className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300"
              >
                <span>Open Full Intelligence Dossier</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>

            <p className="text-gray-300 leading-relaxed text-[11px]">
              {selectedNode.details || "Subject monitored in relation to multi-jurisdiction criminal network."}
            </p>

            {selectedNode.cases && selectedNode.cases.length > 0 && (
              <div className="flex items-center gap-2 pt-1 text-[10px]">
                <span className="text-gray-400">LINKED FIR CASES:</span>
                {selectedNode.cases.map((c) => (
                  <span
                    key={c}
                    className="px-1.5 py-0.5 rounded bg-[#111827] border border-[#1F2937] text-blue-300 font-semibold"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
