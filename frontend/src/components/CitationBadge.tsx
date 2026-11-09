"use client";

import React from "react";
import { Citation } from "@/types";
import { FileText } from "lucide-react";

interface CitationBadgeProps {
  citation: Citation;
  onClick: (citation: Citation) => void;
  isActive?: boolean;
}

export function CitationBadge({
  citation,
  onClick,
  isActive,
}: CitationBadgeProps) {
  return (
    <button
      onClick={() => onClick(citation)}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer border ${
        isActive
          ? "bg-zinc-900 text-white border-zinc-900 shadow-xs"
          : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200/90 hover:border-zinc-300"
      }`}
      title={`${citation.doc_name} (Page ${citation.page_number}): "${citation.verbatim_quote}"`}
    >
      <span
        className={`font-mono text-[11px] font-semibold ${
          isActive ? "text-zinc-200" : "text-zinc-900"
        }`}
      >
        [{citation.citation_id}]
      </span>
      <FileText
        className={`w-3 h-3 ${isActive ? "text-zinc-300" : "text-zinc-400"}`}
      />
      <span className="truncate max-w-[160px]">{citation.doc_name}</span>
      <span
        className={`font-mono text-[10px] px-1 py-0.2 rounded ${
          isActive ? "bg-zinc-800 text-zinc-300" : "bg-zinc-200/70 text-zinc-600"
        }`}
      >
        p.{citation.page_number}
      </span>
    </button>
  );
}
