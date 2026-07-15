import Opportunity, { IOpportunity } from "../models/opportunity.model";
import {
  CreateOpportunityDto,
  UpdateOpportunityDto,
} from "../dtos/opportunity.dto";

export interface OpportunityFilters {
  category?: string;
  search?: string;
}

export interface IOpportunityRepository {
  upsert(
    data: CreateOpportunityDto,
  ): Promise<{ doc: IOpportunity; created: boolean }>;

  findById(id: string): Promise<IOpportunity | null>;

  update(id: string, data: UpdateOpportunityDto): Promise<IOpportunity | null>;

  delete(id: string): Promise<boolean>;

  getAllPaginated(
    page: number,
    limit: number,
    filters: OpportunityFilters,
  ): Promise<{
    data: IOpportunity[];
    total: number;
  }>;

  deactivateStale(seenLinks: string[]): Promise<number>;
}

export class OpportunityMongoRepository implements IOpportunityRepository {
  async upsert(
    data: CreateOpportunityDto,
  ): Promise<{ doc: IOpportunity; created: boolean }> {
    const existing = await Opportunity.findOne({
      registrationLink: data.registrationLink,
    });

    if (existing) {
      existing.set({
        title: data.title,
        organizer: data.organizer,
        category: data.category,
        location: data.location,
        eventDate: data.eventDate,
        description: data.description,
        postedDate: data.postedDate,
        source: data.source,
        isActive: true,
      });

      await existing.save();

      return { doc: existing, created: false };
    }

    const created = await Opportunity.create({
      ...data,
      isActive: true,
    });

    return { doc: created, created: true };
  }

  async findById(id: string): Promise<IOpportunity | null> {
    return await Opportunity.findById(id);
  }

  async update(
    id: string,
    data: UpdateOpportunityDto,
  ): Promise<IOpportunity | null> {
    return await Opportunity.findByIdAndUpdate(id, data, {
      returnDocument: "after",
    });
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await Opportunity.findByIdAndDelete(id);
    return !!deleted;
  }

  async getAllPaginated(
    page: number,
    limit: number,
    filters: OpportunityFilters,
  ) {
    const query: any = { isActive: true };

    if (filters.category) {
      query.category = { $regex: filters.category, $options: "i" };
    }

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { organizer: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }

    const total = await Opportunity.countDocuments(query);

    const data = await Opportunity.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      data,
      total,
    };
  }

  async deactivateStale(seenLinks: string[]): Promise<number> {
    const result = await Opportunity.updateMany(
      {
        registrationLink: { $nin: seenLinks },
        isActive: true,
      },
      { isActive: false },
    );

    return result.modifiedCount ?? 0;
  }
}
