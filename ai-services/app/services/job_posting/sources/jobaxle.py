from __future__ import annotations

import asyncio
import json
import re

import httpx
from bs4 import BeautifulSoup

from app.services.job_posting.models import JobPosting

SITE_URL = "https://jobaxle.com"
SITEMAP_URL = f"{SITE_URL}/sitemap.xml"
BROWSER_UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
JOB_URL_RE = re.compile(r"^https://jobaxle\.com/jobs/[a-z0-9\-]+$", re.I)

_EMPLOYMENT_TYPE_MAP = {
    "full time": "Full-time",
    "part time": "Part-time",
    "internship": "Internship",
    "contract": "Contract",
    "remote": "Remote",
}


def _extract_job_ld(html: str) -> dict | None:
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup.select('script[type="application/ld+json"]'):
        try:
            data = json.loads(tag.string or "")
        except (json.JSONDecodeError, TypeError):
            continue
        if isinstance(data, dict) and data.get("@type") == "JobPosting":
            return data
    return None


def _format_salary(ld: dict) -> str:
    salary = ld.get("baseSalary") or {}
    value = (salary.get("value") or {}).get("value")
    currency = salary.get("currency")
    if not value:
        return "Not disclosed"
    if isinstance(value, str) and value.strip().casefold() == "negotiable":
        return "Negotiable"
    return f"{currency or ''} {value}".strip()


def _to_posting(url: str, ld: dict) -> JobPosting | None:
    title = (ld.get("title") or "").strip()
    if not title:
        return None

    address = (ld.get("jobLocation") or {}).get("address") or {}
    location = address.get("addressLocality") or address.get("streetAddress") or ""

    employment_type = _EMPLOYMENT_TYPE_MAP.get((ld.get("employmentType") or "").strip().casefold())

    return JobPosting(
        title=title,
        company=((ld.get("hiringOrganization") or {}).get("name") or "Unknown").strip() or "Unknown",
        location=location or "Nepal",
        salary=_format_salary(ld),
        employment_type=employment_type,
        description=(ld.get("description") or "")[:2000],
        apply_link=url,
        source="jobaxle",
        posted_date=ld.get("datePosted"),
    )


async def _fetch_detail(client: httpx.AsyncClient, url: str) -> JobPosting | None:
    try:
        response = await client.get(url)
        response.raise_for_status()
    except httpx.HTTPError:
        return None

    ld = _extract_job_ld(response.text)
    if ld is None:
        return None

    return _to_posting(url, ld)


class JobaxleSource:
    """No working search endpoint found on this site (its ?search= param
    is client-JS-only) and no relevance filtering here anymore — every
    listing in the sitemap is a candidate. The only cap is ``max_jobs``
    itself: the sitemap has ~8000 entries and fetching all of them as
    individual detail-page requests every run would make this the slowest
    source by far, so we still only fetch up to ``max_jobs`` detail pages
    (in sitemap order), not the full 8000.
    """

    name = "jobaxle"

    async def scrape(self, *, max_jobs: int) -> list[JobPosting]:
        headers = {"User-Agent": BROWSER_UA}

        async with httpx.AsyncClient(timeout=30.0, headers=headers, follow_redirects=True) as client:
            response = await client.get(SITEMAP_URL)
            response.raise_for_status()
            urls = re.findall(r"<loc>([^<]+)</loc>", response.text)
            job_urls = [u for u in urls if JOB_URL_RE.match(u)]

            candidates = job_urls[:max_jobs]

            semaphore = asyncio.Semaphore(10)

            async def fetch_one(url: str) -> JobPosting | None:
                async with semaphore:
                    return await _fetch_detail(client, url)

            results = await asyncio.gather(*[fetch_one(url) for url in candidates])

        jobs = [job for job in results if job is not None]
        return jobs[:max_jobs]
