/// <reference types="jest" />
// This file lives outside the tsconfig.jest.json project ts-jest actually
// compiles it with (it's under src/, which the app's own tsconfig excludes
// entirely). The triple-slash directive pulls in Jest's global types for
// whichever config an editor falls back to, without adding a stray
// tsconfig.json inside the application source tree.

export const fastApiClient = {
  generateCareerKnowledge: jest.fn().mockResolvedValue({
    careerDescription: "Mock career description.",
    requiredSkills: ["javascript", "node.js"],
    tools: ["Git"],
    frameworks: ["Express"],
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
    projects: [],
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
    marketTrend: { trend: "Growing" },
    estimatedCompletionMonths: 6,
  }),

  regenerateCareerKnowledge: jest.fn().mockResolvedValue({
    careerDescription: "Mock regenerated career description.",
    requiredSkills: ["javascript", "node.js"],
    tools: [],
    frameworks: [],
    certifications: [],
    roadmap: [],
    projects: [],
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
    marketTrend: { trend: "Growing" },
    estimatedCompletionMonths: 6,
  }),

  generateSkillResources: jest.fn().mockResolvedValue({
    resources: [
      { title: "Mock Resource", type: "Article", url: "https://example.com", skills: ["javascript"] },
    ],
  }),

  scrapeJobPostings: jest.fn().mockResolvedValue({
    jobs: [],
    stats: {
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      durationSeconds: 0,
      sourcesAttempted: [],
      sourcesSucceeded: [],
      sourcesFailed: {},
      totalScraped: 0,
    },
  }),

  scrapeOpportunities: jest.fn().mockResolvedValue({
    opportunities: [],
    stats: {
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      durationSeconds: 0,
      sourcesAttempted: [],
      sourcesSucceeded: [],
      sourcesFailed: {},
      totalScraped: 0,
    },
  }),

  classifyOpportunities: jest.fn().mockResolvedValue({ classifications: [] }),

  analyzeResume: jest.fn().mockResolvedValue({
    candidateNameOnResume: "Mock Candidate",
    identityMatch: true,
    identityReason: "Name matches",
    skills: ["javascript"],
    projects: [],
    experience: [],
    education: [],
    strengths: [],
    weaknesses: [],
    atsScore: 75,
    recommendations: [],
    comparison: null,
  }),

  generateInterviewQuestions: jest.fn().mockResolvedValue({
    questions: [
      { question: "What is a closure?", type: "Oral", skills: ["javascript"] },
    ],
  }),

  evaluateInterviewAnswer: jest.fn().mockResolvedValue({
    technicalScore: 80,
    confidenceScore: 75,
    feedback: "Good answer.",
    idealAnswer: "A closure is...",
  }),

  transcribeAudio: jest.fn().mockResolvedValue("mock transcription"),
};
