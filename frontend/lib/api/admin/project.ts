import axiosInstance from "../axios-instance";
import { API } from "../endpoints";

export const createProject = async (data: any) => {
    try {
        const response = await axiosInstance.post(API.ADMIN.PROJECT.CREATE, data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || "Failed to create project");
    }
};

export const updateProject = async (id: string, data: any) => {
    try {
        const response = await axiosInstance.put(API.ADMIN.PROJECT.UPDATE(id), data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || "Failed to update project");
    }
};

export const deleteProject = async (id: string) => {
    try {
        const response = await axiosInstance.delete(API.ADMIN.PROJECT.DELETE(id));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || "Failed to delete project");
    }
};
