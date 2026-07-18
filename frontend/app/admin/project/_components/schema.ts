import { z } from "zod";

export const createProjectSchema = z.object({
    title: z.string().min(1, "Title is required").min(2, "Title must be at least 2 characters"),
    description: z.string().optional(),
    difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
    // Comma-separated in the form; converted to an array before submit.
    skills: z.string().optional(),
    requirements: z.string().optional(),
    githubTemplate: z.string().optional(),
    estimatedHours: z.coerce.number().positive("Must be a positive number"),
    careerRole: z.string().min(1, "Career role is required"),
    isActive: z.boolean().default(true),
});

export const updateProjectSchema = createProjectSchema;
