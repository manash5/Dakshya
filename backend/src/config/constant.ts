import * as dotenv from "dotenv";
dotenv.config();

export const PORT=process.env.PORT||8088;
export const baseUrl = process.env.BASE_URL || 'http://localhost:8088';
export const MOCK_DB=process.env.MOCK_DB||"mock";
export const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dakshya";
export const JWT_KEY = process.env.SECRET_KEY || "merosecretjwtkey"; 

