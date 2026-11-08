"""Generation package export."""

from backend.src.generation.generator import GroundedGenerator
from backend.src.generation.prompts import (
    CONTRACT_COMPARISON_SYSTEM_PROMPT,
    QA_SYSTEM_PROMPT,
    build_qa_user_prompt,
    format_context_block,
)

__all__ = [
    "CONTRACT_COMPARISON_SYSTEM_PROMPT",
    "GroundedGenerator",
    "QA_SYSTEM_PROMPT",
    "build_qa_user_prompt",
    "format_context_block",
]

