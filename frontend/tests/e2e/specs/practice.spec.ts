import { test, expect } from "@playwright/test";
import { resetMockServer } from "../helpers/mock";
import { loginViaCookies } from "../helpers/auth";

test.describe("Practice hub", () => {
    test.beforeEach(async ({ request, context }) => {
        await resetMockServer(request);
        await loginViaCookies(context);
    });

    test("renders the practice hero, skill mastery section and attempt history", async ({ page }) => {
        await page.goto("/dashboard/practice");
        await expect(page.getByRole("heading", { name: "Practice", exact: true })).toBeVisible();
        await expect(page.getByText("Skill Practice")).toBeVisible();
        // Seeded practice.fixtures.js history entry.
        await expect(page.getByText(/Solid understanding of core concepts|78/).first()).toBeVisible();
    });
});
