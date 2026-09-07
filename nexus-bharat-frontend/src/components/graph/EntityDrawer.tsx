"use client";

import React from "react";
import Link from "next/link";
import { X, GitBranch, Share2, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GraphEntity } from "@/types/graph";
import { NodeDetails } from "./NodeDetails";

export interface EntityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entity: GraphEntity | null;
  isLoading?: boolean;
  onExpandNeighbors?: (id: string) => void;
  onSelectEntity?: (id: string) => void;
}

export function EntityDrawer({
  isOpen,
  onClose,
  entity,
  isLoading,
  onExpandNeighbors,
  onSelectEntity,
}: EntityDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 md:w-[440px] bg-white/95 backdrop-blur-2xl border-l border-slate-200 shadow-[-12px_0_40px_rgba(15,23,42,0.08)] flex flex-col justify-between"
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4.5 bg-white/50">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                INTELLIGENCE DOSSIER
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                Target Node Inspector
              </h3>
            </div>

            <button
              onClick={onClose}
              aria-label="Close intelligence drawer"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-28 rounded-2xl bg-slate-100 border border-slate-200" />
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="h-16 rounded-xl bg-slate-100 border border-slate-200" />
                  <div className="h-16 rounded-xl bg-slate-100 border border-slate-200" />
                  <div className="h-16 rounded-xl bg-slate-100 border border-slate-200" />
                </div>
                <div className="h-32 rounded-xl bg-slate-100 border border-slate-200" />
              </div>
            ) : entity ? (
              <NodeDetails entity={entity} onNavigateEntity={onSelectEntity} />
            ) : (
              <div className="py-20 text-center text-xs font-mono text-slate-400">
                NO TARGET NODE SELECTED
              </div>
            )}
          </div>

          {/* Drawer Footer Actions */}
          {entity && (
            <div className="border-t border-slate-200 p-5 bg-slate-50/80 backdrop-blur-sm space-y-2.5">
              {/* Primary Deep Investigation Workspace Navigation */}
              <Link
                href={`/entity/${entity.id}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-bold transition-all shadow-sm font-mono w-full group"
              >
                <ExternalLink className="h-4 w-4 text-blue-100 group-hover:translate-x-0.5 transition-transform" />
                <span>VIEW DETAILS &amp; FULL DOSSIER</span>
              </Link>

              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href={`/connection-finder?source=${entity.id}`}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors font-mono shadow-xs"
                >
                  <GitBranch className="h-3.5 w-3.5 text-blue-600" />
                  <span>Trace Paths</span>
                </Link>

                {onExpandNeighbors && (
                  <button
                    onClick={() => onExpandNeighbors(entity.id)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors font-mono shadow-xs"
                  >
                    <Share2 className="h-3.5 w-3.5 text-blue-600" />
                    <span>Expand Links</span>
                  </button>
                )}
              </div>

              <div className="text-[10px] font-mono text-center text-slate-400 pt-1">
                CLASSIFICATION: RESTRICTED // LEA INVESTIGATION
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

