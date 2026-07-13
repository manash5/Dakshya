import { z } from "zod";

export const CreateUserProgressDto = z.object({
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

      completedProjects: z.array(
        z.object({
          projectTitle: z.string(),
          completedAt: z.date(),
        }),
      ),

      lastAnalyzed: z.date(),
    }),
  ),
});

export type CreateUserProgressDto = z.infer<typeof CreateUserProgressDto>;

export const UpdateUserProgressDto = CreateUserProgressDto.omit({
  userId: true,
}).partial();

export type UpdateUserProgressDto = z.infer<typeof UpdateUserProgressDto>;
