from __future__ import annotations

from typing import Protocol

from app.services.opportunity.models import Opportunity


class OpportunitySource(Protocol):
    """Every adapter implements this. Same shape as job_posting's JobSource:
    return whatever the source currently lists, up to max_items — no
    relevance filtering here, that happens downstream if needed.
    """

    name: str

    async def scrape(self, *, max_items: int) -> list[Opportunity]:
        ...
