# Dakshya — Backend REST API

Express + TypeScript REST API for **Dakshya**, an AI-powered career guidance platform for Nepali students. It serves the Next.js frontend and talks to MongoDB (Mongoose) and a FastAPI AI microservice (Gemini) for career-knowledge generation, interview questions, resume analysis, and job/opportunity scraping.

## Tech Stack

- **Runtime:** Node.js, Express 5, TypeScript
- **Database:** MongoDB via Mongoose
- **Auth:** JWT (Bearer tokens), bcrypt password hashing
- **Validation:** Zod DTOs
- **Security:** Helmet security headers, rate limiting on credential endpoints, CORS allow-list
- **Scheduling:** node-cron (job/opportunity scraping)
- **File uploads:** Multer (profile pictures, resumes, interview audio)

## Architecture

The codebase follows a layered MVC-style architecture with a strict separation between routing and business logic:

```
index.ts              → server bootstrap (DB connect, cron registration)
src/app.ts            → Express app, middleware, route mounting, error handling
src/routes/           → route definitions only (no logic); admin routes in routes/admin/
src/controllers/      → HTTP layer: parse request, call service, shape response
src/services/         → business logic, cross-entity composition
src/repository/       → data access (Mongoose queries) behind interfaces
src/models/           → Mongoose schemas
src/dtos/             → Zod schemas for request validation
src/middleware/       → JWT auth, admin guard, upload handling
src/clients/          → FastAPI (AI microservice) client
src/cron/             → scheduled scraping jobs
src/exceptions/       → HttpException
src/utils/            → ApiResponseHelper (uniform response envelope)
```

Every response uses a consistent envelope:

```json
{ "status": 200, "success": true, "message": "...", "data": { }, "meta": { "page": 1, "limit": 10, "total": 42 } }
```

Errors return appropriate HTTP status codes (`400` validation, `401` unauthenticated, `403` forbidden, `404` not found, `429` rate-limited, `500` unexpected) with a descriptive message.

## Getting Started

```bash
npm install
cp .env.example .env   # fill in values (see below)
npm run dev            # starts on PORT with tsx --watch
```

### Environment variables

| Variable | Purpose |
|---|---|
| `PORT` | HTTP port the API listens on |
| `BASE_URL` | Public base URL of this API (used for building upload links) |
| `MONGO_URL` | MongoDB connection string |
| `SECRET_KEY` | Secret for signing JWTs |
| `APP_URL` | Frontend base URL (used in password-reset links) |
| `GOOGLE_CLIENT_ID` | Google OAuth client id for Google Sign-In |
| `GMAIL_USER` / `GOOGLE_APP_PASSWORD` | Gmail SMTP credentials for password-reset emails |
| `FASTAPI_URL` / `FASTAPI_SERVICE_URL` | Base URL of the AI microservice |

### Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Run with auto-reload |
| `npm run lint` | ESLint over the whole backend |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Run the Jest test suite with coverage |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Same as `npm test` (explicit alias) |

## Testing

Jest + Supertest + `mongodb-memory-server` — every test hits the real Express
app and a real (in-memory, disposable) MongoDB instance, not mocked models.
The only things mocked are external services the tests shouldn't depend on
being available: the FastAPI AI client, Google OAuth token verification, and
Nodemailer.

```
tests/
  setup.ts       → starts/stops the in-memory MongoDB, clears collections between tests
  helpers/       → test user + JWT creation, university/course/jobRole/project fixtures,
                   a full-onboarding helper for tests that need a real UserProgress doc
  routes/        → integration tests per route group (auth, catalog, practice, etc.)
  unit/          → focused unit tests for repository methods integration tests don't reach
```

Run `npm test` for a full run with a coverage report. Current coverage:
statements 82.5%, lines 83.1%, functions 81.1%, branches 45.4% (branch
coverage — every individual conditional path — is the strictest of the four
metrics and the threshold reflects realistic current coverage rather than an
aspirational one).

## API Reference

Base URL: `http://localhost:<PORT>/api/v1`

🔒 = requires `Authorization: Bearer <token>` · 👑 = additionally requires admin role

### Auth (`/auth`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/register-email` | Register with email verification |
| POST | `/auth/login` | Login, returns JWT |
| POST | `/auth/google` | Login/register with a Google ID token |
| POST | `/auth/forgot-password` | Email a password-reset link |
| POST | `/auth/reset-password` | Reset password with emailed token |
| GET | `/auth/whoami` 🔒 | Current user summary from token |
| GET | `/auth/getProfile` 🔒 | Full profile of current user |
| PUT | `/auth/update` 🔒 | Update profile (multipart, profile picture) |
| PUT | `/auth/change-password` 🔒 | Change password |
| POST | `/auth/onboarding` 🔒 | Complete onboarding (university, course, semester, target roles) |

