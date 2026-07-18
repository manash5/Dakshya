from __future__ import annotations

import asyncio
import re

import httpx
from bs4 import BeautifulSoup

from app.services.job_posting.models import JobPosting

LISTING_URL = "https://www.jobsnepal.com/jobs"
DETAIL_RE = re.compile(r"^https://www\.jobsnepal\.com/[a-z0-9-]+-\d{4,}$")
BROWSER_UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
SALARY_RE = re.compile(r"\b(?:nrs\.?|rs\.?|npr)\s*(\d[\d,]*(?:\s*[-\u2013]\s*\d[\d,]*)?)", re.I)


def _clean(text: str | None) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def _extract_salary(text: str) -> str:
    if re.search(r"\bnegotiable\b", text, re.I):
        return "Negotiable"
    match = SALARY_RE.search(text)
    return f"NRs {match.group(1)}" if match else "Not disclosed"


async def _fetch_detail(client: httpx.AsyncClient, url: str) -> JobPosting | None:
    try:
        response = await client.get(url)
        response.raise_for_status()
    except httpx.HTTPError:
        return None

    soup = BeautifulSoup(response.text, "html.parser")
    title_el = soup.select_one("h1")
    title = _clean(title_el.get_text(" ", strip=True) if title_el else "")
    if not title:
        return None

    page_text = soup.get_text(" ", strip=True)
    company_el = soup.select_one("a[href*='employer/']")
    company = _clean(company_el.get_text(" ", strip=True) if company_el else "")

    skills: list[str] = []
    skills_match = re.search(r"Skills?:?\s*([^\n]{3,200})", page_text)
    if skills_match:
        skills = [s.strip() for s in re.split(r"[,;/]", skills_match.group(1)) if 2 <= len(s.strip()) <= 40]

    return JobPosting(
        title=title,
        company=company or "Unknown",
        location="Nepal",
        salary=_extract_salary(page_text),
        required_skills=skills,
        description=page_text[:2000],
        apply_link=url,
        source="jobsnepal",
    )


class JobsNepalSource:
    name = "jobsnepal"

    async def scrape(self, *, max_jobs: int) -> list[JobPosting]:

        oversample = max(max_jobs * 4, max_jobs + 30)
        headers = {"User-Agent": BROWSER_UA}

        async with httpx.AsyncClient(timeout=30.0, headers=headers, follow_redirects=True) as client:
            response = await client.get(LISTING_URL)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")

            urls: list[str] = []
            seen: set[str] = set()
            for link in soup.select("a[href]"):
                href = _clean(link.get("href"))
                if DETAIL_RE.match(href) and href not in seen:
                    seen.add(href)
                    urls.append(href)
            urls = urls[:oversample]

            semaphore = asyncio.Semaphore(10)

            async def fetch_one(url: str) -> JobPosting | None:
                async with semaphore:
                    return await _fetch_detail(client, url)

            results = await asyncio.gather(*[fetch_one(url) for url in urls])

        return [job for job in results if job is not None]