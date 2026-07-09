import { Request, Response } from "express";
import { SubjectService } from "../services/subject.service";
import { ApiResponseHelper } from "../utils/api-response";

interface QueryParams {
  page?: string;
  limit?: string;
  search?: string;
}

const service = new SubjectService();

export class SubjectController {

  /**
   * Used during onboarding.
   * User has already selected a course.
   * Returns only subjects belonging to that course.
   */
  async getSubjectsByCourse(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const { page, limit, search }: QueryParams = req.query;

      const { data, pagination } =
        await service.getSubjectsByCoursePaginated(
          courseId as string,
          page,
          limit,
          search,
        );

      return ApiResponseHelper.success(
        res,
        data,
        200,
        "Subjects fetched successfully",
        pagination,
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to load subjects",
        e.status || 500,
      );
    }
  }

  /**
   * Returns one subject.
   */
  async getSubjectById(req: Request, res: Response) {
    try {
      const { subjectId } = req.params;

      const subject =
        await service.getSubjectById(subjectId as string);

      return ApiResponseHelper.success(
        res,
        subject,
        200,
        "Subject fetched successfully",
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to load subject",
        e.status || 500,
      );
    }
  }
}