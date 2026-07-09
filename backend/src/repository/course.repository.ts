import mongoose, { UpdateQuery } from "mongoose";
import Course, { ICourse } from "../models/course.model";
import { CreateCourseDto } from "../dtos/course.dto";

const toObjectId = (id?: string | null) => {
  if (id === undefined) return undefined;
  return id ? new mongoose.Types.ObjectId(id) : null;
};

export interface ICourseRepository {
  create(data: CreateCourseDto): Promise<ICourse>;
  findById(id: string): Promise<ICourse | null>;
  findByName(name: string): Promise<ICourse | null>;
  findByUniversity(universityId: string): Promise<ICourse[]>;
  findAll(): Promise<ICourse[]>;
  update(id: string, data: UpdateQuery<ICourse>): Promise<ICourse | null>;
  delete(id: string): Promise<boolean>;
  findByNameAndUniversity(name: string, universityId: string): Promise<ICourse | null>;
  getAllPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{
    data: ICourse[];
    total: number;
  }>;
}

export class CourseMongoRepository implements ICourseRepository {

  async create(data: CreateCourseDto): Promise<ICourse> {
    return await Course.create({
      ...data,
      universityId: toObjectId(data.universityId as any),
    });
  }

  async findById(id: string): Promise<ICourse | null> {
    return await Course.findById(id);
  }

  async findByName(name: string): Promise<ICourse | null> {
    return await Course.findOne({ name: name });
  }

  async findByUniversity(universityId: string): Promise<ICourse[]> {
        return await Course.find({ universityId }).populate("universityId");
    }

  async findAll(): Promise<ICourse[]> {
    return await Course.find().populate("universityId");
  }

  async update(id: string, data: UpdateQuery<ICourse>) {
    if (data.universityId) {
      data.universityId = toObjectId(data.universityId as any) as any;
    }

    return await Course.findByIdAndUpdate(id, data, { returnDocument: 'after' });
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await Course.findByIdAndDelete(id);

    return !!deleted;
  }

  async findByNameAndUniversity(name: string, universityId: string): Promise<ICourse | null> {
    return await Course.findOne({ name: name, universityId: universityId });
  }

  async getAllPaginated(page: number, limit: number, search?: string, universityId?: string) {
    const query: any = {};
 
    if (universityId) {
      query.universityId = universityId;
    }
 
    if (search) {
      query.name = {
        $regex: search,
        $options: "i",
      };
    }
 
    const total = await Course.countDocuments(query);
 
    const data = await Course.find(query)
      .populate("universityId")
      .skip((page - 1) * limit)
      .limit(limit);
 
    return { data, total };
  }
}
