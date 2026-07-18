"use server";
import {
    analyzeResume,
    deleteResumeAnalysis,
    getLatestResumeAnalysis,
    getResumeAnalysisById,
    getResumeHistory,
} from "@/lib/api/resumeAnalysis";

export const handleAnalyzeResume = async (formData: FormData) => {
    try {
        const result = await analyzeResume(formData);
        if (result.success) {
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || "Failed to analyze resume" };
    } catch (error: any) {
        return { success: false, message: error?.message || "Failed to analyze resume" };
    }
};

export const handleGetResumeHistory = async ({
    page,
    limit,
}: { page?: number; limit?: number } = {}) => {
    try {
        const currentPage = page ? (page > 0 ? page : 1) : 1;
        const currentLimit = limit ? (limit > 0 ? limit : 10) : 10;
        const result = await getResumeHistory({ page: currentPage, limit: currentLimit });
        if (result.success) {
            return { success: true, message: result.message, data: result.data, pagination: result.meta };
        }
        return { success: false, message: result.message || "Failed to fetch resume analysis history" };
    } catch (error: any) {
        return { success: false, message: error?.message || "Failed to fetch resume analysis history" };
    }
};

export const handleGetLatestResumeAnalysis = async () => {
    try {
        const result = await getLatestResumeAnalysis();
        if (result.success) {
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || "No resume analysis found" };
    } catch (error: any) {
        return { success: false, message: error?.message || "No resume analysis found" };
    }
};

export const handleGetResumeAnalysisById = async (id: string) => {
    try {
        const result = await getResumeAnalysisById(id);
        if (result.success) {
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || "Failed to fetch resume analysis" };
    } catch (error: any) {
        return { success: false, message: error?.message || "Failed to fetch resume analysis" };
    }
};

export const handleDeleteResumeAnalysis = async (id: string) => {
    try {
        const result = await deleteResumeAnalysis(id);
        if (result.success) {
            return { success: true, message: result.message };
        }
        return { success: false, message: result.message || "Failed to delete resume analysis" };
    } catch (error: any) {
        return { success: false, message: error?.message || "Failed to delete resume analysis" };
    }
};
