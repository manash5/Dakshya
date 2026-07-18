import { z } from "zod";

export const opportunitySchema = z.object({
    title: z.string().min(1, "Title is required"),
    organizer: z.string().optional(),
    category: z.string().optional(),
    location: z.string().optional(),
    eventDate: z.string().optional(),
    description: z.string().optional(),
    registrationLink: z.string().min(1, "Registration link is required"),
    source: z.string().min(1, "Source is required"),
    postedDate: z.string().optional(),
    isActive: z.boolean().default(true),
});
