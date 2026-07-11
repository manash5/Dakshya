from fastapi import APIRouter, HTTPException

from app.services.career_knowledge.schemas import (
    CareerKnowledgeRequest,
    CareerKnowledgeResponse,
)
from app.services.career_knowledge.service import generate_career_knowledge_with_gemini

router = APIRouter(prefix="/api/v1/career-knowledge", tags=["career-knowledge"])


@router.post("/generate", response_model=CareerKnowledgeResponse)
def generate_career_knowledge(payload: CareerKnowledgeRequest) -> CareerKnowledgeResponse:
    try:
        return generate_career_knowledge_with_gemini(payload.jobRole)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}") from exc