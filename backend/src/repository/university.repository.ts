import { UpdateQuery } from "mongoose";
import University, { IUniversity } from "../models/university.model";

export interface IUniversityRepository {
  create(data: Partial<IUniversity>): Promise<IUniversity>;
  findById(id: string): Promise<IUniversity | null>;
  findByName(name: string): Promise<IUniversity | null>;
  findAll(): Promise<IUniversity[]>;
  update(
    id: string,
    data: UpdateQuery<IUniversity>,
  ): Promise<IUniversity | null>;

  delete(id: string): Promise<boolean>;

  getAllPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{
    data: IUniversity[];
    total: number;
  }>;
}

export class UniversityMongoRepository implements IUniversityRepository {
  async create(data: Partial<IUniversity>): Promise<IUniversity> {
    const university = await University.create(data);
    return university;
  }

  async findById(id: string): Promise<IUniversity | null> {
    return await University.findById(id);
  }

  async findByName(name: string): Promise<IUniversity | null> {
    return await University.findOne({ name: name });
  }

  async findAll(): Promise<IUniversity[]> {
    return await University.find();
  }

  async update(
    id: string,
    data: UpdateQuery<IUniversity>,
  ): Promise<IUniversity | null> {
    return await University.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await University.findByIdAndDelete(id);
    return !!deleted;
  }

  async getAllPaginated(page: number, limit: number, search?: string) {
    const query: any = {};

    if (search) {
      query.name = {
        $regex: search,
        $options: "i",
      };
    }

    const total = await University.countDocuments(query);

    const data = await University.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    return { data, total };
  }
}
