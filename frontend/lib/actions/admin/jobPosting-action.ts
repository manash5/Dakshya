"use server";
import { revalidatePath } from "next/cache";
import {
    getAllJobPostings,
    getJobPostingById,
    scrapeJobPostings,
    updateJobPosting,
    deleteJobPosting,
} from "@/lib/api/admin/jobPosting";

export const handleGetAllJobPostings = async ({
    page,
    limit,
    search,
    jobRoleId,
    location,
    skill,
    experience,
}: {
    page?: number;
    limit?: number;
    search?: string;
    jobRoleId?: string;
    location?: string;
    skill?: string;
    experience?: string;
}) => {
    try {
        const currentPage = page ? page > 0 ? page : 1 : 1;
        const currentLimit = limit ? limit > 0 ? limit : 10 : 10;
        const result = await getAllJobPostings({
            page: currentPage,
            limit: currentLimit,
            search: search || "",
            jobRoleId,
            location,
            skill,
            experience,
        });
        if (result.success) {
            return { success: true, message: result.message, data: result.data, pagination: result.meta };
        }
        return { success: false, message: result.message || 'Failed to fetch job postings' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to fetch job postings' };
    }
}

export const handleGetJobPostingById = async (id: string) => {
    try {
        const result = await getJobPostingById(id);
        if (result.success) {
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || 'Failed to fetch job posting' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to fetch job posting' };
    }
}

export const handleScrapeJobPostings = async (jobRoleId?: string) => {
    try {
        const result = await scrapeJobPostings(jobRoleId);
        if (result.success) {
            revalidatePath("/admin/job-postings");
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || 'Failed to scrape job postings' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to scrape job postings' };
    }
}

export const handleUpdateJobPosting = async (id: string, data: any) => {
    try {
        const result = await updateJobPosting(id, data);
        if (result.success) {
            revalidatePath("/admin/job-postings");
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || 'Failed to update job posting' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to update job posting' };
    }
}

export const handleDeleteJobPosting = async (id: string) => {
    try {
        const result = await deleteJobPosting(id);
        if (result.success) {
            revalidatePath("/admin/job-postings");
            return { success: true, message: result.message };
        }
        return { success: false, message: result.message || 'Failed to delete job posting' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to delete job posting' };
    }
}
