import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export interface CareerHero {
    jobRoleId: string;
    jobRole: string;
    readinessScore: number;
    readinessLabel: string;
    missingSkills: string[];
}

export interface MarketPulse {
    jobRoleId: string;
    jobRole: string;
    jobCount: number;
    topLocations: string[];
    topCompanies: string[];
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
    marketPulse: MarketPulse[];
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
