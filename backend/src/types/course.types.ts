import { z } from "zod";


export const CourseSchema = z.object({
    universityId: z.string(), 
    name: z.string(), 
    degree: z.enum([
            "Bachelor",
            "Master",
        ]),  
    durationInSemesters: z.number().int().positive(), 
    description: z.string(), 
    isActive: z.boolean().default(true)
})

export type CourseType = z.infer<typeof CourseSchema>; 