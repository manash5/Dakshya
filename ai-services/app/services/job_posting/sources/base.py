from __future__ import annotations

from typing import Protocol

from app.services.job_posting.models import JobPosting


class JobSource(Protocol):
    """Every adapter implements this. Scraping is role-agnostic: return a
    broad general pool of the source's current listings, up to ``max_jobs``.
    A source is hit exactly once per scrape run — no per-role filtering
    happens here at all anymore. Express stores everything and matches
    jobs to a user's target roles at query time instead.
    """

    name: str

    async def scrape(self, *, max_jobs: int) -> list[JobPosting]:
        ...