import mongoose, { Document, Schema } from "mongoose";
import { JobPostingType } from "../types/jobPosting.types";

export interface IJobPosting
  extends Omit<JobPostingType, "jobRole">,
    Document {
  _id: mongoose.Types.ObjectId;
  jobRole: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const JobPostingModelSchema: Schema = new Schema<IJobPosting>(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, default: "Unknown", trim: true },
    location: { type: String, default: "Nepal", trim: true },
    salary: { type: String, default: "Not disclosed" },
    experience: { type: String, default: null },
    employmentType: { type: String, default: null },
    requiredSkills: [{ type: String }],
    description: { type: String, default: "" },
    // Not assigned during scrape anymore — jobs are stored role-agnostic
    // and matched to a user's target roles at query time (title/keyword
    // match). Left available for admin manual tagging only.
    jobRole: {
      type: Schema.Types.ObjectId,
      ref: "JobRole",
      default: null,
    },
    applyLink: { type: String, required: true },
    source: { type: String, required: true },
    postedDate: { type: String, default: null },
    expiresDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

JobPostingModelSchema.index(
  { title: 1, company: 1, applyLink: 1 },
  { unique: true },
);
JobPostingModelSchema.index({ isActive: 1 });

export default mongoose.model<IJobPosting>(
  "JobPosting",
  JobPostingModelSchema,
);
