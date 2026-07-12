from app.shared.ai_generation import generate_structured
from app.services.career_knowledge.prompts import build_career_knowledge_prompt
from app.services.career_knowledge.schemas import (
    CareerKnowledgeAIResponse,
    CareerKnowledgeResponse,
)


def generate_career_knowledge_with_gemini(job_role: str) -> CareerKnowledgeResponse:
    """
    Pure AI function. Knows nothing about MongoDB, Express, repositories,
    users, or job role IDs. Input: a job role string. Output: a validated
    CareerKnowledgeResponse ready to be handed back to Express.
    """
    prompt = build_career_knowledge_prompt(job_role)

    ai_response = generate_structured(prompt, CareerKnowledgeAIResponse)

    return CareerKnowledgeResponse.from_ai_response(ai_response)