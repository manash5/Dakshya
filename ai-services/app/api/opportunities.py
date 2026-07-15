from fastapi import APIRouter, HTTPException

from app.services.opportunity.schemas import ScrapeRequest, ScrapeResponse
from app.services.opportunity.service import run_scrape

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
