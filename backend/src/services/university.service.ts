import { UniversityMongoRepository } from "../repository/university.repository";
import { HttpException } from "../exceptions/http-exceptions";
import { IUniversity } from "../models/university.model";
import { CreateUniversityDto, UpdateUniversityDto } from '../dtos/university.dto';
import { CourseMongoRepository } from "../repository/course.repository";
import { SubjectMongoRepository } from "../repository/subject.repository";

const courseRepository = new CourseMongoRepository();
const subjectRepository = new SubjectMongoRepository();
const universityRepository = new UniversityMongoRepository();

export class UniversityService {
  async createUniversity(data: CreateUniversityDto): Promise<IUniversity> {
    // University names must be unique
    const existingUniversityByName = await universityRepository.findByName(data.name);
    if (existingUniversityByName) {
      throw new HttpException(400, "University with this name already exists");
    }
    const createdUniversity = await universityRepository.create(data as any);
    return createdUniversity;
  }

  async updateUniversity(id: string, data: UpdateUniversityDto): Promise<IUniversity> {
    const university = await universityRepository.findById(id);
    if (!university) {
      throw new HttpException(404, "University not found");
    }
    if (data.name && data.name !== university.name) {
      const existingUniversityByName = await universityRepository.findByName(data.name);
      if (existingUniversityByName) {
        throw new HttpException(400, "University with this name already exists");
      }
    }
    const updatedUniversity = await universityRepository.update(id, data);
    if (!updatedUniversity) {
      throw new HttpException(404, "University not found");
    }
    return updatedUniversity;
  }

  async getAllUniversitiesPaginated(page?: string, limit?: string, search?: string) {
    const currentPage = page && parseInt(page) > 0 ? parseInt(page) : 1;
    const currentLimit = limit && parseInt(limit) > 0 ? parseInt(limit) : 10;
    const currentSearch = search && search.trim() !== "" ? search : undefined;

    const { data, total } = await universityRepository.getAllPaginated(currentPage, currentLimit, currentSearch);
    const totalPages = Math.ceil(total / currentLimit);
    const pagination = {
      page: currentPage,
      limit: currentLimit,
      totalPages: totalPages,
      total: total,
    };
    return { data, pagination };
  }

  async getAllUniversities(): Promise<IUniversity[]> {
    const universities = await universityRepository.findAll();

    if (universities.length === 0) {
        throw new HttpException(404, "No universities found");
    }

    return universities;
}

  async getUniversityById(id: string): Promise<IUniversity> {
    const university = await universityRepository.findById(id);
    if (!university) {
      throw new HttpException(404, "University not found");
    }
    return university;
  }

  async deleteUniversity(id: string): Promise<boolean> {
    const existingUniversity = await universityRepository.findById(id);
    if (!existingUniversity) {
      throw new HttpException(404, "University not found");
    }

    // Cascade: delete all subjects under every course of this university
    const courses = await courseRepository.findByUniversity(id);
    for (const course of courses) {
      await subjectRepository.deleteByCourse(course._id.toString());
    }

    // Cascade: delete all courses under this university
    await courseRepository.deleteByUniversity(id);

    const deleted = await universityRepository.delete(id);
    if (!deleted) {
      throw new HttpException(500, "Failed to delete university");
    }
    return deleted;
  }
}