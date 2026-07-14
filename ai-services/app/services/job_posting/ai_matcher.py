from __future__ import annotations

import asyncio

from fastapi import HTTPException
from pydantic import BaseModel

from app.services.job_posting.models import JobPosting
from app.shared.ai_generation import generate_structured

# Keep batches small: smaller prompt = cheaper + Gemini stays accurate on
# per-item JSON extraction. 12 jobs/call is a reasonable balance for
# title+skills+salary+description-snippet sized payloads.
BATCH_SIZE = 12

EMPLOYMENT_TYPES = ("Full-time", "Part-time", "Internship", "Contract", "Remote")


class JobClassification(BaseModel):
    apply_link: str
    matches_role: bool
    experience: str | None = None  # e.g. "0-1 years", "2-3 years", "Fresher"
    employment_type: str | None = None  # one of EMPLOYMENT_TYPES, best guess


class BatchClassification(BaseModel):
    results: list[JobClassification]


def _build_prompt(jobs: list[JobPosting], *, role_title: str, title_synonyms: list[str]) -> str:
    # IMPORTANT: title_synonyms must be alternate JOB TITLES only
    # (e.g. "Data Analyst" ~ "BI Analyst", "Data Analytics Associate").
    # Never pass skills/tech keywords here ("sql", "django", "api") — the
    # prompt tells the model these are alternate *titles*, which corrupts
    # its own "judge by title only" instruction and causes both false
    # accepts (skill-named title) and false rejects (model gets confused
    # about what "title" means for this role).
    synonym_hint = (
        f" This role is also sometimes posted under these titles: "
        f"{', '.join(title_synonyms)}."
        if title_synonyms
        else ""
    )
    listings = "\n\n".join(
        f"[{i}] apply_link: {job.apply_link}\n"
        f"title: {job.title}\n"
        f"description: {job.description[:500]}"
        for i, job in enumerate(jobs)
    )
    return (
        f"Target role: \"{role_title}\".{synonym_hint}\n\n"
        f"For each job listing below, decide if its TITLE is a VERY CLOSE "
        f"match for the target role or one of its listed title variants. "
        f"Judge by title/job-function ONLY — ignore any tools, skills, or "
        f"technologies mentioned in the description; two very different "
        f"roles can use the same tech stack, e.g. a 'Data Entry Operator' "
        f'and a "Data Analyst" can both list Excel/SQL, but they are '
        f'different jobs; an "IT Support Officer" and a "Backend Developer" '
        f"are both IT roles but different functions. Use the description "
        f"only to identify experience level and employment type, never to "
        f"decide relevance.\n\n"
        f"Reject anything that is merely same-department, same-tool, or "
        f"same-industry but a different function. When genuinely uncertain, "
        f"lean toward matches_role true rather than false if the title is "
        f"plausibly the same job function under different wording — only "
        f"reject when the job FUNCTION is clearly different.\n\n"
        f"Also extract required experience level and employment type if the "
        f"description implies one (employment_type should be one of: "
        f"{', '.join(EMPLOYMENT_TYPES)}, or null if unclear).\n\n"
        f"Return one result per listing, in the same order, using each "
        f"listing's exact apply_link.\n\n{listings}"
    )


def _classify_batch_sync(
    jobs: list[JobPosting], *, role_title: str, title_synonyms: list[str]
) -> BatchClassification:
    prompt = _build_prompt(jobs, role_title=role_title, title_synonyms=title_synonyms)
    return generate_structured(prompt, BatchClassification, temperature=0.1)


async def refine_with_gemini(
    jobs: list[JobPosting], *, role_title: str, title_synonyms: list[str] = None
) -> list[JobPosting]:
    """Second-pass semantic filter + field enrichment. Runs only on jobs that
    already survived the cheap substring pre-filter (role_filter.py).

    title_synonyms must be alternate job TITLES, never skills/tech keywords
    — see note in _build_prompt.
    """
    if not jobs:
        return []

    synonyms = title_synonyms or []

    batches = [jobs[i : i + BATCH_SIZE] for i in range(0, len(jobs), BATCH_SIZE)]

    async def run_batch(batch: list[JobPosting]) -> list[JobPosting]:
        try:
            classified = await asyncio.to_thread(
                _classify_batch_sync, batch, role_title=role_title, title_synonyms=synonyms
            )
        except HTTPException:
            return batch  # keep stage-1 matches as-is if Gemini call fails

        by_link = {c.apply_link: c for c in classified.results}
        kept: list[JobPosting] = []
        for job in batch:
            result = by_link.get(job.apply_link)
            if result is None:
                print(f"  ? ai_matcher: no classification returned for {job.title!r}, keeping as-is")
                kept.append(job)
                continue
            if not result.matches_role:
                print(f"  x ai_matcher: rejected {job.title!r} (skills: {job.required_skills})")
                continue
            print(f"  + ai_matcher: matched {job.title!r} "
                  f"(experience={result.experience!r}, employment_type={result.employment_type!r})")
            if result.experience:
                job.experience = result.experience
            if result.employment_type in EMPLOYMENT_TYPES:
                job.employment_type = result.employment_type
            kept.append(job)
        return kept

    results = await asyncio.gather(*[run_batch(batch) for batch in batches])
    return [job for batch_result in results for job in batch_result]