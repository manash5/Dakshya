import request from "supertest";

jest.mock("../../src/clients/fastapi.client");

import app from "../../src/app";
import { createTestUser, authHeader } from "../helpers/auth";
import { createOnboardedUser } from "../helpers/onboarding";

describe("Dashboard routes", () => {
  describe("GET /api/v1/dashboard/career", () => {
    it("returns 404 before onboarding (no progress document yet)", async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .get("/api/v1/dashboard/career")
        .set(authHeader(token));

      expect(res.status).toBe(404);
    });

    it("returns hero data for an onboarded user's target roles", async () => {
      const { token } = await createOnboardedUser();

      const res = await request(app)
        .get("/api/v1/dashboard/career")
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.hero.length).toBe(1);
    });
  });
});

describe("Admin career knowledge routes", () => {
  describe("POST /api/v1/admin/careerKnowledge/:jobRoleId", () => {
    it("generates career knowledge for a job role", async () => {
      const { token: adminToken } = await createTestUser({ role: "admin" });
      const { jobRole } = await createOnboardedUser();

      const res = await request(app)
        .post(`/api/v1/admin/careerKnowledge/${jobRole._id}`)
        .set(authHeader(adminToken));

      expect(res.status).toBe(201);
      expect(res.body.data.careerDescription).toBe("Mock career description.");
    });

    it("rejects generating twice for the same role", async () => {
      const { token: adminToken } = await createTestUser({ role: "admin" });
      const { jobRole } = await createOnboardedUser();

      await request(app)
        .post(`/api/v1/admin/careerKnowledge/${jobRole._id}`)
        .set(authHeader(adminToken));

      const res = await request(app)
        .post(`/api/v1/admin/careerKnowledge/${jobRole._id}`)
        .set(authHeader(adminToken));

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/v1/admin/careerKnowledge/:jobRoleId", () => {
    it("returns 404 when no career knowledge exists", async () => {
      const { token: adminToken } = await createTestUser({ role: "admin" });
      const { jobRole } = await createOnboardedUser();

      const res = await request(app)
        .get(`/api/v1/admin/careerKnowledge/${jobRole._id}`)
        .set(authHeader(adminToken));

      expect(res.status).toBe(404);
    });

    it("returns career knowledge once generated", async () => {
      const { token: adminToken } = await createTestUser({ role: "admin" });
      const { jobRole } = await createOnboardedUser();

      await request(app)
        .post(`/api/v1/admin/careerKnowledge/${jobRole._id}`)
        .set(authHeader(adminToken));

      const res = await request(app)
        .get(`/api/v1/admin/careerKnowledge/${jobRole._id}`)
        .set(authHeader(adminToken));

      expect(res.status).toBe(200);
    });
  });

  describe("PUT /api/v1/admin/careerKnowledge/:jobRoleId", () => {
    it("regenerates existing career knowledge", async () => {
      const { token: adminToken } = await createTestUser({ role: "admin" });
      const { jobRole } = await createOnboardedUser();

      await request(app)
        .post(`/api/v1/admin/careerKnowledge/${jobRole._id}`)
        .set(authHeader(adminToken));

      const res = await request(app)
        .put(`/api/v1/admin/careerKnowledge/${jobRole._id}`)
        .set(authHeader(adminToken));

      expect(res.status).toBe(200);
    });
  });

  describe("DELETE /api/v1/admin/careerKnowledge/:jobRoleId", () => {
    it("deletes career knowledge", async () => {
      const { token: adminToken } = await createTestUser({ role: "admin" });
      const { jobRole } = await createOnboardedUser();

      await request(app)
        .post(`/api/v1/admin/careerKnowledge/${jobRole._id}`)
        .set(authHeader(adminToken));

      const res = await request(app)
        .delete(`/api/v1/admin/careerKnowledge/${jobRole._id}`)
        .set(authHeader(adminToken));

      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/v1/admin/careerKnowledge", () => {
    it("lists career knowledge paginated", async () => {
      const { token: adminToken } = await createTestUser({ role: "admin" });

      const res = await request(app)
        .get("/api/v1/admin/careerKnowledge?page=1&limit=10")
        .set(authHeader(adminToken));

      expect(res.status).toBe(200);
    });
  });
});
