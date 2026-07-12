import { z } from "zod";

export const createJobRoleSchema = z.object({
    title: z.string().min(1, "Title is required").min(2, "Title must be at least 2 characters"),
    category: z.string().min(1, "Category is required").min(2, "Category must be at least 2 characters"),
    description: z.string().optional(),
    isActive: z.boolean().default(true),
});

export const updateJobRoleSchema = createJobRoleSchema;
