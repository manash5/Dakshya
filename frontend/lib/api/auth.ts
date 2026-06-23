import axiosInstance from './axios-instance';
import { API } from './endpoints';


export const register = async (data: any) => {
    try{
        const response = await axiosInstance.post(API.AUTH.REGISTER, data); 
        return response.data; 
        // reponse data -> response ko body 
    } catch(error: any){
        throw new Error(
            error.response?.data?.message || 'Registration failed' 
        )
    }
}


export const login = async (data: any) => {
    try{
        const response = await axiosInstance.post(API.AUTH.LOGIN, data); 
        return response.data; 
        // reponse data -> response ko body 
    } catch(error: any){
        throw new Error(
            error.response?.data?.message || 'Login failed' 
        )
    }
}

export const whoami = async ()=>{
    try{
        const response = await axiosInstance.get(API.AUTH.WHOAMI);
        return response.data;
        // response.data -> response ko body
    }catch (error: any) {
        throw new Error(
            error?.response?.data?.message || 'Fetch user info failed'
        );
    }
}

export const profileUpdate = async ( data: any) => {
    try{
        const response = await axiosInstance.put(
            API.AUTH.UPDATE, 
            data,
            {
                headers: {
                    "Content-Type": "multipart/form-data", // for multer
                }
            }
        );
        return response.data;
        // response.data -> response ko body
    }catch (error: any) {
        throw new Error(
            error?.response?.data?.message || 'Profile update failed'
        );
    }
}

export const getProfile = async () => {
    try {
        const response = await axiosInstance.get(API.AUTH.GET_PROFILE);
        return response.data; // Returns the user profile object containing name, role, avatarUrl, etc.
    } catch (error: any) {
        console.error("AXIOS ERROR DETAILS:", error.response?.status, error.response?.data);
        throw new Error(
            error?.response?.data?.message || 'Failed to fetch profile'
        );
    }
}


// checks password for update
export const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
    try {
        const response = await axiosInstance.put(API.AUTH.CHANGE_PASSWORD, data);
        return response.data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message || 'Password change failed'
        );
    }
};