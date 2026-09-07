"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import {
  Download,
  FileJson,
  FileText,
  RotateCcw,
  Check,
  Sparkles,
  Layers,
} from "lucide-react";
import { FusionResult } from "@/types";

interface FusionHeaderProps {
  fusionResult: FusionResult | null;
  onExportJSON: () => void;
  onExportPDF: () => void;
  onReset: () => void;
}

export const FusionHeader: React.FC<FusionHeaderProps> = ({
  fusionResult,
  onExportJSON,
  onExportPDF,
  onReset,
}) => {
  const [jsonDownloaded, setJsonDownloaded] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  const handleJsonClick = () => {
    onExportJSON();
    setJsonDownloaded(true);
    setTimeout(() => setJsonDownloaded(false), 2500);
  };

  const handlePdfClick = () => {
    onExportPDF();
    setPdfDownloaded(true);
    setTimeout(() => setPdfDownloaded(false), 2500);
  };

  return (
    <PageHeader
      title="Case Fusion Intelligence Workspace"
      subtitle="Multi-FIR analytical synthesis combining isolated departmental dockets into a unified, cross-jurisdictional syndicate graph."
      badge="MODULE 6 // FUSION ENGINE"
      badgeColor="bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
      actionButton={
        <div className="flex flex-wrap items-center gap-2">
          {fusionResult && (
            <>
              <button
                type="button"
                onClick={handleJsonClick}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-all active:scale-95"
                title="Export Fused Graph Payload in JSON format"
              >
                {jsonDownloaded ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-300">JSON Exported</span>
                  </>
                ) : (
                  <>
                    <FileJson className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Export JSON</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePdfClick}
                className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/20 px-3.5 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/30 transition-all shadow-sm active:scale-95"
                title="Generate Comprehensive Fusion Dossier (PDF)"
              >
                {pdfDownloaded ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Dossier Saved</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-3.5 w-3.5 text-cyan-300" />
                    <span>Export PDF Dossier</span>
                  </>
                )}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onReset}
            className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors"
            title="Reset Workspace"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      }
    />
  );
};
