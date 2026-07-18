import mongoose, { Document, Schema } from "mongoose";
import { SavedJobType } from "../types/savedJob.types";

export interface ISavedJob
  extends Omit<SavedJobType, "userId" | "jobPostingId">,
    Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  jobPostingId: mongoose.Types.ObjectId;
  savedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SavedJobModelSchema: Schema = new Schema<ISavedJob>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    jobPostingId: {
      type: Schema.Types.ObjectId,
      ref: "JobPosting",
      required: true,
    },
    savedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// A user can only save the same job once.
SavedJobModelSchema.index({ userId: 1, jobPostingId: 1 }, { unique: true });

export default mongoose.model<ISavedJob>("SavedJob", SavedJobModelSchema);
