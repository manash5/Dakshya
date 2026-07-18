import mongoose from "mongoose";
import SavedJob, { ISavedJob } from "../models/savedJob.model";
import { CreateSavedJobDto } from "../dtos/savedJob.dto";

export interface ISavedJobRepository {
  create(data: CreateSavedJobDto): Promise<ISavedJob>;

  findByUserAndJob(
    userId: string,
    jobPostingId: string,
  ): Promise<ISavedJob | null>;

  getAllByUserPaginated(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{
    data: ISavedJob[];
    total: number;
  }>;

  deleteByUserAndJob(userId: string, jobPostingId: string): Promise<boolean>;
}

export class SavedJobMongoRepository implements ISavedJobRepository {
  async create(data: CreateSavedJobDto): Promise<ISavedJob> {
    return await SavedJob.create({
      userId: new mongoose.Types.ObjectId(data.userId),
      jobPostingId: new mongoose.Types.ObjectId(data.jobPostingId),
      savedAt: new Date(),
    });
  }

  async findByUserAndJob(
    userId: string,
    jobPostingId: string,
  ): Promise<ISavedJob | null> {
    return await SavedJob.findOne({ userId, jobPostingId });
  }

  async getAllByUserPaginated(userId: string, page: number, limit: number) {
    const query = { userId };

    const total = await SavedJob.countDocuments(query);

    const data = await SavedJob.find(query)
      .populate("jobPostingId")
      .sort({ savedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { data, total };
  }

  async deleteByUserAndJob(
    userId: string,
    jobPostingId: string,
  ): Promise<boolean> {
    const deleted = await SavedJob.findOneAndDelete({ userId, jobPostingId });
    return !!deleted;
  }
}
