import { z } from "zod";

export const UserProgressSchema = z.object({
  userId: z.string(),

  currentSemester: z.number().int().positive(),

  completedSubjects: z.array(
    z.object({
      subjectId: z.string(),
      completedAt: z.date(),
      grade: z.string().optional(),
    }),
  ),

  acquiredSkills: z.array(
    z.object({
      skill: z.string(),
      lastUpdated: z.date(),
    }),
  ),

  targetRoleProgress: z.array(
    z.object({
      jobRoleId: z.string(),

      readinessScore: z.number().min(0).max(100),

      missingSkills: z.array(z.string()),

      completedRoadmapSteps: z.array(
        z.object({
          stepOrder: z.number().int().positive(),
          completedAt: z.date(),
        }),
      ),

      roadmapStepProgress: z.array(
        z.object({
          stepOrder: z.number().int().positive(),
          watchedResourceUrls: z.array(z.string()),
        }),
      ),

      selfReportedSkills: z.array(
        z.object({
          skill: z.string(),
          description: z.string(),
          reportedAt: z.date(),
        }),
      ),

      completedProjects: z.array(
        z.object({
          projectTitle: z.string(),
          completedAt: z.date(),
          githubLink: z.string().nullable().optional(),
        }),
      ),

      lastAnalyzed: z.date(),

      lastVisited: z.date().nullable().optional(),
    }),
  ),
});

export type UserProgressType = z.infer<typeof UserProgressSchema>;
