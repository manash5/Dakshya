# Dakshya — Backend REST API

Express + TypeScript REST API for **Dakshya**. Talks to MongoDB (Mongoose) and to the FastAPI
AI microservice (`../ai-services`) for every AI-generated feature.

## Tech Stack

- **Runtime:** Node.js, Express 5, TypeScript
- **Database:** MongoDB via Mongoose
- **Auth:** JWT (Bearer tokens), bcrypt password hashing, Google OAuth
- **Validation:** Zod DTOs
- **Security:** Helmet, rate limiting on credential endpoints, CORS allow-list
- **Testing:** Jest + Supertest + `mongodb-memory-server`

## Getting Started

```bash
npm install
cp .env.example .env   # fill in values
npm run dev            # starts on PORT with tsx --watch
```

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Run with auto-reload |
| `npm run lint` / `npm run typecheck` | ESLint / `tsc --noEmit` |
| `npm test` | Jest suite with coverage |

## Layout

```
src/routes/        → route definitions only; admin routes in routes/admin/
src/controllers/    → HTTP layer: parse request, call service, shape response
src/services/       → business logic, cross-entity composition, calls the AI client
src/repository/     → data access (Mongoose) behind interfaces
src/models/ dtos/    → Mongoose schemas / Zod request validation
src/middleware/      → JWT auth, admin guard, upload handling
src/clients/         → FastAPI (AI microservice) client
```

Every response uses a consistent envelope — `{ status, success, message, data, meta? }`. Full
API reference, architecture diagram, and how this fits with the frontend and AI service: see
the [main README](../readme.md).

## Testing

163 tests, mostly real integration tests (real Express app + a real, disposable in-memory
Mongo) — only the FastAPI client, Nodemailer, and Google OAuth verification are mocked.
`npm test` for a full run with coverage (82.5% statements / 83.1% lines / 81.1% functions).
