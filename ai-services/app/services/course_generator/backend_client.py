from typing import Optional

import httpx

from app.services.course_generator.schemas import CourseExtract, CourseResult, SubjectExtract, SubjectResult


class AdminAuthError(Exception):
    """Raised when the backend rejects the token as unauthenticated/not-admin.

    Softwarica's `authorizedMiddleware` + `adminMiddleware` gate the course
    and subject create endpoints to admin users only. A 401 means the token
    itself is invalid/expired/unknown; a 403 means it's a valid token for a
    non-admin user. Either way there's no point retrying with the same token
    against every remaining course, so we surface this immediately.
    """

    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)


def _extract_id(payload: dict) -> Optional[str]:
    """Best-effort extraction of the created record's id from various response shapes."""
    if not isinstance(payload, dict):
        return None
    for key in ("_id", "id", "courseId", "subjectId"):
        if key in payload and payload[key]:
            return str(payload[key])
    for wrapper_key in ("data", "result", "course", "subject"):
        nested = payload.get(wrapper_key)
        if isinstance(nested, dict):
            found = _extract_id(nested)
            if found:
                return found
    return None


# The Node backend rejects `description` over 1000 characters (Zod validation:
# "Too big: expected string to have <=1000 characters"). The extraction prompt
# already asks Gemini to keep descriptions short, but this is a hard backstop
# so a verbose model response can never cause a 400 here again.
MAX_DESCRIPTION_LENGTH = 1000


def _truncate_description(text: str, limit: int = MAX_DESCRIPTION_LENGTH) -> str:
    if len(text) <= limit:
        return text
    # Leave room for an ellipsis so we don't land exactly on the limit boundary.
    return text[: limit - 1].rstrip() + "\u2026"


async def create_course(
    client: httpx.AsyncClient, url: str, token: str, university_id: str,
    course: CourseExtract, is_active: bool,
) -> CourseResult:
    body = {
        "universityId": university_id,
        "name": course.name,
        "degree": course.degree,
        "durationInSemesters": course.durationInSemesters,
        "description": _truncate_description(course.description),
        "isActive": is_active,
    }
    try:
        resp = await client.post(
            url, json=body, headers={"Authorization": f"Bearer {token}"}, timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        course_id = _extract_id(data)
        if not course_id:
            return CourseResult(
                input=course, status="failed",
                error=f"Course created but no id found in response: {data}",
            )
        return CourseResult(input=course, status="created", courseId=course_id)
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code in (401, 403):
            raise AdminAuthError(
                exc.response.status_code,
                f"Backend rejected the token creating course '{course.name}' "
                f"({exc.response.status_code}): {exc.response.text}. "
                "The token must belong to a logged-in user with role='admin'.",
            ) from exc
        return CourseResult(
            input=course, status="failed",
            error=f"{exc.response.status_code}: {exc.response.text}",
        )
    except Exception as exc:
        return CourseResult(input=course, status="failed", error=str(exc))


async def create_subject(
    client: httpx.AsyncClient, url: str, token: str, course_id: str, subject: SubjectExtract,
) -> SubjectResult:
    body = {
        "courseId": course_id,
        "semester": subject.semester,
        "code": subject.code,
        "name": subject.name,
        "credits": subject.credits,
        "description": _truncate_description(subject.description),
        "skills": subject.skills,
    }
    try:
        resp = await client.post(
            url, json=body, headers={"Authorization": f"Bearer {token}"}, timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        subject_id = _extract_id(data)
        return SubjectResult(input=subject, status="created", subjectId=subject_id)
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code in (401, 403):
            raise AdminAuthError(
                exc.response.status_code,
                f"Backend rejected the token creating subject '{subject.name}' "
                f"({exc.response.status_code}): {exc.response.text}. "
                "The token must belong to a logged-in user with role='admin'.",
            ) from exc
        return SubjectResult(
            input=subject, status="failed",
            error=f"{exc.response.status_code}: {exc.response.text}",
        )
    except Exception as exc:
        return SubjectResult(input=subject, status="failed", error=str(exc))