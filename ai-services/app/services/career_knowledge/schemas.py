from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import List

from pydantic import BaseModel, Field, HttpUrl


# ---------------------------------------------------------------------------
# Request
# ---------------------------------------------------------------------------

class CareerKnowledgeRequest(BaseModel):
    jobRole: str = Field(..., min_length=2, description="Job role/title to generate career knowledge for")


# ---------------------------------------------------------------------------
# Enums (kept in sync with the Express-side zod enums)
# ---------------------------------------------------------------------------

class DifficultyLevel(str, Enum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"


class FutureDemandLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    VERY_HIGH = "Very High"


class MarketTrendDirection(str, Enum):
    GROWING = "Growing"
    STABLE = "Stable"
    DECLINING = "Declining"


class LearningResourceType(str, Enum):
    COURSE = "Course"
    DOCUMENTATION = "Documentation"
    VIDEO = "Video"
    ARTICLE = "Article"


# ---------------------------------------------------------------------------
# Nested objects
# ---------------------------------------------------------------------------

class RoadmapStep(BaseModel):
    order: int = Field(..., ge=1)
    title: str
    description: str
    estimatedWeeks: float = Field(..., ge=1)
    requiredSkills: List[str]
    completionCriteria: str
    resources: List[str]


class Project(BaseModel):
    title: str
    description: str
    difficulty: DifficultyLevel
    technologies: List[str]
    estimatedHours: float = Field(..., ge=1)


class InterviewGuide(BaseModel):
    commonTopics: List[str]
    focusAreas: List[str]
    interviewTips: List[str]
    importantConcepts: List[str]


class LearningResource(BaseModel):
    title: str
    type: LearningResourceType
    url: HttpUrl
    skills: List[str] = Field(
        default_factory=list,
        description="1-3 skills from requiredSkills this resource teaches",
    )


class Salary(BaseModel):
    min: float = Field(..., ge=1)
    max: float = Field(..., ge=1)
    currency: str


class MarketTrendAI(BaseModel):
    """What we ask Gemini to generate for marketTrend (no date - LLMs are unreliable at dates)."""
    trend: MarketTrendDirection


class MarketTrend(MarketTrendAI):
    """Full marketTrend object returned by the endpoint. updatedAt is set by the service, not the AI."""
    updatedAt: datetime


# ---------------------------------------------------------------------------
# Top-level response models
# ---------------------------------------------------------------------------

class _CareerKnowledgeCore(BaseModel):
    careerDescription: str
    requiredSkills: List[str]
    tools: List[str]
    frameworks: List[str]
    certifications: List[str]
    roadmap: List[RoadmapStep]
    projects: List[Project]
    interviewGuide: InterviewGuide
    learningResources: List[LearningResource]
    salary: Salary
    difficulty: DifficultyLevel
    futureDemand: FutureDemandLevel
    estimatedCompletionMonths: float = Field(..., ge=1)


class CareerKnowledgeAIResponse(_CareerKnowledgeCore):
    """
    The exact shape Gemini must return.
    Deliberately excludes: jobRoleId, aiGeneratedDate, isUpdating (Express owns these),
    and marketTrend.updatedAt (set server-side, see MarketTrendAI).
    """
    marketTrend: MarketTrendAI


class CareerKnowledgeResponse(_CareerKnowledgeCore):
    """
    What the /career-knowledge/generate endpoint actually returns to Express.
    Same as CareerKnowledgeAIResponse, but marketTrend.updatedAt is filled in.

    Contract with Express (mirrors CreateCareerKnowledgeDtoSchema, which is
    CareerKnowledgeSchema.omit({ isUpdating, aiGeneratedDate })):

      - jobRoleId       -> NOT returned here. Express attaches it from the route
                            (this document has no concept of a job role's Mongo _id).
      - isUpdating       -> NOT returned here. Express defaults this to false.
      - aiGeneratedDate  -> NOT returned here. Express stamps this with new Date()
                            at save time.
      - marketTrend.updatedAt -> IS returned here. It's a different date than
                            aiGeneratedDate (trend freshness vs. doc generation
                            time) and CreateCareerKnowledgeDtoSchema does not
                            omit it, so it must be present on this response.

    To build a CreateCareerKnowledgeDto in Express:
        { jobRoleId: jobRole._id.toString(), ...fastApiResponse }
    """
    marketTrend: MarketTrend

    @classmethod
    def from_ai_response(cls, ai_response: CareerKnowledgeAIResponse) -> "CareerKnowledgeResponse":
        data = ai_response.model_dump()
        data["marketTrend"] = {
            **ai_response.marketTrend.model_dump(),
            "updatedAt": datetime.now(timezone.utc),
        }
        return cls.model_validate(data)