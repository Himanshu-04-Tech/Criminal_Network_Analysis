"use client";

import React, { use } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  RefreshCw,
  Share2,
  FolderLock,
  Compass,
} from "lucide-react";
import {
  getEntity,
  getEntityRelationships,
  getEntityCases,
  getEntityTimeline,
  getRelatedEntities,
} from "@/services/entity";
import {
  EntityHeader,
  EntitySummary,
  EntityRoleCard,
  RiskScoreCard,
  RelationshipPanel,
  CasePanel,
  TimelinePanel,
  RelatedEntities,
  EntityMetrics,
  InvestigationNotes,
} from "@/components/entity";

export default function EntityWorkspacePage() {
  const params = useParams();
  const router = useRouter();

  const rawId = params?.id;
  const entityId = Array.isArray(rawId) ? rawId[0] : (rawId as string) || "P017";

  // Queries
  const {
    data: entity,
    isLoading: loadingEntity,
    error: entityError,
    refetch: refetchEntity,
  } = useQuery({
    queryKey: ["entity", entityId],
    queryFn: () => getEntity(entityId),
  });

  const { data: relationships = [], isLoading: loadingRel } = useQuery({
    queryKey: ["entity-relationships", entityId],
    queryFn: () => getEntityRelationships(entityId),
  });

  const { data: cases = [], isLoading: loadingCases } = useQuery({
    queryKey: ["entity-cases", entityId],
    queryFn: () => getEntityCases(entityId),
  });

  const { data: timeline = [], isLoading: loadingTimeline } = useQuery({
    queryKey: ["entity-timeline", entityId],
    queryFn: () => getEntityTimeline(entityId),
  });

  const { data: related = [], isLoading: loadingRelated } = useQuery({
    queryKey: ["entity-related", entityId],
    queryFn: () => getRelatedEntities(entityId),
  });

  // Loading Skeleton
  if (loadingEntity) {
    return (
      <div className="min-h-screen bg-[#0B1020] text-[#E5E7EB] p-6 space-y-6">
        {/* Navigation Breadcrumb Skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-6 w-32 bg-[#111827] rounded animate-pulse" />
        </div>

        {/* Header Skeleton */}
        <div className="h-44 rounded-xl bg-[#111827] border border-[#1F2937] p-6 animate-pulse space-y-4">
          <div className="flex justify-between">
            <div className="space-y-2">
              <div className="h-5 w-40 bg-[#1F2937] rounded" />
              <div className="h-8 w-64 bg-[#1F2937] rounded" />
            </div>
            <div className="h-10 w-48 bg-[#1F2937] rounded" />
          </div>
        </div>

        {/* 3 Column Top Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-72 rounded-xl bg-[#111827] border border-[#1F2937] animate-pulse" />
          <div className="h-72 rounded-xl bg-[#111827] border border-[#1F2937] animate-pulse" />
          <div className="h-72 rounded-xl bg-[#111827] border border-[#1F2937] animate-pulse" />
        </div>

        {/* 2 Column Middle Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 rounded-xl bg-[#111827] border border-[#1F2937] animate-pulse" />
          <div className="h-96 rounded-xl bg-[#111827] border border-[#1F2937] animate-pulse" />
        </div>
      </div>
    );
  }

  // Error State
  if (entityError || !entity) {
    return (
      <div className="min-h-screen bg-[#0B1020] text-[#E5E7EB] p-8 flex flex-col items-center justify-center font-mono">
        <div className="max-w-md w-full rounded-xl border border-red-500/40 bg-[#111827] p-8 text-center space-y-4 shadow-2xl">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">
            DOSSIER RETRIEVAL FAILED
          </h2>
          <p className="text-xs text-gray-400">
            Target entity identifier <span className="text-amber-400 font-bold">{entityId}</span>{" "}
            could not be resolved in active intelligence repositories.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => refetchEntity()}
              className="flex items-center justify-center gap-2 rounded-lg border border-[#1F2937] bg-[#0B1020] px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-[#1F2937] transition-colors"
            >
              <RefreshCw className="h-4 w-4" /> Retry Query
            </button>
            <Link
              href="/network-explorer"
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-xs font-bold transition-colors"
            >
              <Compass className="h-4 w-4" /> Return to Explorer
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#E5E7EB] pb-16 font-sans">
      {/* Top Breadcrumb Bar */}
      <div className="border-b border-[#1F2937] bg-[#0B1020]/90 backdrop-blur sticky top-0 z-40 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-3">
            <Link
              href="/network-explorer"
              className="flex items-center gap-1.5 text-gray-400 hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>NETWORK EXPLORER</span>
            </Link>
            <span className="text-gray-600">/</span>
            <Link
              href="/entity"
              className="text-gray-400 hover:text-blue-400 transition-colors"
            >
              ROLE DIRECTORY
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-blue-400 font-bold tracking-wider">
              {entity.id} ({entity.name})
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-gray-400">
            <FolderLock className="h-3.5 w-3.5 text-amber-500" />
            <span>CASE VAULT: RESTRICTED LEVEL 3</span>
          </div>
        </div>
      </div>

      {/* Main Content Workspace */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* 1. Entity Header */}
        <section>
          <EntityHeader profile={entity} />
        </section>

        {/* 2. Top Overview Row: 3 Panels */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <EntitySummary profile={entity} />
          <EntityRoleCard profile={entity} />
          <RiskScoreCard profile={entity} />
        </section>

        {/* 3. Deep Investigation Row: Relationships & Cases */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RelationshipPanel relationships={relationships} />
          <CasePanel cases={cases} />
        </section>

        {/* 4. Temporal Intelligence Event Timeline */}
        <section>
          <TimelinePanel timeline={timeline} />
        </section>

        {/* 5. 1-Hop Connected Entities Grid */}
        <section>
          <RelatedEntities related={related} />
        </section>

        {/* 6. Structural Metrics & Field Officer Notes */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EntityMetrics profile={entity} />
          <InvestigationNotes
            entityId={entity.id}
            initialNotes={entity.notes || entity.notesSummary}
          />
        </section>
      </main>
    </div>
  );
}
