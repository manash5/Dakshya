import request from "supertest";
import fs from "fs";
import path from "path";

jest.mock("../../src/clients/fastapi.client");

import app from "../../src/app";
import { createTestUser, authHeader } from "../helpers/auth";

const UPLOAD_DIR = path.join(__dirname, "../../uploads");

async function uploadResume(token: string) {
  return request(app)
    .post("/api/v1/resume-analysis")
    .set(authHeader(token))
    .attach("resume", Buffer.from("%PDF-1.4 fake resume content"), {
      filename: "resume.pdf",
      contentType: "application/pdf",
    });
}

describe("Resume analysis routes", () => {
  afterAll(() => {
    // analyzeAndStore writes the uploaded file to disk for real -- clean up
    // whatever this suite created so repeated runs don't pile up garbage.
    if (fs.existsSync(UPLOAD_DIR)) {
      for (const file of fs.readdirSync(UPLOAD_DIR)) {
        if (file.endsWith("-resume.pdf")) {
          fs.unlinkSync(path.join(UPLOAD_DIR, file));
        }
      }
    }
  });

  describe("POST /api/v1/resume-analysis", () => {
    it("analyzes and stores a resume", async () => {
      const { token } = await createTestUser();

      const res = await uploadResume(token);

      expect(res.status).toBe(201);
      expect(res.body.data.skills).toContain("javascript");
      expect(res.body.data.atsScore).toBe(75);
    });

    it("rejects a request with no file", async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .post("/api/v1/resume-analysis")
        .set(authHeader(token));

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/v1/resume-analysis", () => {
    it("returns only the current user's history", async () => {
      const { token: userA } = await createTestUser();
      const { token: userB } = await createTestUser();

      await uploadResume(userA);
      await uploadResume(userB);

      const res = await request(app)
        .get("/api/v1/resume-analysis")
        .set(authHeader(userA));

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe("GET /api/v1/resume-analysis/latest", () => {
    it("returns the most recent analysis", async () => {
      const { token } = await createTestUser();
      await uploadResume(token);

      const res = await request(app)
        .get("/api/v1/resume-analysis/latest")
        .set(authHeader(token));

      expect(res.status).toBe(200);
    });

    it("returns 404 when there's no analysis yet", async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .get("/api/v1/resume-analysis/latest")
        .set(authHeader(token));

      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/v1/resume-analysis/:id", () => {
    it("returns 404 for another user's analysis", async () => {
      const { token: owner } = await createTestUser();
      const { token: other } = await createTestUser();
      const uploadRes = await uploadResume(owner);

      const res = await request(app)
        .get(`/api/v1/resume-analysis/${uploadRes.body.data._id}`)
        .set(authHeader(other));

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/v1/resume-analysis/:id", () => {
    it("deletes an owned analysis", async () => {
      const { token } = await createTestUser();
      const uploadRes = await uploadResume(token);

      const res = await request(app)
        .delete(`/api/v1/resume-analysis/${uploadRes.body.data._id}`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
    });
  });
});
