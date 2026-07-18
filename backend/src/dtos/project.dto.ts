import { z } from "zod";
import { ProjectSchema } from "../types/project.types";

export const CreateProjectDtoSchema = ProjectSchema.omit({
  isActive: true,
});

export const UpdateProjectDtoSchema = ProjectSchema.partial();

export type CreateProjectDto = z.infer<typeof CreateProjectDtoSchema>;
export type UpdateProjectDto = z.infer<typeof UpdateProjectDtoSchema>;
