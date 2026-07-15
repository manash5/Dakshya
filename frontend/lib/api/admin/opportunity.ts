import axiosInstance from "../axios-instance";
import { API } from "../endpoints";

// GET_ALL / GET_BY_ID live on the public OPPORTUNITY routes — they're
// already gated by authorizedMiddleware, so the admin panel just reads
// through them instead of duplicating a second list endpoint.
export const getAllOpportunities = async (params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
}) => {
    try {
        const response = await axiosInstance.get(API.OPPORTUNITY.GET_ALL, { params });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch opportunities');
    }
}

export const getOpportunityById = async (id: string) => {
    try {
        const response = await axiosInstance.get(API.OPPORTUNITY.GET_BY_ID(id));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch opportunity');
    }
}

export const scrapeOpportunities = async () => {
    try {
        const response = await axiosInstance.post(API.ADMIN.OPPORTUNITY.SCRAPE, {});
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to scrape opportunities');
    }
}

export const createOpportunity = async (data: any) => {
    try {
        const response = await axiosInstance.post(API.ADMIN.OPPORTUNITY.CREATE, data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to create opportunity');
    }
}

export const updateOpportunity = async (id: string, data: any) => {
    try {
        const response = await axiosInstance.put(API.ADMIN.OPPORTUNITY.UPDATE(id), data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to update opportunity');
    }
}

export const deleteOpportunity = async (id: string) => {
    try {
        const response = await axiosInstance.delete(API.ADMIN.OPPORTUNITY.DELETE(id));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to delete opportunity');
    }
}
