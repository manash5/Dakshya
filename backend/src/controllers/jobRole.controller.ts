import { Request, Response } from "express";
import { JobRoleService } from "../services/jobRole.service";
import { ApiResponseHelper } from "../utils/api-response";

interface QueryParams {
    page?: string;
    limit?: string;
    search?: string;
}

const service = new JobRoleService();

export class JobRoleController {

    async getJobRoles(req: Request, res: Response) {
        try {

            const { page, limit, search }: QueryParams = req.query;

            const { data, pagination } =
                await service.getAllJobRolesPaginated(
                    page,
                    limit,
                    search
                );

            return ApiResponseHelper.success(
                res,
                data,
                200,
                "Job roles fetched successfully",
                pagination
            );

        } catch (e: any) {

            return ApiResponseHelper.error(
                res,
                e?.message || "Internal Server Error",
                e.status || 500
            );

        }
    }

    async getJobRoleById(req: Request, res: Response) {
        try {

            const { jobRoleId } = req.params;

            const jobRole =
                await service.getJobRoleById(jobRoleId as string);

            return ApiResponseHelper.success(
                res,
                jobRole,
                200,
                "Job role fetched successfully"
            );

        } catch (e: any) {

            return ApiResponseHelper.error(
                res,
                e?.message || "Internal Server Error",
                e.status || 500
            );

        }
    }
}