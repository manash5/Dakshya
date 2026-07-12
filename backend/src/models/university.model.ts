import mongoose from "mongoose";
import { UniversityType } from "../types/university.types";
import {Document,  Schema } from "mongoose";

export interface IUniversity extends UniversityType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UniversityModelSchema: Schema = new Schema<IUniversity>(
  {
    name: { type: String, required: true, unique: true },
    shortName: { type: String, required: true },
    country: { type: String },
    website: {
        type: String,
        default: null
    }, 
    logo: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model<IUniversity>(
    "University", 
    UniversityModelSchema
); 