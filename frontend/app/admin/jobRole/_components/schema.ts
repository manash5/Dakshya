import { z } from "zod";

export const createJobRoleSchema = z.object({
    title: z.string().min(1, "Title is required").min(2, "Title must be at least 2 characters"),
    category: z.string().min(1, "Category is required").min(2, "Category must be at least 2 characters"),
    description: z.string().optional(),
    isActive: z.boolean().default(true),
    // Comma-separated in the form; converted to an array before submit.
    // Used by the job-posting scraper to widen title matching without AI —
    // e.g. for "Backend Developer", add "Backend Engineer, Software
    // Engineer Backend, API Developer" so postings phrased differently
    // still match.
    keywords: z.string().optional(),
});

export const updateJobRoleSchema = createJobRoleSchema;
