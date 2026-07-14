from __future__ import annotations

import re

from app.services.job_posting.models import JobPosting

_STOPWORDS = frozenset({"a", "an", "and", "for", "in", "of", "the", "to", "with", "or"})

_WORD_RE = re.compile(r"[a-z0-9]+")


def _significant_words(text: str) -> list[str]:
    return [w for w in _WORD_RE.findall(text.casefold()) if w not in _STOPWORDS]


def matches_role(job: JobPosting, *, role_title: str, title_synonyms: list[str] = None, **kwargs) -> bool:
    """Stage-1 cheap filter. Only ever matches on TITLE words — role_title
    plus real alternate job titles (title_synonyms). Do NOT pass skills/tech
    keywords in here as title_synonyms; "sql", "django", "api" etc. are not
    job titles and will cause false positives (e.g. "Django CMS Editor"
    passing a "Backend Developer" search) while doing nothing for recall.
    """
    synonyms = title_synonyms or []
    title = job.title.casefold()

    all_strings_to_parse = [role_title] + [s for s in synonyms if isinstance(s, str)]

    terms: set[str] = set()
    for string in all_strings_to_parse:
        terms.update(_significant_words(string))

    return any(term in title for term in terms)


def filter_by_role(jobs: list[JobPosting], *, role_title: str, title_synonyms: list[str] = None) -> list[JobPosting]:
    return [job for job in jobs if matches_role(job, role_title=role_title, title_synonyms=title_synonyms)]