import { JobRoleType } from "../types/jobRole.types";
import mongoose, { Document, Schema } from "mongoose";

export interface IJobRole extends JobRoleType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const JobRoleSchema: Schema = new Schema<IJobRole>(
  {
    title: { type: String, required: true, unique: true , trim: true},
    category: { type: String, required: true , trim: true, index: true},
    description: { type: String, default: "", trim: true },
    icon: { type: String, default: null },
    isActive: { type: Boolean, default: true, trim: true},
    // Cache of AI-generated similar job titles (see keyword_generator.py on
    // the ai-services side). Regenerating this via Gemini on every single
    // scrape run burns through the API quota for no reason — a role's
    // title-synonyms don't change day to day, so we generate them once and
    // reuse until someone clears this field.
    keywords: [{ type: String }],
  },
  { timestamps: true },
);

export default mongoose.model<IJobRole>("JobRole", JobRoleSchema);
