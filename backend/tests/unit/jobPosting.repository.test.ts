import {
  JobPostingMongoRepository,
  buildJobDedupeKey,
} from "../../src/repository/jobPosting.repository";
import { createJobPosting, createJobRole } from "../helpers/fixtures";

const repo = new JobPostingMongoRepository();

const basePosting = {
  title: "Backend Developer",
  company: "Acme",
  location: "Nepal",
  salary: "Not disclosed",
  experience: null,
  employmentType: null,
  requiredSkills: ["javascript"],
  description: "",
  jobRole: null,
  applyLink: "https://example.com/apply/1",
  source: "test",
  postedDate: null,
};

describe("JobPostingMongoRepository", () => {
  describe("upsert", () => {
    it("creates a new posting when none matches", async () => {
      const { doc, created } = await repo.upsert(basePosting as any);
      expect(created).toBe(true);
      expect(doc.title).toBe("Backend Developer");
    });

    it("updates an existing posting matched by title+company+applyLink", async () => {
      await repo.upsert(basePosting as any);

      const { doc, created } = await repo.upsert({
        ...basePosting,
        salary: "$100k",
      } as any);

      expect(created).toBe(false);
      expect(doc.salary).toBe("$100k");
    });
  });

  describe("getAllPaginated", () => {
    it("filters by role, combined with a text search", async () => {
      const role = await createJobRole({ title: "Backend Developer" });
      await createJobPosting({ title: "Backend Developer", company: "MatchCo" });
      await createJobPosting({ title: "Backend Developer", company: "OtherCo" });

      const { data, total } = await repo.getAllPaginated(1, 10, {
        role: { title: role.title, keywords: [] },
        search: "MatchCo",
      });

      expect(total).toBe(1);
      expect(data[0].company).toBe("MatchCo");
    });

    it("deactivates postings not seen in the latest scrape run", async () => {
      const kept = await createJobPosting({ applyLink: "https://example.com/keep" });
      const stale = await createJobPosting({ applyLink: "https://example.com/stale" });

      const count = await repo.deactivateStale([kept.applyLink]);

      expect(count).toBe(1);
      const { data } = await repo.getAllPaginated(1, 10, {});
      const staleReloaded = data.find((d) => d._id.toString() === stale._id.toString());
      expect(staleReloaded).toBeUndefined();
    });
  });

  describe("getSkillDemand", () => {
    it("returns 0 when the user has no roles or no acquired skills", async () => {
      const result = await repo.getSkillDemand([], ["javascript"]);
      expect(result).toEqual({ totalJobs: 0, skillDemand: {} });

      const result2 = await repo.getSkillDemand([{ title: "Backend Developer", keywords: [] }], []);
      expect(result2).toEqual({ totalJobs: 0, skillDemand: {} });
    });

    it("counts distinct jobs and per-skill demand, deduping near-identical postings", async () => {
      await createJobPosting({
        title: "Backend Developer",
        company: "LawnStarter",
        requiredSkills: ["javascript", "node.js"],
      });
      await createJobPosting({
        title: "Backend Developer (Remote)",
        company: "LawnStarter",
        requiredSkills: ["javascript"],
      });
      await createJobPosting({
        title: "Backend Developer",
        company: "OtherCo",
        requiredSkills: ["python"],
      });

      const result = await repo.getSkillDemand(
        [{ title: "Backend Developer", keywords: [] }],
        ["javascript", "python"],
      );

      // The two LawnStarter postings share a base title (after stripping the
      // trailing "(Remote)" qualifier) and company -- they collapse to one.
      expect(result.totalJobs).toBe(2);
      expect(result.skillDemand.javascript).toBe(1);
      expect(result.skillDemand.python).toBe(1);
    });
  });

  describe("buildJobDedupeKey", () => {
    it("strips a trailing parenthetical qualifier and normalizes case", () => {
      const a = buildJobDedupeKey("Staff Engineer (Berlin)", "Acme Corp");
      const b = buildJobDedupeKey("staff engineer  ", "ACME CORP");
      expect(a).toBe(b);
    });

    it("does not merge genuinely different titles at the same company", () => {
      const a = buildJobDedupeKey("Backend Developer", "Acme");
      const b = buildJobDedupeKey("Frontend Developer", "Acme");
      expect(a).not.toBe(b);
    });
  });
});
