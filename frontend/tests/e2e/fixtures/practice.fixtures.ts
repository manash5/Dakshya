// Seed + builder helpers for the practice-attempt endpoints. The mock server
// keeps started attempts in memory (see mock-server/server.ts) so submit/
// complete calls can mutate the same object a test started, mirroring the
// real flow.

export const seedAttemptHistory: any[] = [
    {
        _id: "attempt-history-1",
        userId: "user-1",
        jobRoleId: { _id: "role-frontend", title: "Frontend Developer", category: "Software Engineering" },
        skill: null,
        skills: [],
        difficulty: "Intermediate",
        mode: "Oral",
        questionCount: 2,
        startedAt: "2026-07-20T09:00:00.000Z",
        completedAt: "2026-07-20T09:20:00.000Z",
        duration: 1200,
        overallScore: 78,
        technicalScore: 80,
        communicationScore: 76,
        feedback: "Solid understanding of core concepts.",
        recommendations: ["Review advanced TypeScript generics"],
        questions: [
            {
                question: "Explain the virtual DOM.",
                type: "oral",
                skills: ["React"],
                expectedAnswer: "A lightweight in-memory representation of the real DOM.",
                userAnswer: "It's a copy of the DOM kept in memory to diff changes efficiently.",
                userCode: "",
                score: 80,
                confidenceScore: 75,
                feedback: "Good explanation.",
            },
        ],
        createdAt: "2026-07-20T09:00:00.000Z",
        updatedAt: "2026-07-20T09:20:00.000Z",
    },
];

export function buildQuestions(mode: string | undefined, questionCount: number | undefined): any[] {
    const bank = [
        { question: "Explain the virtual DOM and why React uses it.", type: "oral", skills: ["React"] },
        { question: "What is the difference between let, const, and var?", type: "oral", skills: ["JavaScript"] },
        { question: "Write a function that reverses a string.", type: "coding", skills: ["JavaScript"] },
        { question: "Explain the box model in CSS.", type: "oral", skills: ["CSS"] },
        { question: "Write a function that returns the nth Fibonacci number.", type: "coding", skills: ["JavaScript"] },
    ];
    const filtered = mode === "Coding"
        ? bank.filter((q) => q.type === "coding")
        : mode === "Oral"
            ? bank.filter((q) => q.type === "oral")
            : bank;
    const count = Math.max(1, Math.min(questionCount || 3, filtered.length || bank.length));
    const source = filtered.length ? filtered : bank;
    return Array.from({ length: count }, (_, i) => ({
        ...source[i % source.length],
        expectedAnswer: "",
        userAnswer: "",
        userCode: "",
        score: 0,
        confidenceScore: 0,
        feedback: "",
    }));
}
