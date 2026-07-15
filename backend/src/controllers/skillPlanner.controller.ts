import { Request, Response } from "express";
import { SkillPlannerService } from "../services/skillPlanner.service";
import { ApiResponseHelper } from "../utils/api-response";

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
}
