import { Request, Response } from "express";
import { OpportunityService } from "../services/opportunity.service";
import { ApiResponseHelper } from "../utils/api-response";

interface QueryParams {
  page?: string;
  limit?: string;
  category?: string;
  search?: string;
  jobRoleIds?: string;
}

const service = new OpportunityService();

export class OpportunityController {
  async getOpportunityById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const opportunity = await service.getOpportunityById(id as string);

      return ApiResponseHelper.success(
        res,
        opportunity,
        200,
        "Opportunity fetched successfully"
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500
      );
    }
  }

  async getOpportunities(req: Request, res: Response) {
    try {
      const { page, limit, category, search, jobRoleIds }: QueryParams = req.query;

      const { data, pagination } = await service.getOpportunitiesPaginated(
        page,
        limit,
        {
          category,
          search,
          jobRoleIds: jobRoleIds ? jobRoleIds.split(",").filter(Boolean) : undefined,
        }
      );

      return ApiResponseHelper.success(
        res,
        data,
        200,
        "Opportunities fetched successfully",
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
}
