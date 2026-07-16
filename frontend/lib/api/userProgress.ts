import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export const touchRoadmapVisit = async (jobRoleId: string) => {
    try {
        const response = await axiosInstance.post(API.USER_PROGRESS.TOUCH_ROADMAP_VISIT(jobRoleId));
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to record roadmap visit");
    }
};

export const completeProject = async (jobRoleId: string, projectTitle: string) => {
    try {
        const response = await axiosInstance.post(API.USER_PROGRESS.COMPLETE_PROJECT(jobRoleId), { projectTitle });
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to mark project as completed");
    }
};
