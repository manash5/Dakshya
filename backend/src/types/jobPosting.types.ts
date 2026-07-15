import { z } from "zod";

export const JobPostingSchema = z.object({
  title: z.string(),
  company: z.string().default("Unknown"),
  location: z.string().default("Nepal"),
  salary: z.string().default("Not disclosed"),
  experience: z.string().nullable().optional(),
  employmentType: z.string().nullable().optional(),
  requiredSkills: z.array(z.string()).default([]),
  description: z.string().default(""),
  // No longer assigned during scrape — jobs are stored role-agnostic and
  // matched to a user's target roles at query time (title/keyword match,
  // see jobPosting.repository.ts). Left optional for admin manual tagging.
  jobRole: z.string().nullable().optional(),
  applyLink: z.string(),
  source: z.string(),
  postedDate: z.string().nullable().optional(),
  expiresDate: z.coerce.date().nullable().optional(),
  isActive: z.boolean().default(true),
});

export type JobPostingType = z.infer<typeof JobPostingSchema>;
