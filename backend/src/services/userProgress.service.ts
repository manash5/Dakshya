import { HttpException } from "../exceptions/http-exceptions";

import { IUserProgress } from "../models/userProgress.model";

import {
  CreateUserProgressDto,
  UpdateUserProgressDto,
} from "../dtos/userProgress.dto";

import {
  IUserProgressRepository,
  UserProgressMongoRepository,
} from "../repository/userProgress.repository";

import { UserMongoRepository } from "../repository/user.repository";
import { SubjectMongoRepository } from "../repository/subject.repository";
import { JobRoleMongoRepository } from "../repository/jobRole.repository";
import { CareerKnowledgeMongoRepository } from "../repository/careerKnowledge.repository";
import mongoose from "mongoose";

const progressRepository = new UserProgressMongoRepository();

const userRepository = new UserMongoRepository();

const subjectRepository = new SubjectMongoRepository();

const jobRoleRepository = new JobRoleMongoRepository();

const careerKnowledgeRepository = new CareerKnowledgeMongoRepository();

export interface IUserProgressService {
  initializeUserProgress(userId: string): Promise<IUserProgress>;

  getUserProgress(userId: string): Promise<IUserProgress>;

  changeCurrentSemester(userId: string, semester: number): Promise<void>;

  syncTargetRoles(userId: string);

  deleteUserProgress(userId: string): Promise<boolean>;

  completeRoadmapStep(
    userId: string,
    jobRoleId: string,
    stepOrder: number,
  ): Promise<IUserProgress>;

  completeProject(
    userId: string,
    jobRoleId: string,
    projectTitle: string,
  ): Promise<IUserProgress>;

  refreshUserReadiness(userId: string): Promise<IUserProgress>;

  refreshAcademicProgress(userId: string): Promise<IUserProgress>;
}

export class UserProgressService implements IUserProgressService {
  // initilze user progress
  async initializeUserProgress(userId: string): Promise<IUserProgress> {
    const existing = await progressRepository.findByUserId(userId);

    if (existing) {
      throw new HttpException(400, "User progress already exists.");
    }

    const createUserProgressData: CreateUserProgressDto = {
      userId,
      currentSemester: 1,
      completedSubjects: [],
      acquiredSkills: [],
      targetRoleProgress: [],
    };
    return await progressRepository.create(createUserProgressData);
  }

  // get user progress
  async getUserProgress(userId: string): Promise<IUserProgress> {
    let progress = await progressRepository.findByUserId(userId);

    if (!progress) {
      throw new HttpException(404, "User progress not found.");
    }

    return progress;
  }

  // change current semester
  async changeCurrentSemester(userId: string, semester: number): Promise<void> {
    const progress = await this.getUserProgress(userId);
    progress.currentSemester = semester;
    await progressRepository.update(progress._id.toString(), {
      currentSemester: semester,
    });
    await this.refreshAcademicProgress(userId);
  }

  // add and updates the target roles
  async syncTargetRoles(userId: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new HttpException(404, "User not found");
    }
    console.log("came here before");
    const progress = await this.getUserProgress(userId);
    console.log("after this ");
    const selectedRoles = user.targetRoles.map((id) => id.toString());
    const existingRoles = progress.targetRoleProgress.map((role) =>
      role.jobRoleId._id.toString(),
    );
    console.log("Selected Roles:", selectedRoles);

    for (const roleId of selectedRoles) {
      console.log("Role:", roleId);
      if (!existingRoles.includes(roleId)) {
        progress.targetRoleProgress.push({
          jobRoleId: new mongoose.Types.ObjectId(roleId),
          readinessScore: 0,
          missingSkills: [],
          completedRoadmapSteps: [],
          completedProjects: [],
          lastAnalyzed: new Date(),
        });
      }
    }

    progress.targetRoleProgress = progress.targetRoleProgress.filter((role) =>
      selectedRoles.includes(role.jobRoleId._id.toString()),
    );
    console.log("Before update");

    await progressRepository.update(progress._id.toString(), {
      targetRoleProgress: progress.targetRoleProgress,
    });

    console.log("After update");

    console.log("Before refresh readiness");

    try {
      await this.refreshUserReadiness(userId);
    } catch (err) {
      console.error("Refresh readiness failed");
      console.error(err);
      console.error((err as Error).stack);
      throw err;
    }

