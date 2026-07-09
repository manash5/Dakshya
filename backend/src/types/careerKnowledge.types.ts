import { z } from "zod";


export const CareerKnowledgeSchema = z.object({
    jobRoleId: z.string(), 
    aiModel: z.string().optional(), 
    skills: z.array(z.string()), 
    roadmap: z.array(
                z.object({
                    title: z.string(),
                    description: z.string()

                })
            ), 
    projects: z.array(
                z.object({
                    title: z.string(),
                    difficulty: z.enum([
                        "Beginner",
                        "Intermediate",
                        "Advanced"
                    ]),
                    description: z.string()
                })
            ), 
    interviewTopics: z.string()
}); 

export type CareerKnowlegeType = z.infer<typeof CareerKnowledgeSchema>; 