from typing import Optional
from urllib.parse import urljoin, urlparse
import asyncio

from bs4 import BeautifulSoup
from fastapi import HTTPException
from playwright.sync_api import Browser, TimeoutError as PlaywrightTimeoutError, sync_playwright

from app.core.config import get_logger

logger = get_logger("course-generator.scraper")

# How many characters of scraped text we hand to Gemini, per page and total.
# Individual course pages tend to be content-rich (full module breakdowns),
# so these are a bit more generous than plain marketing pages need.
MAX_CHARS_PER_PAGE = 15000
MAX_TOTAL_CHARS = 90000

CANDIDATE_KEYWORDS = [
    "course", "courses", "program", "programme", "programs", "programmes",
    "academic", "study", "degree", "curriculum", "faculty", "school-of",
    "syllabus", "structure", "semester", "module", "modules", "subject",
    "subjects",
]

USER_AGENT = "Mozilla/5.0 (compatible; DakshyaCourseBot/1.0; +https://example.com/bot)"

# How long to let a page's JS finish firing network requests, and how long to
# additionally sit and let any lazy-rendered content (course cards, etc.) paint
# after that, before we give up and just read whatever's in the DOM.
PAGE_LOAD_TIMEOUT_MS = 20000
POST_LOAD_SETTLE_MS = 1200


def _clean_text(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "noscript", "svg", "header", "footer", "nav"]):
        tag.decompose()
    text = soup.get_text(separator="\n")
    lines = [line.strip() for line in text.splitlines()]
    lines = [line for line in lines if line]
    return "\n".join(lines)


def _find_candidate_links(html: str, base_url: str) -> list[str]:
    soup = BeautifulSoup(html, "html.parser")
    base_domain = urlparse(base_url).netloc
    found = []
    for a in soup.find_all("a", href=True):
        href = a["href"]
        text = (a.get_text() or "").lower()
        full_url = urljoin(base_url, href)
        parsed = urlparse(full_url)
        if parsed.netloc != base_domain:
            continue
        if parsed.scheme not in ("http", "https"):
            continue
        haystack = f"{href.lower()} {text}"
        if any(kw in haystack for kw in CANDIDATE_KEYWORDS):
            # strip fragments/query for dedup
            clean_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
            if clean_url not in found:
                found.append(clean_url)
    return found


def _render_page_sync(browser: Browser, url: str) -> Optional[str]:
    """Load a URL in a real (headless) browser and return the fully rendered
    HTML, so client-side-rendered content (course listings injected by
    React/Next.js after mount, etc.) is present -- unlike a plain HTTP GET,
    which only ever sees the pre-JS HTML shell.
    """
    page = browser.new_page(user_agent=USER_AGENT)
    try:
        try:
            page.goto(url, wait_until="networkidle", timeout=PAGE_LOAD_TIMEOUT_MS)
        except PlaywrightTimeoutError:
            # Some sites never truly go network-idle (polling, analytics beacons,
            # etc). Whatever rendered by now is still almost always usable.
            logger.warning("networkidle timeout on %s, using what's rendered so far", url)
        # Give client-side rendered widgets a moment to paint after load.
        page.wait_for_timeout(POST_LOAD_SETTLE_MS)
        return page.content()
    except Exception as exc:
        logger.warning("Failed to render %s: %s", url, exc)
        return None
    finally:
        page.close()


def _crawl_website_sync(website: str, max_pages: int, max_depth: int) -> dict:
    """Breadth-first crawl of the homepage plus likely course/program/curriculum
    pages, up to `max_depth` link-hops away, rendering each page with a
    headless browser so JS-injected content and links are visible.

    Runs Playwright's *sync* API (launches the browser via plain
    subprocess.Popen rather than asyncio's subprocess machinery), so it works
    regardless of which asyncio event loop implementation the host process is
    using -- this sidesteps the Windows ProactorEventLoop/SelectorEventLoop
    subprocess issue entirely. Called from crawl_website() via a worker thread.
    """
    pages: dict[str, str] = {}
    queue: list[tuple[str, int]] = [(website, 0)]
    visited: set[str] = set()

    with sync_playwright() as p:
        browser = p.chromium.launch()
        try:
            while queue and len(pages) < max_pages:
                url, depth = queue.pop(0)
                if url in visited:
                    continue
                visited.add(url)

                html = _render_page_sync(browser, url)
                if html is None:
                    if url == website:
                        raise HTTPException(
                            status_code=502, detail=f"Could not load website: {url}"
                        )
                    continue

                pages[url] = _clean_text(html)[:MAX_CHARS_PER_PAGE]

                if depth < max_depth:
                    for link in _find_candidate_links(html, website):
                        if link not in visited:
                            queue.append((link, depth + 1))
        finally:
            browser.close()

    combined = ""
    for url, text in pages.items():
        chunk = f"\n\n===== PAGE: {url} =====\n{text}"
        if len(combined) + len(chunk) > MAX_TOTAL_CHARS:
            remaining = MAX_TOTAL_CHARS - len(combined)
            if remaining > 200:
                combined += chunk[:remaining]
            break
        combined += chunk

    return {"pages": pages, "combined_text": combined}


async def crawl_website(website: str, max_pages: int, max_depth: int = 3) -> dict:
    """Async wrapper that runs the sync-Playwright crawl in a worker thread,
    so it doesn't block the event loop (and avoids async Playwright's
    Windows subprocess limitation -- see _crawl_website_sync docstring).
    """
    return await asyncio.to_thread(_crawl_website_sync, website, max_pages, max_depth)