from fastapi import APIRouter, HTTPException

from app.services.career_knowledge.schemas import (
    CareerKnowledgeRequest,
    CareerKnowledgeResponse,
    GenerateSkillResourcesRequest,
    GenerateSkillResourcesResponse,
)
from app.services.career_knowledge.service import (
    generate_career_knowledge,
    generate_skill_resources,
)

router = APIRouter(prefix="/api/v1/career-knowledge", tags=["career-knowledge"])


@router.post("/generate", response_model=CareerKnowledgeResponse)
def generate_career_knowledge_endpoint(payload: CareerKnowledgeRequest) -> CareerKnowledgeResponse:
    try:
        return generate_career_knowledge(payload.jobRole)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}") from exc


@router.post("/generate-resources", response_model=GenerateSkillResourcesResponse)
def generate_skill_resources_endpoint(
    payload: GenerateSkillResourcesRequest,
) -> GenerateSkillResourcesResponse:
    try:
        return generate_skill_resources(payload.jobRole, payload.skill)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}") from exc