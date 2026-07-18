import mongoose from "mongoose";
import Project, { IProject } from "../models/project.model";
import { CreateProjectDto, UpdateProjectDto } from "../dtos/project.dto";

export interface ProjectFilters {
  careerRole?: string;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  search?: string;
}

export interface IProjectRepository {
  create(data: CreateProjectDto): Promise<IProject>;

  findById(id: string): Promise<IProject | null>;

  update(id: string, data: UpdateProjectDto): Promise<IProject | null>;

  delete(id: string): Promise<boolean>;

  getAllPaginated(
    page: number,
    limit: number,
    filters: ProjectFilters,
  ): Promise<{
    data: IProject[];
    total: number;
  }>;
}

export class ProjectMongoRepository implements IProjectRepository {
  async create(data: CreateProjectDto): Promise<IProject> {
    return await Project.create({
      ...data,
      careerRole: new mongoose.Types.ObjectId(data.careerRole),
      isActive: true,
    });
  }

  async findById(id: string): Promise<IProject | null> {
    return await Project.findById(id).populate("careerRole", "title category");
  }

  async update(id: string, data: UpdateProjectDto): Promise<IProject | null> {
    return await Project.findByIdAndUpdate(
      id,
      {
        ...data,
        careerRole: data.careerRole
          ? new mongoose.Types.ObjectId(data.careerRole)
          : undefined,
      },
      { returnDocument: "after" },
    );
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await Project.findByIdAndDelete(id);
    return !!deleted;
  }

  async getAllPaginated(page: number, limit: number, filters: ProjectFilters) {
    const query: any = { isActive: true };

    if (filters.careerRole) {
      query.careerRole = new mongoose.Types.ObjectId(filters.careerRole);
    }

    if (filters.difficulty) {
      query.difficulty = filters.difficulty;
    }

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { skills: { $regex: filters.search, $options: "i" } },
      ];
    }

    const total = await Project.countDocuments(query);

    const data = await Project.find(query)
      .populate("careerRole", "title category")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { data, total };
  }
}
