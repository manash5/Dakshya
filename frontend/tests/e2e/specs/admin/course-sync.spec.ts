import { test, expect } from "@playwright/test";
import { resetMockServer } from "../../helpers/mock";
import { loginViaCookies } from "../../helpers/auth";

// Covers UniversityCoursesSection.tsx -- the nested course/subject browser
// embedded in a university's edit page (distinct from admin/course's own
// CRUD table, already covered by crud-resources.spec.ts).
test.describe("Admin: university course browser", () => {
    test.beforeEach(async ({ request, context }) => {
        await resetMockServer(request);
        await loginViaCookies(context, { role: "admin" });
    });

    test("expands to show courses and subjects linked to a university", async ({ page }) => {
        await page.goto("/admin/university/univ-1/edit");

        await page.getByRole("button", { name: "View Courses" }).click();
        await expect(page.getByText("BSc (Hons) Computer Science")).toBeVisible();

        await page.getByText("BSc (Hons) Computer Science").click();
        await expect(page.getByText("Introduction to Programming")).toBeVisible();
    });
});
