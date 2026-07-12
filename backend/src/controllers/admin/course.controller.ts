import { Request, Response } from "express";
import { z } from "zod";

import { CourseService } from "../../services/course.service";
import {
  CreateCourseDto,
  UpdateCourseDto,
} from "../../dtos/course.dto";

import { ApiResponseHelper } from "../../utils/api-response";

interface QueryParams {
  page?: string;
  limit?: string;
  search?: string;
}

const courseService = new CourseService();

export class AdminCourseController {
  async createCourse(req: Request, res: Response) {
    try {
      const parsed = CreateCourseDto.safeParse(req.body);

      if (!parsed.success) {
        return ApiResponseHelper.error(
          res,
          z.prettifyError(parsed.error),
          400
        );
      }

      const course =
        await courseService.createCourse(parsed.data);

      return ApiResponseHelper.success(
        res,
        course,
        201,
        "Course created successfully"
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500
      );
    }
  }

  async updateCourse(req: Request, res: Response) {
    try {
      const { courseId } = req.params;

      const parsed = UpdateCourseDto.safeParse(req.body);

      if (!parsed.success) {
        return ApiResponseHelper.error(
          res,
          z.prettifyError(parsed.error),
          400
        );
      }

      const course =
        await courseService.updateCourse(courseId as string, parsed.data);

      return ApiResponseHelper.success(
        res,
        course,
        200,
        "Course updated successfully"
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500
      );
    }
  }

  async deleteCourse(req: Request, res: Response) {
    try {
      const { courseId } = req.params;

      await courseService.deleteCourse(courseId as string);

      return ApiResponseHelper.success(
        res,
        null,
        200,
        "Course deleted successfully"
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500
      );
    }
  }

  async getAllCoursesPaginated(req: Request, res: Response) {
    try {
      const { page, limit, search }: QueryParams = req.query;

      const { data, pagination } =
        await courseService.getAllCoursesPaginated(
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
        e?.message || "Internal Server Error",
        e.status || 500
      );
    }
  }

  async getCoursesByUniversity(req: Request, res: Response) {
    try {
      const { universityId } = req.params;
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
        e?.message || "Internal Server Error",
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
        e?.message || "Internal Server Error",
        e.status || 500
      );
    }
  }
}