import mongoose from "mongoose";
import { CourseType } from "../types/course.types";
import { Document, Schema } from "mongoose";

export interface ICourse extends Omit<CourseType, "universityId">, Document {
  _id: mongoose.Types.ObjectId;
  universityId: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const CourseModelSchema: Schema = new Schema<ICourse>(
  {
    universityId: {
      type: Schema.Types.ObjectId,
      ref: "University",
      required: true, 
    },
    name: { type: String, required: true },
    degree: { type: String, enum: ["Bachelor", "Master"], required: true },
    durationInSemesters: { type: Number, required: true },
    description: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

CourseModelSchema.index({ universityId: 1, isActive: 1 });

export default mongoose.model<ICourse>(
    "Course", 
    CourseModelSchema
)
