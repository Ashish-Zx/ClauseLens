"use client";

import React from "react";
import { BoundingBox, Citation } from "@/types";
import { FileText, Target } from "lucide-react";

interface PDFBoundingBoxOverlayProps {
  filename: string;
  pageNumber: number;
  sectionPath: string;
  rawContent: string;
  boundingBox?: BoundingBox | null;
  activeCitation?: Citation | null;
}

export function PDFBoundingBoxOverlay({
  filename,
  pageNumber,
  sectionPath,
  rawContent,
  boundingBox,
  activeCitation,
}: PDFBoundingBoxOverlayProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full shadow-lg">
      {/* Top Document Header */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-medium text-slate-200">{filename}</span>
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
            Page {pageNumber}
          </span>
        </div>
        {boundingBox && (
          <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            <Target className="w-3.5 h-3.5" />
            <span className="font-mono">
              bbox: [{boundingBox.l.toFixed(0)}, {boundingBox.t.toFixed(0)}, {boundingBox.r.toFixed(0)}, {boundingBox.b.toFixed(0)}]
            </span>
          </div>
        )}
      </div>

      {/* Simulated Document Canvas */}
      <div className="p-6 bg-slate-950/60 overflow-y-auto flex-1 relative flex justify-center">
        <div className="w-full max-w-xl bg-white text-slate-900 p-8 rounded shadow-md relative min-h-[420px] font-serif text-sm leading-relaxed border border-slate-300">
          <div className="text-[11px] font-sans uppercase tracking-widest text-slate-400 font-bold mb-3 border-b border-slate-200 pb-1">
            {sectionPath}
          </div>

          {/* Active Highlight Bounding Box Effect */}
          <div
            className={`p-3 rounded transition-all duration-300 ${
              activeCitation
                ? "bg-amber-100/90 border-2 border-amber-500 shadow-sm ring-4 ring-amber-300/40"
                : "bg-indigo-50/70 border border-indigo-200"
            }`}
          >
            {activeCitation && (
              <div className="text-[10px] font-sans font-bold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Target className="w-3 h-3 text-amber-600" />
                Verified Grounded Excerpt (Citation [{activeCitation.citation_id}])
              </div>
            )}
            <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-800">
              {rawContent}
            </div>
          </div>

          <div className="absolute bottom-3 right-4 text-[10px] font-sans text-slate-400">
            ClauseLens Provenance Viewer &bull; Page {pageNumber}
          </div>
        </div>
      </div>
    </div>
  );
}

