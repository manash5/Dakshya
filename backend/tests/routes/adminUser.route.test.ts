import request from "supertest";
import app from "../../src/app";
import { createTestUser, authHeader } from "../helpers/auth";

describe("Admin user routes", () => {
  describe("Authorization", () => {
    it("rejects a non-admin user with 403", async () => {
      const { token } = await createTestUser({ role: "user" });

      const res = await request(app).get("/api/v1/admin/users").set(authHeader(token));

      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/v1/admin/users", () => {
    it("creates a user with a phone number", async () => {
      const { token } = await createTestUser({ role: "admin" });

      const res = await request(app)
        .post("/api/v1/admin/users")
        .set(authHeader(token))
        .field("firstName", "New")
        .field("lastName", "Admin")
        .field("email", "newadmin@example.com")
        .field("username", "newadminuser")
        .field("password", "Password123!")
        .field("role", "user")
        .field("phoneNumber", "9779800000000");

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe("newadmin@example.com");
      expect(res.body.data.phoneNumber).toBe("9779800000000");
    });

    it("rejects creation without a password", async () => {
      const { token } = await createTestUser({ role: "admin" });

      const res = await request(app)
        .post("/api/v1/admin/users")
        .set(authHeader(token))
        .field("firstName", "New")
        .field("lastName", "Admin")
        .field("email", "nopassword@example.com")
        .field("username", "nopassworduser")
        .field("role", "user");

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/v1/admin/users", () => {
    it("lists users paginated", async () => {
      const { token } = await createTestUser({ role: "admin" });
      await createTestUser();
      await createTestUser();

      const res = await request(app)
        .get("/api/v1/admin/users?page=1&limit=10")
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("GET /api/v1/admin/users/:id", () => {
    it("returns a single user", async () => {
      const { token } = await createTestUser({ role: "admin" });
      const { user: target } = await createTestUser();

      const res = await request(app)
        .get(`/api/v1/admin/users/${target._id}`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(target._id.toString());
    });

    it("returns 404 for a non-existent user", async () => {
      const { token } = await createTestUser({ role: "admin" });

      const res = await request(app)
        .get("/api/v1/admin/users/000000000000000000000000")
        .set(authHeader(token));

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/v1/admin/users/:id", () => {
    it("updates a user's phone number", async () => {
      const { token } = await createTestUser({ role: "admin" });
      const { user: target } = await createTestUser();

      const res = await request(app)
        .put(`/api/v1/admin/users/${target._id}`)
        .set(authHeader(token))
        .field("phoneNumber", "9779811111111");

      expect(res.status).toBe(200);
      expect(res.body.data.phoneNumber).toBe("9779811111111");
    });
  });

  describe("PUT /api/v1/admin/users/:id/password", () => {
    it("updates a user's password when current password is correct", async () => {
      const { token } = await createTestUser({ role: "admin" });
      const { user: target, rawPassword } = await createTestUser();

      const res = await request(app)
        .put(`/api/v1/admin/users/${target._id}/password`)
        .set(authHeader(token))
        .send({
          currentPassword: rawPassword,
          newPassword: "BrandNewPass1",
          confirmPassword: "BrandNewPass1",
        });

      expect(res.status).toBe(200);
    });

    it("rejects when current password is wrong", async () => {
      const { token } = await createTestUser({ role: "admin" });
      const { user: target } = await createTestUser();

      const res = await request(app)
        .put(`/api/v1/admin/users/${target._id}/password`)
        .set(authHeader(token))
        .send({
          currentPassword: "WrongPassword1",
          newPassword: "BrandNewPass1",
          confirmPassword: "BrandNewPass1",
        });

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /api/v1/admin/users/:id", () => {
    it("deletes a user", async () => {
      const { token } = await createTestUser({ role: "admin" });
      const { user: target } = await createTestUser();

      const res = await request(app)
        .delete(`/api/v1/admin/users/${target._id}`)
        .set(authHeader(token));

      expect(res.status).toBe(200);

      const getRes = await request(app)
        .get(`/api/v1/admin/users/${target._id}`)
        .set(authHeader(token));
      expect(getRes.status).toBe(404);
    });

    it("returns 404 for a non-existent user", async () => {
      const { token } = await createTestUser({ role: "admin" });

      const res = await request(app)
        .delete("/api/v1/admin/users/000000000000000000000000")
        .set(authHeader(token));

      expect(res.status).toBe(404);
    });
  });
});