`/auth/login` and `/auth/register` are rate-limited (50 requests / 15 min / IP).

### University, Course, Subject (public read)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/university` | List universities |
| GET | `/university/:id` | University by id |
| GET | `/university/:id/courses` | Courses of a university |
| GET | `/course/:id` | Course by id |
| GET | `/course/:id/subjects` | Subjects of a course |
| GET | `/subject/:id` | Subject by id |

### Job Roles & Career Data

| Method | Endpoint | Description |
|---|---|---|
| GET | `/jobRoles` | List active job roles |
| GET | `/jobRoles/:id` | Job role + its AI career knowledge |
| GET | `/dashboard/career` 🔒 | Aggregated career dashboard (readiness, jobs, skills) |
| GET | `/skill-planner/:jobRoleId` 🔒 | Per-skill status/proficiency composed from degree, resume, projects, interviews |
| POST | `/skill-planner/:jobRoleId/generate-resources` 🔒 | AI-generate learning resources for weak skills |

### Jobs & Opportunities

| Method | Endpoint | Description |
|---|---|---|
| GET | `/job-postings` | List job postings — supports `page`, `limit`, `location`, `skill`, `experience`, `search` query filters |
| GET | `/job-postings/:id` | Job posting by id |
| GET | `/opportunities` | List events/opportunities (paginated, filterable) |
| GET | `/opportunities/:id` | Opportunity by id |
| POST | `/saved-jobs` 🔒 | Save a job posting |
| GET | `/saved-jobs` 🔒 | List saved jobs |
| DELETE | `/saved-jobs/:jobPostingId` 🔒 | Unsave a job posting |

### User Progress (`/userProgress`) 🔒

| Method | Endpoint | Description |
|---|---|---|
| GET | `/userProgress` | Current user's progress document |
| POST | `/userProgress/refresh` | Recompute progress |
| GET | `/userProgress/roadmap/:jobRoleId` | Roadmap progress for a role |
| POST | `/userProgress/roadmap/:jobRoleId/visit` | Record roadmap visit |
| POST | `/userProgress/roadmap/:jobRoleId/project` | Mark a project completed |
| POST | `/userProgress/roadmap/:jobRoleId/step` | Mark a roadmap step completed |
| POST | `/userProgress/roadmap/:jobRoleId/resource` | Mark a learning resource watched |
| POST | `/userProgress/skills/:jobRoleId/report` | Self-report skill evidence |

### Practice / AI Mock Interviews (`/practice-attempts`) 🔒

| Method | Endpoint | Description |
|---|---|---|
| POST | `/practice-attempts` | Start an attempt (AI-generated questions, optionally skill-scoped) |
| GET | `/practice-attempts` | Attempt history (paginated, filterable by role/skill/mode/difficulty) |
| GET | `/practice-attempts/:id` | Attempt with full per-question analysis |
| PUT | `/practice-attempts/:id/answer` | Submit an answer for AI scoring |
| PUT | `/practice-attempts/:id/complete` | Complete the attempt |
| DELETE | `/practice-attempts/:id` | Delete an attempt (owner only) |
| POST | `/practice-attempts/transcribe` | Transcribe recorded audio answer (multipart) |

### Resume Analysis (`/resume-analysis`) 🔒

| Method | Endpoint | Description |
|---|---|---|
| POST | `/resume-analysis` | Upload resume (multipart) for AI analysis |
| GET | `/resume-analysis` | Analysis history |
| GET | `/resume-analysis/latest` | Latest analysis |
| GET | `/resume-analysis/:id` | Analysis by id |
| DELETE | `/resume-analysis/:id` | Delete an analysis |

### Projects (`/projects`) 🔒

| Method | Endpoint | Description |
|---|---|---|
| GET | `/projects` | Recommended practice projects |
| GET | `/projects/:id` | Project by id |

### Admin (`/admin/...`) 🔒👑

Full CRUD + paginated/searchable list endpoints for platform content management:

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

All admin list endpoints support `page`, `limit`, and `search` query parameters.

## Error Handling

- Domain errors throw `HttpException(status, message)` from services; controllers and the global error middleware translate them into the response envelope.
- A global fallback handler catches unexpected errors and returns `500` — no request is ever left hanging.
- Unknown routes return `404 Route Not Found`.

## Testing the API

All endpoints can be exercised with Postman: register via `POST /auth/register`, login via `POST /auth/login`, then send the returned token as `Authorization: Bearer <token>` on protected routes.
