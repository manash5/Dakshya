import { Request, Response } from "express";
import { z } from "zod";
import { JobRoleService } from "../../services/jobRole.service";
import { CreateJobRoleDto, UpdateJobRoleDto } from "../../dtos/jobRole.dto";
import { ApiResponseHelper } from "../../utils/api-response";

interface QueryParams {
    page?: string;
    limit?: string;
    search?: string;
}

const service = new JobRoleService();

export class AdminJobRoleController {

    async createJobRole(req: Request, res: Response) {
        try {

            const parsed =
                CreateJobRoleDto.safeParse(req.body);

            if (!parsed.success) {
                return ApiResponseHelper.error(
                    res,
                    z.prettifyError(parsed.error),
                    400
                );
            }

            const jobRole =
                await service.createJobRole(parsed.data);

            return ApiResponseHelper.success(
                res,
                jobRole,
                201,
                "Job role created successfully"
            );

        } catch (e: any) {

            return ApiResponseHelper.error(
                res,
                e?.message || "Internal Server Error",
                e.status || 500
            );

        }
    }

    async updateJobRole(req: Request, res: Response) {
        try {

            const { jobRoleId } = req.params;

            const parsed =
                UpdateJobRoleDto.safeParse(req.body);

            if (!parsed.success) {
                return ApiResponseHelper.error(
                    res,
                    z.prettifyError(parsed.error),
                    400
                );
            }

            const jobRole =
                await service.updateJobRole(
                    jobRoleId as string,
                    parsed.data
                );

            return ApiResponseHelper.success(
                res,
                jobRole,
                200,
                "Job role updated successfully"
            );

        } catch (e: any) {

            return ApiResponseHelper.error(
                res,
                e?.message || "Internal Server Error",
                e.status || 500
            );

        }
    }

    async deleteJobRole(req: Request, res: Response) {
        try {

            const  jobRoleId  = req.params.jobRoleId;

            const deleted = await service.deleteJobRole(jobRoleId as string);

            return ApiResponseHelper.success(
                res,
                deleted,
                200,
                "Job role deleted successfully"
            );

        } catch (e: any) {

            return ApiResponseHelper.error(
                res,
                e?.message || "Internal Server Error",
                e.status || 500
            );

        }
    }

    async getAllJobRolesPaginated(req: Request, res: Response) {
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