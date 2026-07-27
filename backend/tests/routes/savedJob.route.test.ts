import request from "supertest";
import app from "../../src/app";
import { createTestUser, authHeader } from "../helpers/auth";
import { createJobPosting } from "../helpers/fixtures";

describe("Saved job routes", () => {
  describe("POST /api/v1/saved-jobs", () => {
    it("saves a job posting for the current user", async () => {
      const { token } = await createTestUser();
      const posting = await createJobPosting();

      const res = await request(app)
        .post("/api/v1/saved-jobs")
        .set(authHeader(token))
        .send({ jobPostingId: posting._id.toString() });

      expect(res.status).toBe(201);
    });

    it("returns 404 for a non-existent job posting", async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .post("/api/v1/saved-jobs")
        .set(authHeader(token))
        .send({ jobPostingId: "000000000000000000000000" });

      expect(res.status).toBe(404);
    });

    it("rejects saving the same job twice", async () => {
      const { token } = await createTestUser();
      const posting = await createJobPosting();

      await request(app)
        .post("/api/v1/saved-jobs")
        .set(authHeader(token))
        .send({ jobPostingId: posting._id.toString() });

      const res = await request(app)
        .post("/api/v1/saved-jobs")
        .set(authHeader(token))
        .send({ jobPostingId: posting._id.toString() });

      expect(res.status).toBe(400);
    });

    it("requires jobPostingId", async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .post("/api/v1/saved-jobs")
        .set(authHeader(token))
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/v1/saved-jobs", () => {
    it("returns only the current user's saved jobs", async () => {
      const { token: tokenA } = await createTestUser();
      const { token: tokenB } = await createTestUser();
      const postingA = await createJobPosting();
      const postingB = await createJobPosting();

      await request(app)
        .post("/api/v1/saved-jobs")
        .set(authHeader(tokenA))
        .send({ jobPostingId: postingA._id.toString() });
      await request(app)
        .post("/api/v1/saved-jobs")
        .set(authHeader(tokenB))
        .send({ jobPostingId: postingB._id.toString() });

      const res = await request(app)
        .get("/api/v1/saved-jobs")
        .set(authHeader(tokenA));

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].jobPostingId._id).toBe(postingA._id.toString());
    });
  });

  describe("DELETE /api/v1/saved-jobs/:jobPostingId", () => {
    it("unsaves a previously saved job", async () => {
      const { token } = await createTestUser();
      const posting = await createJobPosting();

      await request(app)
        .post("/api/v1/saved-jobs")
        .set(authHeader(token))
        .send({ jobPostingId: posting._id.toString() });

      const res = await request(app)
        .delete(`/api/v1/saved-jobs/${posting._id}`)
        .set(authHeader(token));

      expect(res.status).toBe(200);

      const listRes = await request(app)
        .get("/api/v1/saved-jobs")
        .set(authHeader(token));
      expect(listRes.body.data.length).toBe(0);
    });

    it("returns 404 when nothing was saved", async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .delete("/api/v1/saved-jobs/000000000000000000000000")
        .set(authHeader(token));

      expect(res.status).toBe(404);
    });
  });
});
