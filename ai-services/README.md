# Dakshya — AI Microservice

FastAPI microservice that does every AI-generated thing in **Dakshya**: career knowledge
generation, mock-interview questions and scoring, resume analysis, and job/opportunity
scraping. Called by the Express backend (`../backend`) over plain HTTP — never called directly
from the browser.

## Tech Stack

- **Runtime:** Python 3.14, FastAPI, Uvicorn
- **AI providers:** Google Gemini (`google-genai`) and Groq — two providers on purpose, not a
  migration in progress (Groq's free tier handles frequent small calls; Gemini's larger context
  handles the occasional huge one, e.g. a scraped university page)
- **Scraping:** Playwright (headless Chromium) + BeautifulSoup4
- **Transcription:** openai-whisper (interview audio answers)
- **Resume parsing:** pypdf
- **Validation:** Pydantic

## Getting Started

```bash
uv sync                                  # installs deps into .venv
uv run playwright install chromium       # one-time browser download
uv run uvicorn main:app --reload         # http://localhost:8000
```

### Environment variables

| Variable | Purpose |
|---|---|
| `AI_SERVICE_PORT` | Port to listen on (defaults to 8000) |
| `GEMINI_API_KEY` / `GEMINI_MODEL_NAME` | Google Gemini credentials + model |
| `GROQ_API_KEY` / `GROQ_MODEL_NAME` | Groq credentials + model |
| `COURSE_CREATE_URL` / `SUBJECT_CREATE_URL` | Backend endpoints the course-generator calls back into after scraping a university |

## Routers

| Router | Endpoint(s) | Purpose |
|---|---|---|
| `career_knowledge` | `POST /api/v1/career-knowledge/generate`, `POST .../generate-resources` | Generate a role's required skills; generate learning resources for a weak skill |
| `course_generator` | `POST /api/v1/generate-university-courses` | Scrape a university's site and AI-extract its course catalogue |
| `interview` | `POST /api/v1/interview/generate-questions`, `POST .../evaluate`, `POST .../transcribe` | Mock-interview questions (optionally skill-scoped), answer scoring, audio transcription |
| `job_poster` | `POST /api/v1/job-postings/scrape` | Playwright-driven scraping of live job postings |
| `opportunities` | `POST /api/v1/opportunities/scrape`, `POST .../classify` | Scrape and classify events/opportunities |
| `resume_analysis` | `POST /api/v1/resume-analysis/analyze` | Parse an uploaded resume (pypdf) and score it against a target role |

Full architecture, request/response envelope conventions, and how this fits with the other two
services: see the [main README](../readme.md).
