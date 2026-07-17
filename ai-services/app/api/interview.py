from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.interview.schemas import (
    EvaluateAnswerRequest,
    EvaluationAIResponse,
    GenerateQuestionsAIResponse,
    GenerateQuestionsRequest,
    TranscriptionResponse,
)
from app.services.interview.service import (
    evaluate_interview_answer,
    generate_interview_questions,
)
from app.services.interview.transcription import transcribe_audio

router = APIRouter(prefix="/api/v1/interview", tags=["interview"])


@router.post("/generate-questions", response_model=GenerateQuestionsAIResponse)
def generate_questions_endpoint(
    payload: GenerateQuestionsRequest,
) -> GenerateQuestionsAIResponse:
    try:
        return generate_interview_questions(
            payload.jobRole,
            payload.difficulty,
            payload.mode,
            payload.questionCount,
            payload.skill,
            payload.skills,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}") from exc


@router.post("/evaluate", response_model=EvaluationAIResponse)
def evaluate_endpoint(payload: EvaluateAnswerRequest) -> EvaluationAIResponse:
    try:
        return evaluate_interview_answer(
            payload.question,
            payload.questionType,
            payload.jobRole,
            payload.difficulty,
            payload.userAnswer,
            payload.userCode,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}") from exc


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_endpoint(file: UploadFile = File(...)) -> TranscriptionResponse:
    audio_bytes = await file.read()

    try:
        text = transcribe_audio(audio_bytes, file.content_type or "")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}") from exc

    return TranscriptionResponse(transcription=text)
