import { Request, Response } from "express";
import { SkillPlannerService } from "../services/skillPlanner.service";
import { GenerateSkillResourcesDtoSchema } from "../dtos/skillPlanner.dto";
import { ApiResponseHelper } from "../utils/api-response";
import { z } from "zod";

const skillPlannerService = new SkillPlannerService();

export class SkillPlannerController {
  async getSkillPlanner(req: Request, res: Response) {
    try {
      const userId = req.user!._id.toString();
      const { jobRoleId } = req.params;

      const planner = await skillPlannerService.getSkillPlanner(userId, jobRoleId as string);

      return ApiResponseHelper.success(
        res,
        planner,
        200,
        "Skill planner fetched successfully",
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to fetch skill planner",
        e.status || 500,
      );
    }
  }

  async generateSkillResources(req: Request, res: Response) {
    try {
      const { jobRoleId } = req.params;

      const parsed = GenerateSkillResourcesDtoSchema.safeParse(req.body);

      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }

      const resources = await skillPlannerService.generateResourcesForSkill(
        jobRoleId as string,
        parsed.data.skill,
      );

      return ApiResponseHelper.success(
        res,
        resources,
        200,
        "Resources generated successfully",
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to generate resources",
        e.status || 500,
      );
    }
  }
}
