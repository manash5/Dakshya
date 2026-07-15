"use server";
import { getSkillPlanner } from "@/lib/api/skillPlanner";

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
