import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export type SkillStatus =
    | "Locked"
    | "Upcoming"
    | "Learning"
    | "Practiced"
    | "ProjectApplied"
    | "InterviewReady"
    | "Mastered";

export type SkillSourceTag = "curriculum" | "resume" | "project" | "practice";

export interface SkillPlannerSkill {
    skill: string;
    displayName: string;
    status: SkillStatus;
    proficiency: number;
    gapPercent: number;
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
    resources: SkillPlannerResource[];
}

export interface SkillPlannerRoadmapStep {
    order: number;
    title: string;
    description: string;
    estimatedWeeks: number;
    startWeek: number;
    requiredSkills: string[];
    completionCriteria: string;
    resources: string[];
    status: "done" | "current" | "locked";
    completedAt: string | null;
}

export interface SkillPlannerResource {
    title: string;
    type: "Course" | "Documentation" | "Video" | "Article";
    url: string;
    skills: string[];
}

export interface SkillPlannerRole {
    jobRoleId: string;
    jobRole: string;
    category: string;
}

export interface RoadmapProgress {
    jobRoleId: string;
    completedModules: number;
    totalModules: number;
    progressPercent: number;
    completedProjects: number;
    totalProjects: number;
    lastVisited: string | null;
}

export interface SkillPlanner {
    role: SkillPlannerRole;
    hasCareerKnowledge: boolean;
    readinessScore: number;
    readinessLabel: string;
    requiredSkillsCount: number;
    matchedSkillsCount: number;
    skills: SkillPlannerSkill[];
    degreeVsMarket: {
        curriculumCoverage: number;
        coveredByDegree: string[];
        notCoveredByDegree: string[];
    };
    roadmap: SkillPlannerRoadmapStep[];
    roadmapProgress: RoadmapProgress;
    resources: SkillPlannerResource[];
    market: {
        salary: { min: number; max: number; currency: string } | null;
        marketTrend: string | null;
        futureDemand: string | null;
        difficulty: string | null;
    };
    lastVisited: string | null;
}

export const getSkillPlanner = async (jobRoleId: string) => {
    try {
        const response = await axiosInstance.get(API.SKILL_PLANNER.GET_BY_ROLE(jobRoleId));
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to fetch skill planner");
    }
};
