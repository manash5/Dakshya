import axiosInstance from "../axios-instance";
import { API } from "../endpoints";


export const getAllUsers = async (params: { page?: number; limit?: number, search?: string }) => {
    try {
        const response = await axiosInstance.get(API.ADMIN.USERS.GET_ALL, { params });
        return response.data; // response body
    }
    catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch users');
    }
}
export const getUserById = async (id: string) => {
    try {
        const response = await axiosInstance.get(API.ADMIN.USERS.GET_BY_ID(id));
        return response.data; // response body
    }
    catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch user');
    }
}

export const createUser = async (data: any) => {
    try {
        const response = await axiosInstance.post(API.ADMIN.USERS.CREATE, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
    catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to create user');
    }
}

export const updateUser = async (id: string, data: any) => {
    try {
        const response = await axiosInstance.put(API.ADMIN.USERS.UPDATE(id), data, {
            headers: {
                'Content-Type': 'multipart/form-data' // multipart/form-data for file upload
            }
        });
        return response.data; // response body
    }
    catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to update user');
    }
}

export const updateUserPassword = async (id: string, data: any) => {
    try {
        const response = await axiosInstance.put(API.ADMIN.USERS.UPDATE_PASSWORD(id), data);
        return response.data; // response body
    }
    catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to update user password');
    }
}


export const deleteUser = async (id: string) => {
    try {
        const response = await axiosInstance.delete(API.ADMIN.USERS.DELETE(id));
        return response.data; // response body
    }
    catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to delete user');
    }
}