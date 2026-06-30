import axios from "axios";
import { getTokenCookie } from "../cookies";
const BASE_URL = 
    process.env.NEXT_PUBLIC_API_URL 
    || "http://localhost:8088";

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {   
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use(
    async (config) => {
        const token = await getTokenCookie();
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
export default axiosInstance;   