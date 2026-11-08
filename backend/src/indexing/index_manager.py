"""Dual-index synchronization manager for ClauseLens.

Coordinates atomic indexing across DenseChromaStore and SparseBM25Store,
guaranteeing deterministic chunk_id alignment and persistent state.
"""

from collections.abc import Iterable
import logging
from pathlib import Path

from backend.src.config import get_settings
from backend.src.exceptions import IndexSyncError
from backend.src.indexing.dense_store import DenseChromaStore
from backend.src.indexing.sparse_store import SparseBM25Store
from backend.src.schemas.document import DocumentChunk

logger = logging.getLogger(__name__)


class IndexManager:
    """Atomic dual-index synchronization manager."""

    def __init__(
        self,
        dense_store: DenseChromaStore | None = None,
        sparse_store: SparseBM25Store | None = None,
    ) -> None:
        """Initialize the manager with dense and sparse stores."""
        settings = get_settings()
        self.dense_store = dense_store or DenseChromaStore()
        self.sparse_store = sparse_store or SparseBM25Store()

        # Load persisted BM25 index from disk if present
        self.bm25_persist_dir = settings.bm25_persist_dir
        self.sparse_store.load(self.bm25_persist_dir)

        logger.info(
            "IndexManager ready: Dense vectors=%d, BM25 chunks=%d",
            self.dense_store.total_chunks,
            self.sparse_store.total_chunks,
        )

    def index_chunks(self, chunks: Iterable[DocumentChunk]) -> None:
        """Atomically index chunks into both ChromaDB and BM25 stores.

        Args:
            chunks: Chunks to index.

        Raises:
            IndexSyncError: If writing to either index fails.
        """
        chunk_list = list(chunks)
        if not chunk_list:
            return

        logger.info("Synchronizing %d chunks across dual indices...", len(chunk_list))
        try:
            # 1. Index into ChromaDB dense store
            self.dense_store.add_chunks(chunk_list)

            # 2. Index into BM25 sparse store
            self.sparse_store.add_chunks(chunk_list)

            # 3. Atomically persist BM25 to disk
            self.sparse_store.save(self.bm25_persist_dir)

            logger.info(
                "Successfully synchronized %d chunks. Total: Dense=%d, Sparse=%d",
                len(chunk_list),
                self.dense_store.total_chunks,
                self.sparse_store.total_chunks,
            )
        except Exception as exc:
            logger.exception("Failed dual-index synchronization: %s", exc)
            raise IndexSyncError(
                f"Dual index synchronization failed: {exc}",
                details={"chunk_count": len(chunk_list), "error": str(exc)},
            ) from exc

    def get_chunk(self, chunk_id: str) -> DocumentChunk | None:
        """Retrieve chunk by ID, checking memory first then vector metadata."""
        chunk = self.sparse_store.get_chunk(chunk_id)
        if chunk is not None:
            return chunk
        return self.dense_store.get_chunk(chunk_id)

    def stats(self) -> dict[str, int]:
        """Return counts of indexed elements across stores."""
        return {
            "dense_count": self.dense_store.total_chunks,
            "sparse_count": self.sparse_store.total_chunks,
        }
