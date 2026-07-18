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

export const completeProject = async (jobRoleId: string, projectTitle: string, githubLink?: string) => {
    try {
        const response = await axiosInstance.post(API.USER_PROGRESS.COMPLETE_PROJECT(jobRoleId), {
            projectTitle,
            ...(githubLink && { githubLink }),
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to mark project as completed");
    }
};

export const completeRoadmapStep = async (jobRoleId: string, stepOrder: number) => {
    try {
        const response = await axiosInstance.post(API.USER_PROGRESS.COMPLETE_ROADMAP_STEP(jobRoleId), { stepOrder });
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to mark roadmap step as completed");
    }
};

export const markResourceWatched = async (jobRoleId: string, stepOrder: number, resourceUrl: string) => {
    try {
        const response = await axiosInstance.post(API.USER_PROGRESS.MARK_RESOURCE_WATCHED(jobRoleId), {
            stepOrder,
            resourceUrl,
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to mark resource as watched");
    }
};

export const submitSelfReportedSkill = async (jobRoleId: string, skill: string, description: string) => {
    try {
        const response = await axiosInstance.post(API.USER_PROGRESS.SUBMIT_SELF_REPORTED_SKILL(jobRoleId), {
            skill,
            description,
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to submit skill evidence");
    }
};
