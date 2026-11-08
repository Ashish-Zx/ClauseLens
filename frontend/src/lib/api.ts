/**
 * Production API client for ClauseLens backend.
 * Provides typed fetch abstractions for document ingestion, search, and synthesis.
 */

import {
  DocumentChunk,
  IndexStats,
  IngestionResponse,
  QueryRequest,
  RAGResponse,
  ScoredChunk,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "APIError";
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const errorJson = (await response.json()) as { detail?: string; message?: string };
      errorDetail = errorJson.detail || errorJson.message || errorDetail;
    } catch {
      // Non-JSON error response
    }
    throw new APIError(response.status, errorDetail);
  }

  return (await response.json()) as T;
}

export const api = {
  /** Fetch storage stats for dense and sparse indexes */
  async getStats(): Promise<IndexStats> {
    return request<IndexStats>("/documents/stats");
  },

  /** Upload and index a PDF contract file */
  async uploadDocument(file: File): Promise<IngestionResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new APIError(response.status, err.detail || "Upload failed");
    }

    return (await response.json()) as IngestionResponse;
  },

  /** Retrieve precision-ranked chunks with multi-stage explainability telemetry */
  async search(requestPayload: QueryRequest): Promise<ScoredChunk[]> {
    return request<ScoredChunk[]>("/query/search", {
      method: "POST",
      body: JSON.stringify(requestPayload),
    });
  },

  /** Ask a question and receive grounded answer with inline citations */
  async ask(requestPayload: QueryRequest): Promise<RAGResponse> {
    return request<RAGResponse>("/query/ask", {
      method: "POST",
      body: JSON.stringify(requestPayload),
    });
  },

  /** Compare multiple contracts and generate a side-by-side matrix */
  async compare(requestPayload: QueryRequest): Promise<RAGResponse> {
    return request<RAGResponse>("/query/compare", {
      method: "POST",
      body: JSON.stringify(requestPayload),
    });
  },

  /** Retrieve full chunk by its unique ID */
  async getChunk(chunkId: string): Promise<DocumentChunk> {
    return request<DocumentChunk>(`/documents/${chunkId}`);
  },
};

