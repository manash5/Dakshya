from typing import List, Optional

from pydantic import BaseModel, Field, HttpUrl


# ---------------------------------------------------------------------------
# What Gemini extracts from the website
# ---------------------------------------------------------------------------

class SubjectExtract(BaseModel):
    semester: int = Field(..., description="Semester number this subject belongs to")
    code: str = Field(..., description="Subject/module code, e.g. CS401")
    name: str
    credits: int
    description: str
    skills: List[str] = Field(default_factory=list)


class CourseExtract(BaseModel):
    name: str = Field(..., description="Full course name, e.g. BSc (Hons) Computing")
    degree: str = Field(..., description="e.g. Bachelor, Master, Diploma")
    durationInSemesters: int
    description: str
    subjects: List[SubjectExtract] = Field(default_factory=list)


class ExtractionResult(BaseModel):
    courses: List[CourseExtract] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# API request/response
# ---------------------------------------------------------------------------

class GenerateCoursesRequest(BaseModel):
    universityId: str
    website: HttpUrl
    token: str = Field(..., description="Bearer token for the course/subject create endpoints")
    courseApiUrl: Optional[str] = Field(
        None, description="Override for the course-create endpoint. Falls back to COURSE_CREATE_URL env var."
    )
    subjectApiUrl: Optional[str] = Field(
        None, description="Override for the subject-create endpoint. Falls back to SUBJECT_CREATE_URL env var."
    )
    maxPagesToCrawl: int = Field(12, ge=1, le=30)
    isActive: bool = True


class SubjectResult(BaseModel):
    input: SubjectExtract
    status: str
    subjectId: Optional[str] = None
    error: Optional[str] = None


class CourseResult(BaseModel):
    input: CourseExtract
    status: str
    courseId: Optional[str] = None
    error: Optional[str] = None
    subjects: List[SubjectResult] = Field(default_factory=list)


class GenerateCoursesResponse(BaseModel):
    website: str
    pagesCrawled: List[str]
    coursesFound: int
    subjectsFound: int
    results: List[CourseResult]
