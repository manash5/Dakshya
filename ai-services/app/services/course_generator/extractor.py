import re
import time

from fastapi import HTTPException

from app.core.config import get_logger
from app.shared.ai_generation import generate_structured
from app.services.course_generator.schemas import CourseExtract, ExtractionResult

logger = get_logger("course-generator.extractor")

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
- "skills" should be 2-5 concrete, atomic, market-relevant skill tags for that subject — the
  kind of terms that appear in a job posting's required-skills list (e.g. "Python", "SQL",
  "React", "Docker"). Never a course-topic label, soft descriptor, or broad field name (e.g.
  NOT "Problem Solving", "Logic", "Computer Science", "Hardware", "History of Computing")
  unless it is a literal, commonly-recognized professional skill (e.g. "Agile", "Teamwork" are
  fine for a professional-practice subject). If a subject is purely theoretical/orientation
  with no concrete tech skill to extract, a short list — or even an empty list — is correct;
  do not pad it with vague topic words just to reach the 2-5 range.
- Respond ONLY with data matching the provided schema.

WEBSITE TEXT:
{content}
"""

_PAGE_MARKER_RE = re.compile(r"\n\n===== PAGE: .*? =====\n")

# Escalating backoff between retries of the SAME chunk, in seconds. Groq's
# free tier caps out at 6,000-12,000 tokens/minute regardless of model --
# even paced one-request-at-a-time, a multi-page crawl will routinely hit
# that ceiling mid-run, so a chunk failing once (likely a 429) isn't a real
# failure, just "try again once the per-minute budget has recovered."
_CHUNK_RETRY_DELAYS = [20, 45, 90]


def _split_into_page_chunks(combined_text: str) -> list[str]:
    """Reverses scraper.py's page-joining (`===== PAGE: {url} =====`
    markers) so each page's text can be sent as its own, Groq-sized request
    instead of one 60-90k character blob that hard-413s on Groq no matter
    the model. Falls back to the whole text as a single chunk if the
    markers aren't present (e.g. called with arbitrary text directly).
    """
    pieces = [p.strip() for p in _PAGE_MARKER_RE.split(combined_text) if p.strip()]
    return pieces or ([combined_text] if combined_text.strip() else [])


def _merge_extraction_results(results: list[ExtractionResult]) -> ExtractionResult:
    """Chunking means the same course can legitimately turn up in more than
    one page's result (e.g. mentioned on the homepage AND its own program
    page) -- merge by course name, keeping the richer subject list and
    folding in any subjects the other occurrence found that this one
    didn't (matched by code, falling back to name).
    """
    by_name: dict[str, CourseExtract] = {}

    for result in results:
        for course in result.courses:
            key = course.name.strip().lower()
            existing = by_name.get(key)

            if existing is None:
                by_name[key] = course
                continue

            richer, other = (
                (existing, course)
                if len(existing.subjects) >= len(course.subjects)
                else (course, existing)
            )
            seen = {(s.code or s.name).lower() for s in richer.subjects}
            richer.subjects = richer.subjects + [
                s for s in other.subjects if (s.code or s.name).lower() not in seen
            ]
            by_name[key] = richer

    return ExtractionResult(courses=list(by_name.values()))


def _extract_chunk_via_groq(chunk: str) -> ExtractionResult | None:
    prompt = EXTRACTION_PROMPT.format(content=chunk)

    for attempt, delay in enumerate([0, *_CHUNK_RETRY_DELAYS]):
        if delay:
            time.sleep(delay)
        try:
            return generate_structured(prompt, ExtractionResult, provider="groq")
        except HTTPException as exc:
            logger.warning("Groq chunk extraction attempt %d failed: %s", attempt + 1, exc.detail)

    return None


def _extract_via_groq_chunks(combined_text: str) -> ExtractionResult:
    chunks = _split_into_page_chunks(combined_text)
    logger.info("Falling back to chunked Groq extraction across %d page(s)", len(chunks))

    results = [r for r in (_extract_chunk_via_groq(chunk) for chunk in chunks) if r is not None]

    if not results:
        raise HTTPException(
            status_code=502,
            detail="Course extraction failed on every page (both Gemini and the chunked Groq fallback)",
        )

    return _merge_extraction_results(results)


def extract_courses(combined_text: str) -> ExtractionResult:
    prompt = EXTRACTION_PROMPT.format(content=combined_text)
    try:
        # Scraped website text routinely runs 60-90k characters -- hard 413s
        # on Groq's free tier regardless of model (see core/config.py).
        # Gemini's context handles it in one shot, so this is tried first.
        return generate_structured(prompt, ExtractionResult, provider="gemini")
    except HTTPException as exc:
        # Falls back to per-page chunked Groq calls instead of failing the
        # whole course sync outright when Gemini is unavailable (quota
        # exhausted, billing not set up, etc.) -- slower (each chunk is
        # paced against Groq's per-minute budget) but doesn't hard-depend
        # on Gemini access being configured correctly.
        logger.warning("Gemini extraction unavailable (%s) -- falling back to chunked Groq calls", exc.detail)
        return _extract_via_groq_chunks(combined_text)
