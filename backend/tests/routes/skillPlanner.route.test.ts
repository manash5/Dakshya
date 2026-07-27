import request from "supertest";

jest.mock("../../src/clients/fastapi.client");

import app from "../../src/app";
import { authHeader } from "../helpers/auth";
import { createOnboardedUser } from "../helpers/onboarding";

describe("Skill planner routes", () => {
  describe("GET /api/v1/skill-planner/:jobRoleId", () => {
    it("returns an empty planner when no career knowledge exists yet", async () => {
      const { token, jobRole } = await createOnboardedUser();

      const res = await request(app)
        .get(`/api/v1/skill-planner/${jobRole._id}`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.hasCareerKnowledge).toBe(false);
      expect(res.body.data.skills).toEqual([]);
    });

    it("returns a populated planner once career knowledge exists", async () => {
      const { token, jobRole } = await createOnboardedUser({ withCareerKnowledge: true });

      const res = await request(app)
        .get(`/api/v1/skill-planner/${jobRole._id}`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.hasCareerKnowledge).toBe(true);
      expect(res.body.data.roadmap.length).toBe(1);
      expect(res.body.data.skills.some((s: any) => s.skill === "javascript")).toBe(true);
    });

    it("returns 404 for a role that isn't a target role", async () => {
      const { token } = await createOnboardedUser();

      const res = await request(app)
        .get("/api/v1/skill-planner/000000000000000000000000")
        .set(authHeader(token));

      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/v1/skill-planner/:jobRoleId/generate-resources", () => {
    it("generates and appends AI resources for a skill", async () => {
      const { token, jobRole } = await createOnboardedUser({ withCareerKnowledge: true });

      const res = await request(app)
        .post(`/api/v1/skill-planner/${jobRole._id}/generate-resources`)
        .set(authHeader(token))
        .send({ skill: "javascript" });

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("rejects a request with no skill", async () => {
      const { token, jobRole } = await createOnboardedUser({ withCareerKnowledge: true });

      const res = await request(app)
        .post(`/api/v1/skill-planner/${jobRole._id}/generate-resources`)
        .set(authHeader(token))
        .send({});

      expect(res.status).toBe(400);
    });

    it("returns 404 when career knowledge doesn't exist for the role", async () => {
      const { token, jobRole } = await createOnboardedUser();

      const res = await request(app)
        .post(`/api/v1/skill-planner/${jobRole._id}/generate-resources`)
        .set(authHeader(token))
        .send({ skill: "javascript" });

      expect(res.status).toBe(404);
    });
  });
});
