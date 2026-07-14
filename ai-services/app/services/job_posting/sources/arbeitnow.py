from __future__ import annotations

import httpx
from bs4 import BeautifulSoup

from app.services.job_posting.models import JobPosting

API_URL = "https://www.arbeitnow.com/api/job-board-api"
BROWSER_UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)


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
        location=(item.get("location") or "").strip() or "Remote",
        salary="Not disclosed",
        required_skills=[t.strip() for t in tags if isinstance(t, str) and t.strip()],
        description=_clean_html(item.get("description"))[:2000],
        apply_link=url,
        source="arbeitnow",
        posted_date=str(item.get("created_at")) if item.get("created_at") else None,
    )


class ArbeitnowSource:
    """arbeitnow is Europe/DACH-heavy and mostly on-site, so we only keep
    remote=true listings — otherwise most results would need EU work
    eligibility and wouldn't be reachable for a Nepal-based applicant.
    No working search param found; paginate the general feed and let
    role_filter.py do the actual matching downstream.
    """

    name = "arbeitnow"
    MAX_PAGES = 3

    async def scrape(self, *, role_title: str, keywords: list[str], max_jobs: int) -> list[JobPosting]:
        headers = {"User-Agent": BROWSER_UA}
        jobs: list[JobPosting] = []

        async with httpx.AsyncClient(timeout=30.0, headers=headers) as client:
            page = 1
            while len(jobs) < max_jobs and page <= self.MAX_PAGES:
                response = await client.get(API_URL, params={"page": page})
                response.raise_for_status()
                payload = response.json()
                items = payload.get("data") or []
                if not items:
                    break

                for item in items:
                    if not item.get("remote"):
                        continue
                    if (posting := _to_posting(item)) is not None:
                        jobs.append(posting)
                        if len(jobs) >= max_jobs:
                            break

                if not (payload.get("links") or {}).get("next"):
                    break
                page += 1

        return jobs[:max_jobs]
