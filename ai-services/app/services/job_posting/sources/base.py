from __future__ import annotations

from typing import Protocol

from app.services.job_posting.models import JobPosting


class JobSource(Protocol):
    """Every adapter implements this. ``query`` is the role title/keyword to
    search for when the site supports real search (e.g. merojob's ?q=).
    Sites with no search endpoint should ignore ``query`` and just return
    the general listing — role_filter.py does the narrowing afterward.
    """

    name: str

    async def scrape(self, *, role_title: str, keywords: list[str], max_jobs: int) -> list[JobPosting]:
        ...