import University from "../../src/models/university.model";
import Course from "../../src/models/course.model";
import JobRole from "../../src/models/jobRole.model";
import JobPosting from "../../src/models/jobPosting.model";
import Project from "../../src/models/project.model";

let counter = 0;

export async function createUniversity(overrides: Partial<Record<string, unknown>> = {}) {
  counter += 1;
  return University.create({
    name: `Test University ${counter}`,
    shortName: `TU${counter}`,
    country: "Nepal",
    ...overrides,
  });
}

export async function createCourse(universityId: string, overrides: Partial<Record<string, unknown>> = {}) {
  counter += 1;
  return Course.create({
    universityId,
    name: `Test Course ${counter}`,
    degree: "Bachelor",
    durationInSemesters: 8,
    description: "A test course",
    ...overrides,
  });
}

export async function createJobRole(overrides: Partial<Record<string, unknown>> = {}) {
  counter += 1;
  return JobRole.create({
    title: `Test Job Role ${counter}`,
    category: "Software Engineering",
    ...overrides,
  });
}

export async function createJobPosting(overrides: Partial<Record<string, unknown>> = {}) {
  counter += 1;
  return JobPosting.create({
    title: `Test Job Posting ${counter}`,
    company: "Test Co",
    applyLink: `https://example.com/jobs/${counter}`,
    source: "test",
    requiredSkills: ["javascript"],
    ...overrides,
  });
}

export async function createProject(careerRole: string, overrides: Partial<Record<string, unknown>> = {}) {
  counter += 1;
  return Project.create({
    title: `Test Project ${counter}`,
    description: "A test project",
    difficulty: "Beginner",
    skills: ["javascript"],
    requirements: [],
    estimatedHours: 10,
    careerRole,
    ...overrides,
  });
}
