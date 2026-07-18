import { HttpException } from "../exceptions/http-exceptions";
import {
  IProjectRepository,
  ProjectFilters,
  ProjectMongoRepository,
} from "../repository/project.repository";
import { CreateProjectDto, UpdateProjectDto } from "../dtos/project.dto";

const projectRepository: IProjectRepository = new ProjectMongoRepository();

export class ProjectService {
  async createProject(data: CreateProjectDto) {
    return await projectRepository.create(data);
  }

  async getProjectsPaginated(
    page?: string,
    limit?: string,
    filters?: ProjectFilters,
  ) {
    const currentPage = page && parseInt(page) > 0 ? parseInt(page) : 1;
    const currentLimit = limit && parseInt(limit) > 0 ? parseInt(limit) : 10;

    const { data, total } = await projectRepository.getAllPaginated(
      currentPage,
      currentLimit,
      filters ?? {},
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

  async getProjectById(id: string) {
    const project = await projectRepository.findById(id);

    if (!project) {
      throw new HttpException(404, "Project not found");
    }

    return project;
  }

  async updateProject(id: string, data: UpdateProjectDto) {
    const updated = await projectRepository.update(id, data);

    if (!updated) {
      throw new HttpException(404, "Project not found");
    }

    return updated;
  }

  async deleteProject(id: string) {
    const deleted = await projectRepository.delete(id);

    if (!deleted) {
      throw new HttpException(404, "Project not found");
    }

    return true;
  }
}
