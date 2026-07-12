"use server";
import { revalidatePath } from "next/cache";
import { getAllSubjects, createSubject, deleteSubject, getSubjectById, updateSubject, getSubjectsByCourse } from "@/lib/api/admin/subject";

export const handleCreateSubject = async (data: any) => {
    try {
        const result = await createSubject(data);
        if (result.success) {
            revalidatePath("/admin/subject");
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || 'Subject creation failed' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Subject creation failed' };
    }
}

export const handleGetAllSubjects = async ({ page, limit, search }: { page?: number; limit?: number; search?: string }) => {
    try {
        const currentPage = page ? page > 0 ? page : 1 : 1;
        const currentLimit = limit ? limit > 0 ? limit : 10 : 10;
        const currentSearch = search || "";
        const result = await getAllSubjects({ page: currentPage, limit: currentLimit, search: currentSearch });
        if (result.success) {
            return { success: true, message: result.message, data: result.data, pagination: result.meta };
        }
        return { success: false, message: result.message || 'Failed to fetch subjects' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to fetch subjects' };
    }
}

export const handleGetSubjectsByCourse = async (
    courseId: string,
    { page, limit, search }: { page?: number; limit?: number; search?: string } = {}
) => {
    try {
        const currentPage = page ? page > 0 ? page : 1 : 1;
        const currentLimit = limit ? limit > 0 ? limit : 10 : 10;
        const currentSearch = search || "";
        const result = await getSubjectsByCourse(courseId, {
            page: currentPage,
            limit: currentLimit,
            search: currentSearch,
        });
        if (result.success) {
            return { success: true, message: result.message, data: result.data, pagination: result.meta };
        }
        return { success: false, message: result.message || 'Failed to fetch course subjects' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to fetch course subjects' };
    }
}

export const handleGetSubjectById = async (id: string) => {
    try {
        const result = await getSubjectById(id);
        if (result.success) {
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || 'Failed to fetch subject' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to fetch subject' };
    }
}

export const handleUpdateSubject = async (id: string, data: any) => {
    try {
        const result = await updateSubject(id, data);
        if (result.success) {
            revalidatePath("/admin/subject");
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || 'Failed to update subject' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to update subject' };
    }
}

export const handleDeleteSubject = async (id: string) => {
    try {
        const result = await deleteSubject(id);
        if (result.success) {
            revalidatePath("/admin/subject");
            return { success: true, message: result.message };
        }
        return { success: false, message: result.message || 'Failed to delete subject' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to delete subject' };
    }
}
