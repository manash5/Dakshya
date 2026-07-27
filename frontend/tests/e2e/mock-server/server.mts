// A zero-dependency stand-in for the real Express backend, used only by the
// Playwright E2E suite. Every dashboard/admin page in this app fetches data
// via Next.js Server Actions running INSIDE the Next.js server process (see
// tests/e2e/README.md for why page.route() can't intercept those calls) --
// so this is a real HTTP server that NEXT_PUBLIC_API_URL points at during
// test runs, not a browser-level mock.
//
// This file (and start.mts) runs directly via `node` rather than through
// Playwright's own TS transform or Next's bundler -- Node 24 strips
// TypeScript types natively, no ts-node/tsx dependency needed. It's ".mts"
// (not ".ts") so Node treats it as an ES module unambiguously without
// needing a nested package.json; relative imports still need explicit
// extensions either way, since that's a Node ESM resolution rule, not a
// TypeScript one -- a bundler's resolver (Next's, Playwright's own) allows
// extensionless imports, bare `node` does not.
import http from "http";
import * as admin from "../fixtures/admin.fixtures.ts";
import * as auth from "../fixtures/auth.fixtures.ts";
import * as dashboardFixtures from "../fixtures/dashboard.fixtures.ts";
import { skillPlannerByRole } from "../fixtures/skillPlanner.fixtures.ts";
import { seedAttemptHistory, buildQuestions } from "../fixtures/practice.fixtures.ts";
import { seedSavedJobs } from "../fixtures/jobFinder.fixtures.ts";
import { seedAnalysisHistory, buildAnalysisResult } from "../fixtures/resumeAnalysis.fixtures.ts";

function clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
}

let state: Record<string, any> = {};
function resetState() {
    state = {
        universities: clone(admin.universities),
        courses: clone(admin.courses),
        subjects: clone(admin.subjects),
        jobRoles: clone(admin.jobRoles),
        jobPostings: clone(admin.jobPostings),
        opportunities: clone(admin.opportunities),
        projects: clone(admin.projects),
        careerKnowledge: clone(admin.careerKnowledge),
        users: clone(admin.users),
        savedJobs: clone(seedSavedJobs),
        practiceAttempts: clone(seedAttemptHistory),
        resumeAnalyses: clone(seedAnalysisHistory),
        profile: clone(auth.PROFILE_SEED),
        nextId: 1000,
    };
}
resetState();

function genId(prefix: string) {
    state.nextId += 1;
    return `${prefix}-${state.nextId}`;
}

// ---------------------------------------------------------------------------
// Minimal router: method + "/segments/:withParams" pattern matching.
// ---------------------------------------------------------------------------
interface MockRequest {
    method: string;
    params: Record<string, string>;
    query: URLSearchParams;
    body: any;
}
interface MockResult {
    status: number;
    body: any;
}
type Handler = (req: MockRequest) => MockResult;
interface Route {
    method: string;
    segments: string[];
    handler: Handler;
}

const routes: Route[] = [];

function compile(pattern: string): string[] {
    return pattern.split("/").filter(Boolean);
}

function on(method: string, pattern: string, handler: Handler) {
    routes.push({ method: method.toUpperCase(), segments: compile(pattern), handler });
}

function matchRoute(method: string, pathSegments: string[]): { route: Route; params: Record<string, string> } | null {
    for (const route of routes) {
        if (route.method !== method) continue;
        if (route.segments.length !== pathSegments.length) continue;
        const params: Record<string, string> = {};
        let matches = true;
        for (let i = 0; i < route.segments.length; i++) {
            const seg = route.segments[i];
            if (seg.startsWith(":")) {
                params[seg.slice(1)] = decodeURIComponent(pathSegments[i]);
            } else if (seg !== pathSegments[i]) {
                matches = false;
                break;
            }
        }
        if (matches) return { route, params };
    }
    return null;
}

