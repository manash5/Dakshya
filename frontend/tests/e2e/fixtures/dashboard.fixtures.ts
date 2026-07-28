// Seed data for GET /api/v1/dashboard/career (dashboard landing, planner,
// practice, and job-finder pages all fetch this first for the user's target
// roles / readiness scores).

export const careerDashboard: any = {
    hero: [
        {
            jobRoleId: "role-frontend",
            jobRole: "Frontend Developer",
            readinessScore: 62,
            readinessLabel: "Above Average",
            missingSkills: ["TypeScript", "GraphQL", "Testing"],
        },
        {
            jobRoleId: "role-backend",
            jobRole: "Backend Developer",
            readinessScore: 48,
            readinessLabel: "Average",
            missingSkills: ["Docker", "System Design"],
        },
    ],
    marketPulse: {
        totalJobs: 2,
        skills: [
            { skill: "React", jobCount: 1 },
            { skill: "Node.js", jobCount: 1 },
        ],
    },
    salaryRange: {
        min: 40000,
        max: 90000,
        currency: "NPR",
        formatted: "NPR 40k - 90k",
        jobRole: "Frontend Developer",
        levelLabel: "Mid Level",
    },
};
