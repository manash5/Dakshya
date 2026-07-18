import { z } from "zod";
import { SavedJobSchema } from "../types/savedJob.types";

export const CreateSavedJobDtoSchema = SavedJobSchema;

export type CreateSavedJobDto = z.infer<typeof CreateSavedJobDtoSchema>;
