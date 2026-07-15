from app.shared.ai_generation import generate_structured
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


def extract_courses(combined_text: str) -> ExtractionResult:
    prompt = EXTRACTION_PROMPT.format(content=combined_text)
    # Scraped website text routinely runs 60-90k characters -- hard 413s on
    # Groq's free tier regardless of model (see core/config.py). Gemini's
    # context handles it in one shot, and this is a rare, admin-triggered
    # action, so its small daily quota isn't the constraint here.
    return generate_structured(prompt, ExtractionResult, provider="gemini")