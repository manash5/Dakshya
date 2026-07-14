import mongoose from "mongoose";
import JobPosting, { IJobPosting } from "../models/jobPosting.model";
import { CreateJobPostingDto, UpdateJobPostingDto } from "../dtos/jobPosting.dto";

export interface JobPostingFilters {
  jobRole?: string;
  location?: string;
  skill?: string;
  experience?: string;
  search?: string;
}

export interface IJobPostingRepository {
  upsert(
    data: CreateJobPostingDto,
  ): Promise<{ doc: IJobPosting; created: boolean }>;

  findById(id: string): Promise<IJobPosting | null>;

  update(id: string, data: UpdateJobPostingDto): Promise<IJobPosting | null>;

  delete(id: string): Promise<boolean>;

  getAllPaginated(
    page: number,
    limit: number,
    filters: JobPostingFilters,
  ): Promise<{
    data: IJobPosting[];
    total: number;
  }>;

  deactivateStale(jobRoleId: string, seenApplyLinks: string[]): Promise<number>;

  getMarketPulseByRole(jobRoleId: string): Promise<{
    jobCount: number;
    topLocations: string[];
    topCompanies: string[];
  }>;
}

export class JobPostingMongoRepository implements IJobPostingRepository {
  async upsert(
    data: CreateJobPostingDto,
  ): Promise<{ doc: IJobPosting; created: boolean }> {
    const existing = await JobPosting.findOne({
      title: data.title,
      company: data.company,
      applyLink: data.applyLink,
    });

    if (existing) {
      existing.set({
        location: data.location,
        salary: data.salary,
        experience: data.experience,
        employmentType: data.employmentType,
        requiredSkills: data.requiredSkills,
        description: data.description,
        postedDate: data.postedDate,
        source: data.source,
        isActive: true,
      });

      await existing.save();

      return { doc: existing, created: false };
    }

    const created = await JobPosting.create({
      ...data,
      jobRole: new mongoose.Types.ObjectId(data.jobRole),
      isActive: true,
    });

    return { doc: created, created: true };
  }

  async findById(id: string): Promise<IJobPosting | null> {
    return await JobPosting.findById(id).populate("jobRole", "title category");
  }

  async update(
    id: string,
    data: UpdateJobPostingDto,
  ): Promise<IJobPosting | null> {
    return await JobPosting.findByIdAndUpdate(id, data, {
      returnDocument: "after",
    });
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await JobPosting.findByIdAndDelete(id);
    return !!deleted;
  }

  async getAllPaginated(
    page: number,
    limit: number,
    filters: JobPostingFilters,
  ) {
    const query: any = { isActive: true };

    if (filters.jobRole) {
      query.jobRole = new mongoose.Types.ObjectId(filters.jobRole);
    }

    if (filters.location) {
      query.location = { $regex: filters.location, $options: "i" };
    }

    if (filters.experience) {
      query.experience = { $regex: filters.experience, $options: "i" };
    }

    if (filters.skill) {
      query.requiredSkills = { $regex: filters.skill, $options: "i" };
    }

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { company: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }

    const total = await JobPosting.countDocuments(query);

    const data = await JobPosting.find(query)
      .populate("jobRole", "title category")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      data,
      total,
    };
  }

  async deactivateStale(
    jobRoleId: string,
    seenApplyLinks: string[],
  ): Promise<number> {
    const result = await JobPosting.updateMany(
      {
        jobRole: new mongoose.Types.ObjectId(jobRoleId),
        applyLink: { $nin: seenApplyLinks },
        isActive: true,
      },
      { isActive: false },
    );

    return result.modifiedCount ?? 0;
  }

  async getMarketPulseByRole(jobRoleId: string): Promise<{
    jobCount: number;
    topLocations: string[];
    topCompanies: string[];
  }> {
    const [result] = await JobPosting.aggregate([
      {
        $match: {
          jobRole: new mongoose.Types.ObjectId(jobRoleId),
          isActive: true,
        },
      },
      {
        $facet: {
          count: [{ $count: "total" }],
          locations: [
            { $group: { _id: "$location", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 3 },
          ],
          companies: [
            { $group: { _id: "$company", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 3 },
          ],
        },
      },
    ]);

    return {
      jobCount: result?.count?.[0]?.total ?? 0,
      topLocations: (result?.locations ?? [])
        .map((entry: { _id: string | null }) => entry._id)
        .filter((location: string | null): location is string => !!location),
      topCompanies: (result?.companies ?? [])
        .map((entry: { _id: string | null }) => entry._id)
        .filter((company: string | null): company is string => !!company),
    };
  }
}
