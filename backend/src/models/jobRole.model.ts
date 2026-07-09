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
    category: { type: String, required: true , trim: true},
    description: { type: String, default: "", trim: true },
    icon: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model<IJobRole>("JobRole", JobRoleSchema);
