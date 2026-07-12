"use server";
import { revalidatePath } from "next/cache";
import { getAllUniversities, createUniversity, deleteUniversity, getUniversityById, updateUniversity } from "@/lib/api/admin/university";

export const handleCreateUniversity = async (data: any) => {
    try {
        const result = await createUniversity(data);
        if (result.success) {
            revalidatePath("/admin/university");
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || 'University creation failed' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'University creation failed' };
    }
}

export const handleGetAllUniversities = async ({ page, limit, search }: { page?: number; limit?: number; search?: string }) => {
    try {
        const currentPage = page ? page > 0 ? page : 1 : 1;
        const currentLimit = limit ? limit > 0 ? limit : 10 : 10;
        const currentSearch = search || "";
        const result = await getAllUniversities({ page: currentPage, limit: currentLimit, search: currentSearch });
        if (result.success) {
            return { success: true, message: result.message, data: result.data, pagination: result.meta };
        }
        return { success: false, message: result.message || 'Failed to fetch universities' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to fetch universities' };
    }
}

export const handleGetUniversityById = async (id: string) => {
    try {
        const result = await getUniversityById(id);
        if (result.success) {
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || 'Failed to fetch university' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to fetch university' };
    }
}

export const handleUpdateUniversity = async (id: string, data: any) => {
    try {
        const result = await updateUniversity(id, data);
        if (result.success) {
            revalidatePath("/admin/university");
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || 'Failed to update university' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to update university' };
    }
}

export const handleDeleteUniversity = async (id: string) => {
    try {
        const result = await deleteUniversity(id);
        if (result.success) {
            revalidatePath("/admin/university");
            return { success: true, message: result.message };
        }
        return { success: false, message: result.message || 'Failed to delete university' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to delete university' };
    }
}
