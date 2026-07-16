import { Request, Response } from "express";
import { z } from "zod";
import { PracticeAttemptService } from "../services/practiceAttempt.service";
import {
  CompletePracticeAttemptDtoSchema,
  StartPracticeAttemptDtoSchema,
  SubmitAnswerDtoSchema,
} from "../dtos/practiceAttempt.dto";
import { ApiResponseHelper } from "../utils/api-response";
import { HttpException } from "../exceptions/http-exceptions";

interface QueryParams {
  page?: string;
  limit?: string;
  jobRoleId?: string;
  skill?: string;
  mode?: "Oral" | "Coding" | "Mixed";
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
}

const service = new PracticeAttemptService();

export class PracticeAttemptController {
  async startAttempt(req: Request, res: Response) {
    try {
      const userId = req.user._id.toString();

      const parsed = StartPracticeAttemptDtoSchema.safeParse(req.body);

      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }

      const attempt = await service.startAttempt(userId, parsed.data);

      return ApiResponseHelper.success(
        res,
        attempt,
        201,
        "Practice attempt started successfully",
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500,
      );
    }
  }

  async submitAnswer(req: Request, res: Response) {
    try {
      const userId = req.user._id.toString();
      const { id } = req.params;

      const parsed = SubmitAnswerDtoSchema.safeParse(req.body);

      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }

      const attempt = await service.submitAnswer(userId, id as string, parsed.data);

      return ApiResponseHelper.success(
        res,
        attempt,
        200,
        "Answer submitted successfully",
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500,
      );
    }
  }

  async completeAttempt(req: Request, res: Response) {
    try {
      const userId = req.user._id.toString();
      const { id } = req.params;

      const parsed = CompletePracticeAttemptDtoSchema.safeParse(req.body);

      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }

      const attempt = await service.completeAttempt(userId, id as string, parsed.data);

      return ApiResponseHelper.success(
        res,
        attempt,
        200,
        "Practice attempt completed successfully",
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
      const { page, limit, jobRoleId, skill, mode, difficulty }: QueryParams = req.query;

      const { data, pagination } = await service.getHistory(userId, page, limit, {
        jobRoleId,
        skill,
        mode,
        difficulty,
      });

      return ApiResponseHelper.success(
        res,
        data,
        200,
        "Practice attempt history fetched successfully",
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

  async getById(req: Request, res: Response) {
    try {
      const userId = req.user._id.toString();
      const { id } = req.params;

      const attempt = await service.getById(userId, id as string);

      return ApiResponseHelper.success(
        res,
        attempt,
        200,
        "Practice attempt fetched successfully",
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500,
      );
    }
  }

  async transcribe(req: Request, res: Response) {
    try {
      if (!req.file) {
        throw new HttpException(400, "Audio file is required");
      }

      const transcription = await service.transcribe(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
      );

      return ApiResponseHelper.success(
        res,
        { transcription },
        200,
        "Audio transcribed successfully",
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500,
      );
    }
  }

  async deleteAttempt(req: Request, res: Response) {
    try {
      const userId = req.user._id.toString();
      const { id } = req.params;

      await service.deleteAttempt(userId, id as string);

      return ApiResponseHelper.success(
        res,
        null,
        200,
        "Practice attempt deleted successfully",
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
