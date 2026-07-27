import { test, expect } from "@playwright/test";
import { resetMockServer } from "../../helpers/mock";
import { loginViaCookies } from "../../helpers/auth";

test.describe("Admin: Users", () => {
    test.beforeEach(async ({ request, context }) => {
        await resetMockServer(request);
        await loginViaCookies(context, { role: "admin" });
    });

    test("lists seeded users", async ({ page }) => {
        await page.goto("/admin/users");
        await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
        await expect(page.getByText("student@example.com")).toBeVisible();
        await expect(page.getByText("admin@example.com")).toBeVisible();
    });

    test("creates a new admin user", async ({ page }) => {
        await page.goto("/admin/users");
        await page.getByRole("link", { name: "New User" }).click();

        await page.locator('input[name="email"]').fill("new.admin@example.com");
        await page.locator('input[name="firstName"]').fill("New");
        await page.locator('input[name="lastName"]').fill("Admin");
        await page.locator('input[name="username"]').fill("newadmin");
        await page.locator('select[name="role"]').selectOption("admin");
        await page.locator('input[name="password"]').fill("Passw0rd!1");
        await page.getByRole("button", { name: "Create User" }).click();

        await page.waitForURL(/\/admin\/users$/);
        await expect(page.getByText("new.admin@example.com")).toBeVisible();
    });

    test("deletes a user via the confirmation modal", async ({ page }) => {
        await page.goto("/admin/users");
        await page.getByRole("button", { name: "Delete" }).first().click();
        const dialog = page.getByRole("dialog");
        await expect(dialog).toBeVisible();
        await dialog.getByRole("button", { name: "Delete" }).click();
        await expect(page.getByText("User deleted")).toBeVisible();
    });
});