// Minimal multipart/form-data parser -- only extracts text field values
// (file parts are ignored; nothing in this suite asserts on uploaded file
// bytes). Good enough for admin forms like UserForm.tsx that submit
// multipart because they *can* attach an image, even when a given test
// doesn't attach one.
function parseMultipart(raw: string, contentType: string): Record<string, string> {
    const boundaryMatch = /boundary=(?:"([^"]+)"|([^;]+))/.exec(contentType);
    const boundary = boundaryMatch && (boundaryMatch[1] || boundaryMatch[2]);
    if (!boundary) return {};

    const body: Record<string, string> = {};
    const parts = raw.split(`--${boundary}`);
    for (const part of parts) {
        const trimmed = part.replace(/^\r\n/, "");
        const headerEnd = trimmed.indexOf("\r\n\r\n");
        if (headerEnd === -1) continue;
        const headers = trimmed.slice(0, headerEnd);
        const nameMatch = /name="([^"]+)"/.exec(headers);
        if (!nameMatch || /filename="/.test(headers)) continue;
        let value = trimmed.slice(headerEnd + 4);
        value = value.replace(/\r\n--$/, "").replace(/\r\n$/, "");
        body[nameMatch[1]] = value;
    }
    return body;
}

function ok(data: any, message = "Success", meta?: any): MockResult {
    return { status: 200, body: { status: 200, success: true, data, message, ...(meta ? { meta } : {}) } };
}
function fail(message = "Error", status = 400): MockResult {
    return { status, body: { status, success: false, message } };
}
function notFound(message = "Not found"): MockResult {
    return fail(message, 404);
}

function paginate(
    items: any[],
    { page, limit, search, searchFields }: { page?: string | null; limit?: string | null; search?: string | null; searchFields?: string[] },
) {
    let filtered = items;
    if (search) {
        const q = String(search).toLowerCase();
        filtered = items.filter((it) => (searchFields || []).some((f) => String(it[f] ?? "").toLowerCase().includes(q)));
    }
    const p = Number(page) > 0 ? Number(page) : 1;
    const l = Number(limit) > 0 ? Number(limit) : 10;
    const total = filtered.length;
    const start = (p - 1) * l;
    return { data: filtered.slice(start, start + l), meta: { page: p, limit: l, total, totalPages: Math.max(1, Math.ceil(total / l)) } };
}

// ---------------------------------------------------------------------------
// Generic CRUD wiring, shared by every admin-managed catalog resource.
// ---------------------------------------------------------------------------
function registerCrud({
    publicPath,
    adminPath,
    key,
    searchFields = [],
    idField = "_id",
    label,
}: {
    publicPath?: string;
    adminPath?: string;
    key: string;
    searchFields?: string[];
    idField?: string;
    label: string;
}) {
    const list: Handler = (req) => {
        const { data, meta } = paginate(state[key], {
            page: req.query.get("page"),
            limit: req.query.get("limit"),
            search: req.query.get("search"),
            searchFields,
        });
        return ok(data, "Success", meta);
    };
    const detail: Handler = (req) => {
        const item = state[key].find((it: any) => it[idField] === req.params.id);
        return item ? ok(item) : notFound(`${label} not found`);
    };
    if (publicPath) {
        on("GET", publicPath, list);
        on("GET", `${publicPath}/:id`, detail);
    }
    if (adminPath) {
        on("GET", adminPath, list);
        on("GET", `${adminPath}/:id`, detail);
        on("POST", adminPath, (req) => {
            const item = { [idField]: genId(key), isActive: true, ...req.body };
            state[key].push(item);
            return ok(item, `${label} added succesfully`);
        });
        on("PUT", `${adminPath}/:id`, (req) => {
            const idx = state[key].findIndex((it: any) => it[idField] === req.params.id);
            if (idx === -1) return notFound(`${label} not found`);
            state[key][idx] = { ...state[key][idx], ...req.body };
            return ok(state[key][idx], `${label} updated successfully`);
        });
        on("DELETE", `${adminPath}/:id`, (req) => {
            const idx = state[key].findIndex((it: any) => it[idField] === req.params.id);
            if (idx === -1) return notFound(`${label} not found`);
            state[key].splice(idx, 1);
            return ok(null, `${label} deleted successfully`);
        });
    }
}

registerCrud({ publicPath: "/api/v1/university", adminPath: "/api/v1/admin/university", key: "universities", searchFields: ["name", "shortName"], label: "University" });
registerCrud({ adminPath: "/api/v1/admin/course", key: "courses", searchFields: ["name"], label: "Course" });
registerCrud({ adminPath: "/api/v1/admin/subject", key: "subjects", searchFields: ["name", "code"], label: "Subject" });
registerCrud({ publicPath: "/api/v1/jobRoles", adminPath: "/api/v1/admin/jobRoles", key: "jobRoles", searchFields: ["title", "category"], label: "Job role" });
registerCrud({ adminPath: "/api/v1/admin/opportunities", key: "opportunities", searchFields: ["title", "organizer"], label: "Opportunity" });
registerCrud({ adminPath: "/api/v1/admin/projects", key: "projects", searchFields: ["title"], label: "Project" });
registerCrud({ adminPath: "/api/v1/admin/users", key: "users", searchFields: ["firstName", "lastName", "email", "username"], label: "User" });

