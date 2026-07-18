from app.shared.ai_generation import generate_structured
from app.services.career_knowledge.prompts import (
    build_career_knowledge_prompt,
    build_skill_resources_prompt,
)
from app.services.career_knowledge.schemas import (
    CareerKnowledgeAIResponse,
    CareerKnowledgeResponse,
    GenerateSkillResourcesResponse,
)


def generate_career_knowledge(job_role: str) -> CareerKnowledgeResponse:
    """
    Pure AI function. Knows nothing about MongoDB, Express, repositories,
    users, or job role IDs. Input: a job role string. Output: a validated
    CareerKnowledgeResponse ready to be handed back to Express.
    """
    prompt = build_career_knowledge_prompt(job_role)

    ai_response = generate_structured(prompt, CareerKnowledgeAIResponse)

    return CareerKnowledgeResponse.from_ai_response(ai_response)


def generate_skill_resources(job_role: str, skill: str) -> GenerateSkillResourcesResponse:
    """
    Pure AI function, same shape as generate_career_knowledge but scoped to
    2-3 resources for a single skill -- used when a roadmap step's skill has
    no matching resources yet.
    """
    prompt = build_skill_resources_prompt(job_role, skill)

    return generate_structured(prompt, GenerateSkillResourcesResponse)