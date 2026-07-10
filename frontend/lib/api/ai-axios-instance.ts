import axios from "axios";

const AI_BASE_URL =
    process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000";

const aiAxiosInstance = axios.create({
    baseURL: AI_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 600_000,
});

export default aiAxiosInstance;
