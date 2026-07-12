import { Request, Response } from "express";
import { z } from "zod";

import { SubjectService } from "../../services/subject.service";
import { CreateSubjectDto, UpdateSubjectDto } from "../../dtos/subject.dto";

import { ApiResponseHelper } from "../../utils/api-response";

interface QueryParams {
  page?: string;
  limit?: string;
  search?: string;
}

const service = new SubjectService();

export class AdminSubjectController {
  async createSubject(req: Request, res: Response) {
    try {
      const parsed = CreateSubjectDto.safeParse(req.body);

      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }

      const subject = await service.createSubject(parsed.data);

      return ApiResponseHelper.success(
        res,
        subject,
        201,
        "Subject created successfully",
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500,
      );
    }
  }

  async updateSubject(req: Request, res: Response) {
    try {
      const  subjectId  = req.params.subjectId;

      const parsed = UpdateSubjectDto.safeParse(req.body);

      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }

      const subject = await service.updateSubject(
        subjectId as string,
        parsed.data,
      );

      return ApiResponseHelper.success(
        res,
        subject,
        200,
        "Subject updated successfully",
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500,
      );
    }
  }

  async deleteSubject(req: Request, res: Response) {
    try {
      const subjectId = req.params.subjectId ;

      await service.deleteSubject(subjectId as string);

      return ApiResponseHelper.success(
        res,
        null,
        200,
        "Subject deleted successfully",
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500,
      );
    }
  }

  async getAllSubjectsPaginated(req: Request, res: Response) {
    try {
      const { page, limit, search }: QueryParams = req.query;

      const { data, pagination } = await service.getAllSubjectsPaginated(
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
        e?.message || "Internal Server Error",
        e.status || 500,
      );
    }
  }

  async getSubjectById(req: Request, res: Response) {
    try {
      const subjectId= req.params.subjectId;

      const subject = await service.getSubjectById(subjectId as string);

      return ApiResponseHelper.success(
        res,
        subject,
        200,
        "Subject fetched successfully",
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500,
      );
    }
  }

  async getSubjectsByCourse(req: Request, res: Response) {
    try {
      const { courseId } = req.params;

      const { page, limit, search }: QueryParams = req.query;

      const { data, pagination } = await service.getSubjectsByCoursePaginated(
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
        e?.message || "Internal Server Error",
        e.status || 500,
      );
    }
  }
}
