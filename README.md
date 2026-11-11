# ClauseLens

**Enterprise contract & policy intelligence.** Ask plain-language questions across your agreements and receive grounded answers with pinpoint citations — powered by a production-grade hybrid RAG pipeline.

<p align="center">
  <code>Docling</code> · <code>ChromaDB + BM25</code> · <code>RRF</code> · <code>Cross-Encoder Reranking</code> · <code>Grounded Generation</code> · <code>Ragas CI</code>
</p>

---

## Features

- **Document intelligence** — Parses scanned PDFs with Docling layout analysis, OCR, and table reconstruction (TableFormer).
- **Hybrid retrieval** — Combines semantic (ChromaDB) and lexical (BM25) search, fused with Reciprocal Rank Fusion (RRF) and refined by a cross-encoder reranker.
- **Grounded answers** — Every response carries inline citations `[1]`, `[2]` with verbatim quotes and page-level bounding-box coordinates.
- **Role-aware UI** — A clean, minimalist interface with a **Standard / Developer** toggle: Standard users see only core workflows; Developer reveals retrieval telemetry, contract comparison, and evaluation dashboards.
- **Automated quality gating** — Ragas evaluation suite runs in CI on a golden benchmark dataset.

---

## Architecture

```text
            ┌──────────────────────────────────────────────────────────┐
            │                 1. INGESTION & PARSING                    │
            └──────────────────────────────────────────────────────────┘
               PDFs / scanned contracts / policies
                         │  Docling (layout + OCR + table extraction)
                         ▼
            Contextual chunker (section splits + breadcrumb lineage)
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
       ┌────────────┐       ┌────────────┐
       │  ChromaDB  │       │   BM25     │
       │ (dense)    │       │ (sparse)   │
       └────────────┘       └────────────┘
              │                     │
              └──────────┬──────────┘
                         ▼
            Reciprocal Rank Fusion (RRF)
                         │  cross-encoder reranker → top-5 context
                         ▼
            ┌──────────────────────────────────────────────────────────┐
            │             2. GROUNDED GENERATION                        │
            └──────────────────────────────────────────────────────────┘
            Grounded LLM synthesis → inline citations + bounding boxes
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
       ┌────────────┐       ┌────────────┐
       │ Next.js UI │       │  Ragas    │
       │ (Standard/ │       │ evaluation │
       │  Developer)│       │  + CI gate │
       └────────────┘       └────────────┘
```

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS, TypeScript |
| Backend | FastAPI, Pydantic v2, uvicorn |
| Parsing | Docling (layout, OCR, TableFormer) |
| Retrieval | ChromaDB (dense), BM25 (sparse), RRF fusion, cross-encoder reranking |
| Generation | Gemini / OpenAI grounded synthesis with citation hydration |
| Evaluation | Ragas on a golden benchmark dataset, CI-gated |

---

## Getting Started

### Backend (Python 3.12 + uv)

```bash
uv venv .venv --python python3.12
source .venv/bin/activate
uv pip install -r backend/requirements.txt

cp .env.example .env            # optional: set Gemini / OpenAI API key

python backend/data/ingest_sample.py   # index sample contracts
pytest backend/tests/ -v               # run test suite
python -m backend.src.evaluation.ragas_runner  # run evaluation

uvicorn backend.src.api.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API docs: `http://localhost:8000/docs`

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

---

## UI Modes

The interface ships with a **Standard / Developer** toggle (top-right of the navigation bar). Your choice is remembered across reloads.

| View | What you see |
| :--- | :--- |
| **Standard** | Core workflows only: ask questions + read sourced answers, preview source documents, and upload contracts. No scores or internals. |
| **Developer** | Everything in Standard, plus contract comparison, the Ragas evaluation dashboard, retrieval telemetry (Dense / BM25 / Rerank scores), latency figures, and the explainability drawer. |

---

## API

Base URL: `http://localhost:8000/api`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/documents/upload` | Upload & parse a PDF, then dual-index it |
| `GET` | `/documents/stats` | Dense / sparse index statistics |
| `GET` | `/documents/{chunk_id}` | Inspect a single chunk |
| `POST` | `/query/search` | Hybrid retrieval with scored chunks |
| `POST` | `/query/ask` | Grounded Q&A with citations |
| `POST` | `/query/compare` | Cross-agreement clause comparison |
| `GET` | `/health` | Service health check |

---

## Evaluation

The pipeline is validated against `data/evaluation/golden_dataset.json` with automated CI gating:

| Metric | Score | Target | Status |
| :--- | :---: | :---: | :---: |
| Context Precision | `0.880` | ≥ 0.85 | ✅ PASS |
| Context Recall | `0.910` | ≥ 0.85 | ✅ PASS |
| Faithfulness | `0.950` | ≥ 0.92 | ✅ PASS |
| Answer Relevancy | `0.890` | ≥ 0.85 | ✅ PASS |

Full scorecards: [`evaluation_report.md`](evaluation_report.md) · [`evaluation_results.json`](evaluation_results.json)

---

## Repository Structure

```text
ClauseLens/
├── backend/
│   ├── src/
│   │   ├── api/            # FastAPI app + routers (/documents, /query)
│   │   ├── ingestion/      # Docling parser, contextual chunker
│   │   ├── indexing/       # ChromaDB, BM25, index manager
│   │   ├── retrieval/      # RRF, reranker, hybrid retriever
│   │   ├── generation/     # Grounded prompts & citation hydration
│   │   ├── evaluation/     # Ragas runner & golden benchmark
│   │   ├── schemas/        # Request/response models
│   │   ├── config.py
│   │   └── exceptions.py
│   ├── data/               # Samples, indices, golden dataset
│   └── tests/
├── frontend/
│   └── src/
│       ├── app/            # Dashboard (Copilot, Workspace, Compare, Evaluation)
│       ├── components/     # Navbar, CitationBadge, TelemetryDrawer, PDF overlay
│       ├── lib/            # Typed API client
│       └── types/          # Strict TypeScript contracts
├── .github/workflows/      # Ragas CI quality gate
├── .env.example
└── evaluation_report.md
```

---

## License

This project is for internal / educational use. See repository history for contributors.
