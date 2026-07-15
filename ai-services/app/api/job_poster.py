from fastapi import APIRouter, HTTPException

from app.services.job_posting.schemas import ScrapeRequest, ScrapeResponse
from app.services.job_posting.service import run_scrape

router = APIRouter(prefix="/api/v1/job-postings", tags=["job-postings"])


@router.post("/scrape", response_model=ScrapeResponse)
async def scrape_jobs(payload: ScrapeRequest = ScrapeRequest()) -> ScrapeResponse:
    """Called by Express (admin-triggered or cron). Always a full scrape —
    no role targeting, no relevance filtering. Returns every job found
    across all sources as JSON; never touches Express's MongoDB directly.
    Express does role-matching itself, at query time, against whatever
    gets stored.
    """
    try:
        return await run_scrape(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}") from exc