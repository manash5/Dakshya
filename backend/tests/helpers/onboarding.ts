import request from "supertest";
import app from "../../src/app";
import { createTestUser, authHeader } from "./auth";
import { createUniversity, createCourse, createJobRole } from "./fixtures";
import CareerKnowledge from "../../src/models/careerKnowledge.model";

// Drives the real /auth/onboarding endpoint (not a shortcut through the
// model) so onboarding's own side effects -- initializeUserProgress,
// syncTargetRoles, refreshAcademicProgress -- actually run, same as a real
// user completing onboarding would trigger.
export async function createOnboardedUser(
  options: { withCareerKnowledge?: boolean } = {},
) {
  const { user, token } = await createTestUser();
  const university = await createUniversity();
  const course = await createCourse(university._id.toString());
  const jobRole = await createJobRole();

  const res = await request(app)
    .post("/api/v1/auth/onboarding")
    .set(authHeader(token))
    .send({
      age: 22,
      universityId: university._id.toString(),
      courseId: course._id.toString(),
      currentSemester: 2,
      targetRoles: [jobRole._id.toString()],
    });

  if (res.status !== 200) {
    throw new Error(
      `Onboarding failed in test setup: ${res.status} ${JSON.stringify(res.body)}`,
    );
  }

  let careerKnowledge = null;
  if (options.withCareerKnowledge) {
    careerKnowledge = await CareerKnowledge.create({
      jobRoleId: jobRole._id,
      careerDescription: "A test career description.",
      requiredSkills: ["javascript", "node.js"],
      tools: [],
      frameworks: [],
      certifications: [],
      roadmap: [
        {
          order: 1,
          title: "Learn the basics",
          description: "Mock roadmap step",
          estimatedWeeks: 2,
          requiredSkills: ["javascript"],
          completionCriteria: "Build a small project",
          resources: [],
        },
      ],
      projects: [
        {
          title: "Sample Project",
          description: "A sample project",
          difficulty: "Beginner",
          technologies: ["javascript"],
          estimatedHours: 5,
        },
      ],
      interviewGuide: {
        commonTopics: [],
        focusAreas: [],
        interviewTips: [],
        importantConcepts: [],
      },
      learningResources: [],
      salary: { min: 500, max: 1500, currency: "USD" },
      difficulty: "Beginner",
      futureDemand: "High",
      marketTrend: { trend: "Growing", updatedAt: new Date() },
      estimatedCompletionMonths: 6,
      aiGeneratedDate: new Date(),
    });
  }

  return { user, token, university, course, jobRole, careerKnowledge };
}
