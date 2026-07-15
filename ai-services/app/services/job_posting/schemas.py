from __future__ import annotations

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from app.services.job_posting.models import JobPosting


class ScrapeRequest(BaseModel):
    """Sent by Express — admin-triggered or cron, always a full scrape now.
    There's no per-role targeting anymore: every source has no working
    per-role search anyway (see each source's docstring), so scraping used
    to mean re-fetching the same data once per JobRole for no benefit, and
    only ever kept jobs matching a role that already existed in Mongo.
    Express now stores everything scraped and matches jobs to roles at
    query time (dashboard, job listings) instead.
    """

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    sources: list[str] | None = None
    # Each source is scraped once per run, into a shared pool. This is that
    # pool's cap per source. 300 measured at ~10s total (merorojgari and
    # merojob were the only sources actually hitting the old 150 cap; the
    # rest are bounded by their real feed size, not this number) — a good
    # tradeoff between recall for niche roles and staying fast.
    pool_size_per_source: int = 300


class ScrapeStats(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    started_at: str
    completed_at: str
    duration_seconds: float
    sources_attempted: list[str]
    sources_succeeded: list[str]
    sources_failed: dict[str, str]
    total_scraped: int


class ScrapeResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    jobs: list[JobPosting]
    stats: ScrapeStats
