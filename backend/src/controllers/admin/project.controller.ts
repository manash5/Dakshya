import { Request, Response } from "express";
import { z } from "zod";
import { ProjectService } from "../../services/project.service";
import {
  CreateProjectDtoSchema,
  UpdateProjectDtoSchema,
} from "../../dtos/project.dto";
import { ApiResponseHelper } from "../../utils/api-response";

const service = new ProjectService();

export class AdminProjectController {
  async createProject(req: Request, res: Response) {
    try {
      const parsed = CreateProjectDtoSchema.safeParse(req.body);

      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }

      const project = await service.createProject(parsed.data);

      return ApiResponseHelper.success(
        res,
        project,
        201,
        "Project created successfully",
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500,
      );
    }
  }

  async updateProject(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const parsed = UpdateProjectDtoSchema.safeParse(req.body);

      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }

      const project = await service.updateProject(id as string, parsed.data);

      return ApiResponseHelper.success(
        res,
        project,
        200,
        "Project updated successfully",
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500,
      );
    }
  }

  async deleteProject(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await service.deleteProject(id as string);

      return ApiResponseHelper.success(
        res,
        null,
        200,
        "Project deleted successfully",
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
