import { z } from "zod";

export const OpportunitySchema = z.object({
  title: z.string(),
  organizer: z.string().default("Unknown"),
  category: z.string().nullable().optional(),
  location: z.string().default("Nepal"),
  eventDate: z.string().nullable().optional(),
  description: z.string().default(""),
  registrationLink: z.string(),
  source: z.string(),
  postedDate: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

export type OpportunityType = z.infer<typeof OpportunitySchema>;
