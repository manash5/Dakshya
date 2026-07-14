import { z } from "zod";
import { JobPostingSchema } from "../types/jobPosting.types";

export const CreateJobPostingDtoSchema = JobPostingSchema.omit({
  isActive: true,
});

export const UpdateJobPostingDtoSchema = JobPostingSchema.partial().omit({
  jobRole: true,
});

export type CreateJobPostingDto = z.infer<typeof CreateJobPostingDtoSchema>;
export type UpdateJobPostingDto = z.infer<typeof UpdateJobPostingDtoSchema>;
