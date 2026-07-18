import { z } from "zod";

export const SavedJobSchema = z.object({
  userId: z.string(),
  jobPostingId: z.string(),
});

export type SavedJobType = z.infer<typeof SavedJobSchema>;
