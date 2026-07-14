import { Request, Response } from "express";
import { JobPostingService } from "../services/jobPosting.service";
import { ApiResponseHelper } from "../utils/api-response";

interface QueryParams {
  page?: string;
  limit?: string;
  jobRole?: string;
  location?: string;
  skill?: string;
  experience?: string;
  search?: string;
}

const service = new JobPostingService();

export class JobPostingController {
  async getJobPostings(req: Request, res: Response) {
    try {
      const {
        page,
        limit,
        jobRole,
        location,
        skill,
        experience,
        search,
      }: QueryParams = req.query;

      const { data, pagination } = await service.getJobPostingsPaginated(
        page,
        limit,
        { jobRole, location, skill, experience, search }
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
