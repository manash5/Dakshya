"use server";
import { revalidatePath } from "next/cache";
import {
    startAttempt,
    getAttemptHistory,
    getAttemptById,
    submitAnswer,
    completeAttempt,
    deleteAttempt,
    transcribeAudio,
} from "@/lib/api/practiceAttempt";

export const handleStartAttempt = async (data: {
    jobRoleId: string;
    skill?: string;
    skills?: string[];
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
    skill,
    mode,
    difficulty,
}: {
    page?: number;
    limit?: number;
    jobRoleId?: string;
    skill?: string;
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
            skill,
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
            // Skill Planner/Roadmap read per-question scores as soon as they're
            // submitted (see backend skillPlanner.service.ts), not just on
            // attempt completion -- revalidate now so a skill flips to
            // "Practiced" without waiting for the whole session to finish.
            revalidatePath("/dashboard/planner");
            revalidatePath("/dashboard/progress");
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
            revalidatePath("/dashboard/practice");
            revalidatePath("/dashboard/planner");
            revalidatePath("/dashboard/progress");
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || "Failed to complete practice attempt" };
    } catch (error: any) {
        return { success: false, message: error?.message || "Failed to complete practice attempt" };
    }
};

export const handleDeleteAttempt = async (id: string) => {
    try {
        const result = await deleteAttempt(id);
        if (result.success) {
            revalidatePath("/dashboard/practice");
            revalidatePath("/dashboard/planner");
            revalidatePath("/dashboard/progress");
            return { success: true, message: result.message };
        }
        return { success: false, message: result.message || "Failed to delete practice attempt" };
    } catch (error: any) {
        return { success: false, message: error?.message || "Failed to delete practice attempt" };
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
