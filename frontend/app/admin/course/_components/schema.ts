import { z } from "zod";

export const createCourseSchema = z.object({
    universityId: z.string().min(1, "University is required"),
    name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
    degree: z.enum(["Bachelor", "Master"], {
        error: () => "Degree is required",
    }),
    durationInSemesters: z.number().min(1, "Duration must be at least 1"),
    description: z.string().min(1, "Description is required").min(10, "Description must be at least 10 characters"),
    isActive: z.boolean().default(true),
});

export const updateCourseSchema = createCourseSchema;
