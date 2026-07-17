from __future__ import annotations

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field

# Reused rather than redefined -- same enum, same "kept in sync with the
# Express-side zod enum" contract as career_knowledge's difficulty field.
from app.services.career_knowledge.schemas import DifficultyLevel


class InterviewMode(str, Enum):
    ORAL = "Oral"
    CODING = "Coding"
    MIXED = "Mixed"


# ---------------------------------------------------------------------------
# Question generation
# ---------------------------------------------------------------------------

class GenerateQuestionsRequest(BaseModel):
    jobRole: str = Field(..., min_length=2)
    difficulty: DifficultyLevel
    mode: InterviewMode
    questionCount: int = Field(..., ge=1, le=20)
    skill: Optional[str] = Field(
        None,
        description="Optional single skill to constrain every generated question to. "
        "Omitted/None means unconstrained generation across the whole role (today's behavior).",
    )
    skills: Optional[List[str]] = Field(
        None,
        description="Optional list of 2+ skills to distribute questions across (roughly evenly, "
        "each covered at least once). Mutually exclusive with `skill` -- used for auto-generated "
        "multi-skill practice sessions rather than a single skill-scoped drill.",
    )


class InterviewQuestion(BaseModel):
    question: str
    type: str = Field(..., description='Exactly "coding" or "oral"')
    skills: List[str] = Field(
        default_factory=list,
        description="1-3 relevant skills/technologies this question tests",
    )


class GenerateQuestionsAIResponse(BaseModel):
    questions: List[InterviewQuestion]


# ---------------------------------------------------------------------------
# Answer evaluation
# ---------------------------------------------------------------------------

class EvaluateAnswerRequest(BaseModel):
    question: str
    questionType: str
    jobRole: str
    difficulty: DifficultyLevel
    userAnswer: Optional[str] = None
    userCode: Optional[str] = None


class EvaluationAIResponse(BaseModel):
    technicalScore: float = Field(..., ge=0, le=100)
    confidenceScore: float = Field(..., ge=0, le=100)
    feedback: str
    idealAnswer: str


# ---------------------------------------------------------------------------
# Transcription
# ---------------------------------------------------------------------------

class TranscriptionResponse(BaseModel):
    transcription: str
