import mongoose from "mongoose";
import {
  CreateUserProgressDto,
  UpdateUserProgressDto,
} from "../dtos/userProgress.dto";
import UserProgress, { IUserProgress } from "../models/userProgress.model";
import { IUser } from "../models/user.model";

export interface IUserProgressRepository {
  create(data: CreateUserProgressDto): Promise<IUserProgress>;

  findById(id: string): Promise<IUserProgress | null>;

  findByUserId(userId: string): Promise<IUserProgress | null>;

  findAll(): Promise<IUserProgress[]>;

  update(
    id: string,
    data: Partial<IUserProgress>,
  ): Promise<IUserProgress | null>;

  deleteByUserId(id: string): Promise<boolean>;

  exists(userId: string): Promise<boolean>;

  getAllPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{
    data: IUserProgress[];
    total: number;
  }>;
}

const toObjectId = (id?: string | null) => {
  if (id === undefined) return undefined;

  return id ? new mongoose.Types.ObjectId(id) : null;
};

export class UserProgressMongoRepository implements IUserProgressRepository {
  async create(data: CreateUserProgressDto): Promise<IUserProgress> {
    return await UserProgress.create({
      ...data,

      userId: toObjectId(data.userId),

      completedSubjects: data.completedSubjects.map((subject) => ({
        ...subject,
        subjectId: toObjectId(subject.subjectId),
      })),

      targetRoleProgress: data.targetRoleProgress.map((role) => ({
        ...role,
        jobRoleId: toObjectId(role.jobRoleId),
      })),
    });
  }
  async findById(id: string): Promise<IUserProgress | null> {
    return await UserProgress.findById(id)
      .populate("userId")
      .populate("completedSubjects.subjectId")
      .populate("targetRoleProgress.jobRoleId");
  }

  async findByUserId(userId: string): Promise<IUserProgress | null> {
    return await UserProgress.findOne({
      userId: toObjectId(userId),
    })
      .populate("userId")
      .populate("completedSubjects.subjectId")
      .populate("targetRoleProgress.jobRoleId");
  }

  async findAll(): Promise<IUserProgress[]> {
    return await UserProgress.find()
      .populate("userId")
      .populate("completedSubjects.subjectId")
      .populate("targetRoleProgress.jobRoleId");
  }

  async update(
    id: string,
    data: Partial<IUserProgress>,
  ): Promise<IUserProgress | null> {
    return await UserProgress.findByIdAndUpdate(
      id,

      data,

      {
        returnDocument: "after",
      },
    )
      .populate("userId")
      .populate("completedSubjects.subjectId")
      .populate("targetRoleProgress.jobRoleId");
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    const deleted = await UserProgress.findOneAndDelete({
      userId: new mongoose.Types.ObjectId(userId),
    });

    return !!deleted;
  }
  async exists(userId: string): Promise<boolean> {
    const exists = await UserProgress.exists({
      userId: toObjectId(userId),
    });

    return !!exists;
  }

  async getAllPaginated(
    page: number,

    limit: number,

    search?: string,
  ) {
    const query: any = {};

    if (search) {
      query.$or = [
        {
          acquiredSkills: {
            $elemMatch: {
              skill: {
                $regex: search,
                $options: "i",
              },
            },
          },
        },
      ];
    }

    const total = await UserProgress.countDocuments(query);

    const data = await UserProgress.find(query)

      .populate("userId")
      .populate("completedSubjects.subjectId")
      .populate("targetRoleProgress.jobRoleId")

      .skip((page - 1) * limit)

      .limit(limit);

    return {
      data,

      total,
    };
  }
}
