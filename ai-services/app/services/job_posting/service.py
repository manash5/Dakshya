from __future__ import annotations

import asyncio
import time
from datetime import datetime, timezone
from urllib.parse import urlparse

from app.services.job_posting.ai_matcher import refine_with_gemini
from app.services.job_posting.keyword_generator import generate_similar_titles
from app.services.job_posting.models import JobPosting
from app.services.job_posting.role_filter import filter_by_role
from app.services.job_posting.schemas import (
    JobRoleTarget,
    RoleScrapeResult,
    ScrapeRequest,
    ScrapeResponse,
    ScrapeStats,
)
from app.services.job_posting.sources import SOURCES


def _normalize_url(url: str) -> str:
    parsed = urlparse(url.strip().casefold())
    host = parsed.netloc.removeprefix("www.")

    return f"{host}{parsed.path.rstrip('/')}?{parsed.query}"


def _dedupe(jobs: list[JobPosting]) -> list[JobPosting]:
    """Same posting can surface from two sources with slightly different
    URLs; dedupe on normalized apply_link, keep the more complete record."""
    def completeness(job: JobPosting) -> int:
        score = len(job.required_skills)
        if job.salary not in ("", "Not disclosed"):
            score += 2
        if job.company not in ("", "Unknown"):
            score += 1
        return score

    by_url: dict[str, JobPosting] = {}
    order: list[str] = []
    for job in jobs:
        key = _normalize_url(job.apply_link)
        existing = by_url.get(key)
        if existing is None or completeness(job) > completeness(existing):
            if key not in by_url:
                order.append(key)
            by_url[key] = job
    return [by_url[key] for key in order]


async def _scrape_one_role(
    role: JobRoleTarget, *, source_names: list[str], max_jobs: int, use_ai_matching: bool
) -> RoleScrapeResult:
    started_at = datetime.now(timezone.utc)
    started_perf = time.perf_counter()

    succeeded: list[str] = []
    failed: dict[str, str] = {}
    all_jobs: list[JobPosting] = []

    try:
        title_synonyms = await asyncio.to_thread(generate_similar_titles, role.job_role_title)
    except Exception as exc:
        print(f"[{role.job_role_title}] keyword_generator failed, continuing with no synonyms: {exc}")
        title_synonyms = []
    print(f"[{role.job_role_title}] AI-generated similar titles: {title_synonyms}")

    async def run_source(name: str) -> None:
        source = SOURCES[name]
        try:
            jobs = await source.scrape(role_title=role.job_role_title, keywords=title_synonyms, max_jobs=max_jobs)
            all_jobs.extend(jobs)
            succeeded.append(name)
        except Exception as exc:
            failed[name] = f"{type(exc).__name__}: {exc}"

    await asyncio.gather(*[run_source(name) for name in source_names])

    total_scraped = len(all_jobs)

    matched = filter_by_role(all_jobs, role_title=role.job_role_title, title_synonyms=title_synonyms)
    print(f"[{role.job_role_title}] stage1: {total_scraped} scraped -> {len(matched)} passed word filter")
    print(f"[{role.job_role_title}] stage1 titles: {[j.title for j in all_jobs]}")

    if use_ai_matching:
        matched = await refine_with_gemini(matched, role_title=role.job_role_title, title_synonyms=title_synonyms)
        print(f"[{role.job_role_title}] stage2: -> {len(matched)} passed AI filter")

    matched = _dedupe(matched)[:max_jobs]
    print(f"[{role.job_role_title}] final: -> {len(matched)} after dedupe/cap")

    completed_at = datetime.now(timezone.utc)
    stats = ScrapeStats(
        started_at=started_at.isoformat(),
        completed_at=completed_at.isoformat(),
        duration_seconds=round(time.perf_counter() - started_perf, 2),
        sources_attempted=source_names,
        sources_succeeded=succeeded,
        sources_failed=failed,
        total_scraped=total_scraped,
        matched_count=len(matched),
    )
    return RoleScrapeResult(job_role_id=role.job_role_id, jobs=matched, stats=stats, keywords=title_synonyms)


async def run_scrape(request: ScrapeRequest) -> ScrapeResponse:
    source_names = request.sources or list(SOURCES)
    unknown = [name for name in source_names if name not in SOURCES]
    if unknown:
        raise ValueError(f"Unknown source(s): {', '.join(unknown)}. Available: {', '.join(SOURCES)}")

    async def run_role(role: JobRoleTarget) -> RoleScrapeResult:
        try:
            return await _scrape_one_role(
                role,
                source_names=source_names,
                max_jobs=request.max_jobs_per_role,
                use_ai_matching=request.use_ai_matching,
            )
        except Exception as exc:

            now = datetime.now(timezone.utc).isoformat()
            return RoleScrapeResult(
                job_role_id=role.job_role_id,
                jobs=[],
                stats=ScrapeStats(
                    started_at=now,
                    completed_at=now,
                    duration_seconds=0.0,
                    sources_attempted=source_names,
                    sources_succeeded=[],
                    sources_failed={},
                    total_scraped=0,
                    matched_count=0,
                ),
                error=f"{type(exc).__name__}: {exc}",
            )

    results = await asyncio.gather(*[run_role(role) for role in request.roles])
    return ScrapeResponse(results=list(results))