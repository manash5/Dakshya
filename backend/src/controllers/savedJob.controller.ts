import { Request, Response } from "express";
import { SavedJobService } from "../services/savedJob.service";
import { ApiResponseHelper } from "../utils/api-response";
import { HttpException } from "../exceptions/http-exceptions";

interface QueryParams {
  page?: string;
  limit?: string;
}

const service = new SavedJobService();

export class SavedJobController {
  async saveJob(req: Request, res: Response) {
    try {
      const userId = req.user._id.toString();
      const { jobPostingId } = req.body;

      if (!jobPostingId) {
        throw new HttpException(400, "jobPostingId is required");
      }

      const savedJob = await service.saveJob(userId, jobPostingId);

      return ApiResponseHelper.success(
        res,
        savedJob,
        201,
        "Job saved successfully",
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500,
      );
    }
  }

  async getSavedJobs(req: Request, res: Response) {
    try {
      const userId = req.user._id.toString();
      const { page, limit }: QueryParams = req.query;

      const { data, pagination } = await service.getSavedJobs(
        userId,
        page,
        limit,
      );

      return ApiResponseHelper.success(
        res,
        data,
        200,
        "Saved jobs fetched successfully",
        pagination,
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500,
      );
    }
  }

  async unsaveJob(req: Request, res: Response) {
    try {
      const userId = req.user._id.toString();
      const { jobPostingId } = req.params;

      await service.unsaveJob(userId, jobPostingId as string);

      return ApiResponseHelper.success(
        res,
        null,
        200,
        "Job unsaved successfully",
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500,
      );
    }
  }
}
