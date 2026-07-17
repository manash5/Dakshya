"use server";
import { revalidatePath } from "next/cache";
import { createProject, updateProject, deleteProject } from "@/lib/api/admin/project";

export const handleCreateProject = async (data: any) => {
    try {
        const result = await createProject(data);
        if (result.success) {
            revalidatePath("/admin/project");
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || "Project creation failed" };
    } catch (error: any) {
        return { success: false, message: error?.message || "Project creation failed" };
    }
};

export const handleUpdateProject = async (id: string, data: any) => {
    try {
        const result = await updateProject(id, data);
        if (result.success) {
            revalidatePath("/admin/project");
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || "Failed to update project" };
    } catch (error: any) {
        return { success: false, message: error?.message || "Failed to update project" };
    }
};

export const handleDeleteProject = async (id: string) => {
    try {
        const result = await deleteProject(id);
        if (result.success) {
            revalidatePath("/admin/project");
            return { success: true, message: result.message };
        }
        return { success: false, message: result.message || "Failed to delete project" };
    } catch (error: any) {
        return { success: false, message: error?.message || "Failed to delete project" };
    }
};
