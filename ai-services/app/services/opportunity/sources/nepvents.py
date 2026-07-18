from __future__ import annotations

import asyncio
import re

from playwright.sync_api import sync_playwright

from app.services.opportunity.models import Opportunity

BASE_URL = "https://www.nepvents.com"
EVENTS_URL = f"{BASE_URL}/events"
BROWSER_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
EVENT_LINK_RE = re.compile(r"^/events/[a-z0-9]+$", re.I)


def _scrape_sync(max_items: int) -> list[dict]:
    """Runs on a worker thread (see scrape() below) using Playwright's sync
    API, not the async API — see hackathon_com.py's _scrape_sync for why
    (Windows + uvicorn's event loop can't create subprocesses, which the
    async API needs to launch a browser).
    """
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            page = browser.new_page(user_agent=BROWSER_UA)
            response = page.goto(EVENTS_URL, wait_until="networkidle", timeout=30000)

            if response is None or not response.ok:
                return []

            title = page.title()
            if "checkpoint" in title.casefold() or "forbidden" in title.casefold():
                return []

            return page.eval_on_selector_all(
                "a[href^='/events/']",
                """els => els.map(el => ({
                    href: el.getAttribute('href'),
                    text: el.innerText || el.textContent || '',
                }))""",
            )
        finally:
            browser.close()


class NepventsSource:
    """nepvents.com is Nepal's dedicated tech-events aggregator (hackathons,
    workshops, competitions) — the right source for this. It sits behind a
    Vercel bot-protection checkpoint that blocked every fetch attempt during
    development (429, escalating to a hard 403) — its real DOM structure
    was never actually observed, so the extraction below is a best-effort
    guess at the markup based on the URL pattern seen in search results
    (/events/<id>), not verified selectors.

    Uses a real headless browser since that's the only thing that could
    ever get past the checkpoint. Written defensively throughout — a
    checkpoint page, timeout, or selector mismatch returns an empty list
    rather than raising, same as every source behaves when it can't
    produce anything. Revisit once this site is reachable and its real
    markup can be inspected directly.
    """

    name = "nepvents"

    async def scrape(self, *, max_items: int) -> list[Opportunity]:
        try:
            links = await asyncio.to_thread(_scrape_sync, max_items)
        except Exception:
            return []

        opportunities: list[Opportunity] = []
        seen_links: set[str] = set()

        for link in links:
            href = link.get("href") or ""
            if not EVENT_LINK_RE.match(href) or href in seen_links:
                continue
            seen_links.add(href)

            text = (link.get("text") or "").strip()
            if not text:
                continue

            lines = [line.strip() for line in text.split("\n") if line.strip()]
            title = lines[0] if lines else text
            event_date = " · ".join(lines[1:3]) if len(lines) > 1 else None

            opportunities.append(
                Opportunity(
                    title=title[:200],
                    location="Nepal",
                    eventDate=event_date,
                    registrationLink=f"{BASE_URL}{href}",
                    source="nepvents",
                )
            )

            if len(opportunities) >= max_items:
                break

        return opportunities
