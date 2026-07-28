import { test, expect } from "@playwright/test";
import { resetMockServer } from "../helpers/mock";
import { loginViaCookies } from "../helpers/auth";

test.describe("Interview flow", () => {
    test.beforeEach(async ({ request, context }) => {
        await resetMockServer(request);
        await loginViaCookies(context);
    });

    test("runs a full oral interview from setup to results", async ({ page }) => {
        await page.goto("/dashboard/practice/interview?jobRoleId=role-frontend");
        await expect(page.getByRole("heading", { name: "Start a Mock Interview" })).toBeVisible();

        await page.getByRole("button", { name: "Oral" }).click();
        await page.locator('input[type="number"]').fill("2");
        await page.getByRole("button", { name: "Start Interview" }).click();

        await expect(page.getByText(/Question 1 of 2/)).toBeVisible();
        await page.getByPlaceholder(/Type or record your answer/).fill("The virtual DOM is an in-memory representation of the UI.");
        await page.getByRole("button", { name: "Next", exact: true }).click();

        await expect(page.getByText(/Question 2 of 2/)).toBeVisible();
        await page.getByPlaceholder(/Type or record your answer/).fill("let and const are block scoped, var is function scoped.");
        await page.getByRole("button", { name: "Finish Interview" }).click();

        await expect(page.getByRole("heading", { name: "Interview Results" })).toBeVisible();
    });
});
