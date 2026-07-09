import mongoose from "mongoose";
import { SubjectType } from "../types/subject.types";
import { Document, Schema } from "mongoose";

export interface ISubject extends Omit<SubjectType, "courseId">, Document {
  _id: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectModelSchema: Schema = new Schema<ISubject>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },

    semester: { type: Number, required: true, min: 1 },
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true },
    credits: { type: Number, required: true},
    description: { type: String , default: "", trim: true},
    skills: { type: [String], default: [] },
  },
  { timestamps: true },
);

export default mongoose.model<ISubject>("Subject", SubjectModelSchema);
