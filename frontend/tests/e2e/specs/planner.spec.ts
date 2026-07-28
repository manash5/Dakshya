import { test, expect } from "@playwright/test";
import { resetMockServer } from "../helpers/mock";
import { loginViaCookies } from "../helpers/auth";

test.describe("Skill Planner", () => {
    test.beforeEach(async ({ request, context }) => {
        await resetMockServer(request);
        await loginViaCookies(context);
    });

    test("shows the skill graph for the selected role", async ({ page }) => {
        await page.goto("/dashboard/planner?role=role-frontend");
        await expect(page.getByText("Skill Graph")).toBeVisible();
        // Skill names also appear as smaller tags elsewhere on the page, so
        // scope to the skill row itself (role="button", accessible name
        // includes the skill + its status) to avoid ambiguous matches.
        await expect(page.getByRole("button", { name: /TypeScript/ }).first()).toBeVisible();
        await expect(page.getByRole("button", { name: /GraphQL/ }).first()).toBeVisible();
    });

    test("opens the skill detail drawer when a skill row is clicked", async ({ page }) => {
        await page.goto("/dashboard/planner?role=role-frontend");
        await page.getByRole("button", { name: /TypeScript/ }).first().click();
        const dialog = page.getByRole("dialog");
        await expect(dialog).toBeVisible();
    });

    test("opens the add-skill-evidence modal for a locked skill", async ({ page }) => {
        await page.goto("/dashboard/planner?role=role-frontend");
        // Only the first DEFAULT_VISIBLE_COUNT (3) skills show initially --
        // "System Design" (the seeded Locked skill) needs "View All" first.
        await page.getByRole("button", { name: /View All/ }).click();
        await page.getByRole("button", { name: "Add Skill", exact: true }).click();
        const dialog = page.getByRole("dialog");
        await expect(dialog.getByText("Add Skill")).toBeVisible();
    });

    test("Practice link routes toward the interview flow for a skill", async ({ page }) => {
        await page.goto("/dashboard/planner?role=role-frontend");
        // Scoped by href rather than accessible name -- the sidebar also has
        // a nav link named "Practice" that points at /dashboard/practice.
        const practiceLink = page.locator('a[href*="/dashboard/practice/interview"]').first();
        await expect(practiceLink).toBeVisible();
    });
});
