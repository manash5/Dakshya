from __future__ import annotations

import asyncio
import time
from datetime import datetime, timezone
from urllib.parse import urlparse

from app.services.job_posting.models import JobPosting
from app.services.job_posting.schemas import ScrapeRequest, ScrapeResponse, ScrapeStats
from app.services.job_posting.sources import ALL_SOURCES, SOURCES

# Hard ceiling per source so one slow/hanging site can't stall the whole
# run — sources run concurrently (see run_scrape), so this bounds total
# wall-clock time regardless of how many sources are configured. The
# default (bulk-API) sources measure well under 10s; this is a safety
# margin above that, not a target.
SOURCE_TIMEOUT_SECONDS = 20.0


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


async def run_scrape(request: ScrapeRequest) -> ScrapeResponse:
    """Scrapes every source exactly once and returns the full deduped pool
    — no role filtering, no dropped jobs. Express stores all of it and
    matches jobs to a user's target roles at query time instead (see
    dashboard.service.ts / jobPosting.repository.ts).
    """
    source_names = request.sources or list(SOURCES)
    unknown = [name for name in source_names if name not in ALL_SOURCES]
    if unknown:
        raise ValueError(f"Unknown source(s): {', '.join(unknown)}. Available: {', '.join(ALL_SOURCES)}")

    started_at = datetime.now(timezone.utc)
    started_perf = time.perf_counter()

    succeeded: list[str] = []
    failed: dict[str, str] = {}
    all_jobs: list[JobPosting] = []

    async def run_source(name: str) -> None:
        source = ALL_SOURCES[name]
        try:
            jobs = await asyncio.wait_for(
                source.scrape(max_jobs=request.pool_size_per_source),
                timeout=SOURCE_TIMEOUT_SECONDS,
            )
            all_jobs.extend(jobs)
            succeeded.append(name)
        except asyncio.TimeoutError:
            failed[name] = f"TimeoutError: exceeded {SOURCE_TIMEOUT_SECONDS}s"
        except Exception as exc:
            failed[name] = f"{type(exc).__name__}: {exc}"

    await asyncio.gather(*[run_source(name) for name in source_names])

    pool = _dedupe(all_jobs)
    completed_at = datetime.now(timezone.utc)
    duration_seconds = round(time.perf_counter() - started_perf, 2)
    print(f"[scrape] {len(pool)} jobs from {succeeded} (failed: {failed or 'none'}) in {duration_seconds}s")

    stats = ScrapeStats(
        started_at=started_at.isoformat(),
        completed_at=completed_at.isoformat(),
        duration_seconds=duration_seconds,
        sources_attempted=source_names,
        sources_succeeded=succeeded,
        sources_failed=failed,
        total_scraped=len(pool),
    )
    return ScrapeResponse(jobs=pool, stats=stats)
