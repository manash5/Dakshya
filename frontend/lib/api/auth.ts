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