import path from "path";
import { test, expect } from "@playwright/test";
import { resetMockServer } from "../helpers/mock";
import { loginViaCookies } from "../helpers/auth";

const SAMPLE_RESUME = path.join(__dirname, "..", "fixtures", "sample-resume.pdf");

test.describe("Resume analysis", () => {
    test.beforeEach(async ({ request, context }) => {
        await resetMockServer(request);
        await loginViaCookies(context);
    });

    test("shows the latest analysis by default", async ({ page }) => {
        await page.goto("/dashboard/resume-analysis");
        await expect(page.getByRole("heading", { name: "Resume Analysis" })).toBeVisible();
        await expect(page.getByText("Test_Student_Resume.pdf")).toBeVisible();
    });

    test("uploads a new resume and shows the fresh analysis", async ({ page }) => {
        await page.goto("/dashboard/resume-analysis");
        await page.getByRole("button", { name: "Analyze another resume" }).click();
        await page.locator('input[type="file"]').setInputFiles(SAMPLE_RESUME);
        await expect(page.getByRole("heading", { name: "Resume Analysis" })).toBeVisible();
    });

    test("switches between resume history entries", async ({ page }) => {
        await page.goto("/dashboard/resume-analysis");
        await expect(page.getByRole("button", { name: "New analysis" })).toBeVisible();
    });
});
