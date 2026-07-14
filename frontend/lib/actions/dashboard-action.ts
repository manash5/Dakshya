"use server";
import { getCareerDashboard } from "@/lib/api/dashboard";

export async function getCareerDashboardData() {
    try {
        const result = await getCareerDashboard();
        if (result.success) {
            return {
                success: true, data: result.data,
                message: result.message || "Career dashboard fetched successfully"
            };
        }
        return {
            success: false, message: result.message
                || "Failed to fetch career dashboard"
        };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to fetch career dashboard" };
    }
}
