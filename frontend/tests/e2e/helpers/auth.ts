import { Page, BrowserContext } from "@playwright/test";
import { AUTH_TOKEN, AUTH_USER, VALID_EMAIL, VALID_PASSWORD } from "../fixtures/auth.fixtures";

/**
 * Injects the same `auth_token` / `user_data` cookies the real login flow
 * sets (see frontend/lib/cookies.ts) so dashboard/admin specs can start
 * already-authenticated. The real route guard is `proxy.ts` at the frontend
 * root (Next 16's successor to `middleware.ts`) -- it redirects non-admin
 * users hitting `/admin/*` to `/unauthorized`, so admin specs pass
 * `{ role: "admin" }` here.
 *
 * Next's cookie store URI-encodes values on write and decodes on read, so
 * we replicate that here rather than setting raw JSON.
 */
export async function loginViaCookies(context: BrowserContext, overrides?: Partial<typeof AUTH_USER>) {
    const user = { ...AUTH_USER, ...overrides };
    await context.addCookies([
        {
            name: "auth_token",
            value: encodeURIComponent(AUTH_TOKEN),
            domain: "localhost",
            path: "/",
        },
        {
            name: "user_data",
            value: encodeURIComponent(JSON.stringify(user)),
            domain: "localhost",
            path: "/",
        },
    ]);
}

/** Drives the real login form -- used only by auth.spec.ts, which is the
 * one suite that must actually exercise the UI login path end to end.
 *
 * LoginForm.tsx's <label> elements aren't wired to their inputs (no
 * htmlFor/id, not nested), so getByLabel() can't find them -- placeholder
 * text is the stable selector here instead. */
export async function loginViaUI(page: Page, email: string, password: string) {
    await page.goto("/login");
    await page.getByPlaceholder("name@company.com").fill(email);
    await page.getByPlaceholder("Enter your password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
}

export { VALID_EMAIL, VALID_PASSWORD };
