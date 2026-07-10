import os
from typing import List

import httpx
from fastapi import APIRouter, HTTPException

from app.services.course_generator.backend_client import AdminAuthError, create_course, create_subject
from app.services.course_generator.extractor import extract_courses_with_gemini
from app.services.course_generator.scraper import crawl_website
from app.services.course_generator.schemas import (
    CourseResult,
    GenerateCoursesRequest,
    GenerateCoursesResponse,
)

# Default backend endpoints for creating courses/subjects.
# These can be overridden per-request in the payload if you'd rather not
# hardcode them in .env.
DEFAULT_COURSE_CREATE_URL = os.getenv("COURSE_CREATE_URL", "")
DEFAULT_SUBJECT_CREATE_URL = os.getenv("SUBJECT_CREATE_URL", "")

router = APIRouter(prefix="/api/v1", tags=["course-generator"])


@router.post("/generate-university-courses", response_model=GenerateCoursesResponse)
async def generate_university_courses(payload: GenerateCoursesRequest):
    course_url = payload.courseApiUrl or DEFAULT_COURSE_CREATE_URL
    subject_url = payload.subjectApiUrl or DEFAULT_SUBJECT_CREATE_URL

    if not course_url or not subject_url:
        raise HTTPException(
            status_code=400,
            detail=(
                "No course/subject create URL configured. Pass courseApiUrl/subjectApiUrl "
                "in the request body, or set COURSE_CREATE_URL and SUBJECT_CREATE_URL in .env"
            ),
        )

    website = str(payload.website)
    crawl = await crawl_website(website, payload.maxPagesToCrawl, max_depth=3)

    if not crawl["combined_text"].strip():
        raise HTTPException(status_code=502, detail="No readable text found on the website")

    extraction = extract_courses_with_gemini(crawl["combined_text"])
    if not extraction.courses:
        return GenerateCoursesResponse(
            website=website,
            pagesCrawled=list(crawl["pages"].keys()),
            coursesFound=0,
            subjectsFound=0,
            results=[],
        )

    results: List[CourseResult] = []
    subjects_found = 0

    async with httpx.AsyncClient() as client:
        try:
            for course in extraction.courses:
                course_result = await create_course(
                    client, course_url, payload.token, payload.universityId, course, payload.isActive,
                )

                if course_result.status == "created" and course.subjects:
                    for subject in course.subjects:
                        subjects_found += 1
                        subject_result = await create_subject(
                            client, subject_url, payload.token, course_result.courseId, subject,
                        )
                        course_result.subjects.append(subject_result)

                results.append(course_result)
        except AdminAuthError as exc:
            raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc

    return GenerateCoursesResponse(
        website=website,
        pagesCrawled=list(crawl["pages"].keys()),
        coursesFound=len(extraction.courses),
        subjectsFound=subjects_found,
        results=results,
    )