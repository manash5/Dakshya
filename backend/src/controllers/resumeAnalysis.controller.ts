import { Request, Response } from "express";
import { ResumeAnalysisService } from "../services/resumeAnalysis.service";
import { ApiResponseHelper } from "../utils/api-response";
import { HttpException } from "../exceptions/http-exceptions";

interface QueryParams {
  page?: string;
  limit?: string;
}

const service = new ResumeAnalysisService();

export class ResumeAnalysisController {
  async analyze(req: Request, res: Response) {
    try {
      const userId = req.user._id.toString();

      if (!req.file) {
        throw new HttpException(400, "Resume file is required");
      }

      const analysis = await service.analyzeAndStore(userId, req.file);

      return ApiResponseHelper.success(
        res,
        analysis,
        201,
        "Resume analyzed successfully",
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500,
      );
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const userId = req.user._id.toString();
      const { page, limit }: QueryParams = req.query;

      const { data, pagination } = await service.getHistory(userId, page, limit);

      return ApiResponseHelper.success(
        res,
        data,
        200,
        "Resume analysis history fetched successfully",
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

  async getLatest(req: Request, res: Response) {
    try {
      const userId = req.user._id.toString();

      const analysis = await service.getLatest(userId);

      return ApiResponseHelper.success(
        res,
        analysis,
        200,
        "Latest resume analysis fetched successfully",
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500,
      );
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const userId = req.user._id.toString();
      const { id } = req.params;

      const analysis = await service.getById(userId, id as string);

      return ApiResponseHelper.success(
        res,
        analysis,
        200,
        "Resume analysis fetched successfully",
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500,
      );
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = req.user._id.toString();
      const { id } = req.params;

      await service.delete(userId, id as string);

      return ApiResponseHelper.success(
        res,
        null,
        200,
        "Resume analysis deleted successfully",
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
