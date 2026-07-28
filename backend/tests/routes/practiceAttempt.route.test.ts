import request from "supertest";

jest.mock("../../src/clients/fastapi.client");

import app from "../../src/app";
import { fastApiClient } from "../../src/clients/fastapi.client";
import { createTestUser, authHeader } from "../helpers/auth";
import { createJobRole } from "../helpers/fixtures";

async function startAttempt(token: string, jobRoleId: string, overrides: Record<string, unknown> = {}) {
  return request(app)
    .post("/api/v1/practice-attempts")
    .set(authHeader(token))
    .send({
      jobRoleId,
      difficulty: "Beginner",
      mode: "Oral",
      questionCount: 3,
      ...overrides,
    });
}

describe("Practice attempt routes", () => {
  describe("POST /api/v1/practice-attempts", () => {
    it("starts a new attempt with AI-generated questions", async () => {
      const { token } = await createTestUser();
      const role = await createJobRole();

      const res = await startAttempt(token, role._id.toString());

      expect(res.status).toBe(201);
      expect(res.body.data.questions.length).toBeGreaterThan(0);
      expect(res.body.data.completedAt).toBeNull();
    });

    it("returns 404 for a non-existent job role", async () => {
      const { token } = await createTestUser();

      const res = await startAttempt(token, "000000000000000000000000");

      expect(res.status).toBe(404);
    });

    it("rejects an invalid payload with 400", async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .post("/api/v1/practice-attempts")
        .set(authHeader(token))
        .send({ difficulty: "Beginner" });

      expect(res.status).toBe(400);
    });
  });

  describe("PUT /api/v1/practice-attempts/:id/answer", () => {
    it("submits an answer and records the AI evaluation", async () => {
      const { token } = await createTestUser();
      const role = await createJobRole();
      const startRes = await startAttempt(token, role._id.toString());
      const attemptId = startRes.body.data._id;

      const res = await request(app)
        .put(`/api/v1/practice-attempts/${attemptId}/answer`)
        .set(authHeader(token))
        .send({ questionIndex: 0, userAnswer: "A closure captures scope." });

      expect(res.status).toBe(200);
      expect(res.body.data.questions[0].userAnswer).toBe("A closure captures scope.");
      expect(res.body.data.questions[0].score).toBe(80);
    });

    it("returns 404 when the attempt belongs to a different user", async () => {
      const { token: ownerToken } = await createTestUser();
      const { token: otherToken } = await createTestUser();
      const role = await createJobRole();
      const startRes = await startAttempt(ownerToken, role._id.toString());
      const attemptId = startRes.body.data._id;

      const res = await request(app)
        .put(`/api/v1/practice-attempts/${attemptId}/answer`)
        .set(authHeader(otherToken))
        .send({ questionIndex: 0, userAnswer: "Not my attempt" });

      expect(res.status).toBe(404);
    });

    it("returns 404 for a question index that doesn't exist", async () => {
      const { token } = await createTestUser();
      const role = await createJobRole();
      const startRes = await startAttempt(token, role._id.toString());
      const attemptId = startRes.body.data._id;

      const res = await request(app)
        .put(`/api/v1/practice-attempts/${attemptId}/answer`)
        .set(authHeader(token))
        .send({ questionIndex: 99, userAnswer: "..." });

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/v1/practice-attempts/:id/complete", () => {
    it("completes an attempt and averages scores", async () => {
      const { token } = await createTestUser();
      const role = await createJobRole();
      const startRes = await startAttempt(token, role._id.toString());
      const attemptId = startRes.body.data._id;

      await request(app)
        .put(`/api/v1/practice-attempts/${attemptId}/answer`)
        .set(authHeader(token))
        .send({ questionIndex: 0, userAnswer: "An answer" });

      const res = await request(app)
        .put(`/api/v1/practice-attempts/${attemptId}/complete`)
        .set(authHeader(token))
        .send({ feedback: "Good job", recommendations: ["Practice more"] });

      expect(res.status).toBe(200);
      expect(res.body.data.completedAt).not.toBeNull();
      expect(res.body.data.overallScore).not.toBeNull();
    });

    it("rejects completing an already-completed attempt", async () => {
      const { token } = await createTestUser();
      const role = await createJobRole();
      const startRes = await startAttempt(token, role._id.toString());
      const attemptId = startRes.body.data._id;

      await request(app)
        .put(`/api/v1/practice-attempts/${attemptId}/complete`)
        .set(authHeader(token))
        .send({});

      const res = await request(app)
        .put(`/api/v1/practice-attempts/${attemptId}/complete`)
        .set(authHeader(token))
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/v1/practice-attempts", () => {
    it("returns only the current user's attempts", async () => {
      const { token: userA } = await createTestUser();
      const { token: userB } = await createTestUser();
      const role = await createJobRole();

      await startAttempt(userA, role._id.toString());
      await startAttempt(userB, role._id.toString());

      const res = await request(app)
        .get("/api/v1/practice-attempts")
        .set(authHeader(userA));

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe("GET /api/v1/practice-attempts/:id", () => {
    it("returns 404 for another user's attempt", async () => {
      const { token: owner } = await createTestUser();
      const { token: other } = await createTestUser();
      const role = await createJobRole();
      const startRes = await startAttempt(owner, role._id.toString());

      const res = await request(app)
        .get(`/api/v1/practice-attempts/${startRes.body.data._id}`)
        .set(authHeader(other));

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/v1/practice-attempts/:id", () => {
    it("deletes an owned attempt", async () => {
      const { token } = await createTestUser();
      const role = await createJobRole();
      const startRes = await startAttempt(token, role._id.toString());
      const attemptId = startRes.body.data._id;

      const res = await request(app)
        .delete(`/api/v1/practice-attempts/${attemptId}`)
        .set(authHeader(token));

      expect(res.status).toBe(200);

      const getRes = await request(app)
        .get(`/api/v1/practice-attempts/${attemptId}`)
        .set(authHeader(token));
      expect(getRes.status).toBe(404);
    });
  });

  describe("POST /api/v1/practice-attempts/transcribe", () => {
    it("transcribes an uploaded audio file", async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .post("/api/v1/practice-attempts/transcribe")
        .set(authHeader(token))
        .attach("audio", Buffer.from("fake audio data"), {
          filename: "recording.webm",
          contentType: "audio/webm",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.transcription).toBe("mock transcription");
      expect(fastApiClient.transcribeAudio).toHaveBeenCalled();
    });

    it("rejects a request with no file", async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .post("/api/v1/practice-attempts/transcribe")
        .set(authHeader(token));

      expect(res.status).toBe(400);
    });
  });
});
