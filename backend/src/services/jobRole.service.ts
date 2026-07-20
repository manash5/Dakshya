import { JobRoleMongoRepository } from "../repository/jobRole.repository";
import { CreateJobRoleDto, UpdateJobRoleDto } from "../dtos/jobRole.dto";
import { HttpException } from "../exceptions/http-exceptions";
import { IJobRole } from "../models/jobRole.model";
import { CareerKnowledgeMongoRepository } from "../repository/careerKnowledge.repository";
import { CareerKnowledgeService } from "./careerKnowledge.service";

const jobRoleRepository = new JobRoleMongoRepository();
const careerKnowledgeRepository = new CareerKnowledgeMongoRepository();
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
    } catch (error: any) {
      // Don't roll back the job role over an AI hiccup (quota, rate limit,
      // transient outage — all things Gemini's free tier actually does).
      // The role itself is valid data independent of career knowledge;
      // admin can retry generation via the regenerate endpoint once
      // Gemini is available again.
      console.error(
        `Career knowledge generation failed for job role ${jobRole._id}: ${error?.message || error}`,
      );
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

    const titleChanged = !!data.title && data.title !== jobRole.title;

    const updatedJobRole = await jobRoleRepository.update(id, data);

    if (!updatedJobRole) {
      throw new HttpException(404, "Job role not found");
    }

    if (titleChanged) {
      // Career knowledge content is generated FROM the title — if it
      // changes, existing content is stale. Same failure tolerance as
      // create: don't let an AI hiccup block the job role update itself.
      try {
        const hasCareerKnowledge = await careerKnowledgeRepository.exists(id);
        if (hasCareerKnowledge) {
          await careerKnowledgeService.regenerateCareerKnowledge(id);
        } else {
          await careerKnowledgeService.generateCareerKnowledge(id);
        }
      } catch (error: any) {
        console.error(
          `Career knowledge update failed for job role ${id}: ${error?.message || error}`,
        );
      }
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

    // Career knowledge may not exist yet — generation can fail (AI quota,
    // rate limit, transient outage) without blocking job role creation, so
    // this has to tolerate that instead of throwing.
    let careerKnowledge = null;
    try {
      careerKnowledge = await careerKnowledgeService.getCareerKnowledgeByJobRole(
        jobRole._id.toString(),
      );
    } catch {
      // keep careerKnowledge as null
    }

    return {
      jobRole,
      careerKnowledge,
    };
  }

  /**
   * NOTE: despite this comment's original claim, jobRoleRepository.delete()
   * is a hard delete (findByIdAndDelete), not a soft one — there is no
   * isActive-flip path here. That's a real risk: any UserProgress doc with
   * a targetRoleProgress.jobRoleId pointing at this role, or any other
   * collection referencing it, is left dangling once this runs. Confirmed
   * this happen live to real user data — see conversation history.
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

    try {
      await careerKnowledgeService.deleteCareerKnowledgeByJobRole(id);
    } catch {
      // No career knowledge existed for this role (e.g. generation never
      // succeeded, or it was already removed) — nothing to clean up.
    }

    return deleted;
  }
}
