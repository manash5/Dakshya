import request from "supertest";

// createJobRole fires off career-knowledge generation as a best-effort side
// effect (see jobRole.service.ts) -- mocked so tests never depend on the
// real FastAPI service being up.
jest.mock("../../src/clients/fastapi.client");

import app from "../../src/app";
import { createTestUser, authHeader } from "../helpers/auth";
import { createUniversity, createCourse, createJobRole } from "../helpers/fixtures";

describe("Admin catalog routes (university/course/subject/jobRoles)", () => {
  describe("Authorization", () => {
    it("rejects a non-admin user with 403", async () => {
      const { token } = await createTestUser({ role: "user" });

      const res = await request(app)
        .get("/api/v1/admin/university")
        .set(authHeader(token));

      expect(res.status).toBe(403);
    });

    it("rejects an unauthenticated request with 401", async () => {
      const res = await request(app).get("/api/v1/admin/university");
      expect(res.status).toBe(401);
    });
  });

  describe("University CRUD", () => {
    it("creates a university", async () => {
      const { token } = await createTestUser({ role: "admin" });

      const res = await request(app)
        .post("/api/v1/admin/university")
        .set(authHeader(token))
        .send({
          name: "Kathmandu University",
          shortName: "KU",
          country: "Nepal",
        });

      // Admin create endpoints in this codebase return 200 rather than 201
      // (pinning current behavior, not asserting it's the ideal REST
      // convention -- see the create endpoints across admin/*.controller.ts
      // for the same pattern).
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("Kathmandu University");
    });

    it("rejects an invalid payload with 400", async () => {
      const { token } = await createTestUser({ role: "admin" });

      const res = await request(app)
        .post("/api/v1/admin/university")
        .set(authHeader(token))
        .send({ name: "A" });

      expect(res.status).toBe(400);
    });

    it("updates a university", async () => {
      const { token } = await createTestUser({ role: "admin" });
      const university = await createUniversity();

      const res = await request(app)
        .put(`/api/v1/admin/university/${university._id}`)
        .set(authHeader(token))
        .send({ name: "Renamed University" });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("Renamed University");
    });

    it("deletes a university", async () => {
      const { token } = await createTestUser({ role: "admin" });
      const university = await createUniversity();

      const res = await request(app)
        .delete(`/api/v1/admin/university/${university._id}`)
        .set(authHeader(token));

      expect(res.status).toBe(200);

      const getRes = await request(app)
        .get(`/api/v1/admin/university/${university._id}`)
        .set(authHeader(token));
      expect(getRes.status).toBe(404);
    });

    it("lists universities paginated", async () => {
      const { token } = await createTestUser({ role: "admin" });
      await createUniversity();
      await createUniversity();

      const res = await request(app)
        .get("/api/v1/admin/university?page=1&limit=10")
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Course CRUD", () => {
    it("creates a course under a university", async () => {
      const { token } = await createTestUser({ role: "admin" });
      const university = await createUniversity();

      const res = await request(app)
        .post("/api/v1/admin/course")
        .set(authHeader(token))
        .send({
          universityId: university._id.toString(),
          name: "Computer Science",
          degree: "Bachelor",
          durationInSemesters: 8,
          description: "A four-year computer science programme.",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe("Computer Science");
    });

    it("returns 404 when the university doesn't exist", async () => {
      const { token } = await createTestUser({ role: "admin" });

      const res = await request(app)
        .post("/api/v1/admin/course")
        .set(authHeader(token))
        .send({
          universityId: "000000000000000000000000",
          name: "Computer Science",
          degree: "Bachelor",
          durationInSemesters: 8,
          description: "A four-year computer science programme.",
        });

      expect(res.status).toBe(404);
    });

    it("updates and deletes a course", async () => {
      const { token } = await createTestUser({ role: "admin" });
      const university = await createUniversity();
      const course = await createCourse(university._id.toString());

      const updateRes = await request(app)
        .put(`/api/v1/admin/course/${course._id}`)
        .set(authHeader(token))
        .send({ name: "Updated Course Name" });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.name).toBe("Updated Course Name");

      const deleteRes = await request(app)
        .delete(`/api/v1/admin/course/${course._id}`)
        .set(authHeader(token));
      expect(deleteRes.status).toBe(200);
    });
  });

  describe("Subject CRUD", () => {
    it("creates a subject under a course", async () => {
      const { token } = await createTestUser({ role: "admin" });
      const university = await createUniversity();
      const course = await createCourse(university._id.toString());

      const res = await request(app)
        .post("/api/v1/admin/subject")
        .set(authHeader(token))
        .send({
          courseId: course._id.toString(),
          semester: 1,
          code: "CS101",
          name: "Intro to Programming",
          credits: 3,
          description: "Fundamentals of programming",
          skills: ["javascript"],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.code).toBe("CS101");
    });

    it("updates and deletes a subject", async () => {
      const { token } = await createTestUser({ role: "admin" });
      const university = await createUniversity();
      const course = await createCourse(university._id.toString());

      const createRes = await request(app)
        .post("/api/v1/admin/subject")
        .set(authHeader(token))
        .send({
          courseId: course._id.toString(),
          semester: 1,
          code: "CS102",
          name: "Data Structures",
          credits: 3,
          description: "Data structures and algorithms",
          skills: [],
        });
      const subjectId = createRes.body.data._id;

      const updateRes = await request(app)
        .put(`/api/v1/admin/subject/${subjectId}`)
        .set(authHeader(token))
        .send({ name: "Data Structures & Algorithms" });
      expect(updateRes.status).toBe(200);

      const deleteRes = await request(app)
        .delete(`/api/v1/admin/subject/${subjectId}`)
        .set(authHeader(token));
      expect(deleteRes.status).toBe(200);
    });
  });

  describe("Job Role CRUD", () => {
    it("creates a job role", async () => {
      const { token } = await createTestUser({ role: "admin" });

      const res = await request(app)
        .post("/api/v1/admin/jobRoles")
        .set(authHeader(token))
        .send({
          title: "Backend Developer",
          category: "Software Engineering",
          description: "Builds and maintains server-side systems.",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe("Backend Developer");
    });

    it("rejects a duplicate job role title", async () => {
      const { token } = await createTestUser({ role: "admin" });
      await createJobRole({ title: "Backend Developer" });

      const res = await request(app)
        .post("/api/v1/admin/jobRoles")
        .set(authHeader(token))
        .send({
          title: "Backend Developer",
          category: "Software Engineering",
          description: "Builds and maintains server-side systems.",
        });

      expect(res.status).toBe(400);
    });

    it("updates and deletes a job role", async () => {
      const { token } = await createTestUser({ role: "admin" });
      const role = await createJobRole();

      const updateRes = await request(app)
        .put(`/api/v1/admin/jobRoles/${role._id}`)
        .set(authHeader(token))
        .send({ description: "An updated description that is long enough." });
      expect(updateRes.status).toBe(200);

      const deleteRes = await request(app)
        .delete(`/api/v1/admin/jobRoles/${role._id}`)
        .set(authHeader(token));
      expect(deleteRes.status).toBe(200);
    });

    it("lists job roles paginated", async () => {
      const { token } = await createTestUser({ role: "admin" });
      await createJobRole();
      await createJobRole();

      const res = await request(app)
        .get("/api/v1/admin/jobRoles?page=1&limit=10")
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });
});
