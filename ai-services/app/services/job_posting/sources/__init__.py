from __future__ import annotations

from app.services.job_posting.sources.base import JobSource
from app.services.job_posting.sources.jobaxle import JobaxleSource
from app.services.job_posting.sources.jobejee import JobejeeSource
from app.services.job_posting.sources.jobsnepal import JobsNepalSource
from app.services.job_posting.sources.merojob import MerojobSource
from app.services.job_posting.sources.merorojgari import MerorojgariSource
from app.services.job_posting.sources.remoteok import RemoteokSource
from app.services.job_posting.sources.remotive import RemotiveSource


# Nepal general boards (merojob, jobsnepal, jobejee, merorojgari) mostly
# carry non-tech postings — NGO, admin, sales, hospitality — so niche tech
# roles (ML, Flutter, Backend...) routinely have zero live matches on any
# given day if that's the only supply. remotive + remoteok are 100% tech/dev
# remote-job platforms and both measure well under 10s (bulk JSON APIs, no
# per-page fetches), so they're back in the default rotation as dedicated
# tech supply without reintroducing the jobaxle-style speed problem.
#
# arbeitnow stays dropped (mostly EU/DACH on-site roles, low relevance for
# a Nepal-based applicant even filtered to remote=true).
#
# jobaxle is excluded from the default rotation too, measured: it fetches
# one detail page per job (no bulk API), which clocked ~0.3 jobs/sec — 21
# jobs in 62s — while the other sources combined return hundreds of jobs in
# under 10s. It was single-handedly forcing every run to eat the full
# per-source timeout ceiling for a small fraction of the yield. Still
# available as an explicit opt-in (pass `sources: ["jobaxle", ...]`) for a
# slower, more thorough one-off scrape — just not part of the default set.
SOURCES: dict[str, JobSource] = {
    "merojob": MerojobSource(),
    "jobsnepal": JobsNepalSource(),
    "jobejee": JobejeeSource(),
    "merorojgari": MerorojgariSource(),
    "remotive": RemotiveSource(),
    "remoteok": RemoteokSource(),
}

ALL_SOURCES: dict[str, JobSource] = {**SOURCES, "jobaxle": JobaxleSource()}
