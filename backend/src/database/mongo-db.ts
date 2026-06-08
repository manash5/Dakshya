import mongoose from "mongoose";
import { MONGODB_URI } from "../config/constant";

export const connectToMongoDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
};