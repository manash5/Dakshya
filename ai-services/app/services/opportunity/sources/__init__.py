from __future__ import annotations

from app.services.opportunity.sources.base import OpportunitySource
from app.services.opportunity.sources.devpost import DevpostSource
from app.services.opportunity.sources.hackathon_com import HackathonComSource
from app.services.opportunity.sources.nepvents import NepventsSource

# devpost is the productive source right now — a public JSON API with
# genuine live listings (60+ open hackathons at time of writing), filtered
# to online/remote ones so they're actually joinable from Nepal. nepvents
# and hackathon.com stay in rotation too (both cheap even when they
# contribute nothing — nepvents ~1.5s blocked, hackathon.com ~5s empty) so
# they start contributing automatically the moment either has something.
SOURCES: dict[str, OpportunitySource] = {
    "devpost": DevpostSource(),
    "nepvents": NepventsSource(),
    "hackathon.com": HackathonComSource(),
}
