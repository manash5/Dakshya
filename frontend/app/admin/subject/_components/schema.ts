import { z } from "zod";

export const createSubjectSchema = z.object({
    courseId: z.string().min(1, "Course is required"),
    semester: z.number().min(1, "Semester must be at least 1"),
    code: z.string().min(1, "Code is required").min(2, "Code must be at least 2 characters"),
    name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
    credits: z.number().min(1, "Credits must be at least 1"),
    description: z.string().optional(),
    skills: z.array(z.string()).optional(),
});

export const updateSubjectSchema = createSubjectSchema;