// Public list endpoints for opportunities/projects filter by jobRoleIds/
// careerRole (see handleGetAllOpportunities, handleGetAllProjects) -- the
// generic registerCrud list doesn't know about those fields, and several
// dashboard pages fan these calls out per target role, so without this
// filter every role would get the same unfiltered list back (harmless data
// wise, but produces duplicate React keys when the same project/opportunity
// gets rendered under more than one role section).
on("GET", "/api/v1/opportunities", (req) => {
    const jobRoleIds = (req.query.get("jobRoleIds") || "").split(",").filter(Boolean);
    const pool = jobRoleIds.length ? state.opportunities.filter((o: any) => (o.jobRoles || []).some((r: string) => jobRoleIds.includes(r))) : state.opportunities;
    const { data, meta } = paginate(pool, { page: req.query.get("page"), limit: req.query.get("limit"), search: req.query.get("search"), searchFields: ["title", "organizer"] });
    return ok(data, "Success", meta);
});
on("GET", "/api/v1/opportunities/:id", (req) => {
    const item = state.opportunities.find((o: any) => o._id === req.params.id);
    return item ? ok(item) : notFound("Opportunity not found");
});
on("GET", "/api/v1/projects", (req) => {
    const careerRole = req.query.get("careerRole");
    const pool = careerRole ? state.projects.filter((p: any) => p.careerRole === careerRole) : state.projects;
    const { data, meta } = paginate(pool, { page: req.query.get("page"), limit: req.query.get("limit"), search: req.query.get("search"), searchFields: ["title"] });
    return ok(data, "Success", meta);
});
on("GET", "/api/v1/projects/:id", (req) => {
    const item = state.projects.find((p: any) => p._id === req.params.id);
    return item ? ok(item) : notFound("Project not found");
});

// Career knowledge doesn't fit the generic CRUD shape: it's not "create a
// new record", it's "generate/regenerate/delete the one record for this
// specific job role" -- every verb is scoped by :jobRoleId in the path
// (see API.ADMIN.CAREER_KNOWLEDGE in frontend/lib/api/endpoints.ts).
on("GET", "/api/v1/admin/careerKnowledge", (req) => {
    const { data, meta } = paginate(state.careerKnowledge, {
        page: req.query.get("page"),
        limit: req.query.get("limit"),
        search: req.query.get("search"),
        searchFields: [],
    });
    return ok(data, "Success", meta);
});
on("GET", "/api/v1/admin/careerKnowledge/:jobRoleId", (req) => {
    const item = state.careerKnowledge.find((c: any) => c.jobRoleId === req.params.jobRoleId);
    return item ? ok(item) : notFound("Career knowledge not found");
});
on("POST", "/api/v1/admin/careerKnowledge/:jobRoleId", (req) => {
    const item = { _id: genId("ck"), jobRoleId: req.params.jobRoleId, aiGeneratedDate: new Date().toISOString(), summary: "Generated summary." };
    state.careerKnowledge.push(item);
    return ok(item, "Career knowledge generated successfully");
});
on("PUT", "/api/v1/admin/careerKnowledge/:jobRoleId", (req) => {
    const idx = state.careerKnowledge.findIndex((c: any) => c.jobRoleId === req.params.jobRoleId);
    if (idx === -1) return notFound("Career knowledge not found");
    state.careerKnowledge[idx] = { ...state.careerKnowledge[idx], aiGeneratedDate: new Date().toISOString() };
    return ok(state.careerKnowledge[idx], "Career knowledge regenerated successfully");
});
on("DELETE", "/api/v1/admin/careerKnowledge/:jobRoleId", (req) => {
    const idx = state.careerKnowledge.findIndex((c: any) => c.jobRoleId === req.params.jobRoleId);
    if (idx === -1) return notFound("Career knowledge not found");
    state.careerKnowledge.splice(idx, 1);
    return ok(null, "Career knowledge deleted successfully");
});

