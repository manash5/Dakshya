import {
  OpportunityMongoRepository,
  OpportunityFilters,
} from "../repository/opportunity.repository";
import { fastApiClient } from "../clients/fastapi.client";
import { HttpException } from "../exceptions/http-exceptions";
import {
  CreateOpportunityDto,
  UpdateOpportunityDto,
} from "../dtos/opportunity.dto";

const opportunityRepository = new OpportunityMongoRepository();

export interface OpportunityScrapeRunStats {
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

// Same shape as JobPostingService: scraping never runs on a user request,
// only from the admin-triggered endpoint or the cron job (see
// cron/opportunity.cron.ts). Users only ever read from MongoDB via
// getOpportunitiesPaginated.
export class OpportunityService {
  async scrapeAndStoreAll(): Promise<OpportunityScrapeRunStats> {
    const { opportunities, stats } = await fastApiClient.scrapeOpportunities();

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const seenLinks: string[] = [];

    for (const opportunity of opportunities) {
      if (!opportunity.title || !opportunity.registrationLink) {
        skipped++;
        continue;
      }

      seenLinks.push(opportunity.registrationLink);

      const payload: CreateOpportunityDto = {
        title: opportunity.title,
        organizer: opportunity.organizer,
        category: opportunity.category,
        location: opportunity.location,
        eventDate: opportunity.eventDate,
        description: opportunity.description,
        registrationLink: opportunity.registrationLink,
        source: opportunity.source,
        postedDate: opportunity.postedDate,
      };

      const { created: wasCreated } = await opportunityRepository.upsert(payload);

      if (wasCreated) {
        created++;
      } else {
        updated++;
      }
    }

    const deactivated = await opportunityRepository.deactivateStale(seenLinks);

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

  async createOpportunity(data: CreateOpportunityDto) {
    const existing = await opportunityRepository.findByRegistrationLink(
      data.registrationLink,
    );

    if (existing) {
      throw new HttpException(
        400,
        "An opportunity with this registration link already exists.",
      );
    }

    return await opportunityRepository.create(data);
  }

  async getOpportunitiesPaginated(
    page?: string,
    limit?: string,
    filters?: OpportunityFilters,
  ) {
    const currentPage = page && parseInt(page) > 0 ? parseInt(page) : 1;
    const currentLimit = limit && parseInt(limit) > 0 ? parseInt(limit) : 10;

    const { data, total } = await opportunityRepository.getAllPaginated(
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

  async getOpportunityById(id: string) {
    const opportunity = await opportunityRepository.findById(id);

    if (!opportunity) {
      throw new HttpException(404, "Opportunity not found");
    }

    return opportunity;
  }

  async updateOpportunity(id: string, data: UpdateOpportunityDto) {
    const updated = await opportunityRepository.update(id, data);

    if (!updated) {
      throw new HttpException(404, "Opportunity not found");
    }

    return updated;
  }

  async deleteOpportunity(id: string) {
    const deleted = await opportunityRepository.delete(id);

    if (!deleted) {
      throw new HttpException(404, "Opportunity not found");
    }

    return true;
  }
}
