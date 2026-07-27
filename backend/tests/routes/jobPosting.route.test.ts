import request from "supertest";

jest.mock("../../src/clients/fastapi.client");

import app from "../../src/app";
import { createTestUser, authHeader } from "../helpers/auth";
import { createJobPosting } from "../helpers/fixtures";

describe("Job posting routes", () => {
  describe("GET /api/v1/job-postings", () => {
    it("lists job postings", async () => {
      const { token } = await createTestUser();
      await createJobPosting();

      const res = await request(app).get("/api/v1/job-postings").set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("filters by location", async () => {
      const { token } = await createTestUser();
      await createJobPosting({ location: "Kathmandu" });
      await createJobPosting({ location: "Pokhara" });

      const res = await request(app)
        .get("/api/v1/job-postings?location=Kathmandu")
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.every((j: any) => j.location === "Kathmandu")).toBe(true);
    });
  });

  describe("GET /api/v1/job-postings/:id", () => {
    it("returns a single job posting", async () => {
      const { token } = await createTestUser();
      const posting = await createJobPosting();

      const res = await request(app)
        .get(`/api/v1/job-postings/${posting._id}`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(posting._id.toString());
    });

    it("returns 404 for a non-existent posting", async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .get("/api/v1/job-postings/000000000000000000000000")
        .set(authHeader(token));

      expect(res.status).toBe(404);
    });
  });

  describe("Admin job posting management", () => {
    it("scrapes and stores job postings", async () => {
      const { token } = await createTestUser({ role: "admin" });

      const res = await request(app)
        .post("/api/v1/admin/job-postings/scrape")
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("totalScraped");
    });

    it("rejects scraping from a non-admin user", async () => {
      const { token } = await createTestUser({ role: "user" });

      const res = await request(app)
        .post("/api/v1/admin/job-postings/scrape")
        .set(authHeader(token));

      expect(res.status).toBe(403);
    });

    it("updates a job posting", async () => {
      const { token } = await createTestUser({ role: "admin" });
      const posting = await createJobPosting();

      const res = await request(app)
        .put(`/api/v1/admin/job-postings/${posting._id}`)
        .set(authHeader(token))
        .send({ title: "Updated Title" });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("Updated Title");
    });

    it("deletes a job posting", async () => {
      const { token } = await createTestUser({ role: "admin" });
      const posting = await createJobPosting();

      const res = await request(app)
        .delete(`/api/v1/admin/job-postings/${posting._id}`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
    });
  });
});
