from typing import Optional, Type, TypeVar

from fastapi import HTTPException
from google.genai import types
from pydantic import BaseModel

from app.core.config import GEMINI_MODEL_NAME, gemini_client

T = TypeVar("T", bound=BaseModel)


def generate_structured(
    prompt: str,
    response_schema: Type[T],
    *,
    model_name: Optional[str] = None,
    temperature: float = 0.7,
) -> T:
    """
    Calls Gemini with a prompt and forces structured JSON output matching
    `response_schema`. Shared by every AI feature (course_generator,
    career_knowledge, and anything added later) so the "call Gemini ->
    validate -> raise 502 on failure" boilerplate only lives in one place.
    """
    try:
        response = gemini_client.models.generate_content(
            model=model_name or GEMINI_MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=temperature,
                response_mime_type="application/json",
                response_schema=response_schema,
            ),
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Gemini generation failed: {exc}") from exc

    raw_text = getattr(response, "text", None)
    if not raw_text:
        raise HTTPException(status_code=502, detail="Gemini returned an empty response")

    try:
        return response_schema.model_validate_json(raw_text)
    except Exception as exc:
        raise HTTPException(
            status_code=502, detail=f"Gemini response did not match expected schema: {exc}"
        ) from exc