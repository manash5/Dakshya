from __future__ import annotations

from pydantic import BaseModel

from app.shared.ai_generation import generate_structured

MAX_SIMILAR_TITLES = 6


class SimilarTitles(BaseModel):
    titles: list[str]


def _build_prompt(role_title: str) -> str:
    # IMPORTANT: alternate JOB TITLES only, never skills/tools/technologies.
    # These get used both as search queries against Nepali job portals and
    # as the "also posted under these titles" hint for ai_matcher's judge
    # prompt — mixing in tech keywords ("sql", "django") there causes false
    # accepts/rejects (see ai_matcher._build_prompt).
    return (
        f'Job title: "{role_title}".\n\n'
        f"List up to {MAX_SIMILAR_TITLES} alternate job titles that Nepali "
        f"job portals (jobsnepal.com, merojob.com) commonly use interchangeably "
        f"for this exact same job function — e.g. \"Data Analyst\" ~ \"BI Analyst\", "
        f"\"Data Analytics Associate\".\n\n"
        f"Rules:\n"
        f"- Only real, commonly-used job TITLES, never skills, tools, or technologies.\n"
        f"- Only titles for the SAME job function — do not include titles for "
        f"related-but-different roles (e.g. do not list \"Data Engineer\" for "
        f"\"Data Analyst\").\n"
        f"- Do not include the original title itself.\n"
        f"- If genuinely no close alternates exist, return an empty list.\n"
    )


def generate_similar_titles(role_title: str) -> list[str]:
    """Pure AI function: job title in, list of alternate job titles out.
    Knows nothing about scraping, Express, or JobRole ids — mirrors
    career_knowledge.service's separation of concerns.

    Used in place of caller-supplied "keywords": Express no longer sends
    similar titles, ai-services derives them itself before scraping/matching.
    """
    prompt = _build_prompt(role_title)
    result = generate_structured(prompt, SimilarTitles, temperature=0.2)

    seen = {role_title.strip().casefold()}
    titles: list[str] = []
    for title in result.titles:
        cleaned = title.strip()
        key = cleaned.casefold()
        if cleaned and key not in seen:
            seen.add(key)
            titles.append(cleaned)

    return titles[:MAX_SIMILAR_TITLES]
