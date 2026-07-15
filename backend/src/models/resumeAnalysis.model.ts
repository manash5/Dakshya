import mongoose, { Document, Schema } from "mongoose";
import { ResumeAnalysisType } from "../types/resumeAnalysis.types";

export interface IResumeAnalysis
  extends Omit<ResumeAnalysisType, "userId" | "comparedToPreviousId">,
    Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  comparedToPreviousId: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeProjectSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    technologies: [{ type: String }],
  },
  { _id: false },
);

const ResumeExperienceSchema = new Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    duration: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { _id: false },
);

const ResumeEducationSchema = new Schema(
  {
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String, default: null },
    duration: { type: String, default: null },
  },
  { _id: false },
);

const ResumeComparisonSchema = new Schema(
  {
    improvements: [{ type: String }],
    regressions: [{ type: String }],
    newSkills: [{ type: String }],
    summary: { type: String, default: "" },
  },
  { _id: false },
);

const ResumeAnalysisModelSchema: Schema = new Schema<IResumeAnalysis>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    resumeUrl: { type: String, required: true },
    originalFileName: { type: String, required: true },
    candidateNameOnResume: { type: String, default: null },
    identityMatch: { type: Boolean, required: true },
    identityReason: { type: String, default: "" },
    skills: [{ type: String }],
    projects: [ResumeProjectSchema],
    experience: [ResumeExperienceSchema],
    education: [ResumeEducationSchema],
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    atsScore: { type: Number, required: true, min: 0, max: 100 },
    recommendations: [{ type: String }],
    comparedToPreviousId: {
      type: Schema.Types.ObjectId,
      ref: "ResumeAnalysis",
      default: null,
    },
    comparison: { type: ResumeComparisonSchema, default: null },
  },
  { timestamps: true },
);

ResumeAnalysisModelSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IResumeAnalysis>(
  "ResumeAnalysis",
  ResumeAnalysisModelSchema,
);
