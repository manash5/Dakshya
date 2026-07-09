import Subject, { ISubject } from "../models/subject.model";
import mongoose, { UpdateQuery } from "mongoose";

const toObjectId = (
  id?: string | null,
): mongoose.Types.ObjectId | null | undefined => {
  if (id === undefined) return undefined;
  return id ? new mongoose.Types.ObjectId(id) : null;
};

export interface ISubjectRepository {
  create(data: Partial<ISubject>): Promise<ISubject>;

  findByName(name: string): Promise<ISubject | null>;

  findById(id: string): Promise<ISubject | null>;

  findByCourse(courseId: string): Promise<ISubject[]>;

  findByCode(code: string): Promise<ISubject | null>;

  findBySemester(courseId: string, semester: number): Promise<ISubject[]>;

  findAll(): Promise<ISubject[]>;

  update(id: string, data: UpdateQuery<ISubject>): Promise<ISubject | null>;

  delete(id: string): Promise<boolean>;

  getAllPaginated(
    page: number,
    limit: number,
    search?: string,
    courseId?: string,
): Promise<{
    data: ISubject[];
    total: number;
}>;
}

export class SubjectMongoRepository implements ISubjectRepository {
  async create(data: Partial<ISubject>): Promise<ISubject> {
    return await Subject.create({
      ...data,
      courseId: toObjectId(data.courseId as any),
    });
  }

  async findByName(name: string): Promise<ISubject | null> {
    return await Subject.findOne({ name });
  }

  async findById(id: string): Promise<ISubject | null> {
    return await Subject.findById(id);
  }

  async findByCourse(courseId: string): Promise<ISubject[]> {
    return await Subject.find({
      courseId: toObjectId(courseId),
    });
  }

  async findBySemester(
    courseId: string,
    semester: number,
  ): Promise<ISubject[]> {
    return await Subject.find({
      courseId: toObjectId(courseId),
      semester,
    });
  }

  async findByCode(code: string): Promise<ISubject | null> {
    return await Subject.findOne({ code });
  }

  async findAll(): Promise<ISubject[]> {
    return await Subject.find().populate("courseId");
  }

  async update(
    id: string,
    data: UpdateQuery<ISubject>,
  ): Promise<ISubject | null> {
    if (data.courseId !== undefined) {
      data.courseId = toObjectId(data.courseId as any) as any;
    }

    return await Subject.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await Subject.findByIdAndDelete(id);
    return !!deleted;
  }

  async getAllPaginated(
    page: number,
    limit: number,
    search?: string,
    courseId?: string,
  ): Promise<{
    data: ISubject[];
    total: number;
  }> {
    const query: any = {};

    if (courseId) {
      query.courseId = toObjectId(courseId);
    }

    if (search) {
      query.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          code: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const total = await Subject.countDocuments(query);

    const data = await Subject.find(query)
      .populate("courseId")
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      data,
      total,
    };
  }
}
