import { Request, Response } from "express";
import { JobPostingService } from "../services/jobPosting.service";
import { ApiResponseHelper } from "../utils/api-response";

interface QueryParams {
  page?: string;
  limit?: string;
  location?: string;
  skill?: string;
  experience?: string;
  search?: string;
  jobRoleId?: string;
}

const service = new JobPostingService();

export class JobPostingController {
  async getJobPostingById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const jobPosting = await service.getJobPostingById(id as string);

      return ApiResponseHelper.success(
        res,
        jobPosting,
        200,
        "Job posting fetched successfully"
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500
      );
    }
  }

  async getJobPostings(req: Request, res: Response) {
    try {
      const {
        page,
        limit,
        location,
        skill,
        experience,
        search,
        jobRoleId,
      }: QueryParams = req.query;

      const { data, pagination } = await service.getJobPostingsPaginated(
        page,
        limit,
        { location, skill, experience, search, jobRoleId }
      );

      return ApiResponseHelper.success(
        res,
        data,
        200,
        "Job postings fetched successfully",
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
}
