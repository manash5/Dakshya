from __future__ import annotations

import asyncio
import json
import re

import httpx
from bs4 import BeautifulSoup

from app.services.job_posting.models import JobPosting

SITE_URL = "https://jobejee.com"
BROWSER_UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
JOB_LINK_RE = re.compile(r"^/job/[^/\"#?]+/\d+/?$")

_EMPLOYMENT_TYPE_MAP = {
    "FULL_TIME": "Full-time",
    "PART_TIME": "Part-time",
    "INTERNSHIP": "Internship",
    "CONTRACTOR": "Contract",
    "TEMPORARY": "Contract",
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
    if isinstance(value, str) and value.strip().lower() == "negotiable":
        return "Negotiable"
    return f"{currency or ''} {value}".strip()


def _to_posting(url: str, ld: dict) -> JobPosting | None:
    title = (ld.get("title") or "").strip()
    if not title:
        return None

    location = ""
    address = (ld.get("jobLocation") or {}).get("address") or {}
    location = address.get("addressLocality") or address.get("streetAddress") or ""

    employment_type = _EMPLOYMENT_TYPE_MAP.get((ld.get("employmentType") or "").upper())

    qualifications = ld.get("qualifications") or ""
    skills = [s.strip() for s in qualifications.split(",") if 2 <= len(s.strip()) <= 60]

    return JobPosting(
        title=title,
        company=((ld.get("hiringOrganization") or {}).get("name") or "Unknown").strip() or "Unknown",
        location=location or "Nepal",
        salary=_format_salary(ld),
        employment_type=employment_type,
        required_skills=skills,
        description=(ld.get("description") or "")[:2000],
        apply_link=url,
        source="jobejee",
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


class JobejeeSource:
    name = "jobejee"

    async def scrape(self, *, role_title: str, keywords: list[str], max_jobs: int) -> list[JobPosting]:
        # No working search/pagination endpoint found on this site — its
        # homepage lists the most recent postings server-rendered, same
        # "no search, scrape the general feed" approach as jobsnepal.py.
        headers = {"User-Agent": BROWSER_UA}

        async with httpx.AsyncClient(timeout=30.0, headers=headers, follow_redirects=True) as client:
            response = await client.get(f"{SITE_URL}/")
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")

            urls: list[str] = []
            seen: set[str] = set()
            for link in soup.select("a[href]"):
                href = (link.get("href") or "").strip()
                if JOB_LINK_RE.match(href) and href not in seen:
                    seen.add(href)
                    urls.append(f"{SITE_URL}{href}")

            oversample = max(max_jobs * 2, max_jobs + 20)
            urls = urls[:oversample]

            semaphore = asyncio.Semaphore(5)

            async def fetch_one(url: str) -> JobPosting | None:
                async with semaphore:
                    return await _fetch_detail(client, url)

            results = await asyncio.gather(*[fetch_one(url) for url in urls])

        jobs = [job for job in results if job is not None]
        return jobs[:max_jobs]