    console.log("After refresh readiness");
  }

  // updates our academic progress
  async refreshAcademicProgress(userId: string): Promise<IUserProgress> {
    const progress = await this.getUserProgress(userId);
    const completedSubjects = await this.updateCompletedSubjects(progress);
    const acquiredSkills = await this.updateAcquiredSkills(progress);
    const updatedProgress = await progressRepository.update(
      progress._id.toString(),
      {
        completedSubjects,
        acquiredSkills,
      },
    );

    if (!updatedProgress) {
      throw new HttpException(500, "Failed to refresh academic progress");
    }
    return await this.refreshUserReadiness(userId);
  }

  //updates the roadmap step that we just completed
  async completeRoadmapStep(
    userId: string,
    jobRoleId: string,
    stepOrder: number,
  ): Promise<IUserProgress> {
    const progress = await this.getUserProgress(userId);

    const role = progress.targetRoleProgress.find(
      (r) => r.jobRoleId._id.toString() === jobRoleId,
    );

    if (!role) {
      throw new HttpException(404, "Target role not found");
    }

    const alreadyCompleted = role.completedRoadmapSteps.some(
      (step) => step.stepOrder === stepOrder,
    );

    if (!alreadyCompleted) {
      role.completedRoadmapSteps.push({
        stepOrder,
        completedAt: new Date(),
      });
    }

    const updatedProgress = await progressRepository.update(
      progress._id.toString(),
      {
        targetRoleProgress: progress.targetRoleProgress,
      },
    );

    if (!updatedProgress) {
      throw new HttpException(500, "Failed to update roadmap progress");
    }

    return await this.refreshUserReadiness(userId);
  }

  // udpates the project we just completed
  async completeProject(
    userId: string,
    jobRoleId: string,
    projectTitle: string,
  ): Promise<IUserProgress> {
    const progress = await this.getUserProgress(userId);

    const role = progress.targetRoleProgress.find(
      (r) => r.jobRoleId._id.toString() === jobRoleId,
    );

    if (!role) {
      throw new HttpException(404, "Target role not found");
    }

    const alreadyCompleted = role.completedProjects.some(
      (project) =>
        project.projectTitle.toLowerCase() === projectTitle.toLowerCase(),
    );

    if (!alreadyCompleted) {
      role.completedProjects.push({
        projectTitle,
        completedAt: new Date(),
      });
    }

    const updatedProgress = await progressRepository.update(
      progress._id.toString(),
      {
        targetRoleProgress: progress.targetRoleProgress,
      },
    );

    if (!updatedProgress) {
      throw new HttpException(500, "Failed to update completed projects");
    }

    return await this.refreshUserReadiness(userId);
  }

  //updates the user readiness
  async refreshUserReadiness(userId: string): Promise<IUserProgress> {
    const progress = await this.getUserProgress(userId);

    for (const role of progress.targetRoleProgress) {
      console.log("role.jobRoleId =", role.jobRoleId);
      console.log("typeof =", typeof role.jobRoleId);
      console.log("constructor =", role.jobRoleId?.constructor?.name);
      console.log("toString =", role.jobRoleId.toString());
      console.log("JSON =", JSON.stringify(role.jobRoleId));
      role.readinessScore = await this.calculateReadiness(
        progress,
        role.jobRoleId._id.toString(),
      );

      role.missingSkills = await this.calculateMissingSkills(
        progress,
        role.jobRoleId._id.toString(),
      );

      role.lastAnalyzed = new Date();
    }

    const updatedProgress = await progressRepository.update(
      progress._id.toString(),
      {
        targetRoleProgress: progress.targetRoleProgress,
      },
    );

    if (!updatedProgress) {
      throw new HttpException(500, "Failed to refresh user readiness");
    }

    return updatedProgress;
  }

  async deleteUserProgress(userId: string): Promise<boolean> {
    const progress = await progressRepository.findByUserId(userId);

    if (!progress) {
      return true;
    }

    const deleted = await progressRepository.deleteByUserId(userId);

    if (!deleted) {
      throw new HttpException(500, "Failed to delete user progress");
    }

    return true;
  }

  // checks if we need to update the progress of the user if the job knowledge is updated or changed
  async checkForKnowledgeUpdates(userId: string): Promise<IUserProgress> {
    const progress = await this.getUserProgress(userId);

    let hasChanges = false;

    for (const role of progress.targetRoleProgress) {
      const knowledge = await careerKnowledgeRepository.findByJobRoleId(
        role.jobRoleId._id.toString(),
      );

      if (!knowledge) {
        continue;
      }

      if (knowledge.aiGeneratedDate > role.lastAnalyzed) {
        role.readinessScore = await this.calculateReadiness(
          progress,
          role.jobRoleId._id.toString(),
        );

        role.missingSkills = await this.calculateMissingSkills(
          progress,
          role.jobRoleId._id.toString(),
        );

        role.lastAnalyzed = new Date();

        hasChanges = true;
      }
    }

    if (!hasChanges) {
      return progress;
    }

    const updated = await progressRepository.update(progress._id.toString(), {
      targetRoleProgress: progress.targetRoleProgress,
    });

    if (!updated) {
      throw new HttpException(500, "Failed to refresh progress");
    }

    return updated;
  }

  // ====================== Private Methods ===============================
  private async updateCompletedSubjects(progress: IUserProgress) {
    const user = await userRepository.findById(progress.userId._id.toString());
    if (!user) {
      throw new HttpException(404, "User not found");
    }
    const subjects = await subjectRepository.findByCourse(
      user.courseId.toString(),
    );
    return subjects
      .filter((subject) => subject.semester <= progress.currentSemester)
      .map((subject) => ({
        subjectId: subject._id,
        completedAt: new Date(),
        grade: undefined,
      }));
  }

  private async updateAcquiredSkills(progress: IUserProgress) {
    const user = await userRepository.findById(progress.userId._id.toString());
    if (!user) {
      throw new HttpException(404, "User not found");
    }
    const subjects = await subjectRepository.findByCourse(
      user.courseId.toString(),
    );
    const completedSubjects = subjects.filter(
      (subject) => subject.semester <= progress.currentSemester,
    );
    const uniqueSkills = new Set<string>();
    for (const subject of completedSubjects) {
      subject.skills.forEach((skill) => uniqueSkills.add(skill));
    }
    return [...uniqueSkills].map((skill) => ({
      skill,
      lastUpdated: new Date(),
    }));
  }

  private async extractRequiredSkills(jobRoleId: string): Promise<string[]> {
    const knowledge =
      await careerKnowledgeRepository.findByJobRoleId(jobRoleId);

    if (!knowledge) {
      throw new HttpException(404, "Career knowledge not found");
    }

    const skills = new Set<string>();

    // Required Skills
    knowledge.requiredSkills.forEach((skill) =>
      skills.add(skill.toLowerCase()),
    );

    // Roadmap Skills
    knowledge.roadmap.forEach((step) => {
      step.requiredSkills.forEach((skill) => skills.add(skill.toLowerCase()));
    });

    return [...skills];
  }

  private async calculateMissingSkills(
    progress: IUserProgress,
    jobRoleId: string,
  ): Promise<string[]> {
    const requiredSkills = await this.extractRequiredSkills(jobRoleId);

    const acquiredSkills = progress.acquiredSkills.map((skill) =>
      skill.skill.toLowerCase(),
    );

    return requiredSkills.filter((skill) => !acquiredSkills.includes(skill));
  }

  private async calculateReadiness(
    progress: IUserProgress,
    jobRoleId: string,
  ): Promise<number> {
    const requiredSkills = await this.extractRequiredSkills(jobRoleId);

    if (requiredSkills.length === 0) {
      return 0;
    }

    const missingSkills = await this.calculateMissingSkills(
      progress,
      jobRoleId,
    );

    const matchedSkills = requiredSkills.length - missingSkills.length;

    return Math.round((matchedSkills / requiredSkills.length) * 100);
  }

  private async ensureProgressIsUpToDate(
    progress: IUserProgress,
  ): Promise<IUserProgress> {
    let requiresRefresh = false;

    for (const role of progress.targetRoleProgress) {
      const knowledge = await careerKnowledgeRepository.findByJobRoleId(
        role.jobRoleId._id.toString(),
      );

      if (!knowledge) {
        continue;
      }

      if (knowledge.aiGeneratedDate > role.lastAnalyzed) {
        requiresRefresh = true;
        break;
      }
    }

    if (!requiresRefresh) {
      return progress;
    }

    return await this.refreshUserReadiness(progress.userId._id.toString());
  }
}
