import mongoose, { Document, Schema } from "mongoose";
import { UserProgressType } from "../types/userProgress.types";

export interface IUserProgress
  extends Omit<
    UserProgressType,
    "userId" | "completedSubjects" | "targetRoleProgress"
  >,
    Document {

  _id: mongoose.Types.ObjectId;

  userId: mongoose.Types.ObjectId;

  completedSubjects: {
    subjectId: mongoose.Types.ObjectId;
    completedAt: Date;
    grade?: string;
  }[];

  targetRoleProgress: {
    jobRoleId: mongoose.Types.ObjectId;
    readinessScore: number;
    missingSkills: string[];
    completedRoadmapSteps: {
      stepOrder: number;
      completedAt: Date;
    }[];
    completedProjects: {
      projectTitle: string;
      completedAt: Date;
    }[];
    lastAnalyzed: Date;
    lastVisited: Date | null;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

// Embedded Schemas 
const CompletedSubjectSchema = new Schema(
  {
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    completedAt: {
      type: Date,
      default: Date.now,
    },

    grade: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

const SkillProgressSchema = new Schema(
  {
    skill: {
      type: String,
      required: true,
      trim: true,
    },


    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const CompletedRoadmapStepSchema = new Schema(
  {
    stepOrder: {
      type: Number,
      required: true,
    },

    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const CompletedProjectSchema = new Schema(
  {
    projectTitle: {
      type: String,
      required: true,
      trim: true,
    },

    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const TargetRoleProgressSchema = new Schema(
  {
    jobRoleId: {
      type: Schema.Types.ObjectId,
      ref: "JobRole",
      required: true,
    },

    readinessScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    missingSkills: [
      {
        type: String,
      },
    ],

    completedRoadmapSteps: [CompletedRoadmapStepSchema],

    completedProjects: [CompletedProjectSchema],

    lastAnalyzed: {
      type: Date,
      default: Date.now,
    },

    // Last time the user opened the roadmap/progress page for this specific
    // target role — powers a "continue where you left off" UI. Deliberately
    // not folded into lastAnalyzed, which tracks readiness recomputation,
    // not page visits.
    lastVisited: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

//Main Schema

const UserProgressSchema = new Schema<IUserProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    currentSemester: {
      type: Number,
      default: 1,
    },

    completedSubjects: [CompletedSubjectSchema],

    acquiredSkills: [SkillProgressSchema],

    targetRoleProgress: [TargetRoleProgressSchema],
  },
  {
    timestamps: true,
  }
);

// Index

UserProgressSchema.index({
  "targetRoleProgress.jobRoleId": 1,
});

export default mongoose.model<IUserProgress>(
  "UserProgress",
  UserProgressSchema
);