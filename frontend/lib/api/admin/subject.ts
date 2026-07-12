import axiosInstance from "../axios-instance";
import { API } from "../endpoints";

export const getAllSubjects = async (params: { page?: number; limit?: number; search?: string }) => {
    try {
        const response = await axiosInstance.get(API.ADMIN.SUBJECT.GET_ALL, { params });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch subjects');
    }
}

export const getSubjectsByCourse = async (
    courseId: string,
    params: { page?: number; limit?: number; search?: string } = {}
) => {
    try {
        const response = await axiosInstance.get(API.ADMIN.COURSE.GET_SUBJECTS(courseId), { params });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch course subjects');
    }
}

export const getSubjectById = async (id: string) => {
    try {
        const response = await axiosInstance.get(API.ADMIN.SUBJECT.GET_BY_ID(id));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch subject');
    }
}

export const createSubject = async (data: any) => {
    try {
        const response = await axiosInstance.post(API.ADMIN.SUBJECT.CREATE, data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to create subject');
    }
}

export const updateSubject = async (id: string, data: any) => {
    try {
        const response = await axiosInstance.put(API.ADMIN.SUBJECT.UPDATE(id), data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to update subject');
    }
}

export const deleteSubject = async (id: string) => {
    try {
        const response = await axiosInstance.delete(API.ADMIN.SUBJECT.DELETE(id));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to delete subject');
    }
}
