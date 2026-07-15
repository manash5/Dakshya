import { Request, Response } from "express";
import { z } from "zod";
import { JobPostingService } from "../../services/jobPosting.service";
import { UpdateJobPostingDtoSchema } from "../../dtos/jobPosting.dto";
import { ApiResponseHelper } from "../../utils/api-response";

const service = new JobPostingService();

export class AdminJobPostingController {
  async scrapeJobPostings(req: Request, res: Response) {
    try {
      // Always a full scrape now — there's no more per-role scraping (see
      // jobPosting.service.ts), so any jobRoleId the client still sends is
      // ignored.
      const stats = await service.scrapeAndStoreAll();

      return ApiResponseHelper.success(
        res,
        stats,
        200,
        "Job postings scraped successfully"
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500
      );
    }
  }

  async updateJobPosting(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const parsed = UpdateJobPostingDtoSchema.safeParse(req.body);

      if (!parsed.success) {
        return ApiResponseHelper.error(
          res,
          z.prettifyError(parsed.error),
          400
        );
      }

      const jobPosting = await service.updateJobPosting(id as string, parsed.data);

      return ApiResponseHelper.success(
        res,
        jobPosting,
        200,
        "Job posting updated successfully"
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500
      );
    }
  }

  async deleteJobPosting(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await service.deleteJobPosting(id as string);

      return ApiResponseHelper.success(
        res,
        null,
        200,
        "Job posting deleted successfully"
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
