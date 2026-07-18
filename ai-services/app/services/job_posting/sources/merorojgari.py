from __future__ import annotations

import html as html_lib
import re

import httpx

from app.services.job_posting.models import JobPosting

API_URL = "https://merorojgari.com/wp-json/wp/v2/job-listings"
BROWSER_UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
# WordPress core caps per_page at 100 regardless of what's requested.
WP_MAX_PER_PAGE = 100

_TAG_RE = re.compile(r"<[^>]+>")


def _clean_html(raw: str | None) -> str:
    text = _TAG_RE.sub(" ", raw or "")
    text = html_lib.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def _to_posting(item: dict) -> JobPosting | None:
    title = _clean_html(item.get("title", {}).get("rendered"))
    link = item.get("link")
    if not title or not link:
        return None

    return JobPosting(
        title=title,
        # WP REST API doesn't expose WP Job Manager's company/location meta
        # fields by default (only theme/layout meta is registered for REST).
        # Same fallback jobsnepal.py uses when a source can't provide them.
        company="Unknown",
        location="Nepal",
        salary="Not disclosed",
        description=_clean_html(item.get("content", {}).get("rendered"))[:2000],
        apply_link=link,
        source="merorojgari",
        posted_date=item.get("date_gmt"),
    )


class MerorojgariSource:
    """No working role-specific search worth trusting (same class of issue
    as merojob's literal q= search — see merojob.py). Just pages through
    the latest unfiltered listings — no relevance filtering here.
    """

    name = "merorojgari"
    MAX_PAGES = 5

    async def scrape(self, *, max_jobs: int) -> list[JobPosting]:
        headers = {"User-Agent": BROWSER_UA, "Accept": "application/json"}
        seen_ids: set[int] = set()
        jobs: list[JobPosting] = []

        async with httpx.AsyncClient(timeout=30.0, headers=headers) as client:

            async def fetch(params: dict) -> list[dict]:
                response = await client.get(API_URL, params=params)
                response.raise_for_status()
                return response.json()

            page = 1
            while len(jobs) < max_jobs and page <= self.MAX_PAGES:
                try:
                    items = await fetch(
                        {"per_page": WP_MAX_PER_PAGE, "page": page, "orderby": "date", "order": "desc"}
                    )
                except httpx.HTTPError:
                    break
                if not items:
                    break

                for item in items:
                    if item.get("id") in seen_ids:
                        continue
                    seen_ids.add(item.get("id"))
                    if (posting := _to_posting(item)) is not None:
                        jobs.append(posting)
                        if len(jobs) >= max_jobs:
                            break

                page += 1

        return jobs[:max_jobs]
