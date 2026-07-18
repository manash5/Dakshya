import { Request, Response } from "express";
import { ProjectService } from "../services/project.service";
import { ApiResponseHelper } from "../utils/api-response";

interface QueryParams {
  page?: string;
  limit?: string;
  careerRole?: string;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  search?: string;
}

const service = new ProjectService();

export class ProjectController {
  async getProjectById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const project = await service.getProjectById(id as string);

      return ApiResponseHelper.success(
        res,
        project,
        200,
        "Project fetched successfully",
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500,
      );
    }
  }

  async getProjects(req: Request, res: Response) {
    try {
      const { page, limit, careerRole, difficulty, search }: QueryParams =
        req.query;

      const { data, pagination } = await service.getProjectsPaginated(
        page,
        limit,
        { careerRole, difficulty, search },
      );

      return ApiResponseHelper.success(
        res,
        data,
        200,
        "Projects fetched successfully",
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
