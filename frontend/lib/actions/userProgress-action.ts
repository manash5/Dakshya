"use server";
import { revalidatePath } from "next/cache";
import { touchRoadmapVisit, completeProject } from "@/lib/api/userProgress";

export async function handleTouchRoadmapVisit(jobRoleId: string) {
    try {
        const result = await touchRoadmapVisit(jobRoleId);
        if (result.success) {
            return {
                success: true, data: result.data,
                message: result.message || "Roadmap visit recorded"
            };
        }
        return {
            success: false, message: result.message
                || "Failed to record roadmap visit"
        };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to record roadmap visit" };
    }
}

export async function handleCompleteProject(jobRoleId: string, projectTitle: string) {
    try {
        const result = await completeProject(jobRoleId, projectTitle);
        if (result.success) {
            revalidatePath("/dashboard/practice");
            revalidatePath("/dashboard/planner");
            return {
                success: true, data: result.data,
                message: result.message || "Project marked as completed"
            };
        }
        return {
            success: false, message: result.message
                || "Failed to mark project as completed"
        };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to mark project as completed" };
    }
}
