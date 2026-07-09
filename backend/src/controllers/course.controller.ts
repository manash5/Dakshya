import { Request, Response } from "express";
import { CourseService } from "../services/course.service";
import { ApiResponseHelper } from "../utils/api-response";

interface QueryParams {
  page?: string;
  limit?: string;
  search?: string;
}

const courseService = new CourseService();

export class CourseController {
  async getCoursesByUniversity(req: Request, res: Response) {
    try {
      const  universityId  = req.params.universityId;
      const { page, limit, search }: QueryParams = req.query;

      const { data, pagination } =
        await courseService.getCoursesByUniversityPaginated(
          universityId as string,
          page,
          limit,
          search
        );

      return ApiResponseHelper.success(
        res,
        data,
        200,
        "Courses fetched successfully",
        pagination
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to fetch courses",
        e.status || 500
      );
    }
  }

  async getCourseById(req: Request, res: Response) {
    try {
      const courseId = req.params.courseId;

      const course = await courseService.getCourseById(courseId as string);

      return ApiResponseHelper.success(
        res,
        course,
        200,
        "Course fetched successfully"
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to fetch course",
        e.status || 500
      );
    }
  }
}