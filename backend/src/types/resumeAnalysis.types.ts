import { z } from "zod";

export const ResumeProjectSchema = z.object({
  title: z.string(),
  description: z.string().default(""),
  technologies: z.array(z.string()).default([]),
});

export const ResumeExperienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  duration: z.string().default(""),
  description: z.string().default(""),
});

export const ResumeEducationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  fieldOfStudy: z.string().nullable().optional(),
  duration: z.string().nullable().optional(),
});

export const ResumeComparisonSchema = z.object({
  improvements: z.array(z.string()).default([]),
  regressions: z.array(z.string()).default([]),
  newSkills: z.array(z.string()).default([]),
  summary: z.string().default(""),
});

export const ResumeAnalysisSchema = z.object({
  userId: z.string(),
  resumeUrl: z.string(),
  originalFileName: z.string(),
  candidateNameOnResume: z.string().nullable().optional(),
  // Whether the AI judged this resume to belong to the account holder.
  // Comparison against a previous analysis only happens when this is true.
  identityMatch: z.boolean(),
  identityReason: z.string().default(""),
  skills: z.array(z.string()).default([]),
  projects: z.array(ResumeProjectSchema).default([]),
  experience: z.array(ResumeExperienceSchema).default([]),
  education: z.array(ResumeEducationSchema).default([]),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  atsScore: z.number().min(0).max(100),
  recommendations: z.array(z.string()).default([]),
  comparedToPreviousId: z.string().nullable().optional(),
  comparison: ResumeComparisonSchema.nullable().optional(),
});

export type ResumeAnalysisType = z.infer<typeof ResumeAnalysisSchema>;
