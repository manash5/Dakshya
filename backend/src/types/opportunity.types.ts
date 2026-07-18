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
  // Which of the platform's job roles this event is relevant to, assigned
  // by an AI classification step at scrape/admin-create time -- empty means
  // general/open to everyone rather than "not yet classified".
  jobRoles: z.array(z.string()).default([]),
});

export type OpportunityType = z.infer<typeof OpportunitySchema>;
