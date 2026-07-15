from typing import Optional

from app.shared.ai_generation import generate_structured
from app.services.resume_analysis.extractor import extract_text_from_pdf
from app.services.resume_analysis.prompts import (
    build_resume_comparison_prompt,
    build_resume_extraction_prompt,
)
from app.services.resume_analysis.schemas import (
    PreviousResumeSummary,
    ResumeAnalysisResult,
    ResumeComparison,
    ResumeExtractionAIResponse,
)


def analyze_resume(
    file_bytes: bytes,
    candidate_full_name: str,
    previous_summary: Optional[PreviousResumeSummary],
) -> ResumeAnalysisResult:
    """
    Pure AI function, same shape as generate_career_knowledge: knows nothing
    about MongoDB, Express, or users. Input: raw resume bytes + the account
    holder's name (+ optionally a summary of their last analysis). Output: a
    validated ResumeAnalysisResult ready to be handed back to Express.
    """
    resume_text = extract_text_from_pdf(file_bytes)

    extraction_prompt = build_resume_extraction_prompt(resume_text, candidate_full_name)
    extraction = generate_structured(extraction_prompt, ResumeExtractionAIResponse)

    comparison: Optional[ResumeComparison] = None

    # Only compare when the AI actually confirmed this resume belongs to the
    # same person -- comparing ATS scores/skills across two different
    # people's resumes would be meaningless, not just unhelpful.
    if extraction.identityMatch and previous_summary is not None:
        comparison_prompt = build_resume_comparison_prompt(extraction, previous_summary)
        comparison = generate_structured(comparison_prompt, ResumeComparison)

    return ResumeAnalysisResult(**extraction.model_dump(), comparison=comparison)
