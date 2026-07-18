import mongoose, { Document, Schema } from "mongoose";
import { PracticeAttemptType } from "../types/practiceAttempt.types";

export interface IPracticeAttempt
  extends Omit<PracticeAttemptType, "userId" | "jobRoleId">,
    Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  jobRoleId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PracticeQuestionSchema = new Schema(
  {
    question: { type: String, required: true },
    type: { type: String, required: true },
    skills: [{ type: String }],
    expectedAnswer: { type: String, default: "" },
    userAnswer: { type: String, default: "" },
    userCode: { type: String, default: "" },
    score: { type: Number, default: 0, min: 0, max: 100 },
    confidenceScore: { type: Number, default: 0, min: 0, max: 100 },
    feedback: { type: String, default: "" },
  },
  { _id: false },
);

const PracticeAttemptModelSchema: Schema = new Schema<IPracticeAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    jobRoleId: { type: Schema.Types.ObjectId, ref: "JobRole", required: true },
    skill: { type: String, default: null },
    skills: { type: [String], default: [] },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    mode: { type: String, enum: ["Oral", "Coding", "Mixed"], required: true },
    questionCount: { type: Number, required: true },
    startedAt: { type: Date, required: true },
    completedAt: { type: Date, default: null },
    duration: { type: Number, default: null },
    overallScore: { type: Number, default: null, min: 0, max: 100 },
    technicalScore: { type: Number, default: null, min: 0, max: 100 },
    communicationScore: { type: Number, default: null, min: 0, max: 100 },
    feedback: { type: String, default: "" },
    recommendations: [{ type: String }],
    questions: [PracticeQuestionSchema],
  },
  { timestamps: true },
);

PracticeAttemptModelSchema.index({ userId: 1, createdAt: -1 });
PracticeAttemptModelSchema.index({ userId: 1, jobRoleId: 1 });
PracticeAttemptModelSchema.index({ userId: 1, skill: 1 });

export default mongoose.model<IPracticeAttempt>(
  "PracticeAttempt",
  PracticeAttemptModelSchema,
);
