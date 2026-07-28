import { test, expect } from "@playwright/test";
import { resetMockServer } from "../helpers/mock";
import { loginViaCookies } from "../helpers/auth";

test.describe("Job Finder", () => {
    test.beforeEach(async ({ request, context }) => {
        await resetMockServer(request);
        await loginViaCookies(context);
    });

    test("lists jobs matching the user's target roles", async ({ page }) => {
        await page.goto("/dashboard/job-finder");
        await expect(page.getByText("Acme Corp")).toBeVisible();
        await expect(page.getByText("Beta Systems")).toBeVisible();
    });

    test("search narrows the listing", async ({ page }) => {
        await page.goto("/dashboard/job-finder");
        await page.getByPlaceholder("Search for company, roles or keywords...").fill("Acme");
        await page.getByRole("button", { name: "Search" }).click();
        await expect(page).toHaveURL(/search=Acme/);
        await expect(page.getByText("Acme Corp")).toBeVisible();
        await expect(page.getByText("Beta Systems")).not.toBeVisible();
    });

    test("saves and unsaves a job", async ({ page }) => {
        await page.goto("/dashboard/job-finder");
        const saveButton = page.getByRole("button", { name: "Save job" }).first();
        await saveButton.click();
        await expect(page.getByRole("button", { name: "Remove from saved jobs" }).first()).toBeVisible();
    });

    test("opens the job detail modal", async ({ page }) => {
        await page.goto("/dashboard/job-finder");
        await page.getByRole("button", { name: "VIEW DETAILS" }).first().click();
        await expect(page.getByRole("dialog")).toBeVisible();
    });

    test("CV analyzer card links to resume analysis", async ({ page }) => {
        await page.goto("/dashboard/job-finder");
        await expect(page.getByText("RE-ANALYZE RESUME")).toBeVisible();
        await page.getByText("RE-ANALYZE RESUME").click();
        await expect(page).toHaveURL(/\/dashboard\/resume-analysis/);
    });
});
