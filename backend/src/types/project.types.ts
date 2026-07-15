import { z } from "zod";

export const ProjectSchema = z.object({
  title: z.string(),
  description: z.string().default(""),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  skills: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  githubTemplate: z.string().nullable().optional(),
  estimatedHours: z.number().positive(),
  careerRole: z.string(),
  isActive: z.boolean().default(true),
});

export type ProjectType = z.infer<typeof ProjectSchema>;
