import request from "supertest";
import app from "../../src/app";
import { createTestUser, authHeader } from "../helpers/auth";
import { createUniversity, createCourse, createJobPosting } from "../helpers/fixtures";
import Subject from "../../src/models/subject.model";

describe("Admin course/subject read endpoints", () => {
  it("returns a single admin course by id", async () => {
    const { token } = await createTestUser({ role: "admin" });
    const university = await createUniversity();
    const course = await createCourse(university._id.toString());

    const res = await request(app)
      .get(`/api/v1/admin/course/${course._id}`)
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(course._id.toString());
  });

  it("searches admin courses by name", async () => {
    const { token } = await createTestUser({ role: "admin" });
    const university = await createUniversity();
    await createCourse(university._id.toString(), { name: "Distinctive Course Name" });
    await createCourse(university._id.toString(), { name: "Something Else" });

    const res = await request(app)
      .get("/api/v1/admin/course?search=Distinctive")
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it("lists courses for a university via the admin nested route", async () => {
    const { token } = await createTestUser({ role: "admin" });
    const university = await createUniversity();
    await createCourse(university._id.toString());

    const res = await request(app)
      .get(`/api/v1/admin/university/${university._id}/courses`)
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it("returns a single admin subject by id", async () => {
    const { token } = await createTestUser({ role: "admin" });
    const university = await createUniversity();
    const course = await createCourse(university._id.toString());
    const subject = await Subject.create({
      courseId: course._id,
      semester: 1,
      code: "CS201",
      name: "Algorithms",
      credits: 3,
      description: "Algorithms and complexity",
      skills: [],
    });

    const res = await request(app)
      .get(`/api/v1/admin/subject/${subject._id}`)
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(subject._id.toString());
  });

  it("searches admin subjects by name", async () => {
    const { token } = await createTestUser({ role: "admin" });
    const university = await createUniversity();
    const course = await createCourse(university._id.toString());
    await Subject.create({
      courseId: course._id,
      semester: 1,
      code: "CS202",
      name: "Distinctive Subject",
      credits: 3,
      description: "A distinctive subject",
      skills: [],
    });

    const res = await request(app)
      .get("/api/v1/admin/subject?search=Distinctive")
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it("lists subjects for a course via the admin nested route", async () => {
    const { token } = await createTestUser({ role: "admin" });
    const university = await createUniversity();
    const course = await createCourse(university._id.toString());
    await Subject.create({
      courseId: course._id,
      semester: 1,
      code: "CS203",
      name: "Databases",
      credits: 3,
      description: "Relational databases",
      skills: [],
    });

    const res = await request(app)
      .get(`/api/v1/admin/course/${course._id}/subjects`)
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });
});

describe("Job posting filters", () => {
  it("filters by skill and experience together", async () => {
    const { token } = await createTestUser();
    await createJobPosting({ requiredSkills: ["python"], experience: "3-5 years" });
    await createJobPosting({ requiredSkills: ["javascript"], experience: "0-1 years" });

    const res = await request(app)
      .get("/api/v1/job-postings?skill=python&experience=3-5")
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it("searches by free text across title/company/description", async () => {
    const { token } = await createTestUser();
    await createJobPosting({ title: "Uniquely Named Role" });
    await createJobPosting({ title: "Something Else" });

    const res = await request(app)
      .get("/api/v1/job-postings?search=Uniquely")
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });
});

describe("Malformed id handling", () => {
  it("returns an error (not a crash) for a malformed ObjectId", async () => {
    const { token } = await createTestUser();

    const res = await request(app)
      .get("/api/v1/job-postings/not-a-valid-object-id")
      .set(authHeader(token));

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.success).toBe(false);
  });
});

describe("Upload middleware file-type rejection", () => {
  it("rejects a non-PDF resume upload", async () => {
    const { token } = await createTestUser();

    const res = await request(app)
      .post("/api/v1/resume-analysis")
      .set(authHeader(token))
      .attach("resume", Buffer.from("not a pdf"), {
        filename: "resume.txt",
        contentType: "text/plain",
      });

    expect(res.status).toBe(400);
  });

  it("rejects an unsupported audio format", async () => {
    const { token } = await createTestUser();

    const res = await request(app)
      .post("/api/v1/practice-attempts/transcribe")
      .set(authHeader(token))
      .attach("audio", Buffer.from("not audio"), {
        filename: "clip.txt",
        contentType: "text/plain",
      });

    expect(res.status).toBe(400);
  });

  it("rejects a non-image profile picture upload", async () => {
    const { token } = await createTestUser();

    const res = await request(app)
      .put("/api/v1/auth/update")
      .set(authHeader(token))
      .field("firstName", "Test")
      .attach("profilePicture", Buffer.from("not an image"), {
        filename: "avatar.txt",
        contentType: "text/plain",
      });

    expect(res.status).toBe(400);
  });
});
