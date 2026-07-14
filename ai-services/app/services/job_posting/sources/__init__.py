from __future__ import annotations

from app.services.job_posting.sources.arbeitnow import ArbeitnowSource
from app.services.job_posting.sources.base import JobSource
from app.services.job_posting.sources.jobaxle import JobaxleSource
from app.services.job_posting.sources.jobejee import JobejeeSource
from app.services.job_posting.sources.jobsnepal import JobsNepalSource
from app.services.job_posting.sources.merojob import MerojobSource
from app.services.job_posting.sources.merorojgari import MerorojgariSource
from app.services.job_posting.sources.remoteok import RemoteokSource
from app.services.job_posting.sources.remotive import RemotiveSource


SOURCES: dict[str, JobSource] = {
    "merojob": MerojobSource(),
    "jobsnepal": JobsNepalSource(),
    "jobejee": JobejeeSource(),
    "jobaxle": JobaxleSource(),
    "merorojgari": MerorojgariSource(),
    "remotive": RemotiveSource(),
    "remoteok": RemoteokSource(),
    "arbeitnow": ArbeitnowSource(),
}