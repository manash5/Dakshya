import { z } from "zod";
import { ResumeAnalysisSchema } from "../types/resumeAnalysis.types";

// ResumeAnalysis documents are produced entirely by the service after
// calling FastAPI (see resumeAnalysis.service.ts) -- there is no
// user-editable "update" for a past analysis, so only a Create DTO exists
// here, used internally rather than parsed directly from a request body.
export const CreateResumeAnalysisDtoSchema = ResumeAnalysisSchema;

export type CreateResumeAnalysisDto = z.infer<
  typeof CreateResumeAnalysisDtoSchema
>;
