import { z } from "zod";
import { OpportunitySchema } from "../types/opportunity.types";

export const CreateOpportunityDtoSchema = OpportunitySchema.omit({
  isActive: true,
});

export const UpdateOpportunityDtoSchema = OpportunitySchema.partial();

export type CreateOpportunityDto = z.infer<typeof CreateOpportunityDtoSchema>;
export type UpdateOpportunityDto = z.infer<typeof UpdateOpportunityDtoSchema>;
