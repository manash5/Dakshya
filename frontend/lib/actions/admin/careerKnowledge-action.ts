"use server";
import { revalidatePath } from "next/cache";
import {
    getAllCareerKnowledgeAdmin,
    getCareerKnowledgeByRoleAdmin,
    generateCareerKnowledge,
    regenerateCareerKnowledge,
    deleteCareerKnowledge,
} from "@/lib/api/admin/careerKnowledge";

export const handleGetAllCareerKnowledgeAdmin = async ({
    page,
    limit,
    search,
}: { page?: number; limit?: number; search?: string } = {}) => {
    try {
        const currentPage = page && page > 0 ? page : 1;
        const currentLimit = limit && limit > 0 ? limit : 50;
        const result = await getAllCareerKnowledgeAdmin({ page: currentPage, limit: currentLimit, search });
        if (result.success) {
            return { success: true, message: result.message, data: result.data, pagination: result.meta };
        }
        return { success: false, message: result.message || "Failed to fetch career knowledge" };
    } catch (error: any) {
        return { success: false, message: error?.message || "Failed to fetch career knowledge" };
    }
};

export const handleGetCareerKnowledgeByRoleAdmin = async (jobRoleId: string) => {
    try {
        const result = await getCareerKnowledgeByRoleAdmin(jobRoleId);
        if (result.success) {
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || "Career knowledge not found" };
    } catch (error: any) {
        return { success: false, message: error?.message || "Career knowledge not found" };
    }
};

export const handleGenerateCareerKnowledge = async (jobRoleId: string) => {
    try {
        const result = await generateCareerKnowledge(jobRoleId);
        if (result.success) {
            revalidatePath("/admin/career-knowledge");
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || "Failed to generate career knowledge" };
    } catch (error: any) {
        return { success: false, message: error?.message || "Failed to generate career knowledge" };
    }
};

export const handleRegenerateCareerKnowledge = async (jobRoleId: string) => {
    try {
        const result = await regenerateCareerKnowledge(jobRoleId);
        if (result.success) {
            revalidatePath("/admin/career-knowledge");
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || "Failed to regenerate career knowledge" };
    } catch (error: any) {
        return { success: false, message: error?.message || "Failed to regenerate career knowledge" };
    }
};

export const handleDeleteCareerKnowledge = async (jobRoleId: string) => {
    try {
        const result = await deleteCareerKnowledge(jobRoleId);
        if (result.success) {
            revalidatePath("/admin/career-knowledge");
            return { success: true, message: result.message };
        }
        return { success: false, message: result.message || "Failed to delete career knowledge" };
    } catch (error: any) {
        return { success: false, message: error?.message || "Failed to delete career knowledge" };
    }
};
