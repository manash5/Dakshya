// Seed data for every admin-managed catalog resource. Kept as plain, JSON-safe
// objects so the mock server can deep-clone them back to a pristine state
// between tests without re-importing modules.

export const jobRoles: any[] = [
    {
        _id: "role-frontend",
        title: "Frontend Developer",
        category: "Software Engineering",
        description: "Builds user-facing web applications.",
        isActive: true,
        keywords: "Frontend Engineer, UI Developer",
    },
    {
        _id: "role-backend",
        title: "Backend Developer",
        category: "Software Engineering",
        description: "Builds and maintains server-side APIs.",
        isActive: true,
        keywords: "Backend Engineer, API Developer",
    },
];

export const universities: any[] = [
    {
        _id: "univ-1",
        name: "Softwarica College of IT & E-Commerce",
        shortName: "Softwarica",
        country: "Nepal",
        website: "https://softwarica.edu.np",
        isActive: true,
    },
    {
        _id: "univ-2",
        name: "Islington College",
        shortName: "Islington",
        country: "Nepal",
        website: "https://islington.edu.np",
        isActive: true,
    },
];

export const courses: any[] = [
    {
        _id: "course-1",
        universityId: "univ-1",
        name: "BSc (Hons) Computer Science",
        degree: "Bachelor",
        durationInSemesters: 8,
        description: "Undergraduate computer science degree.",
        isActive: true,
    },
];

export const subjects: any[] = [
    {
        _id: "subject-1",
        courseId: "course-1",
        semester: 1,
        code: "ST4060CEM",
        name: "Introduction to Programming",
        credits: 15,
        description: "Fundamentals of programming.",
        skills: ["JavaScript"],
    },
];

export const jobPostings: any[] = [
    {
        _id: "posting-1",
        title: "Frontend Developer",
        company: "Acme Corp",
        location: "Kathmandu, Nepal",
        salary: "NPR 60,000 - 90,000",
        experience: "1-2 years",
        employmentType: "Full-time",
        requiredSkills: ["React", "TypeScript"],
        description: "Work on our design system.",
        applyLink: "https://example.com/apply/1",
        source: "manual",
        jobRoleId: "role-frontend",
        isActive: true,
    },
    {
        _id: "posting-2",
        title: "Backend Developer",
        company: "Beta Systems",
        location: "Pokhara, Nepal",
        salary: "NPR 70,000 - 100,000",
        experience: "2-3 years",
        employmentType: "Full-time",
        requiredSkills: ["Node.js", "MongoDB"],
        description: "Own our core REST API.",
        applyLink: "https://example.com/apply/2",
        source: "manual",
        jobRoleId: "role-backend",
        isActive: true,
    },
];

export const opportunities: any[] = [
    {
        _id: "opportunity-1",
        title: "National Hackathon 2026",
        organizer: "Tech Nepal",
        category: "Hackathon",
        location: "Online",
        eventDate: "Aug 15, 2026",
        source: "admin",
        postedDate: "Jul 1, 2026",
        registrationLink: "https://example.com/register",
        description: "48-hour national hackathon.",
        jobRoles: ["role-frontend", "role-backend"],
        isActive: true,
    },
];

export const projects: any[] = [
    {
        _id: "project-1",
        title: "Personal Portfolio Site",
        description: "Build and deploy a personal portfolio.",
        difficulty: "Beginner",
        skills: ["HTML", "CSS", "JavaScript"],
        requirements: "Basic web fundamentals",
        githubTemplate: "https://github.com/example/portfolio-template",
        estimatedHours: 10,
        careerRole: "role-frontend",
        isActive: true,
    },
    {
        _id: "project-2",
        title: "REST API with Auth",
        description: "Build a REST API with JWT auth.",
        difficulty: "Intermediate",
        skills: ["Node.js", "Express", "MongoDB"],
        requirements: "Basic backend fundamentals",
        githubTemplate: "https://github.com/example/api-template",
        estimatedHours: 20,
        careerRole: "role-backend",
        isActive: true,
    },
];

export const careerKnowledge: any[] = [
    {
        _id: "ck-frontend",
        jobRoleId: "role-frontend",
        aiGeneratedDate: "2026-06-01T00:00:00.000Z",
        summary: "Frontend developers build the visual layer of applications.",
    },
];

export const users: any[] = [
    {
        _id: "user-1",
        firstName: "Test",
        lastName: "Student",
        email: "student@example.com",
        username: "teststudent",
        role: "user",
        phoneNumber: "9800000000",
        isActive: true,
    },
    {
        _id: "user-admin",
        firstName: "Admin",
        lastName: "User",
        email: "admin@example.com",
        username: "adminuser",
        role: "admin",
        phoneNumber: "9800000001",
        isActive: true,
    },
];
