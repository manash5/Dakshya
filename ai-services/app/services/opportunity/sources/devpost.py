from __future__ import annotations

import re

import httpx

from app.services.opportunity.models import Opportunity

API_URL = "https://devpost.com/api/hackathons"
BROWSER_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
PER_PAGE = 9  # fixed by the API itself, not configurable via query params

_TAG_RE = re.compile(r"<[^>]+>")


def _clean_prize(raw: str | None) -> str | None:
    if not raw:
        return None
    text = _TAG_RE.sub("", raw).strip()
    return text or None


class DevpostSource:
    """devpost.com is the largest global hackathon directory — a public
    JSON API (devpost.com/api/hackathons), no auth, no bot protection,
    genuinely active (60+ open hackathons at time of writing, unlike
    nepvents/hackathon.com which are currently blocked/empty). Filtered to
    online/remote hackathons only: an in-person listing on the other side
    of the world isn't a real opportunity for a Nepal-based user the way an
    online one is.
    """

    name = "devpost"

    async def scrape(self, *, max_items: int) -> list[Opportunity]:
        headers = {"User-Agent": BROWSER_UA, "Accept": "application/json"}
        opportunities: list[Opportunity] = []

        async with httpx.AsyncClient(timeout=30.0, headers=headers) as client:
            page = 1
            while len(opportunities) < max_items:
                response = await client.get(
                    API_URL,
                    params={
                        "status[]": "open",
                        "order_by": "recently-added",
                        "page": page,
                    },
                )
                response.raise_for_status()
                payload = response.json()
                hackathons = payload.get("hackathons") or []
                if not hackathons:
                    break

                for h in hackathons:
                    location = h.get("displayed_location") or {}
                    is_online = (
                        location.get("icon") == "globe"
                        or "online" in (location.get("location") or "").casefold()
                    )
                    if not is_online:
                        continue

                    title = (h.get("title") or "").strip()
                    url = h.get("url")
                    if not title or not url:
                        continue

                    themes = [
                        t.get("name") for t in (h.get("themes") or []) if t.get("name")
                    ]
                    prize = _clean_prize(h.get("prize_amount"))
                    detail_bits = [
                        b for b in [prize, h.get("time_left_to_submission")] if b
                    ]

                    opportunities.append(
                        Opportunity(
                            title=title,
                            organizer=h.get("organization_name") or "Unknown",
                            category=", ".join(themes[:2]) if themes else "Hackathon",
                            location="Online",
                            eventDate=h.get("submission_period_dates"),
                            description=" · ".join(detail_bits),
                            registrationLink=url,
                            source="devpost",
                        )
                    )

                    if len(opportunities) >= max_items:
                        break

                total_count = (payload.get("meta") or {}).get("total_count", 0)
                if page * PER_PAGE >= total_count:
                    break
                page += 1

        return opportunities
