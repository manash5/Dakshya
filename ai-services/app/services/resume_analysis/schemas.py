from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Nested objects
# ---------------------------------------------------------------------------

class ResumeProject(BaseModel):
    title: str
    description: str
    technologies: List[str]

    @field_validator("title", "description", mode="before")
    @classmethod
    def _null_to_empty(cls, v):
        return v or ""


class ResumeExperience(BaseModel):
    title: str
    company: str
    duration: str
    description: str

    # Groq's JSON mode will happily emit an explicit `null` for a field it
    # couldn't find in the resume (e.g. no listed duration/company) even
    # though the schema says string -- normalized to "" here rather than
    # pushing Optional[str] through Express/Mongo too, so the contract with
    # everything downstream stays "always a string, possibly empty".
    @field_validator("title", "company", "duration", "description", mode="before")
    @classmethod
    def _null_to_empty(cls, v):
        return v or ""


class ResumeEducation(BaseModel):
    institution: str
    degree: str
    fieldOfStudy: Optional[str] = None
    duration: Optional[str] = None

    @field_validator("institution", "degree", mode="before")
    @classmethod
    def _null_to_empty(cls, v):
        return v or ""


# ---------------------------------------------------------------------------
# Extraction (single LLM call: parses the resume AND judges whether the name
# on it plausibly matches the account holder -- one call instead of two
# since both need the same resume text in context anyway)
# ---------------------------------------------------------------------------

class ResumeExtractionAIResponse(BaseModel):
    candidateNameOnResume: Optional[str] = Field(
        None, description="The candidate's full name exactly as written on the resume, if present"
    )
    identityMatch: bool = Field(
        ...,
        description=(
            "Whether candidateNameOnResume plausibly refers to the same person as "
            "the account holder's name given in the prompt (allow for minor "
            "spelling/formatting/nickname differences). False if the resume has no "
            "name, an unrelated name, or looks like someone else's resume."
        ),
    )
    identityReason: str = Field(
        ..., description="One short sentence explaining the identityMatch verdict"
    )
    skills: List[str]
    projects: List[ResumeProject]
    experience: List[ResumeExperience]
    education: List[ResumeEducation]
    strengths: List[str]
    weaknesses: List[str]
    atsScore: float = Field(
        ..., ge=0, le=100, description="Applicant Tracking System compatibility score, 0-100"
    )
    recommendations: List[str]


# ---------------------------------------------------------------------------
# Comparison against a previous analysis (only run when identityMatch is
# true and a previous analysis exists -- see service.py)
# ---------------------------------------------------------------------------

class PreviousResumeSummary(BaseModel):
    skills: List[str]
    strengths: List[str]
    weaknesses: List[str]
    atsScore: float


class ResumeComparison(BaseModel):
    improvements: List[str]
    regressions: List[str]
    newSkills: List[str]
    summary: str


class ResumeAnalysisResult(ResumeExtractionAIResponse):
    comparison: Optional[ResumeComparison] = None
