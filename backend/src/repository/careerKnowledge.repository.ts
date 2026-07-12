import mongoose from "mongoose";
import CareerKnowledge, {
  ICareerKnowledge,
} from "../models/careerKnowledge.model";
import {
  CreateCareerKnowledgeDto,
  UpdateCareerKnowledgeDto,
} from "../dtos/careerKnowledge.dto";

const toObjectId = (id?: string | null) => {
  if (id === undefined) return undefined;
  return id ? new mongoose.Types.ObjectId(id) : null;
};

export interface ICareerKnowledgeRepository {
  create(data: CreateCareerKnowledgeDto): Promise<ICareerKnowledge>;

  findByJobRoleId(jobRoleId: string): Promise<ICareerKnowledge | null>;

  updateByJobRoleId(
    jobRoleId: string,
    data: UpdateCareerKnowledgeDto,
  ): Promise<ICareerKnowledge | null>;

  deleteByJobRoleId(jobRoleId: string): Promise<boolean>;

  exists(jobRoleId: string): Promise<boolean>;

  findOutdatedKnowledge(days: number): Promise<ICareerKnowledge[]>;

  getAllPaginated(
    page: number,
    limit: number,
    search?: string,
    difficulty?: "Beginner" | "Intermediate" | "Advanced",
  ): Promise<{
    data: ICareerKnowledge[];
    total: number;
  }>;
}

export class CareerKnowledgeMongoRepository implements ICareerKnowledgeRepository {
  async create(data: CreateCareerKnowledgeDto): Promise<ICareerKnowledge> {
    return await CareerKnowledge.create({
      ...data,
      aiGeneratedDate: new Date(),
      jobRoleId: toObjectId(data.jobRoleId),
    });
  }

  async findByJobRoleId(jobRoleId: string): Promise<ICareerKnowledge | null> {
    return await CareerKnowledge.findOne({
      jobRoleId: toObjectId(jobRoleId),
    }).populate("jobRoleId", "title category");
  }

  async updateByJobRoleId(
    jobRoleId: string,
    data: UpdateCareerKnowledgeDto,
  ): Promise<ICareerKnowledge | null> {
    return await CareerKnowledge.findOneAndUpdate(
      {
        jobRoleId: toObjectId(jobRoleId),
      },
      {
        ...data,
        aiGeneratedDate: new Date(),
      },
      {
        returnDocument: "after",
      },
    ).populate("jobRoleId", "title category");
  }

  async deleteByJobRoleId(jobRoleId: string): Promise<boolean> {
    const deleted = await CareerKnowledge.findOneAndDelete({
      jobRoleId: toObjectId(jobRoleId),
    });

    return !!deleted;
  }

  async exists(jobRoleId: string): Promise<boolean> {
    const exists = await CareerKnowledge.exists({
      jobRoleId: toObjectId(jobRoleId),
    });

    return !!exists;
  }

  async findOutdatedKnowledge(days: number): Promise<ICareerKnowledge[]> {
    const thresholdDate = new Date();

    thresholdDate.setDate(thresholdDate.getDate() - days);

    return await CareerKnowledge.find({
      aiGeneratedDate: {
        $lt: thresholdDate,
      },
    }).populate("jobRoleId", "title category");
  }

  async getAllPaginated(
    page: number,
    limit: number,
    search?: string,
    difficulty?: "Beginner" | "Intermediate" | "Advanced",
  ) {
    const query: any = {};

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (search) {
      query.$or = [
        {
          careerDescription: {
            $regex: search,
            $options: "i",
          },
        },
        {
          requiredSkills: {
            $regex: search,
            $options: "i",
          },
        },
        {
          tools: {
            $regex: search,
            $options: "i",
          },
        },
        {
          frameworks: {
            $regex: search,
            $options: "i",
          },
        },
        {
          certifications: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const total = await CareerKnowledge.countDocuments(query);

    const data = await CareerKnowledge.find(query)
      .populate("jobRoleId", "title category")
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      data,
      total,
    };
  }
}
