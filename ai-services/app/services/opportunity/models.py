from __future__ import annotations

from bs4 import BeautifulSoup
from pydantic import BaseModel, ConfigDict, field_validator
from pydantic.alias_generators import to_camel


def _strip_html(value: str) -> str:
    if "<" not in value and "&" not in value:
        return value
    return BeautifulSoup(value, "html.parser").get_text(" ", strip=True)


class Opportunity(BaseModel):
    """Canonical scrape output for a tech opportunity (hackathon, workshop,
    competition, webinar, ...). Mirrors job_posting/models.py's JobPosting —
    same alias-to-camelCase convention, same plain-text-only guarantee on
    free-text fields, so Express can consume it the same way.
    """

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    title: str
    organizer: str = "Unknown"
    category: str | None = None
    location: str = "Nepal"
    event_date: str | None = None
    description: str = ""
    registration_link: str
    source: str
    posted_date: str | None = None

    @field_validator("description")
    @classmethod
    def _clean_description(cls, value: str) -> str:
        return _strip_html(value)
