import { UserProgressMongoRepository } from "../../src/repository/userProgress.repository";
import { createTestUser } from "../helpers/auth";
import { createJobRole } from "../helpers/fixtures";
// UserProgress.populate("completedSubjects.subjectId") needs the Subject
// model registered -- route tests get this for free by importing the whole
// app graph, but this unit test only touches the repository directly.
import "../../src/models/subject.model";

const repo = new UserProgressMongoRepository();

describe("UserProgressMongoRepository", () => {
  it("creates and finds progress by user id and by id", async () => {
    const { user } = await createTestUser();

    const created = await repo.create({
      userId: user._id.toString(),
      currentSemester: 1,
      completedSubjects: [],
      acquiredSkills: [],
      targetRoleProgress: [],
    });

    const byUserId = await repo.findByUserId(user._id.toString());
    const byId = await repo.findById(created._id.toString());

    expect(byUserId?._id.toString()).toBe(created._id.toString());
    expect(byId?._id.toString()).toBe(created._id.toString());
  });

  it("returns null when no progress exists for a user", async () => {
    const { user } = await createTestUser();
    const result = await repo.findByUserId(user._id.toString());
    expect(result).toBeNull();
  });

  it("reports exists() correctly", async () => {
    const { user } = await createTestUser();
    expect(await repo.exists(user._id.toString())).toBe(false);

    await repo.create({
      userId: user._id.toString(),
      currentSemester: 1,
      completedSubjects: [],
      acquiredSkills: [],
      targetRoleProgress: [],
    });

    expect(await repo.exists(user._id.toString())).toBe(true);
  });

  it("finds all progress documents", async () => {
    const { user: userA } = await createTestUser();
    const { user: userB } = await createTestUser();
    await repo.create({
      userId: userA._id.toString(),
      currentSemester: 1,
      completedSubjects: [],
      acquiredSkills: [],
      targetRoleProgress: [],
    });
    await repo.create({
      userId: userB._id.toString(),
      currentSemester: 1,
      completedSubjects: [],
      acquiredSkills: [],
      targetRoleProgress: [],
    });

    const all = await repo.findAll();
    expect(all.length).toBe(2);
  });

  it("finds user ids tracking a given target role", async () => {
    const { user } = await createTestUser();
    const role = await createJobRole();

    await repo.create({
      userId: user._id.toString(),
      currentSemester: 1,
      completedSubjects: [],
      acquiredSkills: [],
      targetRoleProgress: [
        {
          jobRoleId: role._id.toString(),
          readinessScore: 0,
          missingSkills: [],
          completedRoadmapSteps: [],
          roadmapStepProgress: [],
          selfReportedSkills: [],
          completedProjects: [],
          lastAnalyzed: new Date(),
          lastVisited: null,
        } as any,
      ],
    });

    const userIds = await repo.findUserIdsByTargetRole(role._id.toString());
    expect(userIds).toContain(user._id.toString());
  });

  it("deletes progress by user id", async () => {
    const { user } = await createTestUser();
    await repo.create({
      userId: user._id.toString(),
      currentSemester: 1,
      completedSubjects: [],
      acquiredSkills: [],
      targetRoleProgress: [],
    });

    const deleted = await repo.deleteByUserId(user._id.toString());
    expect(deleted).toBe(true);
    expect(await repo.findByUserId(user._id.toString())).toBeNull();
  });

  it("returns false deleting progress that doesn't exist", async () => {
    const { user } = await createTestUser();
    const deleted = await repo.deleteByUserId(user._id.toString());
    expect(deleted).toBe(false);
  });

  it("paginates and searches by acquired skill", async () => {
    const { user: userA } = await createTestUser();
    const { user: userB } = await createTestUser();

    await repo.create({
      userId: userA._id.toString(),
      currentSemester: 1,
      completedSubjects: [],
      acquiredSkills: [{ skill: "javascript", lastUpdated: new Date() } as any],
      targetRoleProgress: [],
    });
    await repo.create({
      userId: userB._id.toString(),
      currentSemester: 1,
      completedSubjects: [],
      acquiredSkills: [{ skill: "python", lastUpdated: new Date() } as any],
      targetRoleProgress: [],
    });

    const all = await repo.getAllPaginated(1, 10);
    expect(all.total).toBe(2);

    const filtered = await repo.getAllPaginated(1, 10, "javascript");
    expect(filtered.total).toBe(1);
  });
});
