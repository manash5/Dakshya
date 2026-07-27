import request from "supertest";
import app from "../../src/app";
import Subject from "../../src/models/subject.model";
import JobRole from "../../src/models/jobRole.model";
import { createTestUser, authHeader } from "../helpers/auth";
import { createUniversity, createCourse, createJobRole } from "../helpers/fixtures";

describe("Public catalog routes (university/course/subject/jobRoles)", () => {
  describe("GET /api/v1/university", () => {
    it("requires authentication", async () => {
      const res = await request(app).get("/api/v1/university");
      expect(res.status).toBe(401);
    });

    it("lists universities for an authenticated user", async () => {
      const { token } = await createTestUser();
      await createUniversity({ name: "Alpha University" });

      const res = await request(app).get("/api/v1/university").set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/v1/university/:universityId", () => {
    it("returns a single university", async () => {
      const { token } = await createTestUser();
      const university = await createUniversity();

      const res = await request(app)
        .get(`/api/v1/university/${university._id}`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(university._id.toString());
    });

    it("returns 404 for a non-existent university", async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .get("/api/v1/university/000000000000000000000000")
        .set(authHeader(token));

      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/v1/university/:universityId/courses", () => {
    it("returns courses belonging to a university", async () => {
      const { token } = await createTestUser();
      const university = await createUniversity();
      const course = await createCourse(university._id.toString());

      const res = await request(app)
        .get(`/api/v1/university/${university._id}/courses`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.map((c: any) => c._id)).toContain(course._id.toString());
    });
  });

  describe("GET /api/v1/course/:courseId", () => {
    it("returns a single course", async () => {
      const { token } = await createTestUser();
      const university = await createUniversity();
      const course = await createCourse(university._id.toString());

      const res = await request(app)
        .get(`/api/v1/course/${course._id}`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(course._id.toString());
    });
  });

  describe("GET /api/v1/course/:courseId/subjects", () => {
    it("returns subjects for a course", async () => {
      const { token } = await createTestUser();
      const university = await createUniversity();
      const course = await createCourse(university._id.toString());
      const subject = await Subject.create({
        courseId: course._id,
        semester: 1,
        code: "CS101",
        name: "Intro to Programming",
        credits: 3,
        description: "Fundamentals of programming",
        skills: ["javascript"],
      });

      const res = await request(app)
        .get(`/api/v1/course/${course._id}/subjects`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.map((s: any) => s._id)).toContain(subject._id.toString());
    });
  });

  describe("GET /api/v1/subject/:subjectId", () => {
    it("returns a single subject", async () => {
      const { token } = await createTestUser();
      const university = await createUniversity();
      const course = await createCourse(university._id.toString());
      const subject = await Subject.create({
        courseId: course._id,
        semester: 1,
        code: "CS101",
        name: "Intro to Programming",
        credits: 3,
        description: "Fundamentals of programming",
        skills: [],
      });

      const res = await request(app)
        .get(`/api/v1/subject/${subject._id}`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(subject._id.toString());
    });

    it("returns 404 for a non-existent subject", async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .get("/api/v1/subject/000000000000000000000000")
        .set(authHeader(token));

      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/v1/jobRoles", () => {
    it("lists job roles", async () => {
      const { token } = await createTestUser();
      await createJobRole({ title: "Frontend Developer" });

      const res = await request(app).get("/api/v1/jobRoles").set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/v1/jobRoles/:jobRoleId", () => {
    it("returns a job role with its career knowledge (null if none exists)", async () => {
      const { token } = await createTestUser();
      const role = await createJobRole();

      const res = await request(app)
        .get(`/api/v1/jobRoles/${role._id}`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.jobRole._id).toBe(role._id.toString());
      expect(res.body.data.careerKnowledge).toBeNull();
    });

    it("returns 404 for a non-existent job role", async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .get("/api/v1/jobRoles/000000000000000000000000")
        .set(authHeader(token));

      expect(res.status).toBe(404);
    });
  });
});
