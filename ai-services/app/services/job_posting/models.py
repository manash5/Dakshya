from __future__ import annotations

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class JobPosting(BaseModel):
    """Canonical scrape output. Field names mirror the Mongoose JobPosting
    schema (Express side); ``model_dump(by_alias=True)`` produces camelCase
    keys ready to hand straight to Express without renaming.

    ``job_role`` is deliberately NOT included here — Express owns the
    JobRole -> ObjectId mapping. We instead echo back which role a job was
    scraped for via the response wrapper (see schemas.ScrapeResponse), so
    Express can attach the reference itself.
    """

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    title: str
    company: str = "Unknown"
    location: str = "Nepal"
    salary: str = "Not disclosed"
    experience: str | None = None
    employment_type: str | None = None
    required_skills: list[str] = []
    description: str = ""
    apply_link: str
    source: str
    posted_date: str | None = None