// Job postings: public list supports ?jobRoleId= filtering (Market Pulse /
// Job Finder); admin side is update+delete+scrape only, never manual create.
on("GET", "/api/v1/job-postings", (req) => {
    const jobRoleId = req.query.get("jobRoleId");
    const pool = jobRoleId ? state.jobPostings.filter((j: any) => j.jobRoleId === jobRoleId) : state.jobPostings;
    const { data, meta } = paginate(pool, {
        page: req.query.get("page"),
        limit: req.query.get("limit"),
        search: req.query.get("search"),
        searchFields: ["title", "company"],
    });
    return ok(data, "Success", meta);
});
on("GET", "/api/v1/job-postings/:id", (req) => {
    const item = state.jobPostings.find((j: any) => j._id === req.params.id);
    return item ? ok(item) : notFound("Job posting not found");
});
on("PUT", "/api/v1/admin/job-postings/:id", (req) => {
    const idx = state.jobPostings.findIndex((j: any) => j._id === req.params.id);
    if (idx === -1) return notFound("Job posting not found");
    state.jobPostings[idx] = { ...state.jobPostings[idx], ...req.body };
    return ok(state.jobPostings[idx], "Job posting updated successfully");
});
on("DELETE", "/api/v1/admin/job-postings/:id", (req) => {
    const idx = state.jobPostings.findIndex((j: any) => j._id === req.params.id);
    if (idx === -1) return notFound("Job posting not found");
    state.jobPostings.splice(idx, 1);
    return ok(null, "Job posting deleted successfully");
});
on("POST", "/api/v1/admin/job-postings/scrape", () => ok({ inserted: 0 }, "Scrape complete"));

// University -> courses, course -> subjects/detail (nested catalog browsing).
on("GET", "/api/v1/university/:id/courses", (req) => ok(state.courses.filter((c: any) => c.universityId === req.params.id)));
on("GET", "/api/v1/admin/university/:id/courses", (req) => ok(state.courses.filter((c: any) => c.universityId === req.params.id)));
on("GET", "/api/v1/course/:id/subjects", (req) => ok(state.subjects.filter((s: any) => s.courseId === req.params.id)));
on("GET", "/api/v1/admin/course/:id/subjects", (req) => ok(state.subjects.filter((s: any) => s.courseId === req.params.id)));
on("GET", "/api/v1/course/:id", (req) => {
    const item = state.courses.find((c: any) => c._id === req.params.id);
    return item ? ok(item) : notFound("Course not found");
});
on("POST", "/api/v1/admin/course/sync", () => ok({ inserted: 1 }, "Courses synced successfully"));

// AI service stand-in: NEXT_PUBLIC_AI_SERVICE_URL also points here in tests
// (see playwright.config.ts) so the university-create -> course-sync chain
// resolves instead of hanging on an unreachable AI microservice. Unlike the
// Express backend, this FastAPI-shaped endpoint returns the payload directly
// -- no {success, data, message} envelope (see generateUniversityCourses in
// frontend/lib/api/ai/course-generator.ts, which returns response.data as-is).
on("POST", "/api/v1/generate-university-courses", (req) => {
    const website = (req.body && req.body.website) || "";
    return {
        status: 200,
        body: { website, pagesCrawled: [website], coursesFound: 0, subjectsFound: 0, results: [] },
    };
});

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
on("POST", "/api/v1/auth/register", (req) => ok({ user: { ...auth.AUTH_USER, ...req.body, _id: genId("user") } }, "Registered successfully"));
on("POST", "/api/v1/auth/login", (req) => {
    const { email, password } = req.body || {};
    if (email === auth.VALID_EMAIL && password === auth.VALID_PASSWORD) {
        return ok({ user: auth.AUTH_USER, token: auth.AUTH_TOKEN, mustChangePassword: false }, "Login successful");
    }
    return fail("Invalid email or password", 401);
});
on("GET", "/api/v1/auth/whoami", () => ok(auth.AUTH_USER));
on("GET", "/api/v1/auth/getProfile", () => ok(state.profile));
on("PUT", "/api/v1/auth/update", () => {
    state.profile = { ...state.profile, updatedAt: new Date().toISOString() };
    return ok(state.profile, "Profile updated successfully");
});
on("PUT", "/api/v1/auth/change-password", (req) => {
    const { currentPassword } = req.body || {};
    if (currentPassword && currentPassword !== auth.VALID_PASSWORD) return fail("Current password is incorrect", 400);
    return ok(null, "Password changed successfully");
});
on("POST", "/api/v1/auth/google", () => ok({ user: auth.AUTH_USER, token: auth.AUTH_TOKEN }, "Login successful"));
on("POST", "/api/v1/auth/forgot-password", () => ok(null, "Reset link sent"));
on("POST", "/api/v1/auth/reset-password", () => ok(null, "Password reset successful"));
on("POST", "/api/v1/auth/onboarding", (req) => {
    state.profile = { ...state.profile, ...req.body };
    return ok(state.profile, "Onboarding complete");
});

