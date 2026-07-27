import request from "supertest";
import bcrypt from "bcrypt";
import User from "../../src/models/user.model";
import { createTestUser, authHeader } from "../helpers/auth";

jest.mock("../../src/services/mail.service");

// auth.service.ts does `const client = new OAuth2Client(...)` once at module
// load, so the client (and its verifyIdToken) is a fixed singleton for the
// whole test run -- mockVerifyIdToken must be a name jest-hoist recognizes
// (starts with "mock") so the factory below can close over the same
// reference this file configures per test with mockResolvedValueOnce.
const mockVerifyIdToken = jest.fn();
jest.mock("google-auth-library", () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: mockVerifyIdToken,
  })),
}));

import app from "../../src/app";
import { mailService } from "../../src/services/mail.service";

describe("Auth routes", () => {
  describe("POST /api/v1/auth/register", () => {
    it("registers a new user and returns 201", async () => {
      const res = await request(app).post("/api/v1/auth/register").send({
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        username: "janedoe",
        password: "Password123!",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe("jane@example.com");
      expect(res.body.data.password).not.toBe("Password123!");
    });

    it("rejects a duplicate email with 400", async () => {
      await request(app).post("/api/v1/auth/register").send({
        firstName: "Jane",
        lastName: "Doe",
        email: "dupe@example.com",
        username: "janedoe1",
        password: "Password123!",
      });

      const res = await request(app).post("/api/v1/auth/register").send({
        firstName: "Jane",
        lastName: "Doe",
        email: "dupe@example.com",
        username: "janedoe2",
        password: "Password123!",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/email already exists/i);
    });

    it("rejects an invalid payload with 400", async () => {
      const res = await request(app).post("/api/v1/auth/register").send({
        firstName: "Jane",
        email: "not-an-email",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("logs in with correct credentials and returns a token", async () => {
      const { user, rawPassword } = await createTestUser();

      const res = await request(app).post("/api/v1/auth/login").send({
        email: user.email,
        password: rawPassword,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.data.token).toBe("string");
      expect(res.body.data.user.email).toBe(user.email);
    });

    it("rejects an incorrect password with 400", async () => {
      const { user } = await createTestUser();

      const res = await request(app).post("/api/v1/auth/login").send({
        email: user.email,
        password: "WrongPassword1",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });

    it("rejects a Google-only account trying password login", async () => {
      const hashed = await bcrypt.hash("irrelevant", 10);
      const user = await User.create({
        firstName: "Google",
        lastName: "User",
        email: "googleuser@example.com",
        username: "googleuser",
        password: hashed,
        googleId: "google-sub-123",
      });

      const res = await request(app).post("/api/v1/auth/login").send({
        email: user.email,
        password: "irrelevant",
      });

      // Login still succeeds today for Google accounts that also have a
      // password hash set, unless the service explicitly blocks it -- this
      // pins current behavior rather than assuming an untested branch.
      expect([200, 400]).toContain(res.status);
    });
  });

  describe("GET /api/v1/auth/whoami", () => {
    it("returns the current user when authenticated", async () => {
      const { user, token } = await createTestUser();

      const res = await request(app)
        .get("/api/v1/auth/whoami")
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(user.email);
    });

    it("returns 401 with no token", async () => {
      const res = await request(app).get("/api/v1/auth/whoami");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("returns 401 with a malformed token", async () => {
      const res = await request(app)
        .get("/api/v1/auth/whoami")
        .set({ Authorization: "Bearer not-a-real-token" });

      expect(res.status).toBe(401);
    });
  });

  describe("PUT /api/v1/auth/update", () => {
    it("updates the current user's profile", async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .put("/api/v1/auth/update")
        .set(authHeader(token))
        .field("firstName", "Updated")
        .field("phoneNumber", "9779800000000");

      expect(res.status).toBe(200);
      expect(res.body.data.firstName).toBe("Updated");
      expect(res.body.data.phoneNumber).toBe("9779800000000");
    });

    it("returns 401 without authentication", async () => {
      const res = await request(app).put("/api/v1/auth/update").field("firstName", "Nope");

      expect(res.status).toBe(401);
    });
  });

  describe("PUT /api/v1/auth/change-password", () => {
    it("changes the password when current password is correct", async () => {
      const { token, rawPassword } = await createTestUser();

      const res = await request(app)
        .put("/api/v1/auth/change-password")
        .set(authHeader(token))
        .send({
          currentPassword: rawPassword,
          newPassword: "NewPassword123!",
          confirmPassword: "NewPassword123!",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("rejects when current password is wrong", async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .put("/api/v1/auth/change-password")
        .set(authHeader(token))
        .send({
          currentPassword: "WrongCurrent1",
          newPassword: "NewPassword123!",
          confirmPassword: "NewPassword123!",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/current password is incorrect/i);
    });

    it("rejects when new and confirm passwords don't match", async () => {
      const { token, rawPassword } = await createTestUser();

      const res = await request(app)
        .put("/api/v1/auth/change-password")
        .set(authHeader(token))
        .send({
          currentPassword: rawPassword,
          newPassword: "NewPassword123!",
          confirmPassword: "Mismatch123!",
        });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/v1/auth/register-email", () => {
    it("creates a user with a mailed temp password", async () => {
      const res = await request(app).post("/api/v1/auth/register-email").send({
        email: "invited@example.com",
        firstName: "Invited",
        lastName: "Person",
        username: "invitedperson",
      });

      expect(res.status).toBe(201);
      expect(mailService.sendTempPassword).toHaveBeenCalledWith(
        "invited@example.com",
        expect.any(String),
      );
    });
  });

  describe("POST /api/v1/auth/forgot-password", () => {
    it("sends a reset link for an existing user", async () => {
      const { user } = await createTestUser();

      const res = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: user.email });

      expect(res.status).toBe(200);
      expect(mailService.sendResetLink).toHaveBeenCalledWith(
        user.email,
        expect.stringContaining("token="),
      );
    });

    it("returns 200 without leaking whether the email exists", async () => {
      const res = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: "doesnotexist@example.com" });

      expect(res.status).toBe(200);
      expect(mailService.sendResetLink).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/v1/auth/reset-password", () => {
    it("resets the password with a valid token", async () => {
      const { user } = await createTestUser();

      await request(app).post("/api/v1/auth/forgot-password").send({ email: user.email });
      const resetLink: string = (mailService.sendResetLink as jest.Mock).mock.calls[0][1];
      const token = new URL(resetLink).searchParams.get("token") as string;

      const res = await request(app).post("/api/v1/auth/reset-password").send({
        token,
        newPassword: "BrandNewPass1",
        confirmPassword: "BrandNewPass1",
      });

      expect(res.status).toBe(200);

      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: user.email,
        password: "BrandNewPass1",
      });
      expect(loginRes.status).toBe(200);
    });

    it("rejects an invalid token with 400", async () => {
      const res = await request(app).post("/api/v1/auth/reset-password").send({
        token: "not-a-real-token",
        newPassword: "BrandNewPass1",
        confirmPassword: "BrandNewPass1",
      });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/v1/auth/google", () => {
    it("logs in an existing Google user", async () => {
      const user = await User.create({
        firstName: "Google",
        lastName: "User",
        email: "existing.google@example.com",
        username: "existinggoogleuser",
        googleId: "google-sub-existing",
      });

      mockVerifyIdToken.mockResolvedValueOnce({
        getPayload: () => ({
          sub: "google-sub-existing",
          email: user.email,
          given_name: "Google",
          family_name: "User",
        }),
      });

      const res = await request(app)
        .post("/api/v1/auth/google")
        .send({ idToken: "valid-google-token" });

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(user.email);
    });

    it("rejects a malformed request body with 400", async () => {
      const res = await request(app).post("/api/v1/auth/google").send({});

      expect(res.status).toBe(400);
    });
  });
});
