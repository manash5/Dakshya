import { defineConfig, devices } from "@playwright/test";
import { MOCK_SERVER_PORT } from "./tests/e2e/port";

/**
 * Every dashboard/admin page fetches data through Next.js Server Actions that
 * run inside the Next.js server process itself (never in the browser), so
 * page.route() network mocking can't reach them -- see the "Testing Strategy"
 * section in the root README.
 * Instead this config boots a real mock backend (tests/e2e/mock-server) and
 * points the Next server's NEXT_PUBLIC_API_URL at it.
 */
export default defineConfig({
    testDir: "./tests/e2e/specs",
    // The mock server keeps per-run state in module scope; a single worker
    // keeps every spec talking to the same in-memory "database" without
    // needing cross-process synchronization for a coursework-scale suite.
    workers: 1,
    fullyParallel: false,
    // One retry even outside CI: this dev machine occasionally sees the Next
    // Turbopack dev server drop a request (ECONNRESET) mid-run under
    // sustained sequential navigation load -- a retry absorbs that without
    // masking a genuine assertion failure (which won't pass on retry either).
    retries: 1,
    timeout: 45_000,
    reporter: [["html", { open: "never" }], ["list"]],
    use: {
        baseURL: "http://localhost:3000",
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
    },
    webServer: [
        {
            command: "node tests/e2e/mock-server/start.mts",
            port: MOCK_SERVER_PORT,
            reuseExistingServer: !process.env.CI,
            timeout: 15_000,
        },
        {
            // A production build+start, not `next dev`: Turbopack's dev mode
            // compiles each route on first visit, and under this suite's
            // rapid sequential navigation across ~30 distinct admin/dashboard
            // routes, that on-demand compilation occasionally serializes
            // and stalls a request well past any reasonable test timeout
            // (observed hangs up to 90s on an otherwise-simple page). A full
            // build up front costs time once; it buys deterministic runs.
            command: "npm run build && npm run start",
            port: 3000,
            env: {
                NEXT_PUBLIC_API_URL: `http://localhost:${MOCK_SERVER_PORT}`,
                NEXT_PUBLIC_AI_SERVICE_URL: `http://localhost:${MOCK_SERVER_PORT}`,
            },
            reuseExistingServer: !process.env.CI,
            timeout: 300_000,
        },
    ],
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
});
