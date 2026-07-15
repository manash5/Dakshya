from __future__ import annotations

import asyncio
import time
from datetime import datetime, timezone
from urllib.parse import urlparse

from app.services.opportunity.models import Opportunity
from app.services.opportunity.schemas import ScrapeRequest, ScrapeResponse, ScrapeStats
from app.services.opportunity.sources import SOURCES

# Both current sources launch a headless browser (see nepvents.py,
# hackathon_com.py) — meaningfully slower than the job-posting sources'
# bulk-API calls, so this gets a more generous ceiling than that pipeline's
# 20s.
SOURCE_TIMEOUT_SECONDS = 45.0


def _normalize_url(url: str) -> str:
    parsed = urlparse(url.strip().casefold())
    host = parsed.netloc.removeprefix("www.")
    return f"{host}{parsed.path.rstrip('/')}?{parsed.query}"


def _dedupe(items: list[Opportunity]) -> list[Opportunity]:
    by_url: dict[str, Opportunity] = {}
    order: list[str] = []
    for item in items:
        key = _normalize_url(item.registration_link)
        if key not in by_url:
            order.append(key)
        by_url[key] = item
    return [by_url[key] for key in order]


async def run_scrape(request: ScrapeRequest) -> ScrapeResponse:
    source_names = request.sources or list(SOURCES)
    unknown = [name for name in source_names if name not in SOURCES]
    if unknown:
        raise ValueError(f"Unknown source(s): {', '.join(unknown)}. Available: {', '.join(SOURCES)}")

    started_at = datetime.now(timezone.utc)
    started_perf = time.perf_counter()

    succeeded: list[str] = []
    failed: dict[str, str] = {}
    all_items: list[Opportunity] = []

    async def run_source(name: str) -> None:
        source = SOURCES[name]
        try:
            items = await asyncio.wait_for(
                source.scrape(max_items=request.max_items_per_source),
                timeout=SOURCE_TIMEOUT_SECONDS,
            )
            all_items.extend(items)
            succeeded.append(name)
        except asyncio.TimeoutError:
            failed[name] = f"TimeoutError: exceeded {SOURCE_TIMEOUT_SECONDS}s"
        except Exception as exc:
            failed[name] = f"{type(exc).__name__}: {exc}"

    await asyncio.gather(*[run_source(name) for name in source_names])

    pool = _dedupe(all_items)
    completed_at = datetime.now(timezone.utc)
    duration_seconds = round(time.perf_counter() - started_perf, 2)
    print(f"[opportunity-scrape] {len(pool)} items from {succeeded} (failed: {failed or 'none'}) in {duration_seconds}s")

    stats = ScrapeStats(
        started_at=started_at.isoformat(),
        completed_at=completed_at.isoformat(),
        duration_seconds=duration_seconds,
        sources_attempted=source_names,
        sources_succeeded=succeeded,
        sources_failed=failed,
        total_scraped=len(pool),
    )
    return ScrapeResponse(opportunities=pool, stats=stats)
