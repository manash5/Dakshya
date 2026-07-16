import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export interface ProjectJobRole {
    _id: string;
    title: string;
    category: string;
}

export interface Project {
    _id: string;
    title: string;
    description: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    skills: string[];
    requirements: string[];
    githubTemplate: string | null;
    estimatedHours: number;
    careerRole: ProjectJobRole;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export const getAllProjects = async (params: {
    page?: number;
    limit?: number;
    careerRole?: string;
    difficulty?: string;
    search?: string;
}) => {
    try {
        const response = await axiosInstance.get(API.PROJECT.GET_ALL, { params });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || "Failed to fetch projects");
    }
};

export const getProjectById = async (id: string) => {
    try {
        const response = await axiosInstance.get(API.PROJECT.GET_BY_ID(id));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || "Failed to fetch project");
    }
};
