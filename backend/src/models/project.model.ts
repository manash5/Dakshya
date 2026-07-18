import mongoose, { Document, Schema } from "mongoose";
import { ProjectType } from "../types/project.types";

export interface IProject extends Omit<ProjectType, "careerRole">, Document {
  _id: mongoose.Types.ObjectId;
  careerRole: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectModelSchema: Schema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    skills: [{ type: String }],
    requirements: [{ type: String }],
    githubTemplate: { type: String, default: null },
    estimatedHours: { type: Number, required: true },
    careerRole: {
      type: Schema.Types.ObjectId,
      ref: "JobRole",
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

ProjectModelSchema.index({ careerRole: 1, difficulty: 1 });

export default mongoose.model<IProject>("Project", ProjectModelSchema);
