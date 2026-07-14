from __future__ import annotations

from app.services.job_posting.sources.base import JobSource
from app.services.job_posting.sources.jobsnepal import JobsNepalSource
from app.services.job_posting.sources.merojob import MerojobSource


SOURCES: dict[str, JobSource] = {
    "merojob": MerojobSource(),
    "jobsnepal": JobsNepalSource(),
}