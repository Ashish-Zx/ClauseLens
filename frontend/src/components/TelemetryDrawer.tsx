"use client";

import React from "react";
import { RetrievalTelemetry } from "@/types";
import { Activity, Layers, Zap, X, FileText, Hash, Cpu } from "lucide-react";

interface TelemetryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  chunkId: string;
  sectionPath: string;
  filename: string;
  pageNumber: number;
  telemetry?: RetrievalTelemetry | null;
}

export function TelemetryDrawer({
  isOpen,
  onClose,
  chunkId,
  sectionPath,
  filename,
  pageNumber,
  telemetry,
}: TelemetryDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Subtle Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-900/20 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Light Panel */}
      <div className="relative z-10 w-full max-w-md bg-white border-l border-zinc-200 shadow-float p-6 overflow-y-auto text-zinc-900 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200/80 flex items-center justify-center">
                <Activity className="w-4 h-4 text-zinc-800" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-zinc-900">
                  Retrieval Explainability
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Hybrid RRF + Cross-Encoder Telemetry
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-transparent hover:border-zinc-200 hover:bg-zinc-50 text-zinc-500 hover:text-zinc-900 transition cursor-pointer"
              aria-label="Close telemetry drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Source Lineage Card */}
          <div className="bg-zinc-50/80 p-4 rounded-xl border border-zinc-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                Chunk Provenance
              </span>
              <span className="text-[11px] font-mono text-zinc-500 bg-white px-2 py-0.5 rounded border border-zinc-200/70">
                Page {pageNumber}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900">
              <FileText className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span className="truncate">{filename}</span>
            </div>
            <div className="text-xs text-zinc-600 leading-snug">
              {sectionPath}
            </div>
            <div className="pt-1 flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
              <Hash className="w-3 h-3" />
              <span>{chunkId}</span>
            </div>
          </div>

          {/* 4-Stage Pipeline Breakdown */}
          <div className="space-y-3">
            <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
              Multi-Stage Ranking Pipeline
            </div>

            {/* Stage 1: Dense Vector Search */}
            <div className="bg-white p-3.5 rounded-xl border border-zinc-200/90 shadow-subtle flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200/80 text-zinc-800 flex items-center justify-center font-mono font-semibold text-xs">
                  #{telemetry?.dense_rank ?? "—"}
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-900">
                    1. Dense Vector Search
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    BAAI/bge-small-en-v1.5 &bull; Cosine
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-zinc-400 uppercase">Score</div>
                <span className="font-mono text-xs text-zinc-900 font-semibold">
                  {telemetry?.dense_score !== null &&
                  telemetry?.dense_score !== undefined
                    ? telemetry.dense_score.toFixed(4)
                    : "N/A"}
                </span>
              </div>
            </div>

            {/* Stage 2: Sparse BM25 Search */}
            <div className="bg-white p-3.5 rounded-xl border border-zinc-200/90 shadow-subtle flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200/80 text-zinc-800 flex items-center justify-center font-mono font-semibold text-xs">
                  #{telemetry?.bm25_rank ?? "—"}
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-900">
                    2. Sparse BM25 Lexical
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Legal Clause &amp; Section Tokenizer
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-zinc-400 uppercase">Score</div>
                <span className="font-mono text-xs text-zinc-900 font-semibold">
                  {telemetry?.bm25_score !== null &&
                  telemetry?.bm25_score !== undefined
                    ? telemetry.bm25_score.toFixed(2)
                    : "N/A"}
                </span>
              </div>
            </div>

            {/* Stage 3: Reciprocal Rank Fusion */}
            <div className="bg-white p-3.5 rounded-xl border border-zinc-200/90 shadow-subtle flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200/80 text-zinc-700 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-900">
                    3. Reciprocal Rank Fusion
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono">
                    &Sigma; 1 / (60 + rank)
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-zinc-400 uppercase">RRF</div>
                <span className="font-mono text-xs text-zinc-900 font-semibold">
                  {telemetry?.rrf_score !== null &&
                  telemetry?.rrf_score !== undefined
                    ? telemetry.rrf_score.toFixed(5)
                    : "N/A"}
                </span>
              </div>
            </div>

            {/* Stage 4: Cross-Encoder Reranker */}
            <div className="bg-zinc-900 text-white p-4 rounded-xl shadow-subtle flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 text-emerald-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-2">
                    4. Cross-Encoder Rerank
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                      FINAL
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    ms-marco-MiniLM-L-6-v2
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-zinc-400 uppercase">Logit</div>
                <span className="font-mono text-xs text-emerald-400 font-semibold">
                  {telemetry?.reranker_score !== null &&
                  telemetry?.reranker_score !== undefined
                    ? telemetry.reranker_score.toFixed(4)
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-4 border-t border-zinc-200/80 flex items-center gap-2 text-[11px] text-zinc-400">
          <Cpu className="w-3.5 h-3.5 shrink-0" />
          <span>
            1-indexed Reciprocal Rank Fusion prevents single-modality outliers.
          </span>
        </div>
      </div>
    </div>
  );
}
