import mongoose from "mongoose";
import ResumeAnalysis, {
  IResumeAnalysis,
} from "../models/resumeAnalysis.model";
import { CreateResumeAnalysisDto } from "../dtos/resumeAnalysis.dto";

export interface IResumeAnalysisRepository {
  create(data: CreateResumeAnalysisDto): Promise<IResumeAnalysis>;

  findById(id: string): Promise<IResumeAnalysis | null>;

  findLatestByUser(userId: string): Promise<IResumeAnalysis | null>;

  getAllByUserPaginated(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{
    data: IResumeAnalysis[];
    total: number;
  }>;

  delete(id: string): Promise<boolean>;
}

export class ResumeAnalysisMongoRepository
  implements IResumeAnalysisRepository
{
  async create(data: CreateResumeAnalysisDto): Promise<IResumeAnalysis> {
    return await ResumeAnalysis.create({
      ...data,
      userId: new mongoose.Types.ObjectId(data.userId),
      comparedToPreviousId: data.comparedToPreviousId
        ? new mongoose.Types.ObjectId(data.comparedToPreviousId)
        : null,
    });
  }

  async findById(id: string): Promise<IResumeAnalysis | null> {
    return await ResumeAnalysis.findById(id);
  }

  async findLatestByUser(userId: string): Promise<IResumeAnalysis | null> {
    return await ResumeAnalysis.findOne({ userId }).sort({ createdAt: -1 });
  }

  async getAllByUserPaginated(userId: string, page: number, limit: number) {
    const query = { userId };

    const total = await ResumeAnalysis.countDocuments(query);

    const data = await ResumeAnalysis.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { data, total };
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await ResumeAnalysis.findByIdAndDelete(id);
    return !!deleted;
  }
}
