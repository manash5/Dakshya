import {
  JobPostingMongoRepository,
  JobPostingFilters,
} from "../repository/jobPosting.repository";
import { JobRoleMongoRepository } from "../repository/jobRole.repository";
import { fastApiClient, RoleScrapeResult } from "../clients/fastapi.client";
import { HttpException } from "../exceptions/http-exceptions";
import { CreateJobPostingDto, UpdateJobPostingDto } from "../dtos/jobPosting.dto";

const jobPostingRepository = new JobPostingMongoRepository();
const jobRoleRepository = new JobRoleMongoRepository();

export interface ScrapeRunStats {
  jobRoleId: string;
  jobRoleTitle: string;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  totalScraped: number;
  created: number;
  updated: number;
  skipped: number;
  deactivated: number;
  keywords: string[];
  error: string | null;
}

// NOTE:
// Scraping never runs on a user request. It only runs from the admin-triggered
// endpoint or the cron job (see cron/jobPosting.cron.ts). Users only ever
// read from MongoDB via getJobPostingsPaginated.
export class JobPostingService {
  async scrapeAndStoreForRole(jobRoleId: string): Promise<ScrapeRunStats> {
    const jobRole = await jobRoleRepository.findById(jobRoleId);

    if (!jobRole) {
      throw new HttpException(404, "Job role not found");
    }

    const { results } = await fastApiClient.scrapeJobPostings([
      { jobRoleId: jobRole._id.toString(), jobRoleTitle: jobRole.title },
    ]);

    return await this.persistRoleResult(results[0], jobRole.title);
  }

  async scrapeAndStoreAllActive(): Promise<ScrapeRunStats[]> {
    const jobRoles = await jobRoleRepository.findAll();

    if (jobRoles.length === 0) {
      return [];
    }

    const roleTitleById = new Map(
      jobRoles.map((role) => [role._id.toString(), role.title]),
    );

    const { results } = await fastApiClient.scrapeJobPostings(
      jobRoles.map((role) => ({
        jobRoleId: role._id.toString(),
        jobRoleTitle: role.title,
      })),
    );

    const stats: ScrapeRunStats[] = [];

    for (const result of results) {
      stats.push(
        await this.persistRoleResult(
          result,
          roleTitleById.get(result.jobRoleId) ?? "",
        ),
      );
    }

    return stats;
  }

  private async persistRoleResult(
    result: RoleScrapeResult,
    jobRoleTitle: string,
  ): Promise<ScrapeRunStats> {
    let created = 0;
    let updated = 0;
    let skipped = 0;
    const seenApplyLinks: string[] = [];

    if (!result.error) {
      for (const job of result.jobs) {
        if (!job.title || !job.applyLink) {
          skipped++;
          continue;
        }

        seenApplyLinks.push(job.applyLink);

        const payload: CreateJobPostingDto = {
          title: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary,
          experience: job.experience,
          employmentType: job.employmentType,
          requiredSkills: job.requiredSkills,
          description: job.description,
          jobRole: result.jobRoleId,
          applyLink: job.applyLink,
          source: job.source,
          postedDate: job.postedDate,
        };

        const { created: wasCreated } = await jobPostingRepository.upsert(payload);

        if (wasCreated) {
          created++;
        } else {
          updated++;
        }
      }
    }

    // Anything for this role not seen in this run is stale — mark inactive
    // instead of deleting, so links that come back later are simply
    // reactivated by the next successful upsert.
    const deactivated = result.error
      ? 0
      : await jobPostingRepository.deactivateStale(result.jobRoleId, seenApplyLinks);

    return {
      jobRoleId: result.jobRoleId,
      jobRoleTitle,
      startedAt: result.stats.startedAt,
      completedAt: result.stats.completedAt,
      durationSeconds: result.stats.durationSeconds,
      totalScraped: result.stats.totalScraped,
      created,
      updated,
      skipped,
      deactivated,
      keywords: result.keywords ?? [],
      error: result.error,
    };
  }

  async getJobPostingsPaginated(
    page?: string,
    limit?: string,
    filters?: JobPostingFilters,
  ) {
    const currentPage = page && parseInt(page) > 0 ? parseInt(page) : 1;
    const currentLimit = limit && parseInt(limit) > 0 ? parseInt(limit) : 10;

    const { data, total } = await jobPostingRepository.getAllPaginated(
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

  async updateJobPosting(id: string, data: UpdateJobPostingDto) {
    const updated = await jobPostingRepository.update(id, data);

    if (!updated) {
      throw new HttpException(404, "Job posting not found");
    }

    return updated;
  }

  async deleteJobPosting(id: string) {
    const deleted = await jobPostingRepository.delete(id);

    if (!deleted) {
      throw new HttpException(404, "Job posting not found");
    }

    return true;
  }
}
