import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export interface CareerHero {
    jobRoleId: string;
    jobRole: string;
    readinessScore: number;
    readinessLabel: string;
    missingSkills: string[];
}

export interface SkillDemand {
    skill: string;
    // How many of totalJobs (below) require this skill.
    jobCount: number;
}

export interface MarketPulse {
    // Size of the combined live-posting pool across every target role at once.
    totalJobs: number;
    // The user's acquired skills, sorted by jobCount descending.
    skills: SkillDemand[];
}

export interface SalaryRange {
    min: number | null;
    max: number | null;
    currency: string | null;
    formatted: string;
    jobRole: string | null;
    levelLabel: string | null;
}

export interface CareerDashboard {
    hero: CareerHero[];
    marketPulse: MarketPulse;
    salaryRange: SalaryRange;
}

export const getCareerDashboard = async () => {
    try {
        const response = await axiosInstance.get(API.DASHBOARD.CAREER);
        return response.data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message || "Failed to fetch career dashboard"
        );
    }
}
