from __future__ import annotations

import httpx
from bs4 import BeautifulSoup

from app.services.job_posting.models import JobPosting

API_URL = "https://remoteok.com/api"
BROWSER_UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)


def _clean_html(raw: str | None) -> str:
    return BeautifulSoup(raw or "", "html.parser").get_text(" ", strip=True)


def _format_salary(item: dict) -> str:
    lo, hi = item.get("salary_min"), item.get("salary_max")
    if not lo and not hi:
        return "Not disclosed"
    if lo and hi and lo != hi:
        return f"${lo:,} - ${hi:,}"
    return f"${lo or hi:,}"


def _to_posting(item: dict) -> JobPosting | None:
    title = (item.get("position") or "").strip()
    url = item.get("url") or item.get("apply_url")
    if not title or not url:
        return None

    tags = item.get("tags") or []

    return JobPosting(
        title=title,
        company=(item.get("company") or "Unknown").strip() or "Unknown",
        location=(item.get("location") or "").strip() or "Remote",
        salary=_format_salary(item),
        required_skills=[t.strip() for t in tags if isinstance(t, str) and t.strip()],
        description=_clean_html(item.get("description"))[:2000],
        apply_link=url,
        source="remoteok",
        posted_date=item.get("date"),
    )


class RemoteokSource:
    """RemoteOK's public /api endpoint has no search — it's a flat feed of
    the current listings (element 0 is an API-terms metadata blob, not a
    job). Their own terms just ask for attribution when using the API
    (see 'legal' field on that first element), which we already do via
    source="remoteok" on every posting. role_filter.py does the
    actual relevance matching downstream.
    """

    name = "remoteok"

    async def scrape(self, *, role_title: str, keywords: list[str], max_jobs: int) -> list[JobPosting]:
        headers = {"User-Agent": BROWSER_UA}

        async with httpx.AsyncClient(timeout=30.0, headers=headers) as client:
            response = await client.get(API_URL)
            response.raise_for_status()
            items = response.json()

        jobs = [job for item in items if isinstance(item, dict) and (job := _to_posting(item)) is not None]
        return jobs[:max_jobs]
