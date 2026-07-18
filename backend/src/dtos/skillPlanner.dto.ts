import { z } from "zod";
import { RoadmapProgressDto } from "./userProgress.dto";

export const GenerateSkillResourcesDtoSchema = z.object({
  skill: z.string().min(1, "skill is required"),
});

export type GenerateSkillResourcesDto = z.infer<typeof GenerateSkillResourcesDtoSchema>;

// Response-only DTOs for the Skill Planner aggregator. Everything here is
// computed on read from existing collections (UserProgress, CareerKnowledge,
// Subject, ResumeAnalysis, Project, PracticeAttempt) -- there is no
// persisted "skill planner" or "user skill" document anywhere.

export type SkillStatus =
  | "Locked"
  | "Upcoming"
  | "Learning"
  | "Practiced"
  | "ProjectApplied"
  | "InterviewReady"
  | "Mastered";

export type SkillSourceTag = "curriculum" | "resume" | "project" | "practice" | "selfReported";

export interface SkillPlannerSkillDto {
  skill: string; // lowercased canonical key
  displayName: string; // original casing, first-seen in CareerKnowledge
  status: SkillStatus;
  proficiency: number; // 0-100, heuristic when no practice score exists
  gapPercent: number; // 100 - proficiency
  gapSeverity: "low" | "high";
  sources: SkillSourceTag[];
  curriculum: {
    taught: boolean;
    semester: number | null;
    isPast: boolean;
  };
  practice: {
    attempted: boolean;
    bestScore: number | null;
    attemptCount: number;
  };
  project: {
    applied: boolean;
    projectTitles: string[];
  };
  resources: SkillPlannerResourceDto[];
}

export interface SkillPlannerRoadmapStepDto {
  order: number;
  title: string;
  description: string;
  estimatedWeeks: number;
  startWeek: number;
  requiredSkills: string[];
  completionCriteria: string;
  resources: string[];
  status: "done" | "current" | "locked";
  completedAt: Date | null;
  watchedResourceUrls: string[];
}

export interface SkillPlannerResourceDto {
  title: string;
  type: "Course" | "Documentation" | "Video" | "Article";
  url: string;
  skills: string[];
}

export interface SkillPlannerRoleDto {
  jobRoleId: string;
  jobRole: string;
  category: string;
}

export interface SkillPlannerDto {
  role: SkillPlannerRoleDto;
  hasCareerKnowledge: boolean;
  readinessScore: number;
  readinessLabel: string;
  requiredSkillsCount: number;
  matchedSkillsCount: number;
  skills: SkillPlannerSkillDto[];
  degreeVsMarket: {
    curriculumCoverage: number; // % of required skills the curriculum teaches at all
    coveredByDegree: string[];
    notCoveredByDegree: string[];
  };
  roadmap: SkillPlannerRoadmapStepDto[];
  roadmapProgress: RoadmapProgressDto;
  resources: SkillPlannerResourceDto[];
  market: {
    salary: { min: number; max: number; currency: string } | null;
    marketTrend: string | null;
    futureDemand: string | null;
    difficulty: string | null;
  };
  lastVisited: Date | null;
}
