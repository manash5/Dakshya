import { Request, Response } from "express";
import { UserProgressService } from "../services/userProgress.service";
import { ApiResponseHelper } from "../utils/api-response";

const userProgressService =
    new UserProgressService();

export class UserProgressController {

    async getUserProgress(
        req: Request,
        res: Response
    ) {

        try {

            const userId = req.user._id.toString();
// or req.user.userId depending on your middleware

            const progress =
                await userProgressService.getUserProgress(userId);

            return ApiResponseHelper.success(
                res,
                progress,
                200,
                "User progress fetched successfully"
            );

        } catch (e: any) {

            return ApiResponseHelper.error(
                res,
                e?.message || "Failed to fetch user progress",
                e.status || 500
            );

        }

    }

}