import mongoose from "mongoose";
import { HttpException } from "../exceptions/http-exceptions";
import {
  IPracticeAttemptRepository,
  PracticeAttemptFilters,
  PracticeAttemptMongoRepository,
} from "../repository/practiceAttempt.repository";
import { JobRoleMongoRepository } from "../repository/jobRole.repository";
import { IPracticeAttempt } from "../models/practiceAttempt.model";
import { IJobRole } from "../models/jobRole.model";
import { fastApiClient } from "../clients/fastapi.client";
import {
  CompletePracticeAttemptDto,
  StartPracticeAttemptDto,
  SubmitAnswerDto,
} from "../dtos/practiceAttempt.dto";

const practiceAttemptRepository: IPracticeAttemptRepository =
  new PracticeAttemptMongoRepository();
const jobRoleRepository = new JobRoleMongoRepository();

const average = (values: number[]): number =>
  values.length === 0
    ? 0
    : Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);

export class PracticeAttemptService {
  async startAttempt(userId: string, data: StartPracticeAttemptDto) {
    const jobRole = await jobRoleRepository.findById(data.jobRoleId);

    if (!jobRole) {
      throw new HttpException(404, "Job role not found");
    }

    const generated = await fastApiClient.generateInterviewQuestions(
      jobRole.title,
      data.difficulty,
      data.mode,
      data.questionCount,
    );

    const questions = generated.questions.map((q) => ({
      question: q.question,
      type: q.type,
      expectedAnswer: "",
      userAnswer: "",
      userCode: "",
      score: 0,
      confidenceScore: 0,
      feedback: "",
    }));

    return await practiceAttemptRepository.create({
      userId: new mongoose.Types.ObjectId(userId),
      jobRoleId: new mongoose.Types.ObjectId(data.jobRoleId),
      difficulty: data.difficulty,
      mode: data.mode,
      questionCount: data.questionCount,
      questions,
      startedAt: new Date(),
      completedAt: null,
      duration: null,
      overallScore: null,
      technicalScore: null,
      communicationScore: null,
      feedback: "",
      recommendations: [],
    });
  }

  async submitAnswer(userId: string, attemptId: string, data: SubmitAnswerDto) {
    const attempt = await this.getOwnedAttempt(userId, attemptId);

    if (attempt.completedAt) {
      throw new HttpException(400, "This practice attempt is already completed");
    }

    const question = attempt.questions[data.questionIndex];

    if (!question) {
      throw new HttpException(404, "Question not found on this attempt");
    }

    const jobRole = attempt.jobRoleId as unknown as IJobRole;

    const evaluation = await fastApiClient.evaluateInterviewAnswer(
      question.question,
      question.type,
      jobRole.title,
      attempt.difficulty,
      data.userAnswer,
      data.userCode,
    );

    question.userAnswer = data.userAnswer;
    question.userCode = data.userCode ?? "";
    question.score = evaluation.technicalScore;
    question.confidenceScore = evaluation.confidenceScore;
    question.feedback = evaluation.feedback;
    question.expectedAnswer = evaluation.idealAnswer;

    const updated = await practiceAttemptRepository.update(attemptId, {
      questions: attempt.questions,
    });

    if (!updated) {
      throw new HttpException(500, "Failed to submit answer");
    }

    return updated;
  }

  async completeAttempt(
    userId: string,
    attemptId: string,
    data: CompletePracticeAttemptDto,
  ) {
    const attempt = await this.getOwnedAttempt(userId, attemptId);

    if (attempt.completedAt) {
      throw new HttpException(400, "This practice attempt is already completed");
    }

    const completedAt = new Date();
    const duration = Math.round(
      (completedAt.getTime() - attempt.startedAt.getTime()) / 1000,
    );

    const technicalScore = average(attempt.questions.map((q) => q.score));
    const communicationScore = average(
      attempt.questions.map((q) => q.confidenceScore),
    );
    const overallScore = Math.round((technicalScore + communicationScore) / 2);

    const updated = await practiceAttemptRepository.update(attemptId, {
      completedAt,
      duration,
      overallScore,
      technicalScore,
      communicationScore,
      feedback: data.feedback,
      recommendations: data.recommendations,
    });

    if (!updated) {
      throw new HttpException(500, "Failed to complete practice attempt");
    }

    return updated;
  }

  async transcribe(fileBuffer: Buffer, fileName: string, mimeType: string) {
    return await fastApiClient.transcribeAudio(fileBuffer, fileName, mimeType);
  }

  async getHistory(
    userId: string,
    page?: string,
    limit?: string,
    filters?: PracticeAttemptFilters,
  ) {
    const currentPage = page && parseInt(page) > 0 ? parseInt(page) : 1;
    const currentLimit = limit && parseInt(limit) > 0 ? parseInt(limit) : 10;

    const { data, total } = await practiceAttemptRepository.getAllByUserPaginated(
      userId,
      currentPage,
      currentLimit,
      filters ?? {},
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

  async getById(userId: string, attemptId: string) {
    return await this.getOwnedAttempt(userId, attemptId);
  }

  async deleteAttempt(userId: string, attemptId: string) {
    await this.getOwnedAttempt(userId, attemptId);

    const deleted = await practiceAttemptRepository.delete(attemptId);

    if (!deleted) {
      throw new HttpException(404, "Practice attempt not found");
    }

    return true;
  }

  private async getOwnedAttempt(
    userId: string,
    attemptId: string,
  ): Promise<IPracticeAttempt> {
    const attempt = await practiceAttemptRepository.findById(attemptId);

    if (!attempt || attempt.userId.toString() !== userId) {
      throw new HttpException(404, "Practice attempt not found");
    }

    return attempt;
  }
}
