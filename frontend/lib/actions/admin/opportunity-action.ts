"use server";
import { revalidatePath } from "next/cache";
import {
    getAllOpportunities,
    getOpportunityById,
    scrapeOpportunities,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
} from "@/lib/api/admin/opportunity";

export const handleGetAllOpportunities = async ({
    page,
    limit,
    search,
    category,
}: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
} = {}) => {
    try {
        const currentPage = page ? page > 0 ? page : 1 : 1;
        const currentLimit = limit ? limit > 0 ? limit : 10 : 10;
        const result = await getAllOpportunities({
            page: currentPage,
            limit: currentLimit,
            search,
            category,
        });
        if (result.success) {
            return { success: true, message: result.message, data: result.data, pagination: result.meta };
        }
        return { success: false, message: result.message || 'Failed to fetch opportunities' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to fetch opportunities' };
    }
}

export const handleGetOpportunityById = async (id: string) => {
    try {
        const result = await getOpportunityById(id);
        if (result.success) {
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || 'Failed to fetch opportunity' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to fetch opportunity' };
    }
}

export const handleScrapeOpportunities = async () => {
    try {
        const result = await scrapeOpportunities();
        if (result.success) {
            revalidatePath("/admin/opportunities");
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || 'Failed to scrape opportunities' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to scrape opportunities' };
    }
}

export const handleCreateOpportunity = async (data: any) => {
    try {
        const result = await createOpportunity(data);
        if (result.success) {
            revalidatePath("/admin/opportunities");
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || 'Failed to create opportunity' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to create opportunity' };
    }
}

export const handleUpdateOpportunity = async (id: string, data: any) => {
    try {
        const result = await updateOpportunity(id, data);
        if (result.success) {
            revalidatePath("/admin/opportunities");
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || 'Failed to update opportunity' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to update opportunity' };
    }
}

export const handleDeleteOpportunity = async (id: string) => {
    try {
        const result = await deleteOpportunity(id);
        if (result.success) {
            revalidatePath("/admin/opportunities");
            return { success: true, message: result.message };
        }
        return { success: false, message: result.message || 'Failed to delete opportunity' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to delete opportunity' };
    }
}
