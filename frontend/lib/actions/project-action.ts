"use server";
import { getAllProjects, getProjectById } from "@/lib/api/project";

export const handleGetAllProjects = async ({
    page,
    limit,
    careerRole,
    difficulty,
    search,
}: {
    page?: number;
    limit?: number;
    careerRole?: string;
    difficulty?: string;
    search?: string;
} = {}) => {
    try {
        const currentPage = page ? (page > 0 ? page : 1) : 1;
        const currentLimit = limit ? (limit > 0 ? limit : 10) : 10;
        const result = await getAllProjects({
            page: currentPage,
            limit: currentLimit,
            careerRole,
            difficulty,
            search,
        });
        if (result.success) {
            return { success: true, message: result.message, data: result.data, pagination: result.meta };
        }
        return { success: false, message: result.message || "Failed to fetch projects" };
    } catch (error: any) {
        return { success: false, message: error?.message || "Failed to fetch projects" };
    }
};

export const handleGetProjectById = async (id: string) => {
    try {
        const result = await getProjectById(id);
        if (result.success) {
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || "Failed to fetch project" };
    } catch (error: any) {
        return { success: false, message: error?.message || "Failed to fetch project" };
    }
};
