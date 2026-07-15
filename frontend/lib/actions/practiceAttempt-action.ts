"use server";
import {
    startAttempt,
    getAttemptHistory,
    getAttemptById,
    submitAnswer,
    completeAttempt,
    transcribeAudio,
} from "@/lib/api/practiceAttempt";

export const handleStartAttempt = async (data: {
    jobRoleId: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    mode: "Oral" | "Coding" | "Mixed";
    questionCount: number;
}) => {
    try {
        const result = await startAttempt(data);
        if (result.success) {
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || "Failed to start practice attempt" };
    } catch (error: any) {
        return { success: false, message: error?.message || "Failed to start practice attempt" };
    }
};

export const handleGetAttemptHistory = async ({
    page,
    limit,
    jobRoleId,
    mode,
    difficulty,
}: {
    page?: number;
    limit?: number;
    jobRoleId?: string;
    mode?: string;
    difficulty?: string;
} = {}) => {
    try {
        const currentPage = page ? (page > 0 ? page : 1) : 1;
        const currentLimit = limit ? (limit > 0 ? limit : 10) : 10;
        const result = await getAttemptHistory({
            page: currentPage,
            limit: currentLimit,
            jobRoleId,
            mode,
            difficulty,
        });
        if (result.success) {
            return { success: true, message: result.message, data: result.data, pagination: result.meta };
        }
        return { success: false, message: result.message || "Failed to fetch practice attempt history" };
    } catch (error: any) {
        return { success: false, message: error?.message || "Failed to fetch practice attempt history" };
    }
};

export const handleGetAttemptById = async (id: string) => {
    try {
        const result = await getAttemptById(id);
        if (result.success) {
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || "Failed to fetch practice attempt" };
    } catch (error: any) {
        return { success: false, message: error?.message || "Failed to fetch practice attempt" };
    }
};

export const handleSubmitAnswer = async (
    id: string,
    data: { questionIndex: number; userAnswer?: string; userCode?: string | null },
) => {
    try {
        const result = await submitAnswer(id, data);
        if (result.success) {
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || "Failed to submit answer" };
    } catch (error: any) {
        return { success: false, message: error?.message || "Failed to submit answer" };
    }
};

export const handleCompleteAttempt = async (
    id: string,
    data: { feedback?: string; recommendations?: string[] } = {},
) => {
    try {
        const result = await completeAttempt(id, data);
        if (result.success) {
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || "Failed to complete practice attempt" };
    } catch (error: any) {
        return { success: false, message: error?.message || "Failed to complete practice attempt" };
    }
};

export const handleTranscribeAudio = async (formData: FormData) => {
    try {
        const result = await transcribeAudio(formData);
        if (result.success) {
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || "Failed to transcribe audio" };
    } catch (error: any) {
        return { success: false, message: error?.message || "Failed to transcribe audio" };
    }
};
