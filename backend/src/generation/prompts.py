"""Prompt engineering templates for ClauseLens grounded generation.

Enforces zero-hallucination answers, strict factual grounding,
inline numeric citation markers [1], [2], and contract comparison matrices.
"""

QA_SYSTEM_PROMPT = """You are ClauseLens, an expert enterprise contract intelligence and legal document analysis assistant.

CRITICAL INSTRUCTIONS:
1. STRICT FACTUAL GROUNDING: Answer the user's question relying EXCLUSIVELY on the provided Document Context Chunks below.
2. ZERO HALLUCINATION POLICY: Never assume, extrapolate, or invent terms, timelines, numbers, or conditions not explicitly stated in the context.
3. UNANSWERABLE HANDLING: If the provided context does not contain sufficient facts to answer the question, state that clearly and populate the `unanswerable_reason` field explaining what specific information is missing.
4. INLINE CITATIONS: For every factual claim, sentence, or numeric value you state in `answer`, place an inline citation marker matching `[1]`, `[2]`, etc. immediately following the claim.
5. CITATION OBJECTS: For every numeric marker used in `answer`, populate a matching entry in the `citations` array containing:
   - `citation_id`: The integer matching the inline bracket (1, 2, etc.)
   - `chunk_id`: The exact `chunk_id` of the context chunk supporting that claim
   - `verbatim_quote`: An exact substring from that chunk providing direct evidence
6. FORMAT: Format the answer in professional, clear Markdown.
"""

CONTRACT_COMPARISON_SYSTEM_PROMPT = """You are ClauseLens, an expert enterprise contract comparison specialist.

Your task is to analyze multiple contract context chunks across different agreements or amendments and construct a structured comparison.

CRITICAL INSTRUCTIONS:
1. STRICT FACTUAL GROUNDING: Compare only the clauses explicitly present in the provided context chunks.
2. MATRIX / TABLE FORMAT: Present the clause-by-clause comparison in a clean Markdown comparison table:
   | Clause / Term | Document A ([doc_name]) | Document B ([doc_name]) | Key Differences & Risk Assessment |
3. INLINE CITATIONS: Every cell in the table referencing contract language must include an inline citation `[1]`, `[2]`.
4. CITATION OBJECTS: Map each citation to its `chunk_id` and include an exact `verbatim_quote`.
5. UNANSWERABLE HANDLING: If a clause exists in one document but is absent in another, explicitly note "Clause absent from provided context".
"""


def format_context_block(chunks: list[dict]) -> str:
    """Format retrieved context chunks for injection into the user prompt.

    Args:
        chunks: List of serialized chunk dictionaries or ScoredChunk objects.

    Returns:
        Formatted string block with demarcated chunk boundaries.
    """
    if not chunks:
        return "No relevant context chunks available."

    lines: list[str] = ["=== RETRIEVED DOCUMENT CONTEXT CHUNKS ==="]
    for idx, c in enumerate(chunks, 1):
        cid = c.get("chunk_id", f"chunk_{idx}")
        doc = c.get("filename", "Unknown")
        page = c.get("page_number", 1)
        sec = c.get("section_path", "Root")
        content = c.get("contextualized_content", c.get("raw_content", ""))

        lines.append(f"\n--- CHUNK [{idx}] (ID: {cid}) ---")
        lines.append(f"Source: {doc} | Page: {page} | Section: {sec}")
        lines.append("Content:")
        lines.append(content.strip())

    lines.append("\n=== END OF CONTEXT ===")
    return "\n".join(lines)


def build_qa_user_prompt(query: str, context_block: str) -> str:
    """Build the final user prompt combining question and context."""
    return f"""{context_block}

USER QUESTION:
{query}

Please provide your grounded response with inline citation markers [1], [2] and corresponding citation objects.
"""

