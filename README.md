# ClauseLens: Production-Grade RAG Pipeline with Document Intelligence

> **Enterprise Contract & Policy Intelligence Platform**  
> Powered by **Docling** Layout Parsing, **ChromaDB + BM25** Dual Indexing, **Reciprocal Rank Fusion (RRF)**, **Cross-Encoder Reranking**, **Grounded Generation with Bounding-Box Citations**, and **Ragas** Automated CI Quality Gating.

---

## 🏛️ System Architecture

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                        1. INGESTION & DOCLING PIPELINE                       │
└──────────────────────────────────────────────────────────────────────────────┘
  [Raw PDFs / Scanned Contracts / Policies]
                     │
                     ▼
        ┌─────────────────────────┐
        │   Docling Converter     │ ──► Layout Analysis, OCR, Table Structure (TableFormer ACCURATE)
        └─────────────────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │   Contextual Chunker    │ ──► Section Splits + Breadcrumb Lineage Prepending
        └─────────────────────────┘     [Document: MSA.pdf | Page: 4] [Section: Article 11 > 11.4]
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  Dense Vector   │     │  Sparse Keyword │
│  Index (Chroma) │     │   Index (BM25)  │
└────────┬────────┘     └────────┬────────┘
         │                       │
┌────────┴───────────────────────┴─────────────────────────────────────────────┐
│                    2. HYBRID RETRIEVAL & RERANKING ENGINE                    │
└──────────────────────────────────────────────────────────────────────────────┘
         │                       │
         ▼                       ▼
  [Top-25 Semantic]       [Top-25 Lexical]
         │                       │
         └───────────┬───────────┘
                     ▼
        ┌─────────────────────────┐
        │ Reciprocal Rank Fusion  │ ──► Exact 1-indexed formula: RRF(d) = Σ 1 / (60 + rank_m(d))
        │         (RRF)           │
        └─────────────────────────┘
                     │ (Top-15 Fused Candidates)
                     ▼
        ┌─────────────────────────┐
        │ Cross-Encoder Reranker  │ ──► Joint Query-Chunk Scoring (ms-marco-MiniLM-L-6-v2)
        │                         │     Selects Final Top-5 Context Chunks
        └─────────────────────────┘
                     │
┌────────────────────┴─────────────────────────────────────────────────────────┐
│                  3. GROUNDED GENERATION & RAGAS EVALUATION                   │
└──────────────────────────────────────────────────────────────────────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │  Grounded LLM Synthesis │ ──► Inline Citations [1], [2] + Bounding Box Coordinates (l, t, r, b)
        └─────────────────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
┌─────────────────┐     ┌─────────────────────────────────────────┐
│ Next.js 15 UI   │     │         Ragas Evaluation Suite          │
│ (PDF Viewer +   │     │ • Context Precision (0.880 >= 0.85)     │
│  Diff Studio)   │     │ • Context Recall    (0.910 >= 0.85)     │
│                 │     │ • Faithfulness      (0.950 >= 0.92)     │
│                 │     │ • Answer Relevancy  (0.890 >= 0.85)     │
└─────────────────┘     └─────────────────────────────────────────┘
```

---

## ⚡ Quickstart Guide

### 1. Backend Setup (Python 3.12 + uv)

```bash
# 1. Create and activate Python 3.12 virtual environment
uv venv .venv --python python3.12
source .venv/bin/activate

# 2. Install pinned dependencies with uv
uv pip install -r backend/requirements.txt

# 3. Configure environment variables (optional: add Gemini or OpenAI API key)
cp .env.example .env

# 4. Ingest sample contracts into persistent ChromaDB & BM25
python backend/data/ingest_sample.py

# 5. Run the full test suite (16/16 Unit Tests)
pytest backend/tests/ -v

# 6. Run the Ragas benchmark evaluation suite
python -m backend.src.evaluation.ragas_runner

# 7. Start the FastAPI REST server
uvicorn backend.src.api.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API documentation will be available at: `http://localhost:8000/docs`

---

### 2. Frontend Setup (Next.js 15 + Tailwind CSS)

```bash
cd frontend

# Install frontend dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to interact with the ClauseLens interface:
- **Document Workspace**: Upload PDFs, inspect Docling layout trees and Markdown tables.
- **ClauseLens Copilot**: Ask contract queries, inspect inline citations `[1]`, and open the slide-out **Retrieval Explainability Drawer** (Dense vs BM25 vs RRF vs Cross-Encoder scores).
- **Contract Diff Studio**: Generate side-by-side comparison tables across agreements.
- **Ragas Observatory**: Review real-time quality metric cards and benchmark diagnostics.

---

## 📊 Ragas Evaluation Benchmark Results

The pipeline is benchmarked against `golden_dataset.json` with automated CI gating:

| Metric | Measured Score | Target Threshold | CI Gate Status |
| :--- | :---: | :---: | :---: |
| **Context Precision** | **`0.880`** | $\ge 0.85$ | **PASS ✅** |
| **Context Recall** | **`0.910`** | $\ge 0.85$ | **PASS ✅** |
| **Faithfulness** | **`0.950`** | $\ge 0.92$ | **PASS ✅** |
| **Answer Relevancy** | **`0.890`** | $\ge 0.85$ | **PASS ✅** |

Scorecards are automatically exported to [`evaluation_report.md`](file:///Users/ashishkumarshah/Documents/CampusXaiengineering/Project/ClauseLens/evaluation_report.md) and [`evaluation_results.json`](file:///Users/ashishkumarshah/Documents/CampusXaiengineering/Project/ClauseLens/evaluation_results.json).

---

## 📁 Repository Structure

```text
ClauseLens/
├── blueprint.md                        # Architecture blueprint
├── SKILL.md                            # Production engineering mandates
├── PROGRESS.md                         # Milestone implementation tracker
├── README.md                           # Documentation & quickstart
├── .env.example                        # Environment variables template
├── evaluation_report.md                # Generated Ragas scorecard
├── evaluation_results.json             # Evaluation telemetry JSON
│
├── .github/
│   └── workflows/
│       └── ragas_eval_ci.yml           # Automated GitHub Actions CI quality gate
│
├── backend/                            # Python 3.12 Backend
│   ├── requirements.txt                # Pinned dependencies
│   ├── data/                           # Indices, golden evaluation dataset, samples
│   ├── src/
│   │   ├── config.py                   # Pydantic v2 settings
│   │   ├── exceptions.py               # Custom domain exceptions
│   │   ├── schemas/                    # DocumentChunk, Citation, RAGResponse models
│   │   ├── ingestion/                  # Docling parser & contextual breadcrumb chunker
│   │   ├── indexing/                   # ChromaDB vector store, BM25Plus, IndexManager
│   │   ├── retrieval/                  # RRF algorithm, Cross-Encoder reranker, HybridRetriever
│   │   ├── generation/                 # Grounded prompts & citation hydration engine
│   │   ├── evaluation/                 # Ragas runner & golden benchmark validator
│   │   └── api/                        # FastAPI main & REST routers (/documents, /query)
│   └── tests/                          # 16 Pytest unit & integration tests
│
└── frontend/                           # Next.js 15 App Router UI
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    └── src/
        ├── types/                      # Strict TypeScript data contracts
        ├── lib/api.ts                  # Typed FastAPI client
        ├── components/                 # PDF BoundingBox Overlay, CitationBadge, TelemetryDrawer, Navbar
        └── app/                        # Master Dashboard (Workspace, Copilot, Diff, Observatory)
```

