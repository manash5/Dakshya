# Dakshya — Frontend

Next.js (App Router) single-page application for **Dakshya**. Consumes the Express REST API
in `../backend` for everything — auth, onboarding, career dashboard, skill planner, AI mock
interviews, resume analysis, job finder, and the full admin panel.

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19, Server Components + Server Actions)
- **Styling:** Tailwind CSS 4 (fully custom design — no UI template)
- **Forms:** react-hook-form + Zod
- **HTTP:** axios instances, JWT attached from cookies server-side
- **Testing:** Playwright (E2E) — `tests/e2e/`

## Getting Started

```bash
npm install
npm run dev        # http://localhost:3000 (expects the backend running too)
```

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | Development server / production build / serve build |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Playwright E2E suite (builds + starts the app + a mock backend automatically) |

## Layout

```
app/
  (auth)/          → login, signup, forgot/reset password
  dashboard/       → student app: career dashboard, planner, practice, job-finder,
                     resume-analysis, progress, profile
  admin/           → admin panel: full CRUD for every platform resource
lib/api/           → one module per backend resource; axios + typed responses
lib/actions/       → "use server" actions wrapping the api layer (cookie/JWT handling)
proxy.ts           → route protection (Next 16's replacement for middleware.ts)
tests/e2e/         → Playwright suite + its own mock backend
```

Data flows one way: **page/component → server action (`lib/actions`) → API module
(`lib/api`) → backend**. Full architecture, auth flow, and testing notes: see the
[main README](../readme.md).
