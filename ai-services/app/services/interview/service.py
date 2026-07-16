from typing import Optional

from app.services.career_knowledge.schemas import DifficultyLevel
from app.services.interview.prompts import (
    build_evaluate_answer_prompt,
    build_generate_questions_prompt,
)
from app.services.interview.schemas import (
    EvaluationAIResponse,
    GenerateQuestionsAIResponse,
    InterviewMode,
)
from app.shared.ai_generation import generate_structured


def generate_interview_questions(
    job_role: str,
    difficulty: DifficultyLevel,
    mode: InterviewMode,
    question_count: int,
    skill: Optional[str] = None,
) -> GenerateQuestionsAIResponse:
    """
    Pure AI function, same shape as generate_career_knowledge: knows nothing
    about MongoDB, Express, users, or PracticeAttempt documents. Input: role +
    difficulty + mode + count (+ optional skill focus). Output: a validated
    question list ready to be handed back to Express to seed a
    PracticeAttempt.
    """
    prompt = build_generate_questions_prompt(job_role, difficulty, mode, question_count, skill)

    result = generate_structured(prompt, GenerateQuestionsAIResponse, temperature=0.6)

    # Structured output is schema-validated, not count-guaranteed -- trim
    # defensively if the model over-generates rather than erroring out.
    result.questions = result.questions[:question_count]

    return result


def evaluate_interview_answer(
    question: str,
    question_type: str,
    job_role: str,
    difficulty: DifficultyLevel,
    user_answer: Optional[str],
    user_code: Optional[str],
) -> EvaluationAIResponse:
    prompt = build_evaluate_answer_prompt(
        question, question_type, job_role, difficulty, user_answer, user_code
    )

    return generate_structured(prompt, EvaluationAIResponse, temperature=0.1)
