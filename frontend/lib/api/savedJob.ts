import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export interface SavedJobPosting {
    _id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    experience: string | null;
    employmentType: string | null;
    requiredSkills: string[];
    description: string;
    jobRole: string | null;
    applyLink: string;
    source: string;
    postedDate: string | null;
    expiresDate: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface SavedJob {
    _id: string;
    userId: string;
    jobPostingId: SavedJobPosting;
    savedAt: string;
    createdAt: string;
    updatedAt: string;
}

export const saveJob = async (jobPostingId: string) => {
    try {
        const response = await axiosInstance.post(API.SAVED_JOB.SAVE, { jobPostingId });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || "Failed to save job");
    }
};

export const getSavedJobs = async (params: { page?: number; limit?: number }) => {
    try {
        const response = await axiosInstance.get(API.SAVED_JOB.GET_ALL, { params });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || "Failed to fetch saved jobs");
    }
};

export const unsaveJob = async (jobPostingId: string) => {
    try {
        const response = await axiosInstance.delete(API.SAVED_JOB.UNSAVE(jobPostingId));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || "Failed to unsave job");
    }
};
