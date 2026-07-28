import mongoose from "mongoose";
import JobPosting, { IJobPosting } from "../models/jobPosting.model";
import { CreateJobPostingDto, UpdateJobPostingDto } from "../dtos/jobPosting.dto";

export interface JobPostingFilters {
  location?: string;
  skill?: string;
  experience?: string;
  search?: string;
  // Same title/keyword-aware matching Market Pulse uses (getSkillDemand
  // below) -- lets "jobs for this role" listings agree with the count
  // Market Pulse already shows, instead of a literal-substring search
  // against the role title finding fewer/zero results.
  role?: { title: string; keywords: string[] };
}

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const STOPWORDS = new Set([
  "a", "an", "and", "for", "in", "of", "the", "to", "with", "or",
  // Seniority qualifiers are never required for a match — a "Senior
  // Backend Developer" role should still match a plain "Backend Developer"
  // posting, since postings don't always spell out seniority. Mirrors
  // role_filter.py's old behavior on the ai-services side (now removed).
  "senior", "junior", "lead", "principal", "staff", "associate", "sr", "jr",
]);

const significantWords = (phrase: string): string[] =>
  Array.from(
    new Set(
      phrase
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 0 && !STOPWORDS.has(word)),
    ),
  );

// Jobs aren't tagged to a role at scrape time anymore (see
// jobPosting.model.ts) — role relevance is decided here, at query time, by
// matching a role's title (plus any cached keyword synonyms — see
// jobRole.model.ts) against the job posting's title. A candidate phrase
// matches when ALL of its significant words appear (as whole words, any
// order/position) in the job title — not a literal phrase/substring match,
// so "Senior Backend Developer" still matches a posting titled just
// "Backend Developer", and "Full-Stack Developer" still matches the
// "Full Stack Developer" role. Coarser than the old Python role_filter.py
// (no stemming, no generic-word handling), but a meaningful step up from a
// plain substring match.
export const buildRoleTitleMatch = (roleTitle: string, keywords: string[] = []) => {
  const candidates = [roleTitle, ...keywords]
    .map(significantWords)
    .filter((words) => words.length > 0);

  return {
    $or: candidates.map((words) => ({
      $and: words.map((word) => ({
        title: { $regex: `\\b${escapeRegExp(word)}\\b`, $options: "i" },
      })),
    })),
  };
};

// Mirrors the frontend's dedupeJobs.ts key exactly -- the same company
// posting the same base role across many cities/offices ("Staff Engineer,
// Product (Berlin)" / "(São Paulo)" / ...) is a genuinely distinct listing
// per posting, but reads as one repeated job to a user. Both the job list
// (frontend) and Market Pulse's job counts (below) need to agree on what
// counts as "one job", or the two numbers drift apart again.
export const buildJobDedupeKey = (title: string, company: string): string => {
  const baseTitle = title
    .replace(/\s*[([][^)\]]*[)\]]\s*$/, "")
    .trim()
    .toLowerCase();
  return `${company.trim().toLowerCase()}::${baseTitle}`;
};

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

  deactivateStale(seenApplyLinks: string[]): Promise<number>;

  getSkillDemand(
    roles: { title: string; keywords: string[] }[],
    skills: string[],
  ): Promise<{
    totalJobs: number;
    skillDemand: Record<string, number>;
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
      jobRole: data.jobRole ? new mongoose.Types.ObjectId(data.jobRole) : null,
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

    if (filters.role) {
      const roleMatch = buildRoleTitleMatch(filters.role.title, filters.role.keywords);
      // Combine with an existing $or (from `search`, above) via $and rather
      // than overwriting it -- both apply to postings that request them.
      if (query.$or) {
        query.$and = [{ $or: query.$or }, roleMatch];
        delete query.$or;
      } else {
        Object.assign(query, roleMatch);
      }
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

  async deactivateStale(seenApplyLinks: string[]): Promise<number> {
    // Scraping is one global run now (see jobPosting.service.ts), not
    // per-role, so staleness is global too: anything active that wasn't
    // seen in this run is stale.
    const result = await JobPosting.updateMany(
      {
        applyLink: { $nin: seenApplyLinks },
        isActive: true,
      },
      { isActive: false },
    );

    return result.modifiedCount ?? 0;
  }

  // Demand for each of a user's acquired skills, scoped to the combined
  // pool of live postings across every one of their target roles at once
  // (not per-role) — "out of the N jobs matching your target roles, how
  // many need this skill".
  async getSkillDemand(
    roles: { title: string; keywords: string[] }[],
    skills: string[],
  ): Promise<{
    totalJobs: number;
    skillDemand: Record<string, number>;
  }> {
    if (roles.length === 0 || skills.length === 0) {
      return { totalJobs: 0, skillDemand: {} };
    }

    const roleMatch = {
      $or: roles.flatMap(
        (role) => buildRoleTitleMatch(role.title, role.keywords).$or,
      ),
    };

    // requiredSkills is free-text from scrapers, so demand is matched
    // case-insensitively against the acquired skill strings (same
    // exact-token limitation as everywhere else skills are compared — see
    // readiness.ts).
    const lowerToOriginal = new Map(
      skills.map((skill) => [skill.toLowerCase(), skill]),
    );

    // Dedupe in application code rather than the aggregation pipeline --
    // buildJobDedupeKey needs to strip a trailing "(...)" qualifier, which
    // isn't practical to express as a portable Mongo aggregation stage. The
    // role-matched set is small enough (bounded well under the full
    // collection) for this to be cheap.
    const matchedDocs = await JobPosting.find(
      { ...roleMatch, isActive: true },
      { title: 1, company: 1, requiredSkills: 1 },
    );

    const dedupedByKey = new Map<string, (typeof matchedDocs)[number]>();
    for (const doc of matchedDocs) {
      const key = buildJobDedupeKey(doc.title, doc.company);
      if (!dedupedByKey.has(key)) {
        dedupedByKey.set(key, doc);
      }
    }

    const totalJobs = dedupedByKey.size;

    const skillCounts = new Map<string, number>();
    for (const doc of dedupedByKey.values()) {
      for (const rawSkill of doc.requiredSkills) {
        const lower = rawSkill.toLowerCase();
        if (!lowerToOriginal.has(lower)) continue;
        skillCounts.set(lower, (skillCounts.get(lower) ?? 0) + 1);
      }
    }

    const skillDemand: Record<string, number> = {};
    for (const [lower, count] of skillCounts) {
      const original = lowerToOriginal.get(lower);
      if (original) {
        skillDemand[original] = count;
      }
    }

    return { totalJobs, skillDemand };
  }
}
