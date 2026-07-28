import { test, expect } from "@playwright/test";
import { resetMockServer } from "../helpers/mock";
import { loginViaUI, VALID_EMAIL, VALID_PASSWORD } from "../helpers/auth";

test.describe("Auth", () => {
    test.beforeEach(async ({ request }) => {
        await resetMockServer(request);
    });

    test("logs in with valid credentials and lands on the dashboard", async ({ page }) => {
        await loginViaUI(page, VALID_EMAIL, VALID_PASSWORD);
        await expect(page).toHaveURL(/\/dashboard/);
    });

    // NOTE: LoginForm.tsx's onSubmit only handles the `result.success` branch
    // -- there's no `else { setError(...) }`, so a failed login currently
    // shows no feedback at all (discovered by writing this test; flagged to
    // the user rather than patched, since fixing it wasn't in scope here).
    // This asserts the actual current behavior: no navigation, form still
    // usable -- not the ideal (missing) error message.
    test("does not navigate away on invalid credentials", async ({ page }) => {
        await loginViaUI(page, VALID_EMAIL, "WrongPassw0rd!");
        await expect(page).toHaveURL(/\/login/);
        await expect(page.getByPlaceholder("name@company.com")).toBeVisible();
    });

    test("signup rejects mismatched passwords client-side", async ({ page }) => {
        await page.goto("/signup");
        await page.getByPlaceholder("Enter your first name").fill("New");
        await page.getByPlaceholder("Enter your last name").fill("Student");
        await page.getByPlaceholder("Choose a username").fill("newstudent");
        await page.getByPlaceholder("name@company.com").fill("new.student@example.com");
        await page.getByPlaceholder("Create a password").fill("Passw0rd!1");
        await page.getByPlaceholder("Re-enter your password").fill("Different0rd!1");
        await page.getByRole("button", { name: "Create account" }).click();
        await expect(page.getByText(/passwords do not match/i)).toBeVisible();
    });

    test("signup succeeds and redirects to login", async ({ page }) => {
        await page.goto("/signup");
        await page.getByPlaceholder("Enter your first name").fill("New");
        await page.getByPlaceholder("Enter your last name").fill("Student");
        await page.getByPlaceholder("Choose a username").fill("newstudent");
        await page.getByPlaceholder("name@company.com").fill("new.student@example.com");
        await page.getByPlaceholder("Create a password").fill("Passw0rd!1");
        await page.getByPlaceholder("Re-enter your password").fill("Passw0rd!1");
        await page.getByRole("button", { name: "Create account" }).click();
        await expect(page).toHaveURL(/\/login/);
    });

    test("forgot password shows confirmation after submit", async ({ page }) => {
        await page.goto("/forgot-password");
        await page.getByPlaceholder("name@company.com").fill(VALID_EMAIL);
        await page.getByRole("button", { name: "Send reset link" }).click();
        await expect(page.getByText(/reset link has been sent/i)).toBeVisible();
    });

    test("reset password with matching passwords redirects to login", async ({ page }) => {
        await page.goto("/reset-password?token=mock-reset-token");
        await page.getByPlaceholder("Enter a new password").fill("NewPassw0rd!1");
        await page.getByPlaceholder("Re-enter your new password").fill("NewPassw0rd!1");
        await page.getByRole("button", { name: "Reset password" }).click();
        await expect(page).toHaveURL(/\/login/);
    });
});
