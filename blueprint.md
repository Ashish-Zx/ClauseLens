# ClauseLens: Production-Grade RAG Pipeline with Document Intelligence
**Architectural & Engineering Blueprint**

---

## 1. Executive Summary & Product Vision

**ClauseLens** is an enterprise-grade AI document intelligence and contract analysis platform designed to eliminate manual review bottlenecks across legal, procurement, human resources, and finance teams. 

While basic RAG implementations fail on real-world enterprise documents due to multi-column layouts, embedded pricing/liability tables, scanned pages, and exact lexical terminology, ClauseLens implements a **three-pillar production architecture**:
1. **Layout-Aware Document Intelligence (`Docling`)**: Preserves structural hierarchy, multi-column reading order, and complex tabular matrices while applying contextual header prepending.
2. **Two-Stage Hybrid Retrieval (`Dense + BM25 + RRF + Cross-Encoder`)**: Combines semantic embeddings with exact lexical search via Reciprocal Rank Fusion (RRF), refined by a secondary cross-encoder reranker.
3. **Programmatic Evaluation Suite (`Ragas`)**: Quantifies retrieval and generation quality across Context Precision, Context Recall, Faithfulness, and Answer Relevancy, enabling automated CI/CD quality gating.

---

## 2. Target Use Cases & Core Capabilities

1. **Interactive Contract & Policy Q&A**
   - Natural language and exact-clause queries (e.g., *"What are the liability caps under Section 11.4(b)?"* or *"Compare termination notice periods between the 2023 MSA and 2024 Amendment"*).
2. **Side-by-Side Agreement Diff & Comparison Matrix**
   - Automated extraction and comparison of key legal/financial clauses (Indemnification, Governing Law, SLA Uptime Credits, Payment Terms, Data Privacy/GDPR) across multiple documents.
3. **Structured Table Intelligence**
   - Queries over multi-row, multi-column fee schedules, SLA credit tiers, and rate cards without losing row/column alignment.
4. **Zero-Hallucination Citation Provenance**
   - Every generated claim includes structured citations pointing to the exact source document, page number, section breadcrumb, and bounding box coordinates for frontend PDF highlighting.
5. **Live Ragas Telemetry & Evaluation Dashboard**
   - Built-in benchmarking suite to track pipeline regression and display real-time trustworthiness scores in the UI.

---

