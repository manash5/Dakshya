# Dakshya

**AI-Powered Career-Readiness Platform for Nepali Students**

**Dakshya** (दक्ष्य — *efficient* in Nepali) bridges the gap between Nepal's academic system
and its job market in one unified platform. Instead of a transcript, a resume, some job boards,
and guesswork, Dakshya pulls it all into one place: real skill-gap analysis against actual
Nepali job market demand, personalized learning roadmaps, an AI mock-interview simulator that
scores real answers, AI resume analysis, and live job/opportunity discovery — all
cross-referenced against the same underlying skill graph.

---

## Table of Contents

1. [The Idea](#the-idea)
2. [Problem Statement](#problem-statement)
3. [Target Users](#target-users)
4. [Platform Features](#platform-features)
5. [Tech Stack Overview](#tech-stack-overview)
6. [System Architecture](#system-architecture)
7. [Backend Architecture (Express)](#backend-architecture-express)
8. [Frontend Architecture (Next.js)](#frontend-architecture-nextjs)
9. [AI Microservice (FastAPI)](#ai-microservice-fastapi)
10. [REST API Reference](#rest-api-reference)
11. [Design Patterns & Architecture](#design-patterns--architecture)
12. [Testing Strategy](#testing-strategy)
13. [Docker & Deployment](#docker--deployment)
14. [Repository Structure](#repository-structure)
15. [Getting Started](#getting-started)
16. [Future Improvements](#future-improvements)

---

## The Idea

Career pathways and technical skills shift faster than a university curriculum can keep up
with, and it's genuinely hard for a student to work out what they still need to learn outside
the classroom. Dakshya was built to close that gap: it tracks a student's actual curriculum
progress, generates AI career knowledge per job role, analyzes their resume, runs AI mock
interviews scoped to their real skill gaps, surfaces live job postings, and recommends
hands-on projects — all against the same skill graph, so every feature informs every other
one instead of living in its own silo.

## Problem Statement

Career guidance for students is usually disjointed — separate tools for resume review,
interview practice, and job search, none of them connected to what a student is actually
studying. That makes it hard to answer three basic questions: *what skills does this job
need, which of them do I already have, and which do I still need to build?*

Dakshya answers all three in one place, in its **Skill Planner**: it composes a student's
university curriculum, resume, completed projects, and interview performance into one
per-skill status (Locked → Upcoming → Learning → Practiced → Project Applied → Interview
Ready → Mastered), computed live on every read rather than drifting out of sync in a
separately-stored table.

## Target Users

| User | What they need |
|---|---|
| **Students** | A single destination to evaluate career readiness, close skill gaps, practice interviews, and review their resume |
| **Job seekers / recent graduates** | Employability tools that connect directly to real, current job postings |
| **Platform administrators** | Full control over the academic catalogue (universities/courses/subjects), job roles, AI-generated career knowledge, job postings, opportunities, and projects |

## Platform Features

### For Students
- **Skill Planner** — per-skill readiness composed from degree curriculum, resume, projects,
  and interview performance, with a week-by-week roadmap toward a chosen target role.
- **AI Mock Interviews** — questions generated per role (optionally scoped to a single weak
  skill), oral/coding/mixed modes, voice-to-text transcription, and AI-scored feedback with
  per-question breakdown.
- **AI Resume Analysis** — ATS-style scoring, identity-match checking, extracted skills/
  projects/experience/education, and comparison against the student's previous upload.
- **Job Finder** — live job postings matched to the student's target roles, save/unsave,
  market-pulse stats (which skills are actually in demand right now), and salary ranges.
- **Project-Based Learning** — hands-on project recommendations scoped to skill gaps, with a
  working "Mark Complete."
- **Progress/Roadmap** — a step-by-step roadmap per target role with learning resources.

### For Admins
Full CRUD (with pagination and search) over every piece of platform content: users,
universities, courses, subjects, job roles, AI-generated career knowledge (generate/
regenerate on demand), job postings (AI/web scraping), opportunities, and projects.

---

## Tech Stack Overview

Dakshya is split into three independently runnable services, each with its own dependency set.

### Frontend

| Technology | Purpose |
|---|---|
| Next.js 16 (App Router), React 19, TypeScript | Server/client-rendered SPA, file-based routing, route groups |
| Tailwind CSS v4 | Fully custom, utility-first styling — no UI template |
| React Hook Form + Zod | Typed client-side form validation |
| Axios | Typed HTTP client, one module per backend resource |
| `@react-oauth/google` | Google Sign-In on the client |
| Framer Motion, GSAP, Lenis | Page transitions and scroll-driven animation |
| Monaco Editor, react-toastify | Coding-question editor, toast notifications |
| Playwright | End-to-end testing |

### Backend

| Technology | Purpose |
|---|---|
| Node.js, Express 5, TypeScript | RESTful API runtime and routing |
| Mongoose / MongoDB | Schema-validated document data store |
| Zod | Request-body validation via DTOs |
| jsonwebtoken, bcrypt, google-auth-library | JWT auth, password hashing, Google OAuth verification |
| Helmet, express-rate-limit, CORS | Security headers, credential-endpoint rate limiting, origin allow-list |
| Multer | Multipart uploads — profile pictures, resumes, interview audio |
| node-cron | Scheduled job/opportunity scraping via the AI service |
| Nodemailer | Password-reset and verification email delivery |
| Jest, Supertest, mongodb-memory-server | Automated integration testing |

### AI Microservice

| Technology | Purpose |
|---|---|
| FastAPI, Uvicorn (Python 3.14) | Async REST microservice |
| google-genai (Gemini), Groq | Career knowledge generation, interview questions & scoring, resume analysis |
| openai-whisper, imageio-ffmpeg | Transcription of recorded interview answers |
| Playwright, BeautifulSoup4 | Headless-browser scraping of job/opportunity listings |
| pypdf | Resume text extraction from uploaded PDFs |
| Pydantic | Request/response schema validation |

---

## System Architecture

Nothing in the frontend talks to the AI service directly **from the browser** — every
user-driven request flows **browser → frontend server → backend → (sometimes) AI service →
back down**. A concrete trace: a student clicks "Practice" → the frontend's Server Action calls
`POST /api/v1/practice-attempts` → the backend's service looks up the job role, calls the AI
service's `/api/v1/interview/generate-questions` → the AI service calls Gemini/Groq, returns
questions → the backend saves the attempt in MongoDB and returns it → the frontend renders the
question.

The one exception is server-to-server: the frontend's Next.js *server* (not the browser) calls
the AI service directly for the university course-sync flow, and the AI service calls back into
the backend to create the courses/subjects it discovers.

---

## Backend Architecture (Express)

Layered, MVC-style architecture with a strict separation between routing and business logic:

```
index.ts              → server bootstrap (DB connect, cron registration)
src/app.ts             → Express app, middleware, route mounting, error handling
src/routes/             → route definitions only (no logic); admin routes in routes/admin/
src/controllers/        → HTTP layer: parse request, call service, shape response
src/services/           → business logic, cross-entity composition, calls the AI client
src/repository/         → data access (Mongoose queries) behind interfaces
src/models/             → Mongoose schemas (13 total)
src/dtos/               → Zod schemas for request validation
src/middleware/         → JWT auth, admin guard, upload handling
src/clients/            → FastAPI (AI microservice) client
src/cron/               → scheduled scraping jobs
src/utils/              → ApiResponseHelper (uniform response envelope)
```

Every response uses a consistent envelope:

```json
{ "status": 200, "success": true, "message": "...", "data": {}, "meta": { "page": 1, "limit": 10, "total": 42 } }
```

Auth is JWT-based (Bearer tokens); admin routes additionally check a role guard. Errors throw
`HttpException(status, message)` from the service layer and are translated by controllers/a
global error middleware into the same envelope, with the correct HTTP status
(`400`/`401`/`403`/`404`/`429`/`500`).

---

## Frontend Architecture (Next.js)

Server-first: data fetching, auth checks, and mutations happen on the server whenever
possible, via **Server Actions** rather than client-side API routes.

```
app/
  (auth)/          → login, signup, forgot/reset password
  dashboard/       → student app: career dashboard, planner, practice (AI interviews),
                     job-finder, resume-analysis, progress, profile
  admin/           → admin panel — full CRUD for every platform resource
  _components/     → shared UI
lib/
  api/             → one module per backend resource; axios + typed responses
  api/endpoints.ts → single source of truth for every backend URL
  actions/         → "use server" actions wrapping the api layer (cookie/JWT handling
                     stays server-side, never reaches the browser)
  context/         → Auth and User React contexts
  utils/           → practice stats, recommendations, job dedupe, YouTube helpers
proxy.ts           → route protection — Next 16's replacement for middleware.ts (a
                     naming/convention change that isn't documented anywhere in the
                     app/ tree itself; easy to miss)
```

Data flows one way: **page/component → server action (`lib/actions`) → API module
(`lib/api`) → backend**. Components never hardcode URLs. The JWT is stored in a cookie
(`auth_token`) set server-side by a Server Action and read the same way — client-side JS never
touches it directly.

`proxy.ts` is the real access-control layer: it redirects unauthenticated requests to `/login`,
and redirects non-admin users hitting `/admin/*` to `/unauthorized`. Its matcher covers
`/register`, the exact `/dashboard` path, `/login`, and `/admin/:path*` — nested dashboard
routes rely on the backend rejecting unauthenticated API calls rather than a route-level
redirect.

---

## AI Microservice (FastAPI)

| Router | Endpoint(s) | Purpose |
|---|---|---|
| `career_knowledge` | `POST /generate`, `POST /generate-resources` | Generate a role's required skills; generate learning resources for a weak skill |
| `course_generator` | `POST /generate-university-courses` | AI-assisted seeding of a university's course catalogue from its own website |
| `interview` | `POST /generate-questions`, `POST /evaluate`, `POST /transcribe` | Mock-interview questions (optionally skill-scoped), answer scoring, recorded-audio transcription |
| `job_poster` | `POST /scrape` | Playwright-driven scraping of live job postings |
| `opportunities` | `POST /scrape`, `POST /classify` | Scrape and classify events/opportunities |
| `resume_analysis` | `POST /analyze` | Parse an uploaded resume (pypdf) and score it against a target role |

Two LLM providers on purpose, not a migration in progress: **Groq** is the default (a far
larger free-tier request quota, good for small/frequent calls like career-knowledge
generation), but its per-minute token cap can't clear a full scraped-website prompt — so
**course extraction** explicitly opts into **Gemini**'s larger effective context instead.

---

## REST API Reference

Base URL: `http://localhost:<PORT>/api/v1` · 🔒 = requires `Authorization: Bearer <token>` ·
👑 = additionally requires admin role

### Auth (`/auth`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/register-email` | Register with email verification |
| POST | `/auth/login` | Login, returns JWT |
| POST | `/auth/google` | Login/register with a Google ID token |
| POST | `/auth/forgot-password` / `/auth/reset-password` | Email a reset link / reset with the emailed token |
| GET | `/auth/whoami` 🔒 | Current user summary from token |
| GET | `/auth/getProfile` 🔒 | Full profile of current user |
| PUT | `/auth/update` 🔒 | Update profile (multipart, profile picture) |
| PUT | `/auth/change-password` 🔒 | Change password |
| POST | `/auth/onboarding` 🔒 | Complete onboarding (university, course, semester, target roles) |

`/auth/login` and `/auth/register` are rate-limited (50 requests / 15 min / IP).

### Academic Catalogue & Job Roles (public read)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/university`, `/university/:id`, `/university/:id/courses` | Universities and their courses |
| GET | `/course/:id`, `/course/:id/subjects` | Course by id and its subjects |
| GET | `/subject/:id` | Subject by id |
| GET | `/jobRoles`, `/jobRoles/:id` | List active job roles / role + AI career knowledge |
| GET | `/dashboard/career` 🔒 | Aggregated career dashboard — readiness, jobs, skills |
| GET | `/skill-planner/:jobRoleId` 🔒 | Per-skill status composed from degree, resume, projects, interviews |
| POST | `/skill-planner/:jobRoleId/generate-resources` 🔒 | AI-generate learning resources for weak skills |

### Jobs, Opportunities & Practice

| Method | Endpoint | Description |
|---|---|---|
| GET | `/job-postings` | List postings — `page`, `limit`, `location`, `skill`, `experience`, `search` filters |
| GET | `/opportunities` | List events/opportunities, paginated and filterable |
| POST | `/saved-jobs` 🔒 / DELETE | `/saved-jobs/:jobPostingId` 🔒 | Save / unsave a job posting |
| POST | `/practice-attempts` 🔒 | Start an AI mock-interview attempt (optionally skill-scoped) |
| GET | `/practice-attempts` 🔒 | Attempt history — paginated, filterable by role/skill/mode/difficulty |
| PUT | `/practice-attempts/:id/answer` 🔒 | Submit an answer for AI scoring |
| PUT | `/practice-attempts/:id/complete` 🔒 | Complete the attempt |
| POST | `/practice-attempts/transcribe` 🔒 | Transcribe a recorded audio answer (multipart) |
| POST | `/resume-analysis` 🔒 | Upload a resume (multipart) for AI analysis |
| GET | `/resume-analysis/latest` 🔒 | Latest analysis |
| GET | `/projects` 🔒 | Recommended, hands-on practice projects |

### User Progress (`/userProgress`) 🔒

| Method | Endpoint | Description |
|---|---|---|
| GET | `/userProgress` | Current user's progress document |
| GET | `/userProgress/roadmap/:jobRoleId` | Roadmap progress for a role |
| POST | `/userProgress/roadmap/:jobRoleId/project` \| `/step` \| `/resource` | Mark a project / roadmap step / learning resource complete |
| POST | `/userProgress/skills/:jobRoleId/report` | Self-report skill evidence |

### Admin (`/admin/...`) 🔒👑

Full CRUD plus paginated, searchable list endpoints for platform content management:

| Resource | Endpoints |
|---|---|
| `/admin/users` | list, get, create, update, update password, delete |
| `/admin/university` | list, get, get courses, create, update, delete |
| `/admin/course` | list, get, get subjects, create, update, delete |
| `/admin/subject` | list, get, create, update, delete |
| `/admin/jobRoles` | list, get, create, update, delete |
| `/admin/careerKnowledge` | list, get, generate (AI), regenerate, delete |
| `/admin/job-postings` | scrape (AI/web), update, delete |
| `/admin/opportunities` | create, scrape, update, delete |
| `/admin/projects` | create, update, delete |

---

## Design Patterns & Architecture

- **Layered (N-tier) architecture, backend**: routes → middleware → controllers → services →
  repository → models. Each layer only talks to the one directly below it — controllers never
  touch the database, services never handle HTTP concerns.
- **Repository pattern**: Mongoose queries live behind repository interfaces, keeping
  persistence details out of the service layer.
- **DTO validation**: every request body is validated by a Zod schema before it reaches
  business logic.
- **Server Action pattern, frontend**: mutations are `"use server"` functions running on the
  Node.js server — no separate frontend API routes, no fetch client code in components.
- **Provider-fallback pattern, AI service**: Groq is the default LLM provider; specific
  high-token-volume calls (course extraction) explicitly opt into Gemini instead, based on each
  provider's actual empirically-measured limits rather than a blanket choice.

---

## Testing Strategy

### Backend — Jest + Supertest

163 tests across 16 files, almost all real integration tests: real Supertest requests through
the real Express `app`, backed by a real but disposable `mongodb-memory-server` instance — not
mocked repositories. **Coverage:** statements 82.5%, lines 83.1%, functions 81.1% (branches
capped at 45.4% deliberately — every individual conditional path is a much bigger time
investment for comparatively low value). **Mocked:** the FastAPI AI client, Nodemailer, and
Google OAuth token verification — the only things a test genuinely shouldn't depend on being
available. Run: `cd backend && npm test`.

### Frontend — Playwright

52 end-to-end tests (`frontend/tests/e2e/`), all passing, covering ~95% of the app's real
routes/flows. A few things about this suite that aren't obvious from the code alone:

- **Why a mock HTTP server instead of `page.route()`**: every dashboard/admin page is a Server
  Component calling a Server Action, which calls a server-side axios instance — that HTTP call
  happens *inside the Next.js server process*, never the browser, so Playwright's `page.route()`
  (which only sees browser-initiated requests) can't intercept it. `tests/e2e/mock-server/` is
  instead a small, dependency-free Node `http` server standing in for the real backend (and, for
  the one flow that calls it directly, the AI service too).
- **Why a production build, not `next dev`, in the test config**: under this suite's rapid
  sequential navigation across ~30 routes, Turbopack's dev-mode on-demand compilation
  occasionally stalled a request for tens of seconds. Building once up front removed the
  flakiness entirely.
- **`proxy.ts` discovery**: this app's real route guard turned out to be `proxy.ts` (Next 16's
  renamed successor to `middleware.ts`) — found only by testing directly against a running
  server, since nothing in the `app/` tree references it.
- **A real bug this suite found, not yet fixed**: `LoginForm.tsx`'s submit handler has no
  `else` branch for a failed login — a wrong password currently shows no error message at all.

**Known gap**: no Jest + React Testing Library component/unit tests yet — only end-to-end.
Run: `cd frontend && npm run test:e2e`.

---

## Docker & Deployment

All three services plus MongoDB run via `docker-compose.yml` at the repo root — dev-mode
containers (live-reload via bind mounts, running the existing `dev` scripts:
`tsx --watch`, `next dev`, `uvicorn --reload`), not production-optimized builds.

```bash
docker compose up --build
```

Two things worth knowing if you touch the compose file:

1. **`node_modules`/`.venv` are excluded from the bind mounts** (an extra anonymous volume per
   folder) — otherwise a native addon built on the host (e.g. backend's `bcrypt`) would be the
   wrong platform's binary inside the Linux container.
2. **The frontend's `NEXT_PUBLIC_API_URL`/`NEXT_PUBLIC_API_BASE_URL`/`NEXT_PUBLIC_AI_SERVICE_URL`
   point at internal Docker service names** (`http://backend:8088`, `http://ai-services:8000`),
   not `localhost` — safe here specifically because every one of them is only ever read by
   server-side code, never the browser.

---

## Repository Structure

```
Dakshya/
  frontend/        → Next.js App Router SPA (see frontend/README.md)
  backend/         → Express REST API (see backend/README.md)
  ai-services/     → FastAPI AI microservice (see ai-services/README.md)
  docker-compose.yml
  readme.md        → this file
```

---

## Getting Started

### Manually

```bash
# Backend
cd backend && npm install && cp .env.example .env && npm run dev      # :8088

# AI service
cd ai-services && uv sync && uv run uvicorn main:app                  # :8000

# Frontend
cd frontend && npm install && npm run dev                              # :3000
```

### Via Docker

```bash
docker compose up --build
```

Each package has its own short README with setup details and environment variables specific
to that service.

---

## Future Improvements

- **Agentic orchestration in `ai-services`** — replace direct Gemini/Groq calls with a
  LangGraph-based multi-agent pipeline (a Job Search Agent, Skill Gap Agent, and Practice Agent
  coordinated by an orchestrator), so recommendations are grounded in real, current Nepali job
  market data rather than a single-shot model call.
- **Semantic, embedding-based job matching** — replace keyword matching with vector
  similarity for more accurate role/skill recommendations.
- **HATEOAS + conditional HTTP requests** on the REST API.
- **Frontend component-level unit tests** (Jest + React Testing Library) alongside the existing
  Playwright E2E suite.
- **CI/CD** — automated lint/typecheck/test on every push.
