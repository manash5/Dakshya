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


class InterviewQuestion(BaseModel):
    question: str
    type: str = Field(..., description='Exactly "coding" or "oral"')


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
