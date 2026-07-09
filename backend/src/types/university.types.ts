import { z } from "zod";


export const UniversitySchema = z.object({
    name: z.string(), 
    shortName: z.string(), 
    country: z.string(), 
    website: z.url(), 
    logo: z.string().optional(), 
    isActive: z.boolean().default(true)
}); 

export type UniversityType = z.infer<typeof UniversitySchema>; 