import { z } from "zod";

export const createUniversitySchema = z.object({
    name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
    shortName: z.string().min(1, "Short name is required").min(1, "Short name must be at least 1 character"),
    country: z.string().optional(),
    website: z.string().url("Invalid URL").optional().or(z.literal("")),
    logo: z.instanceof(File).optional(),
    isActive: z.boolean().default(true),
});

export const updateUniversitySchema = createUniversitySchema;

const DEGREES = ["Bachelor", "Master"] as const;



export const createSubjectSchema = z.object({
    courseId: z.string().min(1, "Course is required"),
    semester: z.number().min(1, "Semester must be at least 1"),
    code: z.string().min(1, "Code is required").min(2, "Code must be at least 2 characters"),
    name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
    credits: z.number().min(1, "Credits must be at least 1"),
    description: z.string().optional(),
    skills: z.array(z.string()).optional(),
    isActive: z.boolean().default(true),
});

export const updateSubjectSchema = createSubjectSchema;

export const createJobRoleSchema = z.object({
    title: z.string().min(1, "Title is required").min(2, "Title must be at least 2 characters"),
    category: z.string().min(1, "Category is required").min(2, "Category must be at least 2 characters"),
    description: z.string().optional(),
    icon: z.instanceof(File).optional(),
    isActive: z.boolean().default(true),
});

export const updateJobRoleSchema = createJobRoleSchema;
