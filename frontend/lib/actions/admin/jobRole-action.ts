"use server";
import { revalidatePath } from "next/cache";
import { getAllJobRoles, createJobRole, deleteJobRole, getJobRoleById, updateJobRole } from "@/lib/api/admin/jobRole";

export const handleCreateJobRole = async (data: any) => {
    try {
        const result = await createJobRole(data);
        if (result.success) {
            revalidatePath("/admin/jobs");
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || 'Job role creation failed' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Job role creation failed' };
    }
}

export const handleGetAllJobRoles = async ({ page, limit, search }: { page?: number; limit?: number; search?: string }) => {
    try {
        const currentPage = page ? page > 0 ? page : 1 : 1;
        const currentLimit = limit ? limit > 0 ? limit : 10 : 10;
        const currentSearch = search || "";
        const result = await getAllJobRoles({ page: currentPage, limit: currentLimit, search: currentSearch });
        if (result.success) {
            return { success: true, message: result.message, data: result.data, pagination: result.meta };
        }
        return { success: false, message: result.message || 'Failed to fetch job roles' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to fetch job roles' };
    }
}

export const handleGetJobRoleById = async (id: string) => {
    try {
        const result = await getJobRoleById(id);
        if (result.success) {
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || 'Failed to fetch job role' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to fetch job role' };
    }
}

export const handleUpdateJobRole = async (id: string, data: any) => {
    try {
        const result = await updateJobRole(id, data);
        if (result.success) {
            revalidatePath("/admin/jobs");
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || 'Failed to update job role' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to update job role' };
    }
}

export const handleDeleteJobRole = async (id: string) => {
    try {
        const result = await deleteJobRole(id);
        if (result.success) {
            revalidatePath("/admin/jobs");
            return { success: true, message: result.message };
        }
        return { success: false, message: result.message || 'Failed to delete job role' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to delete job role' };
    }
}
