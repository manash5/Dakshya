import express, { Application, NextFunction, Request, Response } from "express";
import { ApiResponseHelper } from './utils/api-response';
import { HttpException } from './exceptions/http-exceptions';
import cors from 'cors'; 
import userRoute from './routes/user.route'; 
import path from "path";
import adminUserRoutes from './routes/admin/user.route'


const app: Application = express();
const corsOptions = {
    origin: ['http://localhost:3000'], // Explicitly allow your Next.js app port
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'], // Authorizes your Bearer tokens
    credentials: true, // Crucial for letting headers pass through safely
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions)); 

app.use(express.json());// use json as request
app.use(express.urlencoded({ extended: true }));//use form-urlencoded as request

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use("/api/v1/auth", userRoute);

app.use("/api/v1/admin/users", adminUserRoutes);


app.use(
    (req: Request, res: Response) => {
        return res.status(404).json({ message: "Route Not Found" });
    }
)

app.use(
    (err: Error, req: Request, res: Response, next: NextFunction) => {
        if (err instanceof HttpException) {
            return ApiResponseHelper.error(
                res, err.message, err.status
            );
        }

    }
);

export default app;