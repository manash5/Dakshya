import request from "supertest";
import app from "../../src/app";
import { authHeader } from "../helpers/auth";
import { createOnboardedUser } from "../helpers/onboarding";

describe("User progress routes", () => {
  describe("GET /api/v1/userProgress", () => {
    it("returns the current user's progress after onboarding", async () => {
      const { token } = await createOnboardedUser();

      const res = await request(app).get("/api/v1/userProgress").set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.targetRoleProgress.length).toBe(1);
    });
  });

  describe("POST /api/v1/userProgress/refresh", () => {
    it("refreshes academic progress", async () => {
      const { token } = await createOnboardedUser();

      const res = await request(app)
        .post("/api/v1/userProgress/refresh")
        .set(authHeader(token));

      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/v1/userProgress/roadmap/:jobRoleId", () => {
    it("returns computed roadmap progress against career knowledge", async () => {
      const { token, jobRole } = await createOnboardedUser({ withCareerKnowledge: true });

      const res = await request(app)
        .get(`/api/v1/userProgress/roadmap/${jobRole._id}`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.totalModules).toBe(1);
      expect(res.body.data.completedModules).toBe(0);
    });

    it("returns 404 for a role that isn't a target role", async () => {
      const { token } = await createOnboardedUser();

      const res = await request(app)
        .get("/api/v1/userProgress/roadmap/000000000000000000000000")
        .set(authHeader(token));

      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/v1/userProgress/roadmap/:jobRoleId/visit", () => {
    it("records a roadmap visit timestamp", async () => {
      const { token, jobRole } = await createOnboardedUser({ withCareerKnowledge: true });

      const res = await request(app)
        .post(`/api/v1/userProgress/roadmap/${jobRole._id}/visit`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
      const role = res.body.data.targetRoleProgress[0];
      expect(role.lastVisited).not.toBeNull();
    });
  });

  describe("POST /api/v1/userProgress/roadmap/:jobRoleId/step", () => {
    it("marks a roadmap step completed and improves readiness", async () => {
      const { token, jobRole } = await createOnboardedUser({ withCareerKnowledge: true });

      const res = await request(app)
        .post(`/api/v1/userProgress/roadmap/${jobRole._id}/step`)
        .set(authHeader(token))
        .send({ stepOrder: 1 });

      expect(res.status).toBe(200);
      const role = res.body.data.targetRoleProgress[0];
      expect(role.completedRoadmapSteps.length).toBe(1);
      expect(role.completedRoadmapSteps[0].stepOrder).toBe(1);
    });

    it("does not duplicate the same step when completed twice", async () => {
      const { token, jobRole } = await createOnboardedUser({ withCareerKnowledge: true });

      await request(app)
        .post(`/api/v1/userProgress/roadmap/${jobRole._id}/step`)
        .set(authHeader(token))
        .send({ stepOrder: 1 });

      const res = await request(app)
        .post(`/api/v1/userProgress/roadmap/${jobRole._id}/step`)
        .set(authHeader(token))
        .send({ stepOrder: 1 });

      expect(res.status).toBe(200);
      const role = res.body.data.targetRoleProgress[0];
      expect(role.completedRoadmapSteps.length).toBe(1);
    });
  });

  describe("POST /api/v1/userProgress/roadmap/:jobRoleId/resource", () => {
    it("marks a resource as watched", async () => {
      const { token, jobRole } = await createOnboardedUser({ withCareerKnowledge: true });

      const res = await request(app)
        .post(`/api/v1/userProgress/roadmap/${jobRole._id}/resource`)
        .set(authHeader(token))
        .send({ stepOrder: 1, resourceUrl: "https://example.com/resource" });

      expect(res.status).toBe(200);
      const role = res.body.data.targetRoleProgress[0];
      expect(role.roadmapStepProgress[0].watchedResourceUrls).toContain(
        "https://example.com/resource",
      );
    });
  });

  describe("POST /api/v1/userProgress/roadmap/:jobRoleId/project", () => {
    it("marks a project completed", async () => {
      const { token, jobRole } = await createOnboardedUser({ withCareerKnowledge: true });

      const res = await request(app)
        .post(`/api/v1/userProgress/roadmap/${jobRole._id}/project`)
        .set(authHeader(token))
        .send({ projectTitle: "Sample Project", githubLink: "https://github.com/me/sample" });

      expect(res.status).toBe(200);
      const role = res.body.data.targetRoleProgress[0];
      expect(role.completedProjects.length).toBe(1);
      expect(role.completedProjects[0].projectTitle).toBe("Sample Project");
    });
  });

  describe("POST /api/v1/userProgress/skills/:jobRoleId/report", () => {
    it("records a self-reported skill", async () => {
      const { token, jobRole } = await createOnboardedUser({ withCareerKnowledge: true });

      const res = await request(app)
        .post(`/api/v1/userProgress/skills/${jobRole._id}/report`)
        .set(authHeader(token))
        .send({ skill: "Docker", description: "Used Docker to containerize a side project." });

      expect(res.status).toBe(200);
      const role = res.body.data.targetRoleProgress[0];
      expect(role.selfReportedSkills[0].skill).toBe("docker");
    });

    it("updates rather than duplicates an existing self-reported skill", async () => {
      const { token, jobRole } = await createOnboardedUser({ withCareerKnowledge: true });

      await request(app)
        .post(`/api/v1/userProgress/skills/${jobRole._id}/report`)
        .set(authHeader(token))
        .send({ skill: "Docker", description: "First description." });

      const res = await request(app)
        .post(`/api/v1/userProgress/skills/${jobRole._id}/report`)
        .set(authHeader(token))
        .send({ skill: "docker", description: "Updated description." });

      expect(res.status).toBe(200);
      const role = res.body.data.targetRoleProgress[0];
      expect(role.selfReportedSkills.length).toBe(1);
      expect(role.selfReportedSkills[0].description).toBe("Updated description.");
    });
  });
});
