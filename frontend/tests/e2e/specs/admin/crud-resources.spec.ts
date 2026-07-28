import { test, expect } from "@playwright/test";
import { resetMockServer } from "../../helpers/mock";
import { loginViaCookies } from "../../helpers/auth";

// Table-driven happy-path CRUD coverage for the admin resources that follow
// the same Table/Form pattern as university.spec.ts's full-depth suite --
// list renders seed data, create succeeds, delete succeeds via the shared
// Modal component. university.spec.ts already covers list+search+edit in
// full depth for one resource; this spec spreads list+create+delete across
// the rest instead of repeating that depth nine times over.
const resources = [
    {
        label: "Course",
        path: "course",
        listHeading: "Courses",
        newLinkText: "New Course",
        createButtonText: "Create Course",
        seedText: "BSc (Hons) Computer Science",
        fill: async (page: import("@playwright/test").Page) => {
            await page.locator('input[name="universityId"]').fill("univ-1");
            await page.locator('input[name="name"]').fill("E2E Test Course");
            await page.locator('select[name="degree"]').selectOption("Bachelor");
            await page.locator('input[name="durationInSemesters"]').fill("6");
            await page.locator('textarea[name="description"]').fill("A course created by the Playwright E2E suite.");
        },
        createdRowText: "E2E Test Course",
    },
    {
        label: "Subject",
        path: "subject",
        listHeading: "Subjects",
        newLinkText: "New Subject",
        createButtonText: "Create Subject",
        seedText: "Introduction to Programming",
        fill: async (page: import("@playwright/test").Page) => {
            await page.locator('input[name="courseId"]').fill("course-1");
            await page.locator('input[name="semester"]').fill("2");
            await page.locator('input[name="code"]').fill("TS102");
            await page.locator('input[name="name"]').fill("E2E Test Subject");
            await page.locator('input[name="credits"]').fill("3");
        },
        createdRowText: "E2E Test Subject",
    },
    {
        label: "Job Role",
        path: "jobRole",
        listHeading: "Job Roles",
        newLinkText: "New Job Role",
        createButtonText: "Create Job Role",
        seedText: "Frontend Developer",
        fill: async (page: import("@playwright/test").Page) => {
            await page.locator('input[name="title"]').fill("E2E Test Role");
            await page.locator('input[name="category"]').fill("Testing");
        },
        createdRowText: "E2E Test Role",
    },
    {
        label: "Project",
        path: "project",
        listHeading: "Projects",
        newLinkText: "New Project",
        createButtonText: "Create Project",
        seedText: "Personal Portfolio Site",
        fill: async (page: import("@playwright/test").Page) => {
            await page.locator('input[name="title"]').fill("E2E Test Project");
            await page.locator('select[name="difficulty"]').selectOption("Beginner");
            await page.locator('input[name="estimatedHours"]').fill("5");
            await page.locator('select[name="careerRole"]').selectOption("role-frontend");
        },
        createdRowText: "E2E Test Project",
    },
    {
        label: "Opportunity",
        path: "opportunities",
        listHeading: "Opportunities",
        newLinkText: "Create New",
        createButtonText: "Create Opportunity",
        seedText: "National Hackathon 2026",
        fill: async (page: import("@playwright/test").Page) => {
            await page.locator('input[name="title"]').fill("E2E Test Opportunity");
            await page.locator('input[name="organizer"]').fill("E2E Org");
            await page.locator('input[name="category"]').fill("Workshop");
            await page.locator('input[name="location"]').fill("Online");
            await page.locator('input[name="source"]').fill("admin");
            await page.locator('input[name="registrationLink"]').fill("https://example.com/register-e2e");
        },
        createdRowText: "E2E Test Opportunity",
    },
];

