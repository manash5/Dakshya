import app from "./src/app";
import {PORT } from './src/config/constant'
import { connectToMongoDB } from "./src/database/mongo-db";
import { registerCronJobs } from "./src/cron";

connectToMongoDB()
    .then(() => {
        console.log("MongoDB connection established, started server  ...");
        registerCronJobs();
    })
    .catch((error) => {
        console.error("Failed to connect to MongoDB, server not started.", error);
        process.exit(1);
});

app.listen(
    PORT,
    () => {
        console.log(`Server running :${PORT}`);
    }
);