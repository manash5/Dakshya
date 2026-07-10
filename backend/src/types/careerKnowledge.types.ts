import { z } from "zod";

export const CareerKnowledgeSchema = z.object({
  jobRoleId: z.string(),
  careerDescription: z.string().trim(),
  requiredSkills: z.array(z.string()),
  tools: z.array(z.string()),
  frameworks: z.array(z.string()),
  certifications: z.array(z.string()),
  roadmap: z.array(
    z.object({
      order: z.number().positive(),

      title: z.string(),

      description: z.string(),

      estimatedWeeks: z.number().positive(),

      requiredSkills: z.array(z.string()),

      completionCriteria: z.string(),

      resources: z.array(z.string()),
    }),
  ),

  projects: z.array(
    z.object({
      title: z.string(),

      description: z.string(),

      difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),

      technologies: z.array(z.string()),

      estimatedHours: z.number().positive(),
    }),
  ),

  interviewGuide: z.object({
    commonTopics: z.array(z.string()),

    focusAreas: z.array(z.string()),

    interviewTips: z.array(z.string()),

    importantConcepts: z.array(z.string()),
  }),
  
  learningResources: z.array(
    z.object({
      title: z.string(),

      type: z.enum(["Course", "Documentation", "Video", "Article"]),

      url: z.string().url(),
    }),
  ),

  salary: z.object({
    min: z.number().positive(),

    max: z.number().positive(),

    currency: z.string(),
  }),

  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),

  futureDemand: z.enum(["Low", "Medium", "High", "Very High"]),

  marketTrend: z.object({
    trend: z.enum(["Growing", "Stable", "Declining"]),

    updatedAt: z.date(),
  }),

  estimatedCompletionMonths: z.number().positive(),
  averageReadinessScore: z.number().min(0).max(100),
  aiGeneratedDate: z.date(),
  lastUpdated: z.date(),
  aiVersion: z.string(),
  isUpdating: z.boolean().default(false),
});

export type CareerKnowledgeType = z.infer<typeof CareerKnowledgeSchema>;
