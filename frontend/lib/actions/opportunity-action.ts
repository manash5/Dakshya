"use server";
import { getAllOpportunities } from "@/lib/api/opportunity";

export const handleGetAllOpportunities = async ({
    page,
    limit,
    category,
    search,
}: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
} = {}) => {
    try {
        const currentPage = page ? page > 0 ? page : 1 : 1;
        const currentLimit = limit ? limit > 0 ? limit : 10 : 10;
        const result = await getAllOpportunities({
            page: currentPage,
            limit: currentLimit,
            category,
            search,
        });
        if (result.success) {
            return { success: true, message: result.message, data: result.data, pagination: result.meta };
        }
        return { success: false, message: result.message || 'Failed to fetch opportunities' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to fetch opportunities' };
    }
}
