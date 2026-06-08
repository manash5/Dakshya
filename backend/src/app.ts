import express, { Application, NextFunction, Request, Response } from "express";
import { ApiResponseHelper } from './utils/api-response';
import { HttpException } from './exceptions/http-exceptions';
import cors from 'cors'; 


const app: Application = express();
let corsOptions = {
    origin: ['*'], // {"http://localhost:300", "http://example.com"}
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions)); 

app.use(express.json());// use json as request
app.use(express.urlencoded({ extended: true }));//use form-urlencoded as request


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