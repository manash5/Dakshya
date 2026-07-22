import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

import { HttpException } from "../exceptions/http-exceptions";
import {
  fastApiClient,
  PreviousResumeSummary,
} from "../clients/fastapi.client";
import { UserMongoRepository } from "../repository/user.repository";
import {
  IResumeAnalysisRepository,
  ResumeAnalysisMongoRepository,
} from "../repository/resumeAnalysis.repository";
import { CreateResumeAnalysisDto } from "../dtos/resumeAnalysis.dto";

const resumeAnalysisRepository: IResumeAnalysisRepository =
  new ResumeAnalysisMongoRepository();
const userRepository = new UserMongoRepository();

const UPLOAD_DIR = path.join(__dirname, "../../uploads");

export class ResumeAnalysisService {
  async analyzeAndStore(userId: string, file: Express.Multer.File) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const previous = await resumeAnalysisRepository.findLatestByUser(userId);

    const previousSummary: PreviousResumeSummary | null = previous
      ? {
          skills: previous.skills,
          strengths: previous.strengths,
          weaknesses: previous.weaknesses,
          atsScore: previous.atsScore,
        }
      : null;

    const candidateFullName = `${user.firstName} ${user.lastName}`.trim();

    const result = await fastApiClient.analyzeResume(
      file.buffer,
      file.originalname,
      candidateFullName,
      previousSummary,
    );

    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const storedFileName = `${randomUUID()}-${file.originalname}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, storedFileName), file.buffer);

    // Only carry a comparison forward when the AI actually confirmed this
    // resume belongs to the same person -- comparing scores/skills across
    // two different people's resumes would be meaningless, not just
    // unhelpful (see identityMatch on the FastAPI side).
    const shouldCompare = result.identityMatch && !!previous;

    const payload: CreateResumeAnalysisDto = {
      userId,
      resumeUrl: `/uploads/${storedFileName}`,
      originalFileName: file.originalname,
      candidateNameOnResume: result.candidateNameOnResume,
      identityMatch: result.identityMatch,
      identityReason: result.identityReason,
      skills: result.skills,
      projects: result.projects,
      experience: result.experience,
      education: result.education,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      atsScore: result.atsScore,
      recommendations: result.recommendations,
      comparedToPreviousId: shouldCompare ? previous!._id.toString() : null,
      comparison: shouldCompare ? result.comparison : null,
    };

    return await resumeAnalysisRepository.create(payload);
  }

  async getHistory(userId: string, page?: string, limit?: string) {
    const currentPage = page && parseInt(page) > 0 ? parseInt(page) : 1;
    const currentLimit = limit && parseInt(limit) > 0 ? parseInt(limit) : 10;

    const { data, total } = await resumeAnalysisRepository.getAllByUserPaginated(
      userId,
      currentPage,
      currentLimit,
    );

    return {
      data,
      pagination: {
        page: currentPage,
        limit: currentLimit,
        totalPages: Math.ceil(total / currentLimit),
        total,
      },
    };
  }

  async getLatest(userId: string) {
    const analysis = await resumeAnalysisRepository.findLatestByUser(userId);

    if (!analysis) {
      throw new HttpException(404, "No resume analysis found");
    }

    return analysis;
  }

  async getById(userId: string, id: string) {
    const analysis = await resumeAnalysisRepository.findById(id);

    if (!analysis || analysis.userId.toString() !== userId) {
      throw new HttpException(404, "Resume analysis not found");
    }

    return analysis;
  }

  async delete(userId: string, id: string) {
    const analysis = await resumeAnalysisRepository.findById(id);

    if (!analysis || analysis.userId.toString() !== userId) {
      throw new HttpException(404, "Resume analysis not found");
    }

    return await resumeAnalysisRepository.delete(id);
  }
}
