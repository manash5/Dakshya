"use server";
import { getSkillPlanner, generateSkillResources } from "@/lib/api/skillPlanner";

export async function getSkillPlannerData(jobRoleId: string) {
    try {
        const result = await getSkillPlanner(jobRoleId);
        if (result.success) {
            return {
                success: true, data: result.data,
                message: result.message || "Skill planner fetched successfully"
            };
        }
        return {
            success: false, message: result.message
                || "Failed to fetch skill planner"
        };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to fetch skill planner" };
    }
}

export async function handleGenerateSkillResources(jobRoleId: string, skill: string) {
    try {
        const result = await generateSkillResources(jobRoleId, skill);
        if (result.success) {
            return {
                success: true, data: result.data,
                message: result.message || "Resources generated successfully"
            };
        }
        return {
            success: false, message: result.message
                || "Failed to generate resources"
        };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to generate resources" };
    }
}
