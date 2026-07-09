import axiosInstance from "../axios-instance";
import { API } from "../endpoints";

export const getAllCourses = async (params: { page?: number; limit?: number; search?: string }) => {
    try {
        const response = await axiosInstance.get(API.ADMIN.COURSE.GET_ALL, { params });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch courses');
    }
}

export const getCourseById = async (id: string) => {
    try {
        const response = await axiosInstance.get(API.ADMIN.COURSE.GET_BY_ID(id));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch course');
    }
}

export const createCourse = async (data: any) => {
    try {
        const response = await axiosInstance.post(API.ADMIN.COURSE.CREATE, data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to create course');
    }
}

export const updateCourse = async (id: string, data: any) => {
    try {
        const response = await axiosInstance.put(API.ADMIN.COURSE.UPDATE(id), data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to update course');
    }
}

export const deleteCourse = async (id: string) => {
    try {
        const response = await axiosInstance.delete(API.ADMIN.COURSE.DELETE(id));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to delete course');
    }
}
