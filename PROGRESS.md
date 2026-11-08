# ClauseLens Project Progress & Implementation Tracker

This document tracks all completed features, active work, and planned milestones as we build ClauseLens step by step.

---

## Overall Roadmap Status

| Phase | Description | Status |
| :--- | :--- | :--- |
| **Phase 1** | Project Scaffolding, Config & Pydantic Schemas | **Completed** |
| **Phase 2** | Docling Layout Ingestion & Contextual Chunker | **Completed** |
| **Phase 3** | Dual Indexing (ChromaDB + BM25) & Hybrid Search (RRF + Reranker) | **Next Up** |
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

## Next Up: Phase 3 - Dual Indexing & Hybrid Search (Dense + BM25 + RRF + Cross-Encoder)

- **Target Files**:
  1. `backend/src/indexing/dense_store.py`: ChromaDB vector database wrapper with metadata filtering.
  2. `backend/src/indexing/sparse_store.py`: BM25 lexical index with custom legal/code tokenizer.
  3. `backend/src/indexing/index_manager.py`: Atomic dual-index synchronization.
  4. `backend/src/retrieval/rrf.py`: Reciprocal Rank Fusion algorithm ($k=60$, 1-indexed ranks).
  5. `backend/src/retrieval/reranker.py`: Cross-Encoder reranking module.
  6. `backend/src/retrieval/hybrid_retriever.py`: End-to-end hybrid retrieval coordinator.