## 3. End-to-End System Architecture

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                        1. INGESTION & DOCLING PIPELINE                       │
└──────────────────────────────────────────────────────────────────────────────┘
  [Raw PDFs / Scanned Contracts / Policies]
                     │
                     ▼
        ┌─────────────────────────┐
        │   Docling Converter     │ ──► Layout Analysis, OCR, Table Structure
        └─────────────────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │   Contextual Chunker    │ ──► Natural section splits + Breadcrumb
        └─────────────────────────┘     prepending (# Doc > Sec 4 > Sub 4.2)
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  Dense Vector   │     │  Sparse Keyword │
│ Index (Chroma / │     │  Index (BM25 /  │
│   pgvector)     │     │   Rank-BM25)    │
└────────┬────────┘     └────────┬────────┘
         │                       │
┌────────┴───────────────────────┴─────────────────────────────────────────────┐
│                    2. HYBRID RETRIEVAL & RERANKING ENGINE                    │
└──────────────────────────────────────────────────────────────────────────────┘
         │                       │
         ▼                       ▼
  [Top-K Semantic]        [Top-K Lexical]
         │                       │
         └───────────┬───────────┘
                     ▼
        ┌─────────────────────────┐
        │ Reciprocal Rank Fusion  │ ──► RRF_Score(d) = Σ 1 / (60 + rank_m(d))
        │         (RRF)           │
        └─────────────────────────┘
                     │ (Top-N Fused Candidates)
                     ▼
        ┌─────────────────────────┐
        │ Cross-Encoder Reranker  │ ──► Joint Query-Chunk Scoring
        │ (BAAI/bge-reranker-v2)  │     (Selects Final Top-K Context)
        └─────────────────────────┘
                     │
┌────────────────────┴─────────────────────────────────────────────────────────┐
│                  3. GROUNDED GENERATION & RAGAS EVALUATION                   │
└──────────────────────────────────────────────────────────────────────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │  LLM Synthesis Engine   │ ──► Strict Grounding + Structured Citations
        └─────────────────────────┘     (Doc ID, Page, Section, Verbatim Quote)
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
┌─────────────────┐     ┌─────────────────────────────────────────┐
│ Next.js Client  │     │         Ragas Evaluation Suite          │
│ (PDF Viewer +   │     │ • Context Precision  • Context Recall   │
│  Diff Studio)   │     │ • Faithfulness       • Answer Relevancy │
└─────────────────┘     └─────────────────────────────────────────┘
```

---

## 4. Monorepo Directory Structure

Designed for seamless expansion into a full-stack Next.js SaaS application:

```text
RAAG/
├── blueprint.md                        # Full project architecture & roadmap
├── README.md                           # Portfolio documentation & setup guide
├── .env.example                        # Environment variables template
├── .github/
│   └── workflows/
│       └── ragas_eval_ci.yml           # Automated CI pipeline gating via Ragas
│
├── backend/                            # Python 3.12 Backend & AI Engine
│   ├── pyproject.toml                  # Dependencies & project metadata
│   ├── requirements.txt                # Pinned Python packages
│   ├── data/
│   │   ├── raw/                        # Sample MSAs, NDAs, Policies, Invoices (PDFs)
│   │   ├── processed/                  # Cached Docling JSON / Markdown outputs
│   │   ├── indices/                    # Persistent ChromaDB & serialized BM25 store
│   │   └── evaluation/
│   │       └── golden_dataset.json     # Ground-truth Q&A pairs for Ragas benchmarking
│   │
│   ├── src/
│   │   ├── __init__.py
│   │   ├── config.py                   # Pydantic settings (models, chunk sizes, RRF k)
│   │   ├── schemas/
│   │   │   ├── document.py             # DocumentChunk, Metadata, BoundingBox models
│   │   │   └── query.py                # QueryRequest, Citation, RAGResponse models
│   │   │
│   │   ├── ingestion/
│   │   │   ├── docling_parser.py       # Docling layout analysis, OCR, table extraction
│   │   │   └── contextual_chunker.py   # Hierarchical chunker + header prepending
│   │   │
│   │   ├── indexing/
│   │   │   ├── dense_store.py          # Vector DB abstraction (ChromaDB / pgvector)
│   │   │   ├── sparse_store.py         # BM25 lexical index with legal/code tokenizer
│   │   │   └── index_manager.py        # Dual-index synchronization manager
│   │   │
│   │   ├── retrieval/
│   │   │   ├── rrf.py                  # Reciprocal Rank Fusion algorithm
│   │   │   ├── reranker.py             # Cross-Encoder reranking module
│   │   │   └── hybrid_retriever.py     # End-to-end retrieval pipeline
│   │   │
│   │   ├── generation/
│   │   │   ├── prompts.py              # System prompts for Q&A and Contract Comparison
│   │   │   └── generator.py            # LLM client with structured output enforcement
│   │   │
│   │   ├── evaluation/
│   │   │   ├── dataset_builder.py      # Golden dataset loader & synthetic generator
│   │   │   └── ragas_runner.py         # Ragas evaluation suite & scorecard exporter
│   │   │
│   │   └── api/
│   │       ├── main.py                 # FastAPI entrypoint & CORS setup
│   │       └── routes/
│   │           ├── documents.py        # Upload, parse, inspect chunks/tables
│   │           ├── query.py            # Hybrid search, Q&A, contract comparison
│   │           └── evaluation.py       # Trigger & fetch Ragas benchmark reports
│   │
│   └── tests/                          # Pytest unit & integration tests
│       ├── test_chunker.py
│       ├── test_rrf.py
│       └── test_pipeline.py
│
└── frontend/                           # Future Next.js 15 App Router UI
    ├── package.json
    └── src/
        ├── app/                        # Dashboard, Workspace, Diff Studio, Eval Hub
        └── components/                 # PDF Bounding-Box Viewer, Citation Badges, RRF Visualizer
```

---

## 5. Deep-Dive Technical Specifications

### 5.1 Advanced Document Parsing (`src/ingestion/docling_parser.py`)
- **Engine**: `docling.document_converter.DocumentConverter` with `PdfPipelineOptions`.
- **Capabilities Enabled**:
  - `do_ocr = True`: Seamless OCR fallback for scanned contract pages or signatures.
  - `do_table_structure = True`: Uses Docling's TableFormer model to reconstruct cell spans, headers, and rows accurately into structured Markdown tables.
- **Metadata Extraction**: Captures page numbers, bounding box coordinates (`bbox`), element types (`table`, `section_header`, `text`, `list_item`), and document hierarchy levels.

### 5.2 Contextual Chunking (`src/ingestion/contextual_chunker.py`)
- **Problem Solved**: Standard recursive character splitting severs clauses from their parent section headers and shatters tables mid-row.
- **Strategy**:
  - Uses Docling's native `HierarchicalChunker` / layout boundaries.
  - Keeps tables intact as atomic chunks (or splits massive tables by row while repeating the Markdown table header on every split chunk).
  - **Contextual Breadcrumb Prepending**: Every chunk is prefixed with its structural lineage before embedding and indexing:
    ```markdown
    [Document: Master_Services_Agreement_2024.pdf | Page: 12]
    [Section Path: ARTICLE 8: INDEMNIFICATION AND LIABILITY > 8.3 Limitation of Liability]
    ---
    IN NO EVENT SHALL EITHER PARTY'S AGGREGATE LIABILITY EXCEED TWELVE (12) MONTHS OF FEES...
    ```

### 5.3 Dual-Index Hybrid Search & Reciprocal Rank Fusion (`src/retrieval/`)
- **Dense Retrieval**: Embeds context-enriched chunks using `BAAI/bge-small-en-v1.5` (or OpenAI `text-embedding-3-small`) stored in ChromaDB with metadata filters (`doc_id`, `page_no`, `element_type`). Fetches top $K_{dense} = 25$ chunks.
- **Sparse Retrieval**: Tokenizes chunks preserving section numbers (e.g., `14.2(a)`), currency symbols, and acronyms via BM25Okapi. Fetches top $K_{sparse} = 25$ chunks.
- **Reciprocal Rank Fusion (RRF)**:
  $$\text{RRF\_Score}(d \in D) = \sum_{m \in \{\text{dense}, \text{bm25}\}} \frac{1}{k + \text{rank}_m(d)}$$
  where smoothing constant $k = 60$.
- **Cross-Encoder Reranking**: Takes the top $N = 15$ fused chunks from RRF and scores `(query, chunk_text)` pairs jointly using `cross-encoder/ms-marco-MiniLM-L-6-v2` or `BAAI/bge-reranker-base`, returning the final top $K_{final} = 5$ chunks to the generator.

### 5.4 Grounded Generation (`src/generation/`)
- **Structured Outputs**: Enforces a Pydantic response schema containing:
  - `answer`: Direct markdown synthesis.
  - `citations`: Array of `{doc_name, page_number, section_path, verbatim_quote, relevance_score}`.
  - `unanswerable_reason`: Populated if the retrieved context does not contain the facts required to answer.
- **Retriever Telemetry**: Also returns the intermediate Dense rank, BM25 rank, RRF score, and Cross-Encoder score for each chunk so the Next.js UI can render an interactive "Retrieval Explainability" drawer.

---

## 6. Ragas Programmatic Evaluation Suite (`src/evaluation/`)

The automated evaluation module runs the pipeline against `golden_dataset.json` and computes the 4 core Ragas metrics:

| Ragas Metric | Component Tested | Target Threshold | Diagnostic & Automated Remediation |
| :--- | :--- | :--- | :--- |
| **Context Precision** | Retriever & Reranker | `>= 0.85` | Evaluates if relevant chunks rank at the top. Tuned via Cross-Encoder threshold and RRF $k$ parameter. |
| **Context Recall** | Parser & Dual Index | `>= 0.85` | Evaluates if all ground-truth facts were retrieved. Tuned by adjusting chunk size, breadcrumb depth, and $K_{dense}/K_{sparse}$. |
| **Faithfulness** | LLM Generator | `>= 0.92` | Detects hallucinations by verifying every claim against retrieved chunks. Tuned via strict system prompts and temperature `0.0`. |
| **Answer Relevancy** | End-to-End Pipeline | `>= 0.85` | Penalizes verbose, incomplete, or off-topic answers. Tuned via structured response schemas and few-shot examples. |

---

## 7. Next.js Frontend Roadmap (Future UI Vision)

When building the `frontend/` application in Next.js (App Router + Tailwind CSS + shadcn/ui), ClauseLens will feature four flagship views:
1. **Document Intelligence Workspace**: Drag-and-drop PDF uploader with a live split-screen view—original PDF on the left (with interactive bounding-box overlays) and Docling's parsed Markdown/Table hierarchy on the right.
2. **ClauseLens Copilot & Explainable Search**: Chat interface where clicking any inline `[Citation]` highlights the exact paragraph or table on the PDF canvas and opens a drawer showing the chunk's **Dense Rank vs. BM25 Rank vs. RRF Score vs. Reranker Score**.
3. **Contract Diff & Matrix Studio**: Side-by-side comparison table across multiple uploaded agreements (e.g., comparing Liability Caps, Notice Periods, and SLA Credits across 3 vendors).
4. **Ragas Quality & CI Observatory**: Visual dashboard displaying historical Ragas evaluation runs, metric radar charts, and per-question failure diagnostics.

---

## 8. Phased Implementation Plan

- **Phase 1: Environment & Project Scaffolding**
  - Initialize Python 3.12 virtual environment, install dependencies (`docling`, `chromadb`, `rank-bm25`, `sentence-transformers`, `ragas`, `fastapi`), and create the modular `backend/` structure.
- **Phase 2: Docling Ingestion & Contextual Chunker**
  - Implement `docling_parser.py` and `contextual_chunker.py`. Generate realistic multi-column sample contracts with embedded tables to test parsing and breadcrumb prepending.
- **Phase 3: Hybrid Retrieval (Dense + BM25 + RRF + Cross-Encoder)**
  - Build the dual index, implement the RRF algorithm, integrate the Cross-Encoder reranker, and write unit tests verifying lexical + semantic fusion.
- **Phase 4: Grounded Generator & FastAPI Backend**
  - Build the structured LLM synthesis layer and expose REST endpoints (`/api/ingest`, `/api/query`, `/api/compare`, `/api/evaluate`) ready for the Next.js frontend.
- **Phase 5: Ragas Benchmark Suite & CI Gate**
  - Curate the benchmark evaluation dataset, implement `ragas_runner.py`, and generate a baseline evaluation report markdown scorecard.
