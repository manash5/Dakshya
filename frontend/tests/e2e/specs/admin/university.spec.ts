import { test, expect } from "@playwright/test";
import { resetMockServer } from "../../helpers/mock";
import { loginViaCookies } from "../../helpers/auth";

test.describe("Admin: University CRUD", () => {
    test.beforeEach(async ({ request, context }) => {
        await resetMockServer(request);
        await loginViaCookies(context, { role: "admin" });
    });

    test("lists universities and supports search", async ({ page }) => {
        await page.goto("/admin/university");
        await expect(page.getByRole("heading", { name: "Universities" })).toBeVisible();
        await expect(page.getByText("Softwarica College of IT & E-Commerce")).toBeVisible();
        await expect(page.getByText("Islington College")).toBeVisible();

        await page.locator('input[name="search"]').fill("Islington");
        await page.getByRole("button", { name: "Search" }).click();
        await expect(page).toHaveURL(/search=Islington/);
        await expect(page.getByText("Islington College")).toBeVisible();
        await expect(page.getByText("Softwarica College of IT & E-Commerce")).not.toBeVisible();
    });

    test("creates a new university end to end (including the course-sync step)", async ({ page }) => {
        await page.goto("/admin/university/create");
        await page.locator('input[name="name"]').fill("Test University");
        await page.locator('input[name="shortName"]').fill("TU");
        await page.locator('input[name="country"]').fill("Nepal");
        await page.locator('input[name="website"]').fill("https://test-university.example.com");
        await page.getByRole("button", { name: "Create University" }).click();

        await expect(page.getByText("University created successfully").first()).toBeVisible({ timeout: 15_000 });
        await page.getByRole("button", { name: "Done" }).click();
        await expect(page).toHaveURL(/\/admin\/university$/);
        await expect(page.getByText("Test University")).toBeVisible();
    });

    test("edits an existing university", async ({ page }) => {
        await page.goto("/admin/university");
        await page.getByRole("link", { name: "Edit" }).first().click();
        await expect(page).toHaveURL(/\/admin\/university\/univ-1\/edit/);

        await page.locator('input[name="name"]').fill("Softwarica College (Updated)");
        await page.getByRole("button", { name: "Update University" }).click();

        await page.waitForURL(/\/admin\/university$/);
        await expect(page.getByText("Softwarica College (Updated)")).toBeVisible();
    });

    test("deletes a university via the confirmation modal", async ({ page }) => {
        await page.goto("/admin/university");
        await page.getByRole("button", { name: "Delete" }).first().click();

        const dialog = page.getByRole("dialog");
        await expect(dialog).toBeVisible();
        await dialog.getByRole("button", { name: "Delete" }).click();

        await expect(page.getByText("University deleted")).toBeVisible();
    });
});
