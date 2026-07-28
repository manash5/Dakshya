import request from "supertest";
import app from "../../src/app";
import { createTestUser, authHeader } from "../helpers/auth";
import { createJobRole, createProject } from "../helpers/fixtures";

describe("Project routes", () => {
  describe("GET /api/v1/projects", () => {
    it("lists projects", async () => {
      const { token } = await createTestUser();
      const role = await createJobRole();
      await createProject(role._id.toString());

      const res = await request(app).get("/api/v1/projects").set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    it("requires authentication", async () => {
      const res = await request(app).get("/api/v1/projects");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/v1/projects/:id", () => {
    it("returns a single project", async () => {
      const { token } = await createTestUser();
      const role = await createJobRole();
      const project = await createProject(role._id.toString());

      const res = await request(app)
        .get(`/api/v1/projects/${project._id}`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(project._id.toString());
    });

    it("returns 404 for a non-existent project", async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .get("/api/v1/projects/000000000000000000000000")
        .set(authHeader(token));

      expect(res.status).toBe(404);
    });
  });

  describe("Admin project CRUD", () => {
    it("creates a project", async () => {
      const { token } = await createTestUser({ role: "admin" });
      const role = await createJobRole();

      const res = await request(app)
        .post("/api/v1/admin/projects")
        .set(authHeader(token))
        .send({
          title: "Build a REST API",
          description: "Build a small REST API with Express",
          difficulty: "Beginner",
          skills: ["javascript", "express"],
          requirements: ["Node.js installed"],
          estimatedHours: 8,
          careerRole: role._id.toString(),
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe("Build a REST API");
    });

    it("rejects project creation from a non-admin user", async () => {
      const { token } = await createTestUser({ role: "user" });
      const role = await createJobRole();

      const res = await request(app)
        .post("/api/v1/admin/projects")
        .set(authHeader(token))
        .send({
          title: "Build a REST API",
          difficulty: "Beginner",
          estimatedHours: 8,
          careerRole: role._id.toString(),
        });

      expect(res.status).toBe(403);
    });

    it("updates and deletes a project", async () => {
      const { token } = await createTestUser({ role: "admin" });
      const role = await createJobRole();
      const project = await createProject(role._id.toString());

      const updateRes = await request(app)
        .put(`/api/v1/admin/projects/${project._id}`)
        .set(authHeader(token))
        .send({ title: "Updated Title" });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.title).toBe("Updated Title");

      const deleteRes = await request(app)
        .delete(`/api/v1/admin/projects/${project._id}`)
        .set(authHeader(token));
      expect(deleteRes.status).toBe(200);
    });
  });
});
