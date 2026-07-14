from __future__ import annotations

import httpx

from app.services.job_posting.models import JobPosting

API_URL = "https://api.merojob.com/api/v1/jobs/"
SITE_URL = "https://merojob.com"
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)


def _format_salary(salary: dict | None, *, hidden: bool) -> str:
    if not salary:
        return "Not disclosed" if hidden else "Negotiable"
    minimum = salary.get("minimum")
    maximum = salary.get("maximum")
    currency = salary.get("currency") or "NRs"
    unit = salary.get("unit") or "Monthly"
    if maximum:
        return f"{currency} {int(minimum or 0):,} - {int(maximum):,} {unit}"
    if minimum:
        return f"{currency} {int(minimum):,}+ {unit}"
    return "Not disclosed" if hidden else "Negotiable"


def _to_posting(item: dict) -> JobPosting:
    client = item.get("client") or {}
    locations = item.get("job_locations") or []
    location = ", ".join(
        (loc.get("address") or loc.get("name") or "").strip()
        for loc in locations
        if (loc.get("address") or loc.get("name"))
    )
    absolute_url = item.get("absolute_url") or f"/{item.get('slug', '')}/"
    apply_link = f"{SITE_URL}{absolute_url}" if absolute_url.startswith("/") else absolute_url

    return JobPosting(
        title=(item.get("title") or "").strip(),
        company=(client.get("client_name") or client.get("org_name") or "Unknown").strip(),
        location=location or "Nepal",
        salary=_format_salary(item.get("offered_salary"), hidden=bool(item.get("hide_salary"))),
        required_skills=[s.strip() for s in item.get("skills") or [] if s and s.strip()],
        description=(item.get("specification") or item.get("description") or "")[:2000],
        apply_link=apply_link,
        source="merojob",
        posted_date=item.get("created_on") or item.get("published_date"),
    )


class MerojobSource:
    name = "merojob"

    async def scrape(self, *, role_title: str, keywords: list[str], max_jobs: int) -> list[JobPosting]:
        headers = {
            "Accept": "application/json",
            "User-Agent": USER_AGENT,
            "Referer": "https://merojob.com/",
            "Origin": "https://merojob.com",
            "Accept-Language": "en-US,en;q=0.9",
        }

        candidates = [role_title, *keywords]
        seen_ids: set[str] = set()
        jobs: list[JobPosting] = []

        async with httpx.AsyncClient(timeout=30.0, headers=headers) as client:
            for candidate in candidates:
                if len(jobs) >= max_jobs:
                    break
                page = 1
                while len(jobs) < max_jobs:
                    response = await client.get(
                        API_URL, params={"page": page, "page_size": 20, "q": candidate}
                    )
                    response.raise_for_status()
                    payload = response.json()
                    results = payload.get("results") or []
                    if not results:
                        break

                    for item in results:
                        job_id = str(item.get("id"))
                        if job_id in seen_ids:
                            continue
                        seen_ids.add(job_id)
                        jobs.append(_to_posting(item))
                        if len(jobs) >= max_jobs:
                            break

                    if not payload.get("next"):
                        break
                    page += 1

        return jobs[:max_jobs]