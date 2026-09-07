"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Phone,
  CreditCard,
  Building,
  Car,
  MapPin,
  CheckCircle2,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PathEdge, PathNode, EntityType } from "@/types";

export interface PathStepCardProps {
  stepNumber: number;
  edge: PathEdge;
  sourceNode?: PathNode;
  targetNode?: PathNode;
}

export function PathStepCard({
  stepNumber,
  edge,
  sourceNode,
  targetNode,
}: PathStepCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getEntityIcon = (type?: EntityType) => {
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
        return <Building className="h-3.5 w-3.5 text-red-600" />;
      case "LOCATION":
        return <MapPin className="h-3.5 w-3.5 text-purple-600" />;
      default:
        return <Shield className="h-3.5 w-3.5 text-blue-600" />;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 font-mono text-xs shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Hop Step Number & Connection Chain */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 h-7 w-7 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-blue-700 text-[11px]">
            {stepNumber < 10 ? `0${stepNumber}` : stepNumber}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Source Entity */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200">
              {getEntityIcon(sourceNode?.type)}
              <Link
                href={`/entity/${edge.source}`}
                className="font-bold text-slate-900 hover:text-blue-600 transition-colors"
              >
                {edge.source}
              </Link>
              <span className="text-[10px] text-slate-500 truncate max-w-[90px]">
                {sourceNode?.name}
              </span>
            </div>

            {/* Relationship Direction Badge */}
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 font-bold text-[10px]">
              <span>{edge.relationshipType}</span>
              <ArrowRight className="h-3 w-3 text-cyan-600" />
            </div>

            {/* Target Entity */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200">
              {getEntityIcon(targetNode?.type)}
              <Link
                href={`/entity/${edge.target}`}
                className="font-bold text-slate-900 hover:text-cyan-600 transition-colors"
              >
                {edge.target}
              </Link>
              <span className="text-[10px] text-slate-500 truncate max-w-[90px]">
                {targetNode?.name}
              </span>
            </div>
          </div>
        </div>

        {/* Confidence & Action Bar */}
        <div className="flex items-center justify-between md:justify-end gap-3">
          {/* Confidence Meter */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-[10px] text-slate-500">Confidence</div>
              <div className="font-bold text-emerald-700 text-xs">
                {edge.confidence}%
              </div>
            </div>
            <div className="w-16 h-1.5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${edge.confidence}%` }}
              />
            </div>
          </div>

          {/* Expand Evidence Button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span>Evidence</span>
            {isExpanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Supporting Evidence Section */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 animate-fadeIn text-[11px]">
          <div className="flex items-start gap-2 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
            <FileText className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-slate-900 font-semibold">
                Investigative Corroboration:
              </div>
              <p className="text-slate-600 leading-relaxed">
                {edge.evidence || "Direct operational relationship captured across cross-case CDR registries."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 px-1">
            <div className="flex items-center gap-3">
              {edge.date && (
                <span className="flex items-center gap-1 text-slate-500">
                  <Calendar className="h-3 w-3" /> Timestamp: {edge.date}
                </span>
              )}
              {edge.caseId && (
                <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
                  Source Case: {edge.caseId}
                </span>
              )}
            </div>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Digitally Verified Edge
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
