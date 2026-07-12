"use server";
import { revalidatePath } from "next/cache";
import { getAllCourses, createCourse, deleteCourse, getCourseById, updateCourse, getCoursesByUniversity } from "@/lib/api/admin/course";

export const handleCreateCourse = async (data: any) => {
    try {
        const result = await createCourse(data);
        if (result.success) {
            revalidatePath("/admin/course");
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || 'Course creation failed' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Course creation failed' };
    }
}

export const handleGetAllCourses = async ({ page, limit, search }: { page?: number; limit?: number; search?: string }) => {
    try {
        const currentPage = page ? page > 0 ? page : 1 : 1;
        const currentLimit = limit ? limit > 0 ? limit : 10 : 10;
        const currentSearch = search || "";
        const result = await getAllCourses({ page: currentPage, limit: currentLimit, search: currentSearch });
        if (result.success) {
            return { success: true, message: result.message, data: result.data, pagination: result.meta };
        }
        return { success: false, message: result.message || 'Failed to fetch courses' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to fetch courses' };
    }
}

export const handleGetCoursesByUniversity = async (
    universityId: string,
    { page, limit, search }: { page?: number; limit?: number; search?: string } = {}
) => {
    try {
        const currentPage = page ? page > 0 ? page : 1 : 1;
        const currentLimit = limit ? limit > 0 ? limit : 10 : 10;
        const currentSearch = search || "";
        const result = await getCoursesByUniversity(universityId, {
            page: currentPage,
            limit: currentLimit,
            search: currentSearch,
        });
        if (result.success) {
            return { success: true, message: result.message, data: result.data, pagination: result.meta };
        }
        return { success: false, message: result.message || 'Failed to fetch university courses' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to fetch university courses' };
    }
}

export const handleGetCourseById = async (id: string) => {
    try {
        const result = await getCourseById(id);
        if (result.success) {
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || 'Failed to fetch course' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to fetch course' };
    }
}

export const handleUpdateCourse = async (id: string, data: any) => {
    try {
        const result = await updateCourse(id, data);
        if (result.success) {
            revalidatePath("/admin/course");
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || 'Failed to update course' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to update course' };
    }
}

export const handleDeleteCourse = async (id: string) => {
    try {
        const result = await deleteCourse(id);
        if (result.success) {
            revalidatePath("/admin/course");
            return { success: true, message: result.message };
        }
        return { success: false, message: result.message || 'Failed to delete course' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to delete course' };
    }
}
