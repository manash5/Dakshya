from __future__ import annotations

import httpx
from bs4 import BeautifulSoup

from app.services.job_posting.models import JobPosting

API_URL = "https://remotive.com/api/remote-jobs"
BROWSER_UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

_JOB_TYPE_MAP = {
    "full_time": "Full-time",
    "part_time": "Part-time",
    "contract": "Contract",
    "freelance": "Contract",
    "internship": "Internship",
}


def _clean_html(raw: str | None) -> str:
    return BeautifulSoup(raw or "", "html.parser").get_text(" ", strip=True)


def _to_posting(item: dict) -> JobPosting | None:
    title = (item.get("title") or "").strip()
    url = item.get("url")
    if not title or not url:
        return None

    tags = item.get("tags") or []

    return JobPosting(
        title=title,
        company=(item.get("company_name") or "Unknown").strip() or "Unknown",
        # Remote-first source: candidate_required_location says who's
        # eligible to apply (e.g. "Worldwide", "Europe only"), not an
        # office address — surfaced as-is so users can judge eligibility.
        location=item.get("candidate_required_location") or "Remote",
        salary=item.get("salary") or "Not disclosed",
        employment_type=_JOB_TYPE_MAP.get((item.get("job_type") or "").casefold()),
        required_skills=[t.strip() for t in tags if isinstance(t, str) and t.strip()],
        description=_clean_html(item.get("description"))[:2000],
        apply_link=url,
        source="remotive",
        posted_date=item.get("publication_date"),
    )


class RemotiveSource:
    """remotive's own ?search= param doesn't actually filter (verified —
    a nonsense query still returned every listing), so this just pulls the
    current feed each run; role_filter.py does the real
    matching downstream, same as every source with no working search.
    """

    name = "remotive"

    async def scrape(self, *, role_title: str, keywords: list[str], max_jobs: int) -> list[JobPosting]:
        headers = {"User-Agent": BROWSER_UA}

        async with httpx.AsyncClient(timeout=30.0, headers=headers) as client:
            response = await client.get(API_URL, params={"limit": max(max_jobs * 3, 100)})
            response.raise_for_status()
            payload = response.json()

        jobs = [job for item in payload.get("jobs", []) if (job := _to_posting(item)) is not None]
        return jobs[:max_jobs]
