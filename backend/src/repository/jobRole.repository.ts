import JobRole, { IJobRole } from "../models/jobRole.model";
import { UpdateQuery } from "mongoose";

export interface IJobRoleRepository {
  create(data: Partial<IJobRole>): Promise<IJobRole>;

  findById(id: string): Promise<IJobRole | null>;

  findByTitle(title: string): Promise<IJobRole | null>;

  findByCategory(category: string): Promise<IJobRole[]>;

  findAll(): Promise<IJobRole[]>;

  update(
    id: string,
    data: UpdateQuery<IJobRole>
  ): Promise<IJobRole | null>;

  delete(id: string): Promise<boolean>;

  getAllPaginated(
    page: number,
    limit: number,
    search?: string
  ): Promise<{
    data: IJobRole[];
    total: number;
  }>;
}

export class JobRoleMongoRepository implements IJobRoleRepository {

  async create(data: Partial<IJobRole>): Promise<IJobRole> {
    return await JobRole.create(data);
  }

  async findById(id: string): Promise<IJobRole | null> {
    return await JobRole.findById(id);
  }

  async findByTitle(title: string): Promise<IJobRole | null> {
    return await JobRole.findOne({ title: title });
  }

  async findByCategory(category: string): Promise<IJobRole[]> {
    return await JobRole.find({ category: category, isActive: true });
  }

  async findAll(): Promise<IJobRole[]> {
    return await JobRole.find({isActive: true});
  }

  async update(
    id: string,
    data: UpdateQuery<IJobRole>
  ): Promise<IJobRole | null> {
    return await JobRole.findByIdAndUpdate(
      id,
      data,
      { returnDocument: 'after' }
    );
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await JobRole.findByIdAndDelete(id);
    return !!deleted;
  }

  async getAllPaginated(
    page: number,
    limit: number,
    search?: string
  ): Promise<{
    data: IJobRole[];
    total: number;
  }> {

    const query: any = {};

    if (search) {
      query.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          category: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const total = await JobRole.countDocuments(query);

    const data = await JobRole.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      data,
      total,
    };
  }
}