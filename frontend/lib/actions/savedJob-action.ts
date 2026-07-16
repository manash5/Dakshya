"use server";
import { revalidatePath } from "next/cache";
import { saveJob, getSavedJobs, unsaveJob } from "@/lib/api/savedJob";

export const handleSaveJob = async (jobPostingId: string) => {
    try {
        const result = await saveJob(jobPostingId);
        if (result.success) {
            revalidatePath("/dashboard/job-finder");
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || "Failed to save job" };
    } catch (error: any) {
        return { success: false, message: error?.message || "Failed to save job" };
    }
};

export const handleGetSavedJobs = async ({
    page,
    limit,
}: { page?: number; limit?: number } = {}) => {
    try {
        const currentPage = page ? (page > 0 ? page : 1) : 1;
        const currentLimit = limit ? (limit > 0 ? limit : 10) : 10;
        const result = await getSavedJobs({ page: currentPage, limit: currentLimit });
        if (result.success) {
            return { success: true, message: result.message, data: result.data, pagination: result.meta };
        }
        return { success: false, message: result.message || "Failed to fetch saved jobs" };
    } catch (error: any) {
        return { success: false, message: error?.message || "Failed to fetch saved jobs" };
    }
};

export const handleUnsaveJob = async (jobPostingId: string) => {
    try {
        const result = await unsaveJob(jobPostingId);
        if (result.success) {
            revalidatePath("/dashboard/job-finder");
            return { success: true, message: result.message };
        }
        return { success: false, message: result.message || "Failed to unsave job" };
    } catch (error: any) {
        return { success: false, message: error?.message || "Failed to unsave job" };
    }
};
