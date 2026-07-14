from __future__ import annotations

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from app.services.job_posting.models import JobPosting


class JobRoleTarget(BaseModel):
    """One role to scrape for. ``job_role_id`` is the Mongo _id of the
    JobRole doc — never stored or interpreted here, just echoed back so
    Express can map results without guessing.

    ``keywords`` is an optional cache hint — real alternate job titles for
    this role, if Express has any cached on the JobRole doc from a previous
    run. Purely additive input to role_filter.py's word matching; nothing
    generates new values for this anymore (no AI in this pipeline).
    """

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    job_role_id: str
    job_role_title: str
    keywords: list[str] = []


class ScrapeRequest(BaseModel):
    """Sent by Express — either a single admin-triggered role or the full
    batch of active JobRole docs on a cron run.
    """

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    roles: list[JobRoleTarget]
    sources: list[str] | None = None
    max_jobs_per_role: int = 50


class ScrapeStats(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    started_at: str
    completed_at: str
    duration_seconds: float
    sources_attempted: list[str]
    sources_succeeded: list[str]
    sources_failed: dict[str, str]  
    total_scraped: int  
    matched_count: int  


class RoleScrapeResult(BaseModel):
    """Result for a single role within a batch scrape."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    job_role_id: str
    jobs: list[JobPosting]
    stats: ScrapeStats
    keywords: list[str] = []
    error: str | None = None


class ScrapeResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    results: list[RoleScrapeResult]