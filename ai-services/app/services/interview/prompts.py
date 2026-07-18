from typing import List, Optional

from app.services.career_knowledge.schemas import DifficultyLevel
from app.services.interview.schemas import InterviewMode

_LEVEL_GUIDANCE = {
    DifficultyLevel.BEGINNER: "fundamentals, plus one deliberately harder stretch question",
    DifficultyLevel.INTERMEDIATE: "a mix of solid fundamentals and real tradeoff discussions",
    DifficultyLevel.ADVANCED: "architecture-level questions and tradeoff discussions",
}


def build_generate_questions_prompt(
    job_role: str,
    difficulty: DifficultyLevel,
    mode: InterviewMode,
    question_count: int,
    skill: Optional[str] = None,
    skills: Optional[List[str]] = None,
) -> str:
    if mode == InterviewMode.CODING:
        mix_instruction = (
            "ALL questions must be coding challenges requiring a function/algorithm implementation. "
            'Tag every question\'s type as "coding".'
        )
    elif mode == InterviewMode.ORAL:
        mix_instruction = (
            "ALL questions must be conceptual, scenario-based oral questions -- do not generate any coding or "
            'implementation challenges. Tag every question\'s type as "oral".'
        )
    else:
        coding_count = max(1, round(question_count * 0.2))
        oral_count = question_count - coding_count
        mix_instruction = (
            f"Roughly {coding_count} of the questions should be coding challenges requiring a function/algorithm "
            f'implementation (type "coding"), and the remaining {oral_count} should be conceptual, '
            f'scenario-based oral questions (type "oral"). Interleave them naturally rather than grouping all '
            f"of one type together."
        )

    rules = [
        "Questions must reflect what is realistically asked in real interviews for this role and level.",
        'For coding questions: specify the exact problem type (e.g. "sliding window", "dynamic programming", '
        '"system design") within the question text itself, with a clear problem statement.',
        'For oral questions: ask scenario-based questions ("How would you...", "What happens when...", '
        '"Debug this scenario...") rather than pure trivia.',
        f"Vary difficulty appropriately for the level -- {difficulty.value} should get "
        f"{_LEVEL_GUIDANCE[difficulty]}.",
        mix_instruction,
        f"Respond ONLY with data matching the provided schema -- exactly {question_count} questions, no more, "
        f"no fewer.",
    ]

    if skill:
        rules.append(
            f'CRITICAL CONSTRAINT: every single question must require real, hands-on knowledge of "{skill}" to '
            f"answer well -- do not generate generic role trivia or a question primarily about a different skill "
            f'that only tangentially touches "{skill}". If a fully realistic question can\'t be built centered on '
            f'"{skill}", make it a narrower/simpler question about "{skill}" rather than drifting to another topic.'
        )
        rules.append(
            f'For every question, tag it with 1-3 relevant skills in the "skills" field, and ALWAYS include '
            f'"{skill}" itself as one of them, since every question is scoped to it.'
        )
    elif skills:
        skills_list = ", ".join(f'"{s}"' for s in skills)
        rules.append(
            f"CRITICAL CONSTRAINT: distribute the {question_count} questions across these skills: {skills_list} -- "
            f"roughly evenly, with every skill in the list covered by at least one question. Do not generate "
            f"generic role trivia unrelated to this list."
        )
        rules.append(
            'For every question, tag it with 1-3 relevant skills in the "skills" field, and ALWAYS include '
            f"whichever of {skills_list} that specific question is actually testing."
        )
    else:
        rules.append(
            'For every question, additionally tag it with 1-3 relevant skills or technologies it primarily tests, '
            'in the "skills" field -- concise, specific, industry-standard names (e.g. ["React", "State '
            'Management"], ["SQL", "Database Indexing"]) that would plausibly appear in this role\'s job '
            "description."
        )

    numbered_rules = "\n".join(f"{i}. {rule}" for i, rule in enumerate(rules, start=1))
    if skill:
        focus_line = f"Focus skill (MANDATORY for every question): {skill}\n"
    elif skills:
        focus_line = f"Focus skills (MANDATORY, distributed across questions): {', '.join(skills)}\n"
    else:
        focus_line = ""

    return f"""You are a senior technical interviewer at a top-tier tech company, generating REAL, high-signal
interview questions that reflect what is currently being asked in the industry for this exact role and level.

Role: {job_role}
Seniority level: {difficulty.value}
Number of questions: {question_count}
{focus_line}
RULES:
{numbered_rules}
"""


def build_evaluate_answer_prompt(
    question: str,
    question_type: str,
    job_role: str,
    difficulty: DifficultyLevel,
    user_answer: Optional[str],
    user_code: Optional[str],
) -> str:
    if question_type == "oral":
        assessment_instruction = (
            "This is a conceptual oral question. Focus purely on the candidate's verbal explanation, and ignore "
            "any code block. CRITICAL: if the transcript is empty, nonsense, or irrelevant to the question, "
            "score 0 on both scales."
        )
    else:
        assessment_instruction = (
            "This is a coding challenge. Evaluate the code's logic and efficiency; use the transcript only for "
            "insight into their thought process. CRITICAL: if the code is empty, undefined, or just random "
            "characters/comments, score 0 on both scales."
        )

    return f"""You are a principal engineer conducting a technical interview at a top-tier company. You are strict,
fair, and deeply technical -- do not inflate scores for weak answers.

Role: {job_role}
Seniority level: {difficulty.value}
Question type: {question_type}
Interview question: {question}

Candidate's verbal answer (transcribed): {user_answer or "No verbal answer provided."}

Candidate's code submission:
```
{user_code or "No code provided."}
```

{assessment_instruction}

SCORING RUBRIC:
technicalScore (0-100):
  90-100: complete, correct, mentions edge cases and complexity, shows deep understanding.
  70-89: mostly correct, minor gaps, acceptable for the role level.
  50-69: partially correct but missing key concepts or has logical errors.
  20-49: shows basic awareness but the answer is incomplete or has significant mistakes.
  0-19: wrong, empty, gibberish, or completely off-topic.

confidenceScore (0-100): how well-structured, clear, and decisive the verbal explanation was -- not correctness.
  High: clear structure, correct terminology, addresses tradeoffs proactively.
  Low: vague, uncertain language, unable to explain their own reasoning, rambling.
  Zero if the verbal answer is empty, noise, or irrelevant.

feedback: 3-4 sentences -- (1) what they got right, (2) what was missing or wrong, (3) one specific improvement
tip for this exact role/level.

idealAnswer: a comprehensive answer a hired candidate would give. For oral questions: a clear explanation, edge
cases, and why it works. For coding questions: working code with comments and a time/space complexity note. Keep
it under roughly 1200 characters and do not wrap it in code fences.

Respond ONLY with data matching the provided schema.
"""
