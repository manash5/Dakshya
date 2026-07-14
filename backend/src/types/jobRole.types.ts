import { z } from "zod";


export const JobRoleSchema = z.object({
    title: z.string(),
    category: z.string(),
    description: z.string(),
    icon: z.string().optional(),
    isActive: z.boolean().default(true),
    keywords: z.array(z.string()).default([]),

});

export type JobRoleType = z.infer<typeof JobRoleSchema>; 