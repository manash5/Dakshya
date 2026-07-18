import { HttpException } from "../exceptions/http-exceptions";
import { JobPostingMongoRepository } from "../repository/jobPosting.repository";
import {
  ISavedJobRepository,
  SavedJobMongoRepository,
} from "../repository/savedJob.repository";

const savedJobRepository: ISavedJobRepository = new SavedJobMongoRepository();
const jobPostingRepository = new JobPostingMongoRepository();

export class SavedJobService {
  async saveJob(userId: string, jobPostingId: string) {
    const jobPosting = await jobPostingRepository.findById(jobPostingId);

    if (!jobPosting) {
      throw new HttpException(404, "Job posting not found");
    }

    const existing = await savedJobRepository.findByUserAndJob(
      userId,
      jobPostingId,
    );

    if (existing) {
      throw new HttpException(400, "Job already saved");
    }

    return await savedJobRepository.create({ userId, jobPostingId });
  }

  async getSavedJobs(userId: string, page?: string, limit?: string) {
    const currentPage = page && parseInt(page) > 0 ? parseInt(page) : 1;
    const currentLimit = limit && parseInt(limit) > 0 ? parseInt(limit) : 10;

    const { data, total } = await savedJobRepository.getAllByUserPaginated(
      userId,
      currentPage,
      currentLimit,
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

  async unsaveJob(userId: string, jobPostingId: string) {
    const deleted = await savedJobRepository.deleteByUserAndJob(
      userId,
      jobPostingId,
    );

    if (!deleted) {
      throw new HttpException(404, "Saved job not found");
    }

    return true;
  }
}
