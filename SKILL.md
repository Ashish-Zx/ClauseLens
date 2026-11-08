---
name: clauselens-production-rag
description: Write complete, production-grade code for ClauseLens (Python 3.12 FastAPI backend with Docling, Hybrid Search RRF, Cross-Encoder Reranking, Ragas Evaluation, and Next.js 15 frontend). Use whenever writing, refactoring, or debugging code in the ClauseLens repository.
allowed-tools: client
---

# ClauseLens Production Engineering Skill

Enforce senior-level software and AI engineering standards across the ClauseLens monorepo (`backend/` in Python 3.12 + FastAPI and `frontend/` in Next.js + TypeScript). Never output truncated code, placeholders, or mock implementations.

## When to Use

- Writing or updating backend modules (`ingestion`, `indexing`, `retrieval`, `generation`, `evaluation`, `api`)
- Implementing Docling layout parsing, table extraction, OCR, or contextual breadcrumb chunking
- Building Dense (ChromaDB/pgvector) + Sparse (BM25) hybrid retrieval, Reciprocal Rank Fusion (RRF), or Cross-Encoder reranking
- Implementing Ragas evaluation pipelines and CI quality gates
- Building the Next.js 15 App Router frontend, PDF bounding-box viewer, or contract comparison studio

## Core Engineering Mandate (Zero-Shortcuts Policy)

1. **Complete Implementations Only**:
   - Never write `# TODO`, `# implement later`, `pass`, or `...` in any module.
   - Every file must be 100% runnable, complete, and self-contained with all required imports at the top.

2. **Strict Type Safety & Schema Validation**:
   - Python: Annotate every function signature, parameter, and return value using Python 3.12+ syntax (`list[str]`, `dict[str, Any]`, `str | None`). Use Pydantic v2 (`BaseModel`, `Field`, `ConfigDict`, `BaseSettings`) for all data models and configuration.
   - TypeScript: Use strict TypeScript interfaces and Zod schemas; never use `any`.

3. **Structured Logging & Custom Exceptions**:
   - Never use bare `print()` statements in application logic. Use `structlog` or configured `logging.getLogger(__name__)` with contextual metadata (`doc_id`, `chunk_id`, `latency_ms`).
   - Define domain-specific exceptions (`DocumentParsingError`, `IndexSyncError`, `RetrievalError`, `GenerationError`) instead of catching bare `Exception` silently.

4. **Configuration & Secrets Management**:
   - Centralize all environment variables, model names, chunk parameters, and RRF constants (`k=60`, `top_k_dense=25`, `top_k_sparse=25`, `top_n_rerank=15`, `top_k_final=5`) in `backend/src/config.py` using `pydantic-settings`.

## Architecture & Module Standards

### 1. Ingestion & Docling (`backend/src/ingestion/`)

- **Docling Converter**: Configure `DocumentConverter` with `PdfPipelineOptions(do_ocr=True, do_table_structure=True)`. Enable `TableFormerMode.ACCURATE` so complex financial and legal tables retain exact cell spans and row/column alignment.
- **Provenance Preservation**: Extract and preserve `doc_id`, `filename`, `page_number`, `bounding_box` (`l, t, r, b`), `element_type` (`table`, `text`, `section_header`), and hierarchical `section_path` for every parsed element.
- **Contextual Chunker**:
  - Split documents along natural structural boundaries rather than arbitrary character counts.
  - Keep tables intact as Markdown tables. If a table exceeds max token limits, split by row while repeating the Markdown table header row in every sub-chunk.
  - Prepend every chunk with a standardized contextual header before embedding and BM25 indexing:
    ```text
    [Document: {filename} | Page: {page_number}]
    [Section: {breadcrumb_path}]
    ---
    {chunk_content}
    ```

### 2. Dual-Index Storage (`backend/src/indexing/`)

- **Atomic Synchronization**: When indexing a document, write to both the Dense Vector Store (ChromaDB) and the Sparse Keyword Store (BM25) using identical `chunk_id` keys (deterministic SHA-256 hash of `doc_id + page_number + chunk_index`).
- **Legal/Financial Tokenizer for BM25**: Preserve section identifiers (`11.4(b)`), hyphenated terms (`SOC-2`, `non-compete`), and currency/percentage values during tokenization rather than stripping punctuation naively.
- **Persistence**: Persist BM25 indices atomically to disk alongside metadata so restarts do not require re-parsing PDFs.

### 3. Hybrid Retrieval, RRF & Reranking (`backend/src/retrieval/`)

- **Reciprocal Rank Fusion (RRF)**:
  - Execute Dense search ($K=25$) and BM25 search ($K=25$).
  - Compute exact RRF scores using:
    $$\text{RRF}(d) = \sum_{m \in \{\text{dense}, \text{bm25}\}} \frac{1}{k + \text{rank}_m(d)}$$
    where $k = 60$ and $\text{rank}_m(d)$ is 1-indexed.
  - Preserve telemetry on every candidate chunk: `dense_rank`, `bm25_rank`, `dense_score`, `bm25_score`, and `rrf_score`.
- **Cross-Encoder Reranker**:
  - Score the top $N=15$ RRF candidates jointly with `(query, chunk.contextualized_text)` using a Cross-Encoder (`BAAI/bge-reranker-base` or `cross-encoder/ms-marco-MiniLM-L-6-v2`).
  - Record `reranker_score` and return the top $K=5$ chunks sorted by cross-encoder score.

### 4. Grounded Generation (`backend/src/generation/`)

- **Zero-Hallucination Prompting**: Instruct the LLM to answer strictly from the retrieved context chunks. If the context lacks the answer, populate `unanswerable_reason` explicitly rather than guessing.
- **Structured Output Schema**: Return a validated Pydantic response containing:
  - `answer`: Markdown synthesis with inline citation markers (`[1]`, `[2]`).
  - `citations`: List of `Citation` objects (`citation_id`, `chunk_id`, `doc_name`, `page_number`, `section_path`, `verbatim_quote`, `bounding_box`).
  - `retrieval_telemetry`: Latency breakdown and per-chunk ranking scores (`dense_rank`, `bm25_rank`, `rrf_score`, `reranker_score`).

### 5. Ragas Evaluation (`backend/src/evaluation/`)

- Implement programmatic evaluation across all 4 core metrics:
  1. `context_precision`
  2. `context_recall`
  3. `faithfulness`
  4. `answer_relevancy`
- Export both a JSON artifact (`evaluation_results.json`) and a human-readable Markdown scorecard (`evaluation_report.md`) with per-question diagnostics and pass/fail CI exit codes.

## Verification Workflow (Run After Every Step)

1. **Syntax & Import Verification**: Run `/opt/homebrew/bin/python3.12 -m py_compile <files>` to verify zero syntax errors.
2. **Test Execution**: Run `pytest` on unit and integration tests covering chunking, RRF math, and API endpoints before declaring any milestone complete.

## Gotchas to Avoid

- Do not use naive PDF loaders (`PyPDFLoader`, `pypdf`, `pdfplumber`) that destroy multi-column layout and table structures; always use `docling`.
- Do not use 0-indexed ranks in the RRF denominator (`1 / (60 + rank)`); ranks must be 1-indexed (`1, 2, 3...`).
- Do not strip contextual headers before passing chunks to BM25 or Cross-Encoder; the section hierarchy (`Article 8 > 8.3 Limitation of Liability`) is essential for disambiguating similar clauses across different contracts.
