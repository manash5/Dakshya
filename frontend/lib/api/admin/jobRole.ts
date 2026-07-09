import axiosInstance from "../axios-instance";
import { API } from "../endpoints";

export const getAllJobRoles = async (params: { page?: number; limit?: number; search?: string }) => {
    try {
        const response = await axiosInstance.get(API.ADMIN.JOB_ROLE.GET_ALL, { params });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch job roles');
    }
}

export const getJobRoleById = async (id: string) => {
    try {
        const response = await axiosInstance.get(API.ADMIN.JOB_ROLE.GET_BY_ID(id));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch job role');
    }
}

export const createJobRole = async (data: any) => {
    try {
        const response = await axiosInstance.post(API.ADMIN.JOB_ROLE.CREATE, data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to create job role');
    }
}

export const updateJobRole = async (id: string, data: any) => {
    try {
        const response = await axiosInstance.put(API.ADMIN.JOB_ROLE.UPDATE(id), data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to update job role');
    }
}

export const deleteJobRole = async (id: string) => {
    try {
        const response = await axiosInstance.delete(API.ADMIN.JOB_ROLE.DELETE(id));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to delete job role');
    }
}
