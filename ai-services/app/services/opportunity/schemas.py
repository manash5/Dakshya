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


class OpportunityToClassify(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    index: int
    title: str
    description: str = ""
    category: str | None = None


class ClassifyRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    opportunities: list[OpportunityToClassify]
    job_role_titles: list[str]


class OpportunityClassification(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    index: int
    # Subset of job_role_titles (exact matches) this opportunity is relevant
    # to -- empty when the event is general/open to everyone rather than
    # role-specific.
    job_roles: list[str]


class ClassifyResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    classifications: list[OpportunityClassification]
