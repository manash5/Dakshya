import { z } from "zod";

export const SubjectSchema = z.object({
    courseId: z.string().optional(), 
    semester: z.number().int().positive(), 
    code: z.string(), 
    name: z.string(), 
    credits: z.number().int().positive(),
    description: z.string(), 
    skills: z.array(z.string()) 
})

export type SubjectType = z.infer<typeof SubjectSchema>; 