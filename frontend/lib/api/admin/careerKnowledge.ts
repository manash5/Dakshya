import axiosInstance from "../axios-instance";
import { API } from "../endpoints";

export const getAllCareerKnowledgeAdmin = async (params: { page?: number; limit?: number; search?: string }) => {
    try {
        const response = await axiosInstance.get(API.ADMIN.CAREER_KNOWLEDGE.GET_ALL, { params });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || "Failed to fetch career knowledge");
    }
};

export const getCareerKnowledgeByRoleAdmin = async (jobRoleId: string) => {
    try {
        const response = await axiosInstance.get(API.ADMIN.CAREER_KNOWLEDGE.GET_BY_ROLE(jobRoleId));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || "Failed to fetch career knowledge");
    }
};

export const generateCareerKnowledge = async (jobRoleId: string) => {
    try {
        const response = await axiosInstance.post(API.ADMIN.CAREER_KNOWLEDGE.GENERATE(jobRoleId));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || "Failed to generate career knowledge");
    }
};

export const regenerateCareerKnowledge = async (jobRoleId: string) => {
    try {
        const response = await axiosInstance.put(API.ADMIN.CAREER_KNOWLEDGE.REGENERATE(jobRoleId));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || "Failed to regenerate career knowledge");
    }
};

export const deleteCareerKnowledge = async (jobRoleId: string) => {
    try {
        const response = await axiosInstance.delete(API.ADMIN.CAREER_KNOWLEDGE.DELETE(jobRoleId));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || "Failed to delete career knowledge");
    }
};
