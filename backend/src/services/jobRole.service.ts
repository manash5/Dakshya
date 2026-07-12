import { JobRoleMongoRepository } from "../repository/jobRole.repository";
import { CreateJobRoleDto, UpdateJobRoleDto } from "../dtos/jobRole.dto";
import { HttpException } from "../exceptions/http-exceptions";
import { IJobRole } from "../models/jobRole.model";
import { CareerKnowledgeMongoRepository } from "../repository/careerKnowledge.repository";
import { CareerKnowledgeService } from "./careerKnowledge.service";

const jobRoleRepository = new JobRoleMongoRepository();
const careerKnowledgeService = new CareerKnowledgeService();

// NOTE:
// JobRole stores only static information.
// AI-generated skills, roadmap, projects and interview topics
// belong to CareerKnowledge and will be generated later.

export class JobRoleService {
  async createJobRole(data: CreateJobRoleDto): Promise<IJobRole> {
    if (!data.category.trim()) {
      throw new HttpException(400, "Category cannot be empty");
    }

    const existingJobRole = await jobRoleRepository.findByTitle(data.title);

    if (existingJobRole) {
      throw new HttpException(400, "Job role with this title already exists");
    }

    const jobRole = await jobRoleRepository.create(data);
    try {
      await careerKnowledgeService.generateCareerKnowledge(
        jobRole._id.toString(),
      );
    } catch {
      await jobRoleRepository.delete(jobRole._id.toString());

      throw new HttpException(500, "Failed to generate career knowledge.");
    }

    return jobRole;
  }

  async updateJobRole(id: string, data: UpdateJobRoleDto): Promise<IJobRole> {
    const jobRole = await jobRoleRepository.findById(id);

    if (!jobRole) {
      throw new HttpException(404, "Job role not found");
    }

    if (data.title && data.title !== jobRole.title) {
      const existingJobRole = await jobRoleRepository.findByTitle(data.title);

      if (existingJobRole && existingJobRole._id.toString() !== id) {
        throw new HttpException(400, "Job role with this title already exists");
      }
    }

    if (data.category !== undefined && data.category.trim() === "") {
      throw new HttpException(400, "Category cannot be empty");
    }

    const updatedJobRole = await jobRoleRepository.update(id, data);

    if (!updatedJobRole) {
      throw new HttpException(404, "Job role not found");
    }

    return updatedJobRole;
  }

  async getAllJobRoles(): Promise<IJobRole[]> {
    return await jobRoleRepository.findAll();
  }

  async getJobRolesByCategory(category: string): Promise<IJobRole[]> {
    return await jobRoleRepository.findByCategory(category);
  }

  async getAllJobRolesPaginated(
    page?: string,
    limit?: string,
    search?: string,
  ) {
    const currentPage = page && parseInt(page) > 0 ? parseInt(page) : 1;

    const currentLimit = limit && parseInt(limit) > 0 ? parseInt(limit) : 10;

    const currentSearch = search && search.trim() !== "" ? search : undefined;

    const { data, total } = await jobRoleRepository.getAllPaginated(
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

  async getJobRoleById(id: string) {
    const jobRole = await jobRoleRepository.findById(id);

    if (!jobRole) {
      throw new HttpException(404, "Job role not found");
    }

    const careerKnowledge =
      await careerKnowledgeService.getCareerKnowledgeByJobRole(
        jobRole._id.toString(),
      );

    return {
      jobRole,
      careerKnowledge,
    };
  }

  /**
   * Soft delete instead of permanent delete.
   * This prevents breaking references from existing users.
   */
  async deleteJobRole(id: string): Promise<boolean> {
    const jobRole = await jobRoleRepository.findById(id);

    if (!jobRole) {
      throw new HttpException(404, "Job role not found");
    }

    const deleted = await jobRoleRepository.delete(id);

    if (!deleted) {
      throw new HttpException(500, "Failed to deactivate job role");
    }

    return deleted;
  }
}
