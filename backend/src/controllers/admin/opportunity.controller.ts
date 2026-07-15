import { Request, Response } from "express";
import { z } from "zod";
import { OpportunityService } from "../../services/opportunity.service";
import {
  CreateOpportunityDtoSchema,
  UpdateOpportunityDtoSchema,
} from "../../dtos/opportunity.dto";
import { ApiResponseHelper } from "../../utils/api-response";

const service = new OpportunityService();

export class AdminOpportunityController {
  async createOpportunity(req: Request, res: Response) {
    try {
      const parsed = CreateOpportunityDtoSchema.safeParse(req.body);

      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }

      const opportunity = await service.createOpportunity(parsed.data);

      return ApiResponseHelper.success(
        res,
        opportunity,
        201,
        "Opportunity created successfully"
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500
      );
    }
  }

  async scrapeOpportunities(req: Request, res: Response) {
    try {
      const stats = await service.scrapeAndStoreAll();

      return ApiResponseHelper.success(
        res,
        stats,
        200,
        "Opportunities scraped successfully"
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500
      );
    }
  }

  async updateOpportunity(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const parsed = UpdateOpportunityDtoSchema.safeParse(req.body);

      if (!parsed.success) {
        return ApiResponseHelper.error(
          res,
          z.prettifyError(parsed.error),
          400
        );
      }

      const opportunity = await service.updateOpportunity(id as string, parsed.data);

      return ApiResponseHelper.success(
        res,
        opportunity,
        200,
        "Opportunity updated successfully"
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500
      );
    }
  }

  async deleteOpportunity(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await service.deleteOpportunity(id as string);

      return ApiResponseHelper.success(
        res,
        null,
        200,
        "Opportunity deleted successfully"
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
