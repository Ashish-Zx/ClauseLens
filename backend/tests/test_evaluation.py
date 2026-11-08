"""Unit tests for the Ragas evaluation module."""

from pathlib import Path
from backend.src.evaluation.dataset_builder import GoldenTestCase, load_golden_dataset
from backend.src.evaluation.ragas_runner import EvaluationReport, TARGET_THRESHOLDS


def test_load_golden_dataset() -> None:
    """Verify golden dataset file loads valid GoldenTestCase models."""
    dataset_path = Path("backend/data/evaluation/golden_dataset.json")
    test_cases = load_golden_dataset(dataset_path)

    assert len(test_cases) == 5
    first_tc = test_cases[0]
    assert first_tc.id == "eval_001"
    assert "Section 11.4(b)" in first_tc.question
    assert "$1,500,000" in first_tc.ground_truth
    assert len(first_tc.expected_context_keywords) > 0


def test_evaluation_report_schema() -> None:
    """Verify EvaluationReport models and pass/fail gate checks."""
    mock_metrics = {
        "context_precision": 0.88,
        "context_recall": 0.87,
        "faithfulness": 0.94,
        "answer_relevancy": 0.89,
    }
    all_passed = all(
        mock_metrics[m] >= TARGET_THRESHOLDS[m]
        for m in TARGET_THRESHOLDS
    )
    assert all_passed is True

    report = EvaluationReport(
        timestamp="2026-11-08T12:00:00Z",
        metrics=mock_metrics,
        thresholds=TARGET_THRESHOLDS,
        passed_ci_gate=all_passed,
        diagnostics=[],
    )
    assert report.passed_ci_gate is True
    assert report.metrics["faithfulness"] == 0.94

