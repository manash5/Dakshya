import json
from typing import Literal, Optional, Type, TypeVar

from fastapi import HTTPException
from google.genai import types as genai_types
from pydantic import BaseModel

from app.core.config import GEMINI_MODEL_NAME, GROQ_MODEL_NAME, gemini_client, groq_client

T = TypeVar("T", bound=BaseModel)

_SCHEMA_INSTRUCTION = (
    "\n\nRespond ONLY with a single JSON object matching this JSON Schema "
    "exactly (no extra commentary, no markdown fences):\n{schema}"
)


def _generate_with_groq(
    prompt: str, response_schema: Type[T], *, model_name: Optional[str], temperature: float
) -> T:
    # Groq's JSON mode (unlike Gemini's response_schema) only guarantees
    # syntactically valid JSON, not schema conformance -- so the schema is
    # spelled out in the prompt itself, and the response is still validated
    # against response_schema afterward.
    schema_prompt = prompt + _SCHEMA_INSTRUCTION.format(
        schema=json.dumps(response_schema.model_json_schema())
    )

    try:
        response = groq_client.chat.completions.create(
            model=model_name or GROQ_MODEL_NAME,
            messages=[{"role": "user", "content": schema_prompt}],
            temperature=temperature,
            response_format={"type": "json_object"},
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Groq generation failed: {exc}") from exc

    raw_text = response.choices[0].message.content if response.choices else None
    if not raw_text:
        raise HTTPException(status_code=502, detail="Groq returned an empty response")

    try:
        return response_schema.model_validate_json(raw_text)
    except Exception as exc:
        raise HTTPException(
            status_code=502, detail=f"Groq response did not match expected schema: {exc}"
        ) from exc


def _generate_with_gemini(
    prompt: str, response_schema: Type[T], *, model_name: Optional[str], temperature: float
) -> T:
    try:
        response = gemini_client.models.generate_content(
            model=model_name or GEMINI_MODEL_NAME,
            contents=prompt,
            config=genai_types.GenerateContentConfig(
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


def generate_structured(
    prompt: str,
    response_schema: Type[T],
    *,
    provider: Literal["groq", "gemini"] = "groq",
    model_name: Optional[str] = None,
    temperature: float = 0.7,
) -> T:
    """
    Calls an LLM with a prompt and forces structured JSON output matching
    `response_schema`. Shared by every AI feature so the "call the model ->
    validate -> raise 502 on failure" boilerplate only lives in one place.

    provider defaults to "groq" (higher daily request quota, but a hard
    ~6-12k tokens/minute ceiling -- fine for small/frequent calls). Pass
    provider="gemini" for anything sending a large prompt (large website
    scrapes, etc.) -- see the comment on gemini_client in core/config.py
    for why both providers exist rather than a straight swap.
    """
    if provider == "gemini":
        return _generate_with_gemini(prompt, response_schema, model_name=model_name, temperature=temperature)
    return _generate_with_groq(prompt, response_schema, model_name=model_name, temperature=temperature)
