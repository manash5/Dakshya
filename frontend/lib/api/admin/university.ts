import axiosInstance from "../axios-instance";
import { API } from "../endpoints";

export const getAllUniversities = async (params: { page?: number; limit?: number; search?: string }) => {
    try {
        const response = await axiosInstance.get(API.ADMIN.UNIVERSITY.GET_ALL, { params });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch universities');
    }
}

export const getUniversityById = async (id: string) => {
    try {
        const response = await axiosInstance.get(API.ADMIN.UNIVERSITY.GET_BY_ID(id));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch university');
    }
}

export const createUniversity = async (data: any) => {
    try {
        const response = await axiosInstance.post(API.ADMIN.UNIVERSITY.CREATE, data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to create university');
    }
}

export const updateUniversity = async (id: string, data: any) => {
    try {
        const response = await axiosInstance.put(API.ADMIN.UNIVERSITY.UPDATE(id), data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to update university');
    }
}

export const deleteUniversity = async (id: string) => {
    try {
        const response = await axiosInstance.delete(API.ADMIN.UNIVERSITY.DELETE(id));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to delete university');
    }
}
