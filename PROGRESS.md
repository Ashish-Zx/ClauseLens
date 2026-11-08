# ClauseLens Project Progress & Implementation Tracker

This document tracks all completed features, active work, and planned milestones as we build ClauseLens step by step.

---

## Overall Roadmap Status

| Phase | Description | Status |
| :--- | :--- | :--- |
| **Phase 1** | Project Scaffolding, Config & Pydantic Schemas | **Completed** |
| **Phase 2** | Docling Layout Ingestion & Contextual Chunker | **Completed** |
| **Phase 3** | Dual Indexing (ChromaDB + BM25) & Hybrid Search (RRF + Reranker) | **In Progress** |
| **Phase 4** | Grounded Generation & Citation Extraction | Pending |
| **Phase 5** | FastAPI REST Endpoints | Pending |
| **Phase 6** | Ragas Evaluation Suite & Quality CI Gate | Pending |
| **Phase 7** | Next.js 15 Frontend (App Router, PDF Viewer, Diff Studio) | Pending |

---

## Detailed Log of Completed Work

### Phase 1: Project Scaffolding, Config & Core Schemas

#### 1. Repository Scaffolding & Environment
- **`.gitignore`**: Configured to ignore virtual environments, cache directories, model weights, OS files, and dynamic vector database indices while keeping folder structure intact via `.gitkeep`.
- **`.env.example`**: Clean template specifying runtime parameters, model identifiers (`BAAI/bge-small-en-v1.5`, `cross-encoder/ms-marco-MiniLM-L-6-v2`), RRF constants ($k=60$), and LLM keys.
- **`backend/requirements.txt`**: Pinned enterprise dependencies (`fastapi`, `pydantic`, `pydantic-settings`, `docling`, `chromadb`, `rank-bm25`, `sentence-transformers`, `torch`, `ragas`, `structlog`).
- **`backend/src/exceptions.py`**: Custom domain exceptions (`DocumentParsingError`, `IndexSyncError`, `RetrievalError`, `GenerationError`, `EvaluationError`) subclassing `ClauseLensError`.

#### 2. Configuration Module
- **File**: `backend/src/config.py`
- **What it does**:
  - Uses Pydantic v2 `BaseSettings` to validate environment variables with sensible defaults.
  - Exposes `get_settings()` with `@lru_cache` for fast dependency injection across all services.
  - Defines the core parameters:
    - $k = 60$ for Reciprocal Rank Fusion.
    - $K_{dense} = 25$ and $K_{sparse} = 25$ candidate pool sizes.
    - $N_{rerank} = 15$ input to cross-encoder.
    - $K_{final} = 5$ top chunks delivered to the generation context.

#### 3. Core Pydantic Data Contracts
- **File**: `backend/src/schemas/document.py`
  - `ElementType`: Enum classifying layout blocks (`text`, `table`, `section_header`, `list_item`).
  - `BoundingBox`: 4-coordinate float box `(l, t, r, b)` with page number and coordinate origin for UI overlays.
  - `DocumentMetadata`: Document-level metadata (`doc_id`, `filename`, `page_count`, `file_size_bytes`, `created_at`).
  - `ParsedElement` & `ParsedDocument`: Intermediate layout elements and document container.
  - `DocumentChunk`: Atomic text/table unit with breadcrumb header builder and deterministic SHA-256 chunk identifier.
- **File**: `backend/src/schemas/query.py`
  - `QueryRequest`: Search query payload with optional document filters.
  - `RetrievalTelemetry`: Captures `dense_rank`, `dense_score`, `bm25_rank`, `bm25_score`, `rrf_score`, and `reranker_score`.
  - `ScoredChunk`: Chunk bundled with full ranking telemetry.
  - `Citation`: Grounded factual quote with page number, section breadcrumb, and bounding box coordinates for frontend PDF highlighting.
  - `RAGResponse`: Complete structured answer model with inline `[1]`, `[2]` citation markers and latency breakdown.

---

## Detailed Log: Phase 2 - Ingestion & Contextual Chunking

### 1. Document Parsing with Docling
- **File**: `backend/src/ingestion/docling_parser.py`
- **What it does**:
  - Wraps Docling's `DocumentConverter` with `PdfPipelineOptions(do_ocr=True, do_table_structure=True)`.
  - Enables `TableFormerMode.ACCURATE` to ensure financial and contract tables preserve exact rows and cell alignment as Markdown tables.
  - Tracks hierarchical document headers into breadcrumb section paths (`Article 8 > 8.3 Limitation of Liability`).
  - Extracts provenance coordinates (`BoundingBox`) for frontend PDF highlights.
  - Raises domain-specific `DocumentParsingError` on missing files or conversion failures.

### 2. Contextual Boundary Chunker
- **File**: `backend/src/ingestion/contextual_chunker.py`
- **What it does**:
  - Groups layout elements along structural section boundaries and page transitions instead of slicing arbitrary sentences mid-thought.
  - Treats tables as first-class citizens: small tables remain atomic chunks; oversized tables are split cleanly row-by-row with table headers and markdown separator rows repeated on every sub-chunk.
  - Prepends every chunk with standardized breadcrumbs (`[Document: ...] [Section: ...] ---`).
  - Merges bounding boxes across aggregated elements for precise UI PDF overlays.
- **Test File**: `backend/tests/test_chunker.py`
  - Unit tests covering text grouping, section boundary splits, table header repetition, and deterministic chunk ID generation.

---

## Detailed Log: Phase 3 - Dual Indexing & Hybrid Search

### 1. Reciprocal Rank Fusion (RRF)
- **File**: `backend/src/retrieval/rrf.py`
- **What it does**:
  - Implements the exact 1-indexed RRF formula:
    $$\text{RRF}(d) = \sum_{m \in \{\text{dense}, \text{bm25}\}} \frac{1}{k + \text{rank}_m(d)}$$
    with $k = 60$.
  - Preserves full telemetry (`dense_rank`, `bm25_rank`, `dense_score`, `bm25_score`, `rrf_score`).
  - Converts intermediate ranking candidates into `RetrievalTelemetry` for frontend search explainability.
- **Test File**: `backend/tests/test_rrf.py`
  - Verifies exact reciprocal rank math, 1-indexed denominator checks, and telemetry mapping.

### 2. BM25 Sparse Keyword Store & Legal Tokenizer
- **File**: `backend/src/indexing/sparse_store.py`
- **What it does**:
  - `legal_tokenizer`: Uses a domain regex preserving section numbers (`11.4(b)`), hyphenated terms (`SOC-2`), currency amounts (`$1,500,000`), and percentages (`99.9%`).
  - `SparseBM25Store`: BM25Okapi keyword search over contextualized chunks with optional `doc_ids` filtering.
  - Disk persistence: Atomic save and load (`bm25_store.pkl`) to avoid re-parsing PDFs on server restart.
- **Test File**: `backend/tests/test_sparse_store.py`
  - Verifies token preservation, BM25 keyword matching, metadata filtering, and atomic disk persistence.

---

## Next Up: Phase 3 Remaining Components

- **Target Files**:
  1. `backend/src/indexing/dense_store.py`: ChromaDB vector database wrapper with embedding model integration.
  2. `backend/src/retrieval/reranker.py`: Cross-Encoder reranker (`cross-encoder/ms-marco-MiniLM-L-6-v2`).
  3. `backend/src/indexing/index_manager.py`: Atomic dual-index synchronization.
  4. `backend/src/retrieval/hybrid_retriever.py`: Hybrid search pipeline combining dense + sparse + RRF + reranking.

