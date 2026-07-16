import { Request, Response } from "express";
import { z } from "zod";
import { UserProgressService } from "../services/userProgress.service";
import { ApiResponseHelper } from "../utils/api-response";
import { CompleteProjectDtoSchema } from "../dtos/userProgress.dto";

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

    async refreshProgress(
        req: Request,
        res: Response
    ) {

        try {

            const userId = req.user._id.toString();

            const progress =
                await userProgressService.refreshAcademicProgress(userId);

            return ApiResponseHelper.success(
                res,
                progress,
                200,
                "Progress refreshed successfully"
            );

        } catch (e: any) {

            return ApiResponseHelper.error(
                res,
                e?.message || "Failed to refresh progress",
                e.status || 500
            );

        }

    }

    async getRoadmapProgress(
        req: Request,
        res: Response
    ) {

        try {

            const userId = req.user._id.toString();
            const { jobRoleId } = req.params;

            const progress =
                await userProgressService.getRoadmapProgress(userId, jobRoleId as string);

            return ApiResponseHelper.success(
                res,
                progress,
                200,
                "Roadmap progress fetched successfully"
            );

        } catch (e: any) {

            return ApiResponseHelper.error(
                res,
                e?.message || "Failed to fetch roadmap progress",
                e.status || 500
            );

        }

    }

    async touchRoadmapVisit(
        req: Request,
        res: Response
    ) {

        try {

            const userId = req.user._id.toString();
            const { jobRoleId } = req.params;

            const progress =
                await userProgressService.touchRoadmapVisit(userId, jobRoleId as string);

            return ApiResponseHelper.success(
                res,
                progress,
                200,
                "Roadmap visit recorded successfully"
            );

        } catch (e: any) {

            return ApiResponseHelper.error(
                res,
                e?.message || "Failed to record roadmap visit",
                e.status || 500
            );

        }

    }

    async completeProject(
        req: Request,
        res: Response
    ) {

        try {

            const userId = req.user._id.toString();
            const { jobRoleId } = req.params;

            const parsed = CompleteProjectDtoSchema.safeParse(req.body);

            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }

            const progress =
                await userProgressService.completeProject(
                    userId, jobRoleId as string, parsed.data.projectTitle,
                );

            return ApiResponseHelper.success(
                res,
                progress,
                200,
                "Project marked as completed successfully"
            );

        } catch (e: any) {

            return ApiResponseHelper.error(
                res,
                e?.message || "Failed to mark project as completed",
                e.status || 500
            );

        }

    }

}