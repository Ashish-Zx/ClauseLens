"use client";

import React from "react";
import { Citation } from "@/types";
import { BookOpen, ExternalLink } from "lucide-react";

interface CitationBadgeProps {
  citation: Citation;
  onClick: (citation: Citation) => void;
  isActive?: boolean;
}

export function CitationBadge({ citation, onClick, isActive }: CitationBadgeProps) {
  return (
    <button
      onClick={() => onClick(citation)}
      className={`inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 rounded text-xs font-semibold transition cursor-pointer ${
        isActive
          ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400"
          : "bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/80"
      }`}
      title={`${citation.doc_name} (Page ${citation.page_number}): "${citation.verbatim_quote}"`}
    >
      <BookOpen className="w-3 h-3 text-indigo-400" />
      <span>[{citation.citation_id}]</span>
      <span className="text-[10px] text-indigo-400 font-normal hidden sm:inline">
        p.{citation.page_number}
      </span>
    </button>
  );
}

