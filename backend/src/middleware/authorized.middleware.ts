import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_KEY } from "../config/constant";
import { HttpException } from "../exceptions/http-exceptions";
import { IUser } from "../models/user.model";
import { ApiResponseHelper } from "../utils/api-response";
import { UserMongoRepository } from "../repository/user.repository";

const userRepository = new UserMongoRepository();

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace -- declaration merging onto Express requires a namespace
    namespace Express {
        interface Request {
            user?: Record<string, any> | IUser;
        }
    }
}
export const authorizedMiddleware =
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer "))
                throw new HttpException(401, "Authorization header missing or malformed");
            const token = authHeader.split(" ")[1];
            if (!token)
                throw new HttpException(401, "Token missing");
            const decoded = jwt.verify(token, JWT_KEY) as Record<string, any>;
            if (!decoded || !decoded.id)
                throw new HttpException(401, "Invalid token");
            const user = await userRepository.findById(decoded.id);
            if (!user)
                throw new HttpException(401, "User not found");
            req.user = user;
            return next();
        } catch (e: Error | unknown | any) {
            return ApiResponseHelper.error(
                res,
                e?.message || "Unauthorized",
                e.status || 401
            );
        }
    }

export const adminMiddleware = async (
    req: Request, res: Response, next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new HttpException(401, 'Unauthorized no user info');
        }
        if (req.user.role !== 'admin') {
            throw new HttpException(403, 'Forbidden not admin');
        }
        return next();
    } catch (err: Error | any) {
        return ApiResponseHelper.error(
            res,
            err.message || 'Internal Server Error',
            err.status || 500
        );
    }
}