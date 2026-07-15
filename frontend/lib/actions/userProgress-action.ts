"use server";
import { touchRoadmapVisit } from "@/lib/api/userProgress";

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
