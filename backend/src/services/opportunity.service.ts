import {
  OpportunityMongoRepository,
  OpportunityFilters,
} from "../repository/opportunity.repository";
import { JobRoleMongoRepository } from "../repository/jobRole.repository";
import { fastApiClient, OpportunityToClassify } from "../clients/fastapi.client";
import { HttpException } from "../exceptions/http-exceptions";
import {
  CreateOpportunityDto,
  UpdateOpportunityDto,
} from "../dtos/opportunity.dto";

const opportunityRepository = new OpportunityMongoRepository();
const jobRoleRepository = new JobRoleMongoRepository();

// Shared by both the scrape pipeline and admin manual-create: batches every
// item into one AI call, maps the returned role titles back to JobRole
// ObjectIds (title match is case-insensitive since it's just crossing the
// FastAPI/Express boundary as plain strings, not a stored key). Falls back
// to leaving jobRoles empty (general/unclassified) rather than failing the
// whole scrape/create if the AI call errors -- classification is additive
// enrichment, not a hard requirement for an opportunity to be usable.
async function classifyAgainstRoles(
  items: { title: string; description?: string | null; category?: string | null }[],
): Promise<string[][]> {
  const empty = items.map(() => [] as string[]);

  if (items.length === 0) {
    return empty;
  }

  try {
    const jobRoles = await jobRoleRepository.findAll();
    if (jobRoles.length === 0) {
      return empty;
    }

    const titleToId = new Map(jobRoles.map((r) => [r.title.toLowerCase(), r._id.toString()]));
    const toClassify: OpportunityToClassify[] = items.map((item, index) => ({
      index,
      title: item.title,
      description: item.description ?? "",
      category: item.category ?? null,
    }));

    const { classifications } = await fastApiClient.classifyOpportunities(
      toClassify,
      jobRoles.map((r) => r.title),
    );

    const byIndex = new Map(classifications.map((c) => [c.index, c.jobRoles]));

    return items.map((_, index) => {
      const titles = byIndex.get(index) ?? [];
      return titles
        .map((title) => titleToId.get(title.toLowerCase()))
        .filter((id): id is string => !!id);
    });
  } catch {
    return empty;
  }
}

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
    const seenLinks: string[] = [];

    const validOpportunities = opportunities.filter((o) => o.title && o.registrationLink);
    const jobRolesByIndex = await classifyAgainstRoles(validOpportunities);

    for (let i = 0; i < validOpportunities.length; i++) {
      const opportunity = validOpportunities[i];

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
        jobRoles: jobRolesByIndex[i],
      };

      const { created: wasCreated } = await opportunityRepository.upsert(payload);

      if (wasCreated) {
        created++;
      } else {
        updated++;
      }
    }

    const skipped = opportunities.length - validOpportunities.length;

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

    const [jobRoles] = await classifyAgainstRoles([
      { title: data.title, description: data.description, category: data.category },
    ]);

    return await opportunityRepository.create({ ...data, jobRoles });
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
