import { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service";
import { ApiResponseHelper } from "../utils/api-response";

const dashboardService = new DashboardService();

export class DashboardController {
  async getCareerDashboard(req: Request, res: Response) {
    try {
      const userId = req.user!._id.toString();

      const dashboard = await dashboardService.getCareerDashboard(userId);

      return ApiResponseHelper.success(
        res,
        dashboard,
        200,
        "Career dashboard fetched successfully",
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to fetch career dashboard",
        e.status || 500,
      );
    }
  }
}