// Job postings have no manual "create" (populated via scrape only, see
// project_context.md), so they're covered separately: edit + delete only.
test.describe("Admin: Job Posting edit/delete", () => {
    test.beforeEach(async ({ request, context }) => {
        await resetMockServer(request);
        await loginViaCookies(context, { role: "admin" });
    });

    test("edits a job posting", async ({ page }) => {
        await page.goto("/admin/job-postings");
        await expect(page.getByRole("heading", { name: "Job Postings" })).toBeVisible();
        await page.getByRole("link", { name: "Edit" }).first().click();

        await page.locator('input[name="title"]').fill("Senior Frontend Developer");
        await page.getByRole("button", { name: "Update Job Posting" }).click();

        await page.waitForURL(/\/admin\/job-postings$/);
        await expect(page.getByText("Senior Frontend Developer")).toBeVisible();
    });

    test("deletes a job posting via the confirmation modal", async ({ page }) => {
        await page.goto("/admin/job-postings");
        await page.getByRole("button", { name: "Delete" }).first().click();
        const dialog = page.getByRole("dialog");
        await expect(dialog).toBeVisible();
        await dialog.getByRole("button", { name: "Delete" }).click();
        await expect(page.getByText("Job posting deleted")).toBeVisible();
    });
});

// Career knowledge has no manual create/edit form at all -- it's purely
// AI-generated per job role via Generate/Regenerate, see
// CareerKnowledgeTable.tsx.
test.describe("Admin: Career Knowledge generate/regenerate/delete", () => {
    test.beforeEach(async ({ request, context }) => {
        await resetMockServer(request);
        await loginViaCookies(context, { role: "admin" });
    });

    test("generates career knowledge for a role that doesn't have any yet", async ({ page }) => {
        await page.goto("/admin/career-knowledge");
        const backendRow = page.getByRole("row", { name: /Backend Developer/ });
        await backendRow.getByRole("button", { name: "Generate" }).click();
        await expect(page.getByText("Career knowledge generated successfully")).toBeVisible();
    });

    test("regenerates and deletes existing career knowledge", async ({ page }) => {
        await page.goto("/admin/career-knowledge");
        const frontendRow = page.getByRole("row", { name: /Frontend Developer/ });
        await frontendRow.getByRole("button", { name: "Regenerate" }).click();
        await expect(page.getByText("Career knowledge regenerated successfully")).toBeVisible();

        await frontendRow.getByRole("button", { name: "Delete" }).click();
        const dialog = page.getByRole("dialog");
        await expect(dialog).toBeVisible();
        await dialog.getByRole("button", { name: "Delete" }).click();
        await expect(page.getByText("Career knowledge deleted successfully")).toBeVisible();
    });
});

for (const resource of resources) {
    test.describe(`Admin: ${resource.label} CRUD`, () => {
        test.beforeEach(async ({ request, context }) => {
            await resetMockServer(request);
            await loginViaCookies(context, { role: "admin" });
        });

        test(`lists seeded ${resource.label.toLowerCase()}s`, async ({ page }) => {
            await page.goto(`/admin/${resource.path}`);
            await expect(page.getByRole("heading", { name: resource.listHeading })).toBeVisible();
            await expect(page.getByText(resource.seedText)).toBeVisible();
        });

        test(`creates a new ${resource.label.toLowerCase()}`, async ({ page }) => {
            await page.goto(`/admin/${resource.path}`);
            await page.getByRole("link", { name: resource.newLinkText }).click();
            await resource.fill(page);
            await page.getByRole("button", { name: resource.createButtonText }).click();
            await page.waitForURL(new RegExp(`/admin/${resource.path}$`));
            await expect(page.getByText(resource.createdRowText)).toBeVisible();
        });

        test(`deletes a ${resource.label.toLowerCase()} via the confirmation modal`, async ({ page }) => {
            await page.goto(`/admin/${resource.path}`);
            await page.getByRole("button", { name: "Delete" }).first().click();
            const dialog = page.getByRole("dialog");
            await expect(dialog).toBeVisible();
            await dialog.getByRole("button", { name: "Delete" }).click();
            await expect(page.getByText(new RegExp(`${resource.label} deleted`, "i"))).toBeVisible();
        });
    });
}
