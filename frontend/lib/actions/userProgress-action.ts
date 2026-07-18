"use server";
import { revalidatePath } from "next/cache";
import {
    touchRoadmapVisit,
    completeProject,
    completeRoadmapStep,
    markResourceWatched,
    submitSelfReportedSkill,
} from "@/lib/api/userProgress";

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

export async function handleCompleteProject(jobRoleId: string, projectTitle: string, githubLink?: string) {
    try {
        const result = await completeProject(jobRoleId, projectTitle, githubLink);
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

export async function handleCompleteRoadmapStep(jobRoleId: string, stepOrder: number) {
    try {
        const result = await completeRoadmapStep(jobRoleId, stepOrder);
        if (result.success) {
            revalidatePath("/dashboard/progress");
            revalidatePath("/dashboard/planner");
            return {
                success: true, data: result.data,
                message: result.message || "Roadmap step marked as completed"
            };
        }
        return {
            success: false, message: result.message
                || "Failed to mark roadmap step as completed"
        };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to mark roadmap step as completed" };
    }
}

export async function handleMarkResourceWatched(jobRoleId: string, stepOrder: number, resourceUrl: string) {
    try {
        const result = await markResourceWatched(jobRoleId, stepOrder, resourceUrl);
        if (result.success) {
            revalidatePath("/dashboard/progress");
            return {
                success: true, data: result.data,
                message: result.message || "Resource marked as watched"
            };
        }
        return {
            success: false, message: result.message
                || "Failed to mark resource as watched"
        };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to mark resource as watched" };
    }
}

export async function handleSubmitSelfReportedSkill(jobRoleId: string, skill: string, description: string) {
    try {
        const result = await submitSelfReportedSkill(jobRoleId, skill, description);
        if (result.success) {
            revalidatePath("/dashboard/planner");
            return {
                success: true, data: result.data,
                message: result.message || "Skill evidence submitted"
            };
        }
        return {
            success: false, message: result.message
                || "Failed to submit skill evidence"
        };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to submit skill evidence" };
    }
}