// ---------------------------------------------------------------------------
// Dashboard / skill planner / user progress
// ---------------------------------------------------------------------------
on("GET", "/api/v1/dashboard/career", () => ok(clone(dashboardFixtures.careerDashboard)));

on("GET", "/api/v1/skill-planner/:jobRoleId", (req) => {
    const data = skillPlannerByRole[req.params.jobRoleId] || skillPlannerByRole["role-frontend"];
    return ok(clone(data));
});
on("POST", "/api/v1/skill-planner/:jobRoleId/generate-resources", () => ok({ resources: [] }, "Resources generated"));

on("PUT", "/api/v1/userProgress/roadmap/:jobRoleId/visit", () => ok(null, "Visit recorded"));
on("PUT", "/api/v1/userProgress/roadmap/:jobRoleId/project", () => ok(null, "Project marked complete"));
on("PUT", "/api/v1/userProgress/roadmap/:jobRoleId/step", () => ok(null, "Step marked complete"));
on("PUT", "/api/v1/userProgress/roadmap/:jobRoleId/resource", () => ok(null, "Resource marked watched"));
on("PUT", "/api/v1/userProgress/skills/:jobRoleId/report", () => ok(null, "Skill reported"));

// ---------------------------------------------------------------------------
// Practice attempts / interviews
// ---------------------------------------------------------------------------
on("POST", "/api/v1/practice-attempts", (req) => {
    const body = req.body || {};
    const attempt = {
        _id: genId("attempt"),
        userId: "user-1",
        jobRoleId: state.jobRoles.find((r: any) => r._id === body.jobRoleId) || { _id: body.jobRoleId, title: "Unknown Role" },
        skill: body.skill || null,
        skills: body.skills || [],
        difficulty: body.difficulty || "Intermediate",
        mode: body.mode || "Mixed",
        questionCount: body.questionCount || 3,
        startedAt: new Date().toISOString(),
        completedAt: null,
        duration: null,
        overallScore: null,
        technicalScore: null,
        communicationScore: null,
        feedback: "",
        recommendations: [],
        questions: buildQuestions(body.mode, body.questionCount),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    state.practiceAttempts.unshift(attempt);
    return ok(attempt, "Interview started");
});
on("GET", "/api/v1/practice-attempts", (req) => {
    const jobRoleId = req.query.get("jobRoleId");
    let pool = state.practiceAttempts;
    if (jobRoleId) pool = pool.filter((a: any) => (a.jobRoleId && a.jobRoleId._id) === jobRoleId);
    const { data, meta } = paginate(pool, { page: req.query.get("page"), limit: req.query.get("limit"), search: null, searchFields: [] });
    return ok(data, "Success", meta);
});
on("GET", "/api/v1/practice-attempts/:id", (req) => {
    const item = state.practiceAttempts.find((a: any) => a._id === req.params.id);
    return item ? ok(item) : notFound("Attempt not found");
});
on("PUT", "/api/v1/practice-attempts/:id/answer", (req) => {
    const item = state.practiceAttempts.find((a: any) => a._id === req.params.id);
    if (!item) return notFound("Attempt not found");
    const { questionIndex, userAnswer, userCode } = req.body || {};
    const q = item.questions[questionIndex];
    if (q) {
        q.userAnswer = userAnswer || "";
        q.userCode = userCode || "";
        q.score = 75;
        q.confidenceScore = 70;
        q.feedback = "Reasonable answer.";
        q.expectedAnswer = q.expectedAnswer || "A model answer covering the key points.";
    }
    return ok(item, "Answer submitted");
});
on("PUT", "/api/v1/practice-attempts/:id/complete", (req) => {
    const item = state.practiceAttempts.find((a: any) => a._id === req.params.id);
    if (!item) return notFound("Attempt not found");
    item.completedAt = new Date().toISOString();
    item.duration = 600;
    item.overallScore = 78;
    item.technicalScore = 80;
    item.communicationScore = 76;
    item.feedback = (req.body && req.body.feedback) || "Good overall performance.";
    item.recommendations = (req.body && req.body.recommendations) || ["Keep practicing system design."];
    return ok(item, "Interview completed");
});
on("DELETE", "/api/v1/practice-attempts/:id", (req) => {
    const idx = state.practiceAttempts.findIndex((a: any) => a._id === req.params.id);
    if (idx === -1) return notFound("Attempt not found");
    state.practiceAttempts.splice(idx, 1);
    return ok(null, "Attempt deleted");
});
on("POST", "/api/v1/practice-attempts/transcribe", () => ok({ text: "This is a transcribed answer." }, "Transcribed"));

// ---------------------------------------------------------------------------
// Resume analysis
// ---------------------------------------------------------------------------
on("POST", "/api/v1/resume-analysis", (req) => {
    const result = buildAnalysisResult((req.body && req.body.fileName) || "resume.pdf");
    state.resumeAnalyses.unshift(result);
    return ok(result, "Resume analyzed successfully");
});
on("GET", "/api/v1/resume-analysis/latest", () => {
    const latest = state.resumeAnalyses[0];
    return latest ? ok(latest) : ok(null, "No analysis found");
});
on("GET", "/api/v1/resume-analysis", (req) => {
    const { data, meta } = paginate(state.resumeAnalyses, { page: req.query.get("page"), limit: req.query.get("limit"), search: null, searchFields: [] });
    return ok(data, "Success", meta);
});
on("GET", "/api/v1/resume-analysis/:id", (req) => {
    const item = state.resumeAnalyses.find((r: any) => r._id === req.params.id);
    return item ? ok(item) : notFound("Analysis not found");
});
on("DELETE", "/api/v1/resume-analysis/:id", (req) => {
    const idx = state.resumeAnalyses.findIndex((r: any) => r._id === req.params.id);
    if (idx === -1) return notFound("Analysis not found");
    state.resumeAnalyses.splice(idx, 1);
    return ok(null, "Analysis deleted");
});

// ---------------------------------------------------------------------------
// Saved jobs
// ---------------------------------------------------------------------------
on("POST", "/api/v1/saved-jobs", (req) => {
    const jobPostingId = req.body && req.body.jobPostingId;
    const posting = state.jobPostings.find((j: any) => j._id === jobPostingId);
    const saved = {
        _id: genId("saved"),
        userId: "user-1",
        jobPostingId: posting || jobPostingId,
        savedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    state.savedJobs.push(saved);
    return ok(saved, "Job saved");
});
on("GET", "/api/v1/saved-jobs", (req) => {
    const { data, meta } = paginate(state.savedJobs, { page: req.query.get("page"), limit: req.query.get("limit"), search: null, searchFields: [] });
    return ok(data, "Success", meta);
});
on("DELETE", "/api/v1/saved-jobs/:jobPostingId", (req) => {
    const idx = state.savedJobs.findIndex((s: any) => {
        const id = s.jobPostingId && s.jobPostingId._id ? s.jobPostingId._id : s.jobPostingId;
        return id === req.params.jobPostingId;
    });
    if (idx === -1) return notFound("Saved job not found");
    state.savedJobs.splice(idx, 1);
    return ok(null, "Job unsaved");
});

// ---------------------------------------------------------------------------
// Test control surface -- specs call this between tests via Playwright's
// `request` fixture (plain HTTP, so it works across the worker/runner
// process boundary that a shared in-memory reference could not cross).
// ---------------------------------------------------------------------------
on("POST", "/__mock__/reset", () => {
    resetState();
    return ok(null, "Reset");
});

export function createMockServer() {
    return http.createServer((req, res) => {
        const url = new URL(req.url || "/", "http://localhost");
        const pathSegments = url.pathname.split("/").filter(Boolean);
        const method = (req.method || "GET").toUpperCase();

        const chunks: Buffer[] = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => {
            const raw = Buffer.concat(chunks).toString("utf8");
            const contentType = req.headers["content-type"] || "";
            let body: any = {};
            if (raw && contentType.includes("application/json")) {
                try {
                    body = JSON.parse(raw);
                } catch {
                    body = {};
                }
            } else if (raw && contentType.includes("multipart/form-data")) {
                body = parseMultipart(raw, contentType);
            }

            const matched = matchRoute(method, pathSegments);
            if (!matched) {
                res.writeHead(404, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: false, status: 404, message: `No mock for ${method} ${url.pathname}` }));
                return;
            }

            const result = matched.route.handler({ method, params: matched.params, query: url.searchParams, body });
            res.writeHead(result.status, { "Content-Type": "application/json" });
            res.end(JSON.stringify(result.body));
        });
    });
}

export { resetState };
