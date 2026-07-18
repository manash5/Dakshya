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

// title/company (Experience) and institution/degree (Education) are NOT
// `required` even though they're conceptually the core fields -- FastAPI's
// extraction schema already normalizes a missing value to "" rather than
// null (see resume_analysis/schemas.py's null_to_empty validators), so the
// real contract here is "always a string, possibly empty," not "always
// present." Mongoose's `required` validator rejects "" too, so keeping
// `required: true` here crashed on any resume where the AI couldn't find a
// company/degree for one entry.
const ResumeExperienceSchema = new Schema(
  {
    title: { type: String, default: "" },
    company: { type: String, default: "" },
    duration: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { _id: false },
);

const ResumeEducationSchema = new Schema(
  {
    institution: { type: String, default: "" },
    degree: { type: String, default: "" },
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
