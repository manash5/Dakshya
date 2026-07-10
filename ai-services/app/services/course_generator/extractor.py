from fastapi import HTTPException
from google.genai import types

from app.core.config import GEMINI_MODEL_NAME, gemini_client
from app.services.course_generator.schemas import ExtractionResult

EXTRACTION_PROMPT = """You are analyzing text scraped from a college/university website.
Identify the ACADEMIC PROGRAMS (courses) that this institution actually offers,
and, where the website provides a curriculum/module/subject breakdown, the
subjects taught under each course, grouped by semester or year.

Rules:
- Only include real academic programs mentioned in the text below. Do not invent
  programs that aren't referenced.
- "degree" should be a short label such as "Bachelor", "Master", "Diploma", "PhD".
- Course "description" must be a CONCISE summary, at most 800 characters. Do not
  copy the website's full marketing paragraph verbatim -- write a short,
  original summary instead (this is a hard backend limit of 1000 characters,
  so stay well under it).
- "durationInSemesters" must be a whole number. If the site states duration in
  years, convert to semesters (1 year = 2 semesters) unless stated otherwise.
- Many college sites list the semester-wise subjects/modules for each course
  (often under a "Curriculum", "Structure", or "Syllabus" section) — use that
  when present, including the actual codes, credits, and descriptions given.
- If a course's page does NOT explicitly list its subjects, don't leave
  "subjects" empty. Instead, produce a reasonable, typical subject list for
  that course based on standard curricula for its field and level (e.g. a
  first semester of a BSc Computing program typically includes Programming
  Fundamentals, Mathematics, IT Skills, etc.), spread across its semesters.
  For any estimated subject, make the "code" a plausible placeholder (e.g.
  "CS101") and mention in its "description" that it is an estimated subject,
  not one confirmed on the website.
- "credits" must be a whole number; if unstated, use a reasonable estimate based
  on the rest of the curriculum.
- "skills" should be 2-5 short skill/topic tags relevant to that subject.
- Respond ONLY with data matching the provided schema.

WEBSITE TEXT:
{content}
"""


def extract_courses_with_gemini(combined_text: str) -> ExtractionResult:
    prompt = EXTRACTION_PROMPT.format(content=combined_text)

    try:
        response = gemini_client.models.generate_content(
            model=GEMINI_MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ExtractionResult,
            ),
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Gemini extraction failed: {exc}") from exc

    raw_text = getattr(response, "text", None)
    if not raw_text:
        raise HTTPException(status_code=502, detail="Gemini returned an empty response")

    try:
        return ExtractionResult.model_validate_json(raw_text)
    except Exception as exc:
        raise HTTPException(
            status_code=502, detail=f"Gemini response did not match expected schema: {exc}"
        ) from exc