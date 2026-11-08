"use client";

import React from "react";
import { RetrievalTelemetry } from "@/types";
import { Activity, Layers, Search, Zap, X } from "lucide-react";

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
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl p-6 overflow-y-auto text-slate-100 animate-in slide-in-from-right duration-200">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-lg text-white">Retrieval Explainability</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
          aria-label="Close telemetry drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {/* Source Lineage */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
            Clause Provenance
          </div>
          <div className="text-sm font-medium text-slate-200">{filename}</div>
          <div className="text-xs text-indigo-300 mt-1">Page {pageNumber} &bull; {sectionPath}</div>
          <div className="text-xs text-slate-500 font-mono mt-1">ID: {chunkId}</div>
        </div>

        {/* 4-Stage Telemetry Breakdown */}
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Multi-Stage Ranking Scores
          </div>

          {/* 1. Dense Semantic Search */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                # {telemetry?.dense_rank ?? "—"}
              </div>
              <div>
                <div className="text-sm font-medium text-slate-200">Dense Vector Search</div>
                <div className="text-xs text-slate-400">BAAI/bge-small-en-v1.5 (Cosine)</div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-sm text-blue-400 font-semibold">
                {telemetry?.dense_score !== null && telemetry?.dense_score !== undefined
                  ? telemetry.dense_score.toFixed(4)
                  : "N/A"}
              </span>
            </div>
          </div>

          {/* 2. BM25 Sparse Search */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                # {telemetry?.bm25_rank ?? "—"}
              </div>
              <div>
                <div className="text-sm font-medium text-slate-200">BM25 Lexical Keyword</div>
                <div className="text-xs text-slate-400">Legal Regex Tokenizer</div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-sm text-amber-400 font-semibold">
                {telemetry?.bm25_score !== null && telemetry?.bm25_score !== undefined
                  ? telemetry.bm25_score.toFixed(2)
                  : "N/A"}
              </span>
            </div>
          </div>

          {/* 3. Reciprocal Rank Fusion (RRF) */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-200">Reciprocal Rank Fusion</div>
                <div className="text-xs text-slate-400">1-indexed (k = 60)</div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-sm text-purple-400 font-semibold">
                {telemetry?.rrf_score !== null && telemetry?.rrf_score !== undefined
                  ? telemetry.rrf_score.toFixed(5)
                  : "N/A"}
              </span>
            </div>
          </div>

          {/* 4. Cross-Encoder Reranker */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-indigo-900/60 flex items-center justify-between bg-gradient-to-r from-indigo-950/40 to-slate-950">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-white flex items-center gap-1.5">
                  Cross-Encoder Reranker
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-semibold">
                    TOP-5
                  </span>
                </div>
                <div className="text-xs text-slate-400">ms-marco-MiniLM-L-6-v2</div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-sm text-emerald-400 font-semibold">
                {telemetry?.reranker_score !== null && telemetry?.reranker_score !== undefined
                  ? telemetry.reranker_score.toFixed(4)
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

