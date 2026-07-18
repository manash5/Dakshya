from fastapi import APIRouter, HTTPException

from app.services.opportunity.schemas import ClassifyRequest, ClassifyResponse, ScrapeRequest, ScrapeResponse
from app.services.opportunity.service import classify_opportunities, run_scrape

router = APIRouter(prefix="/api/v1/opportunities", tags=["opportunities"])


@router.post("/scrape", response_model=ScrapeResponse)
async def scrape_opportunities(payload: ScrapeRequest = ScrapeRequest()) -> ScrapeResponse:
    """Called by Express (admin-triggered or cron). Scrapes every configured
    opportunity source (hackathons, workshops, competitions) and returns
    everything found — no relevance filtering, same philosophy as
    job_poster.py. Never touches Express's MongoDB directly.
    """
    try:
        return await run_scrape(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}") from exc


@router.post("/classify", response_model=ClassifyResponse)
async def classify(payload: ClassifyRequest) -> ClassifyResponse:
    """Called by Express after scraping (or on an admin manual create) to
    tag each opportunity with which of the platform's job roles it's
    relevant to, so opportunities can be filtered by target role the same
    way job postings already are. Never touches Express's MongoDB directly
    -- Express maps the returned role titles back to JobRole ObjectIds.
    """
    try:
        return await classify_opportunities(payload)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}") from exc
