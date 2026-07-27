// Canonical credentials the auth.spec.ts suite drives through the real UI.
// The mock server's /auth/login handler checks against these directly rather
// than a full user table, since auth is the one flow tested end-to-end
// through real forms rather than via cookie injection.

export const VALID_EMAIL = "student@example.com";
export const VALID_PASSWORD = "Passw0rd!1";

export const AUTH_USER: any = {
    _id: "user-1",
    firstName: "Test",
    lastName: "Student",
    email: VALID_EMAIL,
    username: "teststudent",
    role: "user",
    mustChangePassword: false,
    // UserContext.tsx shows a blocking onboarding overlay on every /dashboard
    // page for role "user" unless this is true -- it would otherwise
    // intercept every click in the suite.
    onboardingCompleted: true,
};

export const AUTH_TOKEN = "mock-jwt-token-e2e";

// GET /auth/getProfile + PUT /auth/update operate on this richer shape
// (frontend/app/dashboard/profile/_components/profile-types.ts).
export const PROFILE_SEED: any = {
    firstName: "Test",
    lastName: "Student",
    email: VALID_EMAIL,
    username: "teststudent",
    phoneNumber: "9800000000",
    profilePicture: null,
    role: "student",
    updatedAt: "2026-07-01T00:00:00.000Z",
    targetRoles: ["role-frontend", "role-backend"],
    currentSemester: 5,
};
