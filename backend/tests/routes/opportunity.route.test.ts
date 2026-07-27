import request from "supertest";

jest.mock("../../src/clients/fastapi.client");

import app from "../../src/app";
import { createTestUser, authHeader } from "../helpers/auth";
import Opportunity from "../../src/models/opportunity.model";

async function createOpportunity(overrides: Partial<Record<string, unknown>> = {}) {
  return Opportunity.create({
    title: "Test Hackathon",
    organizer: "Test Org",
    location: "Kathmandu",
    description: "A test hackathon",
    registrationLink: `https://example.com/register/${Date.now()}-${Math.random()}`,
    source: "test",
    ...overrides,
  });
}

describe("Opportunity routes", () => {
  describe("GET /api/v1/opportunities", () => {
    it("lists opportunities", async () => {
      const { token } = await createTestUser();
      await createOpportunity();

      const res = await request(app).get("/api/v1/opportunities").set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/v1/opportunities/:id", () => {
    it("returns a single opportunity", async () => {
      const { token } = await createTestUser();
      const opportunity = await createOpportunity();

      const res = await request(app)
        .get(`/api/v1/opportunities/${opportunity._id}`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(opportunity._id.toString());
    });

    it("returns 404 for a non-existent opportunity", async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .get("/api/v1/opportunities/000000000000000000000000")
        .set(authHeader(token));

      expect(res.status).toBe(404);
    });
  });

  describe("Admin opportunity CRUD", () => {
    it("creates an opportunity", async () => {
      const { token } = await createTestUser({ role: "admin" });

      const res = await request(app)
        .post("/api/v1/admin/opportunities")
        .set(authHeader(token))
        .send({
          title: "New Hackathon",
          organizer: "Org",
          description: "A hackathon",
          registrationLink: "https://example.com/register/new",
          source: "manual",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe("New Hackathon");
    });

    it("rejects a duplicate registration link", async () => {
      const { token } = await createTestUser({ role: "admin" });
      const existing = await createOpportunity();

      const res = await request(app)
        .post("/api/v1/admin/opportunities")
        .set(authHeader(token))
        .send({
          title: "Duplicate",
          registrationLink: existing.registrationLink,
          source: "manual",
        });

      expect(res.status).toBe(400);
    });

    it("scrapes opportunities", async () => {
      const { token } = await createTestUser({ role: "admin" });

      const res = await request(app)
        .post("/api/v1/admin/opportunities/scrape")
        .set(authHeader(token));

      expect(res.status).toBe(200);
    });

    it("updates and deletes an opportunity", async () => {
      const { token } = await createTestUser({ role: "admin" });
      const opportunity = await createOpportunity();

      const updateRes = await request(app)
        .put(`/api/v1/admin/opportunities/${opportunity._id}`)
        .set(authHeader(token))
        .send({ title: "Updated Title" });
      expect(updateRes.status).toBe(200);

      const deleteRes = await request(app)
        .delete(`/api/v1/admin/opportunities/${opportunity._id}`)
        .set(authHeader(token));
      expect(deleteRes.status).toBe(200);
    });
  });
});
