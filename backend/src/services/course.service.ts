import { CourseMongoRepository } from "../repository/course.repository";
import { UniversityMongoRepository } from "../repository/university.repository";
import { SubjectMongoRepository } from "../repository/subject.repository";
import { CreateCourseDto, UpdateCourseDto } from "../dtos/course.dto";
import { HttpException } from "../exceptions/http-exceptions";
import { ICourse } from "../models/course.model";

const courseRepository = new CourseMongoRepository();
const universityRepository = new UniversityMongoRepository();
const subjectRepository = new SubjectMongoRepository();

export class CourseService {
  async createCourse(data: CreateCourseDto): Promise<ICourse> {
    // Verify university exists
    const university = await universityRepository.findById(data.universityId);

    if (!university) {
      throw new HttpException(404, "University not found");
    }

    // University + Course Name must be unique
    const existingCourse = await courseRepository.findByNameAndUniversity(
      data.name.trim(),
      data.universityId,
    );

    if (existingCourse) {
      throw new HttpException(
        400,
        "Course with this name already exists for this university",
      );
    }

    return await courseRepository.create(data);
  }

  async updateCourse(id: string, data: UpdateCourseDto): Promise<ICourse> {
    const course = await courseRepository.findById(id);

    if (!course) {
      throw new HttpException(404, "Course not found");
    }

    // If university changes, verify it exists
    if (
      data.universityId &&
      data.universityId !== course.universityId?.toString()
    ) {
      const university = await universityRepository.findById(data.universityId);

      if (!university) {
        throw new HttpException(404, "University not found");
      }
    }

    const universityId = data.universityId ?? course.universityId!.toString();

    const courseName = data.name?.trim() ?? course.name;

    const duplicate = await courseRepository.findByNameAndUniversity(
      courseName,
      universityId,
    );

    if (duplicate && duplicate._id.toString() !== id) {
      throw new HttpException(
        400,
        "Course with this name already exists for this university",
      );
    }

    const updatedCourse = await courseRepository.update(id, data);

    if (!updatedCourse) {
      throw new HttpException(404, "Course not found");
    }

    return updatedCourse;
  }

  async getAllCourses(): Promise<ICourse[]> {
    return await courseRepository.findAll();
  }

  async getCoursesByUniversity(universityId: string): Promise<ICourse[]> {
    const university = await universityRepository.findById(universityId);

    if (!university) {
      throw new HttpException(404, "University not found");
    }

    return await courseRepository.findByUniversity(universityId);
  }

  async getCoursesByUniversityPaginated(
    universityId: string,
    page?: string,
    limit?: string,
    search?: string,
  ) {
    const university = await universityRepository.findById(universityId);

    if (!university) {
      throw new HttpException(404, "University not found");
    }

    const currentPage = page && parseInt(page) > 0 ? parseInt(page) : 1;

    const currentLimit = limit && parseInt(limit) > 0 ? parseInt(limit) : 10;

    const currentSearch = search && search.trim() !== "" ? search : undefined;

    const { data, total } = await courseRepository.getAllPaginated(
      currentPage,
      currentLimit,
      currentSearch,
      universityId,
    );

    return {
      data,
      pagination: {
        page: currentPage,
        limit: currentLimit,
        totalPages: Math.ceil(total / currentLimit),
        total,
      },
    };
  }

  async getCourseById(id: string): Promise<ICourse> {
    const course = await courseRepository.findById(id);

    if (!course) {
      throw new HttpException(404, "Course not found");
    }

    return course;
  }

  async deleteCourse(id: string): Promise<boolean> {
    const existingCourse = await courseRepository.findById(id);

    if (!existingCourse) {
      throw new HttpException(404, "Course not found");
    }

    // Prevent deleting course with subjects
    const subjects = await subjectRepository.findByCourse(id);

    if (subjects.length > 0) {
      throw new HttpException(
        400,
        "Cannot delete a course that still contains subjects",
      );
    }

    const deleted = await courseRepository.delete(id);

    if (!deleted) {
      throw new HttpException(500, "Failed to delete course");
    }

    return deleted;
  }

  async getAllCoursesPaginated(page?: string, limit?: string, search?: string) {
    const currentPage = page && parseInt(page) > 0 ? parseInt(page) : 1;

    const currentLimit = limit && parseInt(limit) > 0 ? parseInt(limit) : 10;

    const currentSearch = search && search.trim() !== "" ? search : undefined;

    const { data, total } = await courseRepository.getAllPaginated(
      currentPage,
      currentLimit,
      currentSearch,
    );

    return {
      data,
      pagination: {
        page: currentPage,
        limit: currentLimit,
        totalPages: Math.ceil(total / currentLimit),
        total,
      },
    };
  }
}
