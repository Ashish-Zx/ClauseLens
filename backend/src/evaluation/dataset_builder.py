"""Golden benchmark dataset builder and validator for Ragas evaluation."""

import json
import logging
from pathlib import Path

from pydantic import BaseModel, Field

from backend.src.exceptions import EvaluationError
from backend.src.schemas.query import RAGResponse, ScoredChunk

logger = logging.getLogger(__name__)

DEFAULT_GOLDEN_DATASET_PATH = Path("backend/data/evaluation/golden_dataset.json")


class GoldenTestCase(BaseModel):
    """Schema for a single curated ground-truth evaluation benchmark item."""

    id: str = Field(..., description="Unique test case ID")
    question: str = Field(..., description="Benchmark contract question")
    ground_truth: str = Field(..., description="Human expert ground-truth answer")
    expected_context_keywords: list[str] = Field(
        default_factory=list,
        description="Key terms that must be present in retrieved context",
    )
    section_path: str = Field(..., description="Target section hierarchy")
    doc_name: str = Field(..., description="Target document filename")


def load_golden_dataset(
    file_path: Path | str | None = None,
) -> list[GoldenTestCase]:
    """Load and validate the curated golden evaluation dataset.

    Args:
        file_path: Optional path to golden dataset JSON file.

    Returns:
        List of validated GoldenTestCase models.

    Raises:
        EvaluationError: If dataset file is missing or invalid.
    """
    path = Path(file_path or DEFAULT_GOLDEN_DATASET_PATH).resolve()
    if not path.exists():
        raise EvaluationError(
            f"Golden evaluation dataset not found at {path}",
            details={"path": str(path)},
        )

    try:
        content = path.read_text(encoding="utf-8")
        raw_items = json.loads(content)
        test_cases = [GoldenTestCase.model_validate(item) for item in raw_items]
        logger.info("Loaded %d golden test cases from %s", len(test_cases), path.name)
        return test_cases
    except Exception as exc:
        raise EvaluationError(
            f"Failed to parse golden dataset at {path}: {exc}",
            details={"path": str(path), "error": str(exc)},
        ) from exc


def build_evaluation_payload(
    test_cases: list[GoldenTestCase],
    responses: list[RAGResponse],
    retrieved_contexts: list[list[ScoredChunk]],
) -> dict[str, list]:
    """Construct standard dictionary payload for Ragas / HuggingFace Dataset.

    Args:
        test_cases: Ground-truth test items.
        responses: Generated RAGResponse instances from pipeline.
        retrieved_contexts: Retrieved chunks corresponding to each test case.

    Returns:
        Dictionary formatted for HuggingFace Dataset conversion.
    """
    questions: list[str] = []
    answers: list[str] = []
    contexts: list[list[str]] = []
    ground_truths: list[str] = []

    for tc, resp, chunks in zip(test_cases, responses, retrieved_contexts):
        questions.append(tc.question)
        answers.append(resp.answer)
        contexts.append([c.contextualized_content for c in chunks])
        ground_truths.append(tc.ground_truth)

    return {
        "question": questions,
        "answer": answers,
        "contexts": contexts,
        "ground_truth": ground_truths,
    }

