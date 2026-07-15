import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export interface Opportunity {
    _id: string;
    title: string;
    organizer: string;
    category: string | null;
    location: string;
    eventDate: string | null;
    description: string;
    registrationLink: string;
    source: string;
    postedDate: string | null;
    createdAt: string;
}

export const getAllOpportunities = async (params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
}) => {
    try {
        const response = await axiosInstance.get(API.OPPORTUNITY.GET_ALL, { params });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch opportunities');
    }
}
