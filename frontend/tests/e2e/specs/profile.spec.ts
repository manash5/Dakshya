import { test, expect } from "@playwright/test";
import { resetMockServer } from "../helpers/mock";
import { loginViaCookies } from "../helpers/auth";

test.describe("Profile", () => {
    test.beforeEach(async ({ request, context }) => {
        await resetMockServer(request);
        await loginViaCookies(context);
    });

    test("shows the current profile fields", async ({ page }) => {
        await page.goto("/dashboard/profile");
        await expect(page.locator('input[name="firstName"]')).toHaveValue("Test");
        await expect(page.locator('input[name="email"]')).toHaveValue("student@example.com");
    });

    test("updates the profile", async ({ page }) => {
        await page.goto("/dashboard/profile");
        await page.locator('input[name="phoneNumber"]').fill("9811111111");
        await page.getByRole("button", { name: "Save Changes" }).click();
        await expect(page.getByText("Profile updated successfully")).toBeVisible();
    });

    test("changes the password", async ({ page }) => {
        await page.goto("/dashboard/profile");
        await page.getByRole("button", { name: "Change Password" }).click();
        await page.getByPlaceholder("Current Password").fill("Passw0rd!1");
        await page.getByPlaceholder("New Password").fill("NewPassw0rd!2");
        await page.getByRole("button", { name: "Update" }).click();
        await expect(page.getByText("Password updated!")).toBeVisible();
    });
});
