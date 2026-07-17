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

      lastVisited: z.date().nullable().optional(),
    }),
  ),
});

export type CreateUserProgressDto = z.infer<typeof CreateUserProgressDto>;

export const UpdateUserProgressDto = CreateUserProgressDto.omit({
  userId: true,
}).partial();

export type UpdateUserProgressDto = z.infer<typeof UpdateUserProgressDto>;

// Response-only DTO. Folds what would otherwise be a separate
// UserRoadmapProgress collection into a computed view over the existing
// targetRoleProgress subdocument + that role's CareerKnowledge, instead of
// persisting a second, easy-to-desync copy of the same completion state.
export interface RoadmapProgressDto {
  jobRoleId: string;
  completedModules: number;
  totalModules: number;
  progressPercent: number;
  completedProjects: number;
  totalProjects: number;
  lastVisited: Date | null;
}

export const CompleteProjectDtoSchema = z.object({
  projectTitle: z.string().min(1, "projectTitle is required"),
  githubLink: z.string().url("githubLink must be a valid URL").optional(),
});

export type CompleteProjectDto = z.infer<typeof CompleteProjectDtoSchema>;

export const CompleteRoadmapStepDtoSchema = z.object({
  stepOrder: z.number().int().min(1, "stepOrder is required"),
});

export type CompleteRoadmapStepDto = z.infer<typeof CompleteRoadmapStepDtoSchema>;

export const MarkResourceWatchedDtoSchema = z.object({
  stepOrder: z.number().int().min(1, "stepOrder is required"),
  resourceUrl: z.string().url("resourceUrl must be a valid URL"),
});

export type MarkResourceWatchedDto = z.infer<typeof MarkResourceWatchedDtoSchema>;

export const SubmitSelfReportedSkillDtoSchema = z.object({
  skill: z.string().min(1, "skill is required"),
  description: z.string().min(1, "description is required"),
});

export type SubmitSelfReportedSkillDto = z.infer<typeof SubmitSelfReportedSkillDtoSchema>;
