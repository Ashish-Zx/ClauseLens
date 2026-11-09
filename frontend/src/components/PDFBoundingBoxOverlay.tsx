"use client";

import React from "react";
import { BoundingBox, Citation } from "@/types";
import { FileText, Target, CheckCircle2, Sparkles } from "lucide-react";

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
    <div className="bg-white border border-zinc-200/90 rounded-xl overflow-hidden flex flex-col h-full shadow-card">
      {/* Top Document Inspector Bar */}
      <div className="bg-zinc-50/80 px-4 py-3 border-b border-zinc-200/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-white border border-zinc-200/80 flex items-center justify-center shrink-0">
            <FileText className="w-3.5 h-3.5 text-zinc-600" />
          </div>
          <span className="text-xs font-medium text-zinc-800 truncate">
            {filename}
          </span>
          <span className="text-[11px] bg-zinc-200/70 text-zinc-700 px-1.5 py-0.5 rounded font-mono shrink-0">
            p.{pageNumber}
          </span>
        </div>

        {boundingBox && (
          <div className="flex items-center gap-1 text-[11px] text-zinc-500 bg-white px-2 py-0.5 rounded-md border border-zinc-200/80 shrink-0">
            <Target className="w-3 h-3 text-amber-600" />
            <span className="font-mono text-[10px]">
              [{boundingBox.l.toFixed(0)}, {boundingBox.t.toFixed(0)},{" "}
              {boundingBox.r.toFixed(0)}, {boundingBox.b.toFixed(0)}]
            </span>
          </div>
        )}
      </div>

      {/* Breadcrumb Hierarchy Bar */}
      <div className="px-4 py-2 bg-white border-b border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
        <span className="truncate font-medium text-zinc-600">
          {sectionPath}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono shrink-0 ml-2">
          Docling Layout View
        </span>
      </div>

      {/* Document Page Sheet Preview */}
      <div className="p-5 sm:p-6 bg-[#F4F4F5]/70 overflow-y-auto flex-1 flex justify-center">
        <div className="w-full max-w-xl bg-white text-zinc-900 p-6 sm:p-8 rounded-lg shadow-subtle border border-zinc-200/90 relative flex flex-col justify-between min-h-[420px]">
          <div className="space-y-4">
            {/* Simulated subtle context lines above */}
            <div className="space-y-1.5 opacity-35 select-none" aria-hidden="true">
              <div className="h-2 w-1/3 bg-zinc-300 rounded" />
              <div className="h-2 w-full bg-zinc-200 rounded" />
              <div className="h-2 w-5/6 bg-zinc-200 rounded" />
            </div>

            {/* Section Header inside Document */}
            <div className="pt-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                Extracted Hierarchy
              </div>
              <div className="text-xs font-semibold text-zinc-800 border-b border-zinc-100 pb-2">
                {sectionPath}
              </div>
            </div>

            {/* Highlighted Bounding Box Clause */}
            <div
              className={`p-4 rounded-lg transition-all duration-200 ${
                activeCitation
                  ? "bg-amber-50/70 border border-amber-300/90 shadow-xs"
                  : "bg-zinc-50/80 border border-zinc-200/90"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    activeCitation
                      ? "bg-amber-100 text-amber-900"
                      : "bg-zinc-200/70 text-zinc-700"
                  }`}
                >
                  {activeCitation ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-amber-700" />
                      Verified Excerpt &bull; Citation [{activeCitation.citation_id}]
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-zinc-600" />
                      Top Ranked Clause Match
                    </>
                  )}
                </span>

                {boundingBox && (
                  <span className="text-[10px] font-mono text-zinc-400">
                    {boundingBox.coord_origin}
                  </span>
                )}
              </div>

              <div className="whitespace-pre-wrap font-sans text-xs sm:text-[13px] leading-relaxed text-zinc-800">
                {rawContent}
              </div>
            </div>

            {/* Simulated subtle context lines below */}
            <div className="space-y-1.5 opacity-35 pt-2 select-none" aria-hidden="true">
              <div className="h-2 w-full bg-zinc-200 rounded" />
              <div className="h-2 w-4/5 bg-zinc-200 rounded" />
              <div className="h-2 w-2/3 bg-zinc-200 rounded" />
            </div>
          </div>

          {/* Page Footer */}
          <div className="pt-6 mt-6 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
            <span>{filename}</span>
            <span>Page {pageNumber}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
