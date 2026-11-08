"""Application configuration module for ClauseLens.

Centralizes all environment variables, model configurations, storage paths,
and retrieval hyperparameters using Pydantic v2 BaseSettings.
"""

from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """ClauseLens global settings loaded from environment or .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Application
    app_env: str = "development"
    log_level: str = "INFO"

    # Embedding & Reranker Models
    embedding_model_name: str = "BAAI/bge-small-en-v1.5"
    reranker_model_name: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"

    # Persistence Directories
    chroma_persist_dir: Path = Path("data/indices/chroma")
    bm25_persist_dir: Path = Path("data/indices/bm25")

    # Retrieval Hyperparameters (Reciprocal Rank Fusion & Reranking)
    rrf_k: int = 60
    top_k_dense: int = 25
    top_k_sparse: int = 25
    top_n_rerank: int = 15
    top_k_final: int = 5

    # API Keys for LLM Generation (optional during local testing)
    gemini_api_key: str | None = None
    openai_api_key: str | None = None


@lru_cache
def get_settings() -> Settings:
    """Return a cached singleton instance of application settings."""
    return Settings()

