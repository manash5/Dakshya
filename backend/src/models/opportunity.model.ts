import mongoose, { Document, Schema } from "mongoose";
import { OpportunityType } from "../types/opportunity.types";

export interface IOpportunity
  extends Omit<OpportunityType, "jobRoles">,
    Document {
  _id: mongoose.Types.ObjectId;
  jobRoles: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const OpportunityModelSchema: Schema = new Schema<IOpportunity>(
  {
    title: { type: String, required: true, trim: true },
    organizer: { type: String, default: "Unknown", trim: true },
    category: { type: String, default: null },
    location: { type: String, default: "Nepal", trim: true },
    eventDate: { type: String, default: null },
    description: { type: String, default: "" },
    registrationLink: { type: String, required: true, unique: true },
    source: { type: String, required: true },
    postedDate: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    jobRoles: [{ type: Schema.Types.ObjectId, ref: "JobRole", default: [] }],
  },
  { timestamps: true },
);

OpportunityModelSchema.index({ isActive: 1 });
OpportunityModelSchema.index({ jobRoles: 1 });

export default mongoose.model<IOpportunity>(
  "Opportunity",
  OpportunityModelSchema,
);
