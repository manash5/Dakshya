from __future__ import annotations

import re

from app.services.job_posting.models import JobPosting

_STOPWORDS = frozenset({
    "a", "an", "and", "for", "in", "of", "the", "to", "with", "or",
    # Seniority qualifiers are never required for a match in either
    # direction — a "Senior Backend Developer" role should still match a
    # plain "Backend Developer" posting (employers don't always spell out
    # seniority in the title), and vice versa.
    "senior", "junior", "lead", "principal", "staff", "associate", "sr", "jr",
})

_WORD_RE = re.compile(r"[a-z0-9]+")

# Generic occupational nouns — never enough to establish a match on their
# own ("Site Engineer" sharing "Engineer" with "ML Engineer" isn't a real
# match), but also not required if a title uses a different one than the
# role does ("Software Engineer, Backend" should still match "Backend
# Developer" even though it says "Engineer" not "Developer"). See
# _matches_candidate for how these two things fit together.
_GENERIC_OCCUPATIONAL_WORDS = frozenset({
    "engineer", "developer", "specialist", "officer", "associate", "manager",
    "analyst", "assistant", "coordinator", "executive", "administrator",
    "architect", "consultant", "technician", "designer",
})

# Common IT/tech title abbreviations (this pipeline currently only really
# covers the IT field, since that's the only category in use right now).
# Applied as a substring replace before tokenizing so an abbreviated role
# name and its spelled-out form count as the same phrase, e.g.
# "ML Engineer" <-> "Machine Learning Engineer". No AI involved — this is
# the deterministic stand-in for that.
_PHRASE_NORMALIZATIONS: list[tuple[str, str]] = [
    ("machine learning", "ml"),
    ("artificial intelligence", "ai"),
    ("quality assurance", "qa"),
    ("user interface", "ui"),
    ("user experience", "ux"),
    ("human resources", "hr"),
    ("full stack", "fullstack"),
    ("front end", "frontend"),
    ("back end", "backend"),
    ("dev ops", "devops"),
    ("information technology", "it"),
    ("search engine optimization", "seo"),
]


def _normalize_phrases(text: str) -> str:
    normalized = text.casefold()
    for long_form, short_form in _PHRASE_NORMALIZATIONS:
        normalized = normalized.replace(long_form, short_form)
    return normalized


def _stem(word: str) -> str:
    """Crude plural stripping so "Developers" / "Developer" etc. compare
    equal without an NLP dependency."""
    if len(word) > 4 and word.endswith("ies"):
        return word[:-3] + "y"
    if len(word) > 3 and word.endswith("s") and not word.endswith("ss"):
        return word[:-1]
    return word


def _significant_words(text: str) -> set[str]:
    normalized = _normalize_phrases(text)
    return {_stem(w) for w in _WORD_RE.findall(normalized) if w not in _STOPWORDS}


def _matches_candidate(job_words: set[str], candidate_words: set[str]) -> bool:
    if not candidate_words:
        return False

    core = candidate_words - _GENERIC_OCCUPATIONAL_WORDS
    if core:
        # ALL distinguishing/domain words must appear in the job title —
        # "Lead Data Scientist" (core: data, scientist) must not match
        # "Data Entry Clerk" just because it shares "data". But the generic
        # occupational word itself is deliberately NOT required: "Software
        # Engineer, Backend" (core: backend) still matches a "Backend
        # Developer" search despite saying "Engineer" instead of
        # "Developer" — real postings phrase things differently, and
        # there's no AI here to bridge that. This is what keeps precision
        # high without an AI judge: generic-word-only overlap is never
        # enough (that's what previously let "Site Engineer" through for
        # an "ML Engineer" search), but the full domain-word set still
        # has to line up.
        return core.issubset(job_words)

    # Candidate is entirely generic (e.g. a role literally titled just
    # "Engineer") — nothing else to go on, so fall back to requiring that.
    return bool(candidate_words & job_words)


def matches_role(job: JobPosting, *, role_title: str, title_synonyms: list[str] = None, **kwargs) -> bool:
    """The only relevance filter in the pipeline — no AI stage-2 anymore.
    Matches on TITLE words only: a job matches if its title contains the
    distinguishing word of role_title, or of one of the given
    title_synonyms (real alternate job titles — cached from a previous run,
    if any; never skills/tech keywords, which would just narrow things
    further for no reason). See _matches_candidate for the actual rule.
    """
    synonyms = title_synonyms or []
    job_words = _significant_words(job.title)

    candidates = [role_title] + [s for s in synonyms if isinstance(s, str)]
    return any(_matches_candidate(job_words, _significant_words(c)) for c in candidates)


def filter_by_role(jobs: list[JobPosting], *, role_title: str, title_synonyms: list[str] = None) -> list[JobPosting]:
    return [job for job in jobs if matches_role(job, role_title=role_title, title_synonyms=title_synonyms)]
