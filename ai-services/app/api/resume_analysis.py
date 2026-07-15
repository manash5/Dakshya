import json

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from typing import Optional

from app.services.resume_analysis.schemas import (
    PreviousResumeSummary,
    ResumeAnalysisResult,
)
from app.services.resume_analysis.service import analyze_resume

router = APIRouter(prefix="/api/v1/resume-analysis", tags=["resume-analysis"])


@router.post("/analyze", response_model=ResumeAnalysisResult)
async def analyze_resume_endpoint(
    file: UploadFile = File(...),
    candidateFullName: str = Form(...),
    previousAnalysis: Optional[str] = Form(None),
) -> ResumeAnalysisResult:
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF resumes are supported")

    file_bytes = await file.read()

    previous_summary = None
    if previousAnalysis:
        try:
            previous_summary = PreviousResumeSummary.model_validate(
                json.loads(previousAnalysis)
            )
        except Exception as exc:
            raise HTTPException(
                status_code=400, detail=f"Invalid previousAnalysis payload: {exc}"
            ) from exc

    try:
        return analyze_resume(file_bytes, candidateFullName, previous_summary)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}") from exc
