import { z } from "zod";
import { CareerKnowledgeSchema } from "../types/careerKnowledge.types";

export const CreateCareerKnowledgeDtoSchema =
CareerKnowledgeSchema.omit({
    isUpdating: true,
    aiGeneratedDate: true,
});

export const UpdateCareerKnowledgeDtoSchema =
CareerKnowledgeSchema
.partial()
.omit({
    jobRoleId: true,
    aiGeneratedDate: true,
});

export type CreateCareerKnowledgeDto =
z.infer<typeof CreateCareerKnowledgeDtoSchema>;

export type UpdateCareerKnowledgeDto =
z.infer<typeof UpdateCareerKnowledgeDtoSchema>;