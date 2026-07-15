from __future__ import annotations

import asyncio

from playwright.sync_api import sync_playwright

from app.services.opportunity.models import Opportunity

URL = "https://www.hackathon.com/country/nepal"
BROWSER_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)


def _scrape_sync(max_items: int) -> list[dict]:
    """Runs on a worker thread (see scrape() below) using Playwright's sync
    API — deliberately not the async API. On Windows, uvicorn's event loop
    can end up as a SelectorEventLoop, which can't create subprocesses at
    all, and Playwright's async API needs that to launch a browser
    (confirmed: NotImplementedError from asyncio's subprocess_exec). The
    sync API manages its own driver connection on a dedicated thread
    internally, sidestepping the calling loop's subprocess support
    entirely — the standard workaround for this exact class of problem.
    """
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            page = browser.new_page(user_agent=BROWSER_UA)
            response = page.goto(URL, wait_until="load", timeout=30000)

            if response is None or not response.ok:
                return []

            try:
                page.click("text=Got it!", timeout=3000)
            except Exception:
                pass

            page.wait_for_timeout(2000)

            is_empty = page.eval_on_selector(
                ".result-list", "el => el.classList.contains('empty')"
            )
            if is_empty:
                return []

            return page.eval_on_selector_all(
                ".result-list > *",
                """els => els.map(el => ({
                    text: el.innerText || el.textContent || '',
                    href: el.querySelector('a[href]')?.getAttribute('href') || null,
                }))""",
            )
        finally:
            browser.close()


class HackathonComSource:
    """hackathon.com is a global hackathon directory with a per-country
    filter. Client-rendered (results load via JS, not present in the raw
    HTML — confirmed by inspection), so this needs a real browser.

    Verified against real fetched markup: the results container is
    `.result-list`, which gets an `empty` modifier class when there's
    nothing to show (confirmed true for both Nepal and India at time of
    writing — this directory's coverage appears sparse generally, not
    Nepal-specific). Individual card markup was never actually observed
    populated, so this reads each direct child of `.result-list` generically
    (first line of text as title, first link as the registration link)
    rather than relying on guessed class names for the card internals.
    """

    name = "hackathon.com"

    async def scrape(self, *, max_items: int) -> list[Opportunity]:
        try:
            cards = await asyncio.to_thread(_scrape_sync, max_items)
        except Exception:
            return []

        opportunities: list[Opportunity] = []

        for card in cards:
            href = card.get("href")
            text = (card.get("text") or "").strip()
            if not href or not text:
                continue

            lines = [line.strip() for line in text.split("\n") if line.strip()]
            title = lines[0] if lines else text
            event_date = " · ".join(lines[1:3]) if len(lines) > 1 else None

            link = href if href.startswith("http") else f"https://www.hackathon.com{href}"

            opportunities.append(
                Opportunity(
                    title=title[:200],
                    category="Hackathon",
                    location="Nepal",
                    eventDate=event_date,
                    registrationLink=link,
                    source="hackathon.com",
                )
            )

            if len(opportunities) >= max_items:
                break

        return opportunities
