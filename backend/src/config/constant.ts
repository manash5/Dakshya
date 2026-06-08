import * as dotenv from "dotenv";
dotenv.config();

export const PORT=process.env.PORT||8008;
export const MOCK_DB=process.env.MOCK_DB||"mock";
export const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/class36b";
export const SECRET_KEY = process.env.SECRET_KEY || "merosecretjwtkey"; 

