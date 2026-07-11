import { Request, Response } from 'express';
import { CareerKnowledgeService } from '../../services/careerKnowledge.service';
import { ApiResponseHelper } from '../../utils/api-response';

interface QueryParams {
  page?: string;
  limit?: string;
  search?: string;
}

const careerService = new CareerKnowledgeService();

export class AdminCareerKnowledgeController {

  async generateCareerKnowledge(req: Request, res: Response) {
    try {
      const jobRoleId = req.params.jobRoleId;
      
      const result = await careerService.generateCareerKnowledge(jobRoleId as string);
      
      return ApiResponseHelper.success(
        res,
        result,
        201,
        "Career knowledge generated successfully"
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500
      );
    }
  }

  async regenerateCareerKnowledge(req: Request, res: Response) {
    try {
      const jobRoleId = req.params.jobRoleId;
      
      const result = await careerService.regenerateCareerKnowledge(jobRoleId as string);
      
      return ApiResponseHelper.success(
        res,
        result,
        200,
        "Career knowledge regenerated successfully"
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500
      );
    }
  }

  async deleteCareerKnowledge(req: Request, res: Response) {
    try {
      const jobRoleId = req.params.jobRoleId;
      
      await careerService.deleteCareerKnowledgeByJobRole(jobRoleId as string);
      
      return ApiResponseHelper.success(
        res,
        null,
        200,
        "Career knowledge deleted successfully"
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500
      );
    }
  }

  async getSingleCareerKnowledge(req: Request, res: Response) {
    try {
      const jobRoleId = req.params.jobRoleId;
      
      const knowledge = await careerService.getCareerKnowledgeByJobRole(jobRoleId as string);
      
      if (!knowledge) {
        return ApiResponseHelper.error(
          res,
          'Career knowledge not found.',
          404
        );
      }

      return ApiResponseHelper.success(
        res,
        knowledge,
        200,
        "Career knowledge fetched successfully"
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500
      );
    }
  }


  async getPaginatedDashboardList(req: Request, res: Response) {
    try {
      const { page, limit, search }: QueryParams = req.query;

      const { data, pagination } = await careerService.getAllCareerKnowledgePaginated(page, limit);
      
      return ApiResponseHelper.success(
        res,
        data,
        200,
        "Dashboard data fetched successfully",
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