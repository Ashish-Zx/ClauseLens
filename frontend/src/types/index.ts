/**
 * Strict TypeScript types for ClauseLens frontend matching backend Pydantic schemas.
 * Zero use of 'any' across all data contracts.
 */

export type ElementType = "text" | "table" | "section_header" | "list_item";

export interface BoundingBox {
  l: number;
  t: number;
  r: number;
  b: number;
  page_number: number;
  coord_origin: string;
}

export interface DocumentMetadata {
  doc_id: string;
  filename: string;
  page_count: number;
  file_size_bytes: number;
  created_at: string;
}

export interface DocumentChunk {
  chunk_id: string;
  doc_id: string;
  filename: string;
  page_number: number;
  chunk_index: number;
  element_type: ElementType;
  section_path: string;
  raw_content: string;
  contextualized_content: string;
  bounding_box: BoundingBox | null;
}

export interface RetrievalTelemetry {
  chunk_id: string;
  dense_rank: number | null;
  bm25_rank: number | null;
  dense_score: number | null;
  bm25_score: number | null;
  rrf_score: number | null;
  reranker_score: number | null;
}

export interface ScoredChunk {
  chunk_id: string;
  doc_id: string;
  filename: string;
  page_number: number;
  section_path: string;
  raw_content: string;
  contextualized_content: string;
  bounding_box: BoundingBox | null;
  telemetry: RetrievalTelemetry;
}

export interface Citation {
  citation_id: number;
  chunk_id: string;
  doc_name: string;
  page_number: number;
  section_path: string;
  verbatim_quote: string;
  bounding_box: BoundingBox | null;
}

export interface QueryRequest {
  query: string;
  doc_ids?: string[] | null;
  top_k?: number | null;
}

export interface RAGResponse {
  query: string;
  answer: string;
  citations: Citation[];
  telemetry: RetrievalTelemetry[];
  unanswerable_reason: string | null;
  total_latency_ms: number;
}

export interface IngestionResponse {
  doc_id: string;
  filename: string;
  page_count: number;
  chunk_count: number;
  table_count: number;
  status: string;
}

export interface IndexStats {
  dense_count: number;
  sparse_count: number;
}

