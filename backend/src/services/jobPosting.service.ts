import {
  JobPostingMongoRepository,
  JobPostingFilters,
} from "../repository/jobPosting.repository";
import { JobRoleMongoRepository } from "../repository/jobRole.repository";
import { fastApiClient } from "../clients/fastapi.client";
import { HttpException } from "../exceptions/http-exceptions";
import { CreateJobPostingDto, UpdateJobPostingDto } from "../dtos/jobPosting.dto";

const jobPostingRepository = new JobPostingMongoRepository();
const jobRoleRepository = new JobRoleMongoRepository();

export interface JobPostingQueryFilters {
  location?: string;
  skill?: string;
  experience?: string;
  search?: string;
  jobRoleId?: string;
}

export interface ScrapeRunStats {
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  sourcesAttempted: string[];
  sourcesSucceeded: string[];
  sourcesFailed: Record<string, string>;
  totalScraped: number;
  created: number;
  updated: number;
  skipped: number;
  deactivated: number;
}

// NOTE:
// Scraping never runs on a user request. It only runs from the admin-triggered
// endpoint or the cron job (see cron/jobPosting.cron.ts). Users only ever
// read from MongoDB via getJobPostingsPaginated.
//
// Scraping is one global run now, not per-role — ai-services returns every
// job it found across all sources, unfiltered. Role relevance (which jobs
// belong to "Frontend Developer" vs "ML Engineer") is decided here, at
// query time, by title/keyword matching (see jobPosting.repository.ts and
// dashboard.service.ts), not baked into what gets stored.
export class JobPostingService {
  async scrapeAndStoreAll(): Promise<ScrapeRunStats> {
    const { jobs, stats } = await fastApiClient.scrapeJobPostings();

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const seenApplyLinks: string[] = [];

    for (const job of jobs) {
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

    // Anything not seen in this run is stale — mark inactive instead of
    // deleting, so links that come back later are simply reactivated by
    // the next successful upsert.
    const deactivated = await jobPostingRepository.deactivateStale(seenApplyLinks);

    return {
      startedAt: stats.startedAt,
      completedAt: stats.completedAt,
      durationSeconds: stats.durationSeconds,
      sourcesAttempted: stats.sourcesAttempted,
      sourcesSucceeded: stats.sourcesSucceeded,
      sourcesFailed: stats.sourcesFailed,
      totalScraped: stats.totalScraped,
      created,
      updated,
      skipped,
      deactivated,
    };
  }

  async getJobPostingsPaginated(
    page?: string,
    limit?: string,
    filters?: JobPostingQueryFilters,
  ) {
    const currentPage = page && parseInt(page) > 0 ? parseInt(page) : 1;
    const currentLimit = limit && parseInt(limit) > 0 ? parseInt(limit) : 10;

    const repositoryFilters: JobPostingFilters = {
      location: filters?.location,
      skill: filters?.skill,
      experience: filters?.experience,
      search: filters?.search,
    };

    if (filters?.jobRoleId) {
      const jobRole = await jobRoleRepository.findById(filters.jobRoleId);

      if (!jobRole) {
        throw new HttpException(404, "Job role not found");
      }

      repositoryFilters.role = { title: jobRole.title, keywords: jobRole.keywords ?? [] };
    }

    const { data, total } = await jobPostingRepository.getAllPaginated(
      currentPage,
      currentLimit,
      repositoryFilters,
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

  async getJobPostingById(id: string) {
    const jobPosting = await jobPostingRepository.findById(id);

    if (!jobPosting) {
      throw new HttpException(404, "Job posting not found");
    }

    return jobPosting;
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
