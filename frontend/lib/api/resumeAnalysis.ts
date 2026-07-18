import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export interface ResumeProject {
    title: string;
    description: string;
    technologies: string[];
}

export interface ResumeExperience {
    title: string;
    company: string;
    duration: string;
    description: string;
}

export interface ResumeEducation {
    institution: string;
    degree: string;
    fieldOfStudy: string | null;
    duration: string | null;
}

export interface ResumeComparison {
    improvements: string[];
    regressions: string[];
    newSkills: string[];
    summary: string;
}

export interface ResumeAnalysis {
    _id: string;
    userId: string;
    resumeUrl: string;
    originalFileName: string;
    candidateNameOnResume: string | null;
    identityMatch: boolean;
    identityReason: string;
    skills: string[];
    projects: ResumeProject[];
    experience: ResumeExperience[];
    education: ResumeEducation[];
    strengths: string[];
    weaknesses: string[];
    atsScore: number;
    recommendations: string[];
    comparedToPreviousId: string | null;
    comparison: ResumeComparison | null;
    createdAt: string;
    updatedAt: string;
}

export const analyzeResume = async (formData: FormData) => {
    try {
        const response = await axiosInstance.post(API.RESUME_ANALYSIS.ANALYZE, formData, {
            headers: {
                "Content-Type": "multipart/form-data", // for multer
            },
        });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || "Failed to analyze resume");
    }
};

export const getResumeHistory = async (params: { page?: number; limit?: number }) => {
    try {
        const response = await axiosInstance.get(API.RESUME_ANALYSIS.GET_ALL, { params });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || "Failed to fetch resume analysis history");
    }
};

export const getLatestResumeAnalysis = async () => {
    try {
        const response = await axiosInstance.get(API.RESUME_ANALYSIS.GET_LATEST);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || "Failed to fetch latest resume analysis");
    }
};

export const getResumeAnalysisById = async (id: string) => {
    try {
        const response = await axiosInstance.get(API.RESUME_ANALYSIS.GET_BY_ID(id));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || "Failed to fetch resume analysis");
    }
};

export const deleteResumeAnalysis = async (id: string) => {
    try {
        const response = await axiosInstance.delete(API.RESUME_ANALYSIS.DELETE(id));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || "Failed to delete resume analysis");
    }
};
