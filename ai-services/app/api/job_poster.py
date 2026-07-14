from fastapi import APIRouter, HTTPException

from app.services.job_posting.schemas import ScrapeRequest, ScrapeResponse
from app.services.job_posting.service import run_scrape

router = APIRouter(prefix="/api/v1/job-postings", tags=["job-postings"])


@router.post("/scrape", response_model=ScrapeResponse)
async def scrape_jobs(payload: ScrapeRequest) -> ScrapeResponse:
    """Called by Express (admin-triggered or cron), one call per batch of
    JobRole docs. Scrapes + filters + AI-matches, returns JSON per role —
    never touches Express's MongoDB directly.
    """
    try:
        return await run_scrape(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}") from exc