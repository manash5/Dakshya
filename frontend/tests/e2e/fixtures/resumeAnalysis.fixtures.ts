export const seedAnalysisHistory: any[] = [
    {
        _id: "resume-analysis-1",
        userId: "user-1",
        resumeUrl: "/uploads/resumes/seed-resume.pdf",
        originalFileName: "Test_Student_Resume.pdf",
        candidateNameOnResume: "Test Student",
        identityMatch: true,
        identityReason: "Name on resume matches account name",
        skills: ["React", "Node.js", "MongoDB"],
        projects: [
            { title: "Portfolio Site", description: "Personal site built with Next.js", technologies: ["Next.js", "Tailwind"] },
        ],
        experience: [
            { title: "Intern", company: "Acme Inc", duration: "Jun 2025 - Aug 2025", description: "Built internal tools" },
        ],
        education: [
            { institution: "Softwarica College", degree: "BSc (Hons) Computing", fieldOfStudy: "Computer Science", duration: "2023 - 2027" },
        ],
        strengths: ["Strong project portfolio", "Clear formatting"],
        weaknesses: ["No quantified achievements", "Missing certifications section"],
        atsScore: 74,
        recommendations: ["Add metrics to experience bullet points", "Include a skills summary section"],
        comparedToPreviousId: null,
        comparison: null,
        createdAt: "2026-07-20T08:00:00.000Z",
        updatedAt: "2026-07-20T08:00:00.000Z",
    },
];

export function buildAnalysisResult(fileName: string | undefined): any {
    return {
        _id: `resume-analysis-${Date.now()}`,
        userId: "user-1",
        resumeUrl: "/uploads/resumes/new-upload.pdf",
        originalFileName: fileName || "resume.pdf",
        candidateNameOnResume: "Test Student",
        identityMatch: true,
        identityReason: "Name on resume matches account name",
        skills: ["React", "Node.js", "MongoDB", "TypeScript"],
        projects: [
            { title: "Portfolio Site", description: "Personal site built with Next.js", technologies: ["Next.js", "Tailwind"] },
        ],
        experience: [
            { title: "Intern", company: "Acme Inc", duration: "Jun 2025 - Aug 2025", description: "Built internal tools" },
        ],
        education: [
            { institution: "Softwarica College", degree: "BSc (Hons) Computing", fieldOfStudy: "Computer Science", duration: "2023 - 2027" },
        ],
        strengths: ["Strong project portfolio", "Clear formatting"],
        weaknesses: ["No quantified achievements"],
        atsScore: 80,
        recommendations: ["Add metrics to experience bullet points"],
        comparedToPreviousId: "resume-analysis-1",
        comparison: {
            improvements: ["Added TypeScript to skills"],
            regressions: [],
            newSkills: ["TypeScript"],
            summary: "Your resume shows solid improvement since last upload.",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}
