import PracticeAttempt, {
  IPracticeAttempt,
} from "../models/practiceAttempt.model";

export interface PracticeAttemptFilters {
  jobRoleId?: string;
  mode?: "Oral" | "Coding" | "Mixed";
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
}

export interface IPracticeAttemptRepository {
  create(data: Partial<IPracticeAttempt>): Promise<IPracticeAttempt>;

  findById(id: string): Promise<IPracticeAttempt | null>;

  update(
    id: string,
    data: Partial<IPracticeAttempt>,
  ): Promise<IPracticeAttempt | null>;

  delete(id: string): Promise<boolean>;

  getAllByUserPaginated(
    userId: string,
    page: number,
    limit: number,
    filters: PracticeAttemptFilters,
  ): Promise<{
    data: IPracticeAttempt[];
    total: number;
  }>;
}

export class PracticeAttemptMongoRepository
  implements IPracticeAttemptRepository
{
  async create(data: Partial<IPracticeAttempt>): Promise<IPracticeAttempt> {
    return await PracticeAttempt.create(data);
  }

  async findById(id: string): Promise<IPracticeAttempt | null> {
    return await PracticeAttempt.findById(id).populate(
      "jobRoleId",
      "title category",
    );
  }

  async update(
    id: string,
    data: Partial<IPracticeAttempt>,
  ): Promise<IPracticeAttempt | null> {
    return await PracticeAttempt.findByIdAndUpdate(id, data, {
      returnDocument: "after",
    });
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await PracticeAttempt.findByIdAndDelete(id);
    return !!deleted;
  }

  async getAllByUserPaginated(
    userId: string,
    page: number,
    limit: number,
    filters: PracticeAttemptFilters,
  ) {
    const query: any = { userId };

    if (filters.jobRoleId) {
      query.jobRoleId = filters.jobRoleId;
    }

    if (filters.mode) {
      query.mode = filters.mode;
    }

    if (filters.difficulty) {
      query.difficulty = filters.difficulty;
    }

    const total = await PracticeAttempt.countDocuments(query);

    const data = await PracticeAttempt.find(query)
      .populate("jobRoleId", "title category")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { data, total };
  }
}
