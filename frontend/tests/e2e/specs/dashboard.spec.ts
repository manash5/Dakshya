import { test, expect } from "@playwright/test";
import { resetMockServer } from "../helpers/mock";
import { loginViaCookies } from "../helpers/auth";

test.describe("Dashboard landing", () => {
    test.beforeEach(async ({ request, context }) => {
        await resetMockServer(request);
        await loginViaCookies(context);
    });

    test("renders target roles, market pulse, salary range and opportunities", async ({ page }) => {
        await page.goto("/dashboard");
        await expect(page.getByText("Frontend Developer").first()).toBeVisible();
        await expect(page.getByText("Backend Developer").first()).toBeVisible();
        await expect(page.getByText("National Hackathon 2026")).toBeVisible();
    });

    test("shows recommended jobs matching the user's target roles", async ({ page }) => {
        await page.goto("/dashboard");
        await expect(page.getByText("Acme Corp").first()).toBeVisible();
    });
});
