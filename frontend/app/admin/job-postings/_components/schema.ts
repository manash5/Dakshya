import { z } from "zod";

export const updateJobPostingSchema = z.object({
    title: z.string().min(1, "Title is required"),
    company: z.string().min(1, "Company is required"),
    location: z.string().min(1, "Location is required"),
    salary: z.string().min(1, "Salary is required"),
    experience: z.string().optional(),
    employmentType: z.string().optional(),
    requiredSkills: z.string().optional(),
    description: z.string().optional(),
    applyLink: z.string().min(1, "Apply link is required"),
    source: z.string().min(1, "Source is required"),
    isActive: z.boolean().default(true),
});
