import { SubjectMongoRepository } from "../repository/subject.repository";
import { CourseMongoRepository } from "../repository/course.repository";
import { UserMongoRepository } from "../repository/user.repository";
import { CreateSubjectDto, UpdateSubjectDto } from "../dtos/subject.dto";
import { HttpException } from "../exceptions/http-exceptions";
import { ISubject } from "../models/subject.model";
import { UserProgressService } from "./userProgress.service";

const subjectRepository = new SubjectMongoRepository();
const courseRepository = new CourseMongoRepository();
const userRepository = new UserMongoRepository();
const userProgressService = new UserProgressService();

export class SubjectService {
  async createSubject(data: CreateSubjectDto): Promise<ISubject> {
    // A Subject must belong to an existing Course
    const course = await courseRepository.findById(data.courseId);
    if (!course) {
      throw new HttpException(404, "Course not found");
    }
    // Subject code must be globally unique
    const existingSubjectByCode = await subjectRepository.findByCode(data.code);
    if (existingSubjectByCode) {
      throw new HttpException(400, "Subject with this code already exists");
    }
    // Semester must be within the course duration
    if (data.semester < 1 || data.semester > course.durationInSemesters) {
      throw new HttpException(400, "Semester exceeds course duration");
    }
    const createdSubject = await subjectRepository.create(data as any);
    await this.refreshAffectedUsers(data.courseId);
    return createdSubject;
  }

  async updateSubject(id: string, data: UpdateSubjectDto): Promise<ISubject> {
    const subject = await subjectRepository.findById(id);

    if (!subject) {
      throw new HttpException(404, "Subject not found");
    }

    // Validate Course
    const courseId = data.courseId ?? subject.courseId.toString();

    const course = await courseRepository.findById(courseId);

    if (!course) {
      throw new HttpException(404, "Course not found");
    }

    // Validate duplicate code
    const subjectCode = data.code ?? subject.code;

    const duplicate = await subjectRepository.findByCode(subjectCode);

    if (duplicate && duplicate._id.toString() !== id) {
      throw new HttpException(400, "Subject with this code already exists");
    }

    // Validate semester
    const semester = data.semester ?? subject.semester;

    if (semester < 1 || semester > course.durationInSemesters) {
      throw new HttpException(400, "Semester exceeds course duration");
    }

    const updatedSubject = await subjectRepository.update(id, data);

    if (!updatedSubject) {
      throw new HttpException(404, "Subject not found");
    }

    await this.refreshAffectedUsers(courseId);
    // Subject moved to a different course — the old course's enrolled
    // students no longer have this subject, so their acquiredSkills need
    // refreshing too, not just the new course's students.
    if (data.courseId && data.courseId !== subject.courseId.toString()) {
      await this.refreshAffectedUsers(subject.courseId.toString());
    }

    return updatedSubject;
  }

  async getAllSubjects(): Promise<ISubject[]> {
    return await subjectRepository.findAll();
  }

  async getSubjectsByCourse(courseId: string): Promise<ISubject[]> {
    const course = await courseRepository.findById(courseId);

    if (!course) {
      throw new HttpException(404, "Course not found");
    }

    return await subjectRepository.findByCourse(courseId);
  }

  async getSubjectsByCoursePaginated(
    courseId: string,
    page?: string,
    limit?: string,
    search?: string,
  ) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new HttpException(404, "Course not found");
    }
    const currentPage = page && parseInt(page) > 0 ? parseInt(page) : 1;
    const currentLimit = limit && parseInt(limit) > 0 ? parseInt(limit) : 10;
    const currentSearch = search && search.trim() !== "" ? search : undefined;

    // NOTE: requires getAllPaginated on SubjectMongoRepository to accept
    // an optional courseId filter (see repository additions).
    const { data, total } = await subjectRepository.getAllPaginated(
      currentPage,
      currentLimit,
      currentSearch,
      courseId,
    );
    const totalPages = Math.ceil(total / currentLimit);
    const pagination = {
      page: currentPage,
      limit: currentLimit,
      totalPages: totalPages,
      total: total,
    };
    return { data, pagination };
  }

  async getSubjectById(id: string): Promise<ISubject> {
    const subject = await subjectRepository.findById(id);
    if (!subject) {
      throw new HttpException(404, "Subject not found");
    }
    return subject;
  }

  async deleteSubject(id: string): Promise<boolean> {
    const existingSubject = await subjectRepository.findById(id);
    if (!existingSubject) {
      throw new HttpException(404, "Subject not found");
    }
    const deleted = await subjectRepository.delete(id);
    if (!deleted) {
      throw new HttpException(500, "Failed to delete subject");
    }
    await this.refreshAffectedUsers(existingSubject.courseId.toString());
    return deleted;
  }

  async getAllSubjectsPaginated(
    page?: string,
    limit?: string,
    search?: string,
  ) {
    const currentPage = page && parseInt(page) > 0 ? parseInt(page) : 1;

    const currentLimit = limit && parseInt(limit) > 0 ? parseInt(limit) : 10;

    const currentSearch = search && search.trim() !== "" ? search : undefined;

    const { data, total } = await subjectRepository.getAllPaginated(
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

  // Subject content (skills, semester placement) feeds directly into every
  // enrolled student's acquiredSkills/readiness (see
  // UserProgressService.updateAcquiredSkills) — a subject changing must
  // refresh everyone in that course immediately, not wait for whoever
  // happens to next trigger a semester/target-role change themselves.
  private async refreshAffectedUsers(courseId: string): Promise<void> {
    const users = await userRepository.findByCourseId(courseId);
    for (const user of users) {
      try {
        await userProgressService.refreshAcademicProgress(user._id.toString());
      } catch (e) {
        // Most commonly: no progress doc yet (user hasn't onboarded) —
        // nothing to refresh. Logged rather than swallowed outright so a
        // genuine failure here doesn't silently masquerade as that case.
        console.warn(
          `[subject] Failed to refresh progress for user ${user._id}:`,
          (e as Error).message,
        );
      }
    }
  }
}
