from __future__ import annotations

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from app.services.opportunity.models import Opportunity


class ScrapeRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    sources: list[str] | None = None
    max_items_per_source: int = 50


class ScrapeStats(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    started_at: str
    completed_at: str
    duration_seconds: float
    sources_attempted: list[str]
    sources_succeeded: list[str]
    sources_failed: dict[str, str]
    total_scraped: int


class ScrapeResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    opportunities: list[Opportunity]
    stats: ScrapeStats
