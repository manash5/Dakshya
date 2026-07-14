import axiosInstance from "../axios-instance";
import { API } from "../endpoints";

// GET_ALL / GET_BY_ID live on the public JOB_POSTING routes — they're
// already gated by authorizedMiddleware, so the admin panel just reads
// through them instead of duplicating a second list endpoint.
export const getAllJobPostings = async (params: {
    page?: number;
    limit?: number;
    search?: string;
    jobRole?: string;
    location?: string;
    skill?: string;
    experience?: string;
}) => {
    try {
        const response = await axiosInstance.get(API.JOB_POSTING.GET_ALL, { params });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch job postings');
    }
}

export const getJobPostingById = async (id: string) => {
    try {
        const response = await axiosInstance.get(API.JOB_POSTING.GET_BY_ID(id));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch job posting');
    }
}

export const scrapeJobPostings = async (jobRoleId?: string) => {
    try {
        const response = await axiosInstance.post(
            API.ADMIN.JOB_POSTING.SCRAPE,
            jobRoleId ? { jobRoleId } : {}
        );
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to scrape job postings');
    }
}

export const updateJobPosting = async (id: string, data: any) => {
    try {
        const response = await axiosInstance.put(API.ADMIN.JOB_POSTING.UPDATE(id), data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to update job posting');
    }
}

export const deleteJobPosting = async (id: string) => {
    try {
        const response = await axiosInstance.delete(API.ADMIN.JOB_POSTING.DELETE(id));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to delete job posting');
    }
}